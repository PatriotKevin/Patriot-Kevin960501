<script context="module">
    export let ssr = false;
    import _find from "$lib/lodash/find";
    import _map from "$lib/lodash/map";
    import _pick from "$lib/lodash/pick";
    import _each from "$lib/lodash/each";
    import _filter from "$lib/lodash/filter";
    import _omit from "$lib/lodash/omit";
    import _extend from "$lib/lodash/extend";

    import { browserGet, browserSet } from "$lib/helpers/browser_utils";
    import { getTimeSlotString } from "$lib/helpers/date_utils";
    export async function load() {
        let event = browserGet("purchase-event");
        let orderQty = browserGet("purchase-order-qty");
        let subtotal;
        let total;

        let ticketTypes = []; // type:[{id:,name:}]
        let ticketOptionGroups = {}; // {ticket_type_id:[TicketOption]}
        let tickets = [];

        if (event && orderQty) {
            subtotal = 0;
            for (const ticketOptionId in orderQty) {
                if (orderQty.hasOwnProperty(ticketOptionId)) {
                    subtotal +=
                        orderQty[ticketOptionId] *
                        _find(
                            event.ticketOptions,
                            (element) => element.id == ticketOptionId
                        ).price;
                    const ticketOption = _find(
                        event.ticketOptions,
                        (element) => element.id == ticketOptionId
                    );
                    for (let i = 0; i < orderQty[ticketOptionId]; i++) {
                        tickets.push({
                            event: event.id,
                            ticket_type: ticketOption.ticket_type.id,
                            price: ticketOption.price,
                            start: ticketOption.start,
                            end: ticketOption.end,
                            ticketOptionId: ticketOptionId,
                            description_: `${
                                ticketOption.ticket_type.name
                            }, ${getTimeSlotString(
                                ticketOption.start,
                                ticketOption.end,
                                ticketOption.ticket_type.name
                            )}`,
                            customer_: {
                                firstName: "",
                                lastName: "",
                                email: "",
                                phone: "",
                                ownerId:event.userId
                            },
                            addons_: {},
                            sponsor_: browserGet("purchased-sponsor-ids") || [],
                        });
                    }
                }
            }
            total = subtotal;
        }

        return {
            props: {
                event,
                orderQty,
                subtotal,
                total,
                ticketTypes,
                ticketOptionGroups,
                tickets,
            },
        };
    }
</script>

<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { apiAgent } from "$lib/helpers/apiAgent.svelte";
    import { config } from "$lib/helpers/config.svelte";
    import LibLoader from "$lib/helpers/LibLoader.svelte";
    import { price_number } from "$lib/helpers/number_utils"

    export let event;
    export let orderQty;
    export let subtotal;
    export let total;
    export let ticketTypes;
    export let ticketOptionGroups;
    export let tickets;

    // Stripe workers
    let stripe;
    let stripeElements;
    let stripeCard;
    let cardEmpty = true;
    let cardComplete = false;
    let cardError = null;

    let error = null;
    let redirectCountDown = 5;
    let proceeding = false;

    if (!event) {
        error = "no event";
        onMount(() => {
            setInterval(() => {
                if (typeof redirectCountDown == "number") {
                    if (redirectCountDown > 0) redirectCountDown -= 1;
                    else if (redirectCountDown == 0) {
                        redirectCountDown = "Redirecting...";
                        setTimeout(() => {
                            goto("/");
                        }, 500);
                    }
                }
            }, 1000);
        });
    } else if (!orderQty) {
        error = "no order";
        onMount(() => {
            setInterval(() => {
                if (typeof redirectCountDown == "number") {
                    if (redirectCountDown > 0) redirectCountDown -= 1;
                    else if (redirectCountDown == 0) {
                        redirectCountDown = "Redirecting...";
                        setTimeout(() => {
                            goto("/order/select-ticket");
                        }, 500);
                    }
                }
            }, 1000);
        });
    } else {
        // onMount(() => {
        // })
    }

    function calcTotal(tickets) {
        let _total = 0
        _each(tickets, (ticket) => {
            _total += ticket.price
            _each(ticket.addons_ || {}, (val, key) => {
                if (val) {
                    _total += _find(event.addonOptions, (item) => item.id == key).price
                }
            })
        })
        return _total
    }

    $: totalWithAddonCost = calcTotal(tickets)

    function onStripeLoaded() {
        stripe = Stripe(config.stripeClientKey);
        stripeElements = stripe.elements();
        var stripeStyle = {
            base: {
                color: "#32325d",
                fontFamily: "Arial, sans-serif",
                fontSmoothing: "antialiased",
                fontSize: "16px",
                "::placeholder": {
                    color: "#32325d",
                },
            },
            invalid: {
                fontFamily: "Arial, sans-serif",
                color: "#fa755a",
                iconColor: "#fa755a",
            },
        };
        stripeCard = stripeElements.create("card", { style: stripeStyle });
        stripeCard.mount("#card-element");
        stripeCard.on("change", function (cardEvent) {
            cardEmpty = cardEvent.empty;
            cardComplete = cardEvent.complete;
            cardError = cardEvent.error ? cardEvent.error.message : null;
        });
    }
    async function proceed(e) {
        if (totalWithAddonCost > 0) {
            if (cardEmpty) {
                alert("Please enter your card information.");
                return;
            }
            if (!cardComplete) {
                alert(cardError);
                return;
            }
            if (cardError) {
                alert(cardError);
                return;
            }
        }
        // Data Validity
        const invalidTicket = _find(
            tickets,
            (ticket) =>
                !ticket.customer_.firstName ||
                !ticket.customer_.lastName ||
                !ticket.customer_.email ||
                !ticket.customer_.phone
        );
        if (invalidTicket) {
            alert("Can not proceed due to invalid input");
            return;
        } else {
            try {
                proceeding = true;
                // Save Customers first
                const saveCustomers = _map(tickets, (ticket) =>
                apiAgent.post({
                        url: "/customers",
                        body: _pick(ticket.customer_, [
                            "firstName",
                            "lastName",
                            "email",
                            "phone",
                            "ownerId"
                        ]),
                        token: null,
                    })
                );

                // const saveCustomers = _map(tickets, (ticket) => {
                //    let customerData = _pick(ticket.customer_, [
                //             "firstName",
                //             "lastName",
                //             "email",
                //             "phone"
                //         ]);
                //     // customerData.ownerId = event.userId;
                //     apiAgent.post({
                //         url: "/customers",
                //         body: customerData,
                //         token: null,
                //     })
                // });
                const customers = await Promise.all(saveCustomers);
                _each(customers, (customer, idx) => {
                    tickets[idx].customer = customers[idx].id;
                });

                // POST /pay (reduce ticket quantity, create payment intent)
                // let stripeIntentId = null
                const paymentIntent = await apiAgent.post({
                    url: "/pay",
                    body: _map(tickets, ticket => _omit(ticket, ["customer_", "description_"])),
                    token: null
                })
                if (paymentIntent.error) {
                    throw new Error(paymentIntent.error)
                }

                // Confirm card payment
                if (paymentIntent.clientSecret) {
                    const paymentResult = await stripe.confirmCardPayment(
                        paymentIntent.clientSecret,
                        { payment_method: { card: stripeCard } }
                    );
                    if (paymentResult.error) throw paymentResult.error
                    // stripeIntentId = paymentResult.paymentIntent.id
                    console.log({paymentResult})
                }
                const ticketIds = paymentIntent.savedTickets.map(ticket => ticket.id)
                let sponsor = []
                for (const ticket of paymentIntent.savedTickets) {
                    if (sponsor.length == 0 && ticket.sponsor != undefined && ticket.sponsor.length != 0){
                        sponsor = ticket.sponsor;
                    }
                }
                browserSet('purchased-ticket-ids', ticketIds)
                browserSet('purchased-sponsor-ids', sponsor)
                goto("/order/confirm");
            } catch (err) {
                proceeding = false;
                console.log("err", err);
                alert(
                    err.message ||
                        "Sorry, some error occurred while processing your request."
                );
            }
        }
    }
</script>

<svelte:head>
    <title>Step 2 - Contact Info & Payment</title>
    <LibLoader url="https://js.stripe.com/v3/" on:loaded={onStripeLoaded} />
</svelte:head>
<div class="place-order">
    <div class="container">
        {#if !error}
            <div class="row">
                <div class="col-md-7 col-xs-12">
                    <div class="form-payment">
                        <form class="form-main" action="#">
                            {#each tickets as ticket, index}
                                {#if index != 0}
                                    <div class="mt-30"></div>
                                {/if}
                                <p>{ticket.description_}</p>
                                <div class="row">
                                    <div class="col-md-6 col-xs-12">
                                        <!-- first name -->
                                        <label for="firstname">First Name</label
                                        >
                                        <input
                                            required
                                            name="payment[firstname]"
                                            type="text"
                                            bind:value={ticket.customer_
                                                .firstName}
                                        />
                                    </div>
                                    <div class="col-md-6 col-xs-12">
                                        <!-- last name  -->
                                        <label for="lastname">Last Name</label>
                                        <input
                                            required
                                            name="payment[lastname]"
                                            type="text"
                                            bind:value={ticket.customer_
                                                .lastName}
                                        />
                                    </div>
                                </div>

                                <div class="row">
                                    <div class="col-md-6 col-xs-12">
                                        <!-- email -->
                                        <label for="email">Email</label>
                                        <input
                                            required
                                            name="payment[email]"
                                            type="email"
                                            bind:value={ticket.customer_.email}
                                        />
                                    </div>

                                    <div class="col-md-6 col-xs-12">
                                        <!-- phone -->
                                        <label for="phone"
                                            >Phone</label
                                        >
                                        <input
                                            required
                                            name="payment[phone]"
                                            type="tel"
                                            pattern="^(\d|\s|-|\(|\))*$"
                                            title="Digits, spaces, hyphens and parentheses are allowed."
                                            bind:value={ticket.customer_.phone}
                                            class:bad={!/^(\d|\s|-|\(|\))*$/.test(ticket.customer_.phone)}
                                        />
                                    </div>
                                </div>
                                {#if event.addonOptions && event.addonOptions.length > 0}
                                    <div class="mt-20"/>
                                    <p style="font-size:14px;">Ticket Addons</p>
                                    {#each event.addonOptions as addonOption}
                                    <div class="row" style="margin-top:20px;">
                                        <div class="col-md-1 col-xs-2">
                                        <input type="checkbox" id={'checkbox'+index+':'+addonOption.id} bind:checked={ticket.addons_[addonOption.id]}/>
                                        </div>
                                        <div class="col-md-11 col-xs-10">
                                            <label for={'checkbox'+index+':'+addonOption.id} style="margin-top:0">{addonOption.description}{addonOption.price > 0 ? '(+$' + price_number(addonOption.price) + ')' : ''}</label>
                                        </div>
                                        
                                    </div>
                                    {/each}
                                {/if}
                            {/each}

                            <div class="line" />

                            <div class="mt-30" />
                            <p>Payment Method</p>

                            <div id="card-element" />
                        </form>
                    </div>
                </div>

                <div class="col-md-5 col-xs-12 b-2">
                    <div class="img-summary">
                        <img
                            src={config.getServerURL(event.image.url)}
                            alt=""
                            class="img-full"
                        />
                    </div>

                    <div class="summary">
                        <div class="row">
                            <div class="col-xs-12">
                                <h2>Order Summary</h2>
                            </div>
                        </div>

                        <!-- Start-list summary -->
                        {#each ticketTypes as ticketType}
                            {#each ticketOptionGroups[ticketType.id] as ticketOption}
                                {#if orderQty[ticketOption.id] > 0}
                                    <div class="row list-summary">
                                        <div class="col-xs-10">
                                            <span class="title-summary"
                                                >{orderQty[
                                                    ticketOption.id
                                                ]}x{event.name}, {ticketType.name},
                                                {getTimeSlotString(
                                                    ticketOption.start,
                                                    ticketOption.end,
                                                    ticketOption.ticket_type
                                                        .name
                                                )}</span
                                            >
                                        </div>
                                        <div class="col-xs-2 r-text">
                                            <span class="prices"
                                                >${(
                                                    (orderQty[ticketOption.id] *
                                                        ticketOption.price) /
                                                    100
                                                ).toFixed(2)}</span
                                            >
                                        </div>
                                    </div>
                                {/if}
                            {/each}
                        {/each}
                        <!-- End-list summary -->

                        <!-- Start-list summary -->
                        <div class="row list-summary">
                            <div class="col-xs-10">
                                <span class="title-summary">Subtotal</span>
                            </div>
                            <div class="col-xs-2 r-text">
                                <span class="prices"
                                    >${(totalWithAddonCost / 100).toFixed(2)}</span
                                >
                            </div>
                        </div>
                        <!-- End-list summary -->

                        <!-- Start-list summary -->
                        <div class="row list-summary-total">
                            <div class="col-xs-10">
                                <span class="title-summary">Total</span>
                            </div>
                            <div class="col-xs-2 r-text">
                                <span class="prices"
                                    >${(totalWithAddonCost / 100).toFixed(2)}</span
                                >
                            </div>
                        </div>
                        <!-- End-list summary -->

                        <!-- Start-list summary -->
                        <div class="row btn">
                            <div class="col-xs-12">
                                <button
                                    type="submit"
                                    class="main-btn"
                                    on:click={proceed}
                                    disabled={proceeding}
                                    >Proceed to checkout</button
                                >
                            </div>
                        </div>
                        <!-- End-list summary -->
                    </div>
                </div>
            </div>
        {/if}
        {#if error == "no event"}
            {#if typeof redirectCountDown == "number"}
                <div class="row">
                    <p>
                        You didn't select event to join. You'll be redirected to <a
                            href="/">Home</a
                        >
                        page after {redirectCountDown} seconds.
                    </p>
                </div>
            {:else}
                <div class="row">
                    <p>Going <i>home</i>...</p>
                </div>
            {/if}
        {/if}
        {#if error == "no order"}
            {#if typeof redirectCountDown == "number"}
                <div class="row">
                    <p>
                        You don't seem to have ordered any ticket for the event.
                        You'll be redirected to <a href="/order/select-ticket"
                            >Select Tickets</a
                        >
                        page after {redirectCountDown} seconds.
                    </p>
                </div>
            {:else}
                <div class="row">
                    <p>Going to <i>select tickets</i>...</p>
                </div>
            {/if}
        {/if}
    </div>
</div>
<style>
    button:disabled,
    button[disabled] {
        background: #828Ae0;
        cursor: not-allowed !important;
    }
    input.bad {
        border: 2px solid #faa8a8;
    }
</style>
