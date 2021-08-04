<script context="module">
    export const ssr = false;
</script>
<script>
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { browserGet, browserSet } from "$lib/helpers/browser_utils";
    import {
        getEventDates,
        getEventTimes,
        getTimeSlotString,
        getTimeString,
    } from "$lib/helpers/date_utils";
    import _find from "$lib/lodash/find";
    import { config } from "$lib/helpers/config.svelte";
    let event = browserGet("purchase-event");
    let ticketTypes = []; // type:[{id:,name:}]
    let ticketOptionGroups = {}; // {ticket_type_id:[TicketOption]}
    let orderQty = {}; // {ticketOptionId:number}
    let addTicket = {};
    let uiOptionID = {}; // {ticket_type_id:number}
    if (event) {
        (event.ticketOptions || []).forEach((ticketOption) => {
            orderQty[ticketOption.id] = 0;
            addTicket[ticketOption.id] = 0;
            if (ticketOptionGroups.hasOwnProperty(ticketOption.ticket_type.id))
                ticketOptionGroups[ticketOption.ticket_type.id].push(
                    ticketOption
                );
            else {
                ticketOptionGroups[ticketOption.ticket_type.id] = [
                    ticketOption,
                ];
                ticketTypes.push({
                    id: ticketOption.ticket_type.id,
                    name: ticketOption.ticket_type.name,
                });
                uiOptionID[ticketOption.ticket_type.id] = ticketOption.id;
            }
        });
        // Can do some coding for sorting ticketTypes, if you want.
    } else {
        let redirectCountDown = 5;
        onMount(() => {
            setInterval(() => {
                if (typeof redirectCountDown == "number") {
                    if (redirectCountDown > 0) redirectCountDown -= 1;
                    else if (redirectCountDown == 0) {
                        redirectCountDown = "Going home...";
                        setTimeout(() => {
                            goto("/");
                        }, 500);
                    }
                }
            }, 1000);
        });
    }
    function onKeyPress(e) {
        if (e.which == 13) {
            e.preventDefault();
            // Get all focusable elements on the page
            var $canfocus = jQuery(':focusable');
            var index = $canfocus.index(this) + 1;
            if (index >= $canfocus.length) index = 0;
            $canfocus.eq(index).focus();
        }
    }
    browserSet("purchase-order-qty", null);
    let total, subtotal, countTickets;
    function updateSummary(ordering) {
        countTickets = 0;
        subtotal = 0;
        for (const ticketOptionId in ordering) {
            if (ordering.hasOwnProperty(ticketOptionId)) {
                countTickets += ordering[ticketOptionId]
                subtotal +=
                    ordering[ticketOptionId] *
                    _find(
                        event.ticketOptions,
                        (element) => element.id == ticketOptionId
                    ).price;
            }
        }
        total = subtotal;
    }
    $: updateSummary(orderQty);
    function proceed(e) {
        if (!countTickets) { // If the user hasn't selected any ticket.
            alert('Please select the quantity of tickets.') // @dev/amartis: Review English.
            return
        }
        browserSet('purchase-order-qty', orderQty)
        goto("/order/payment")
    }
</script>

<svelte:head>
    <title>Step 1 - Select Tickets</title>
</svelte:head>
<div class="place-order">
    <div class="container">
        {#if event}
            <div class="row">
                <div class="col-md-7 col-xs-12 p-type">
                    {#each ticketTypes as ticketType}
                        <!-- Start Ticket Item -->
                        <div class="row">
                            <p class="ticket-type">
                                <span
                                    ><img
                                        src="/assets/img/icon/ticket-outlined.svg"
                                        alt=""
                                    /></span
                                >
                                <span>{ticketType.name}</span>
                            </p>
                        </div>
                        <div class="mt-15"></div>
                        <div class="row">
                            <div class="col-md-6 col-xs-6">
                                <div class="event-detail-content">
                                    <h2 style="text-align:left; margin:0px 0px;">{event.name}</h2>
                                    <p class="location">
                                        {`${event.location.street || ''}${event.location.city ? ', ' + event.location.city : ''}`}
                                    </p>
                                    <p class="time">
                                        {getEventTimes(event.start, event.end)}
                                    </p>
                                    <p class="date">
                                        {getEventDates(event.start, event.end)}
                                    </p>
                                </div>
                            </div>
                            <div class="col-md-6 col-xs-6">
                                <div class="qty-slot-ticket">
                                    <form action="#">
                                        <!-- time Slot -->
                                        <label for="typeticket">
                                        {#if ticketType.name.includes("General")}
                                            Date Slot
                                        {:else}
                                            Time Slot
                                        {/if}
                                        </label>
                                        
                                        <select
                                            name="typeticket"
                                            id="typeticket"
                                            class="slot-select-custom sources mb-20"
                                            placeholder="Select a time slot"
                                            bind:value={uiOptionID[
                                                ticketType.id
                                            ]}
                                            on:keypress={onKeyPress}
                                        >
                                            {#each ticketOptionGroups[ticketType.id] as ticketOption}
                                                <option value={ticketOption.id}
                                                    >{getTimeSlotString(
                                                        ticketOption.start,
                                                        ticketOption.end,
                                                        ticketOption.ticket_type
                                                            .name
                                                    )}</option
                                                >
                                            {/each}
                                        </select>

                                        <!-- Qty -->
                                        <label for="quantity">Quantity</label>
                                        <div class="row">
                                            <div class="col-xs-6">
                                                <div class="input-group">
                                                    <div class="input-div">
                                                        <input
                                                            class="number"
                                                            bind:value={addTicket[uiOptionID[ticketType.id]]}
                                                            on:keypress={onKeyPress}
                                                        />
                                                    </div>
                                                    <div class="input-group-text" id="basic-addon">
                                                        <button class="spin_custom plus_spin_custom"
                                                            on:click|preventDefault={() =>
                                                                addTicket[uiOptionID[ticketType.id]]++
                                                            }
                                                            >+</button
                                                        >
                                                        <button class="spin_custom minus_spin_custom"
                                                            on:click|preventDefault={() =>
                                                                addTicket[uiOptionID[ticketType.id]]--
                                                            }
                                                            >-</button
                                                        >
                                                    </div> 
                                                </div>
                                            </div>
                                            <div class="col-xs-6 add">
                                                <button class="main-btn"
                                                    on:click|preventDefault={() =>
                                                        orderQty[uiOptionID[ticketType.id]] = addTicket[uiOptionID[ticketType.id]]
                                                    }
                                                    >Add</button
                                                >
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <!-- End Ticket Item -->
                        <div class="mt-30"></div>
                    {/each}
                </div>
                <div class="col-md-5 col-xs-12">
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
                                        <div class="col-xs-9">
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
                                        <div class="col-xs-1 r-text">
                                            <a
                                                href="/#"
                                                on:click|preventDefault={() =>
                                                    orderQty[uiOptionID[ticketType.id]] = 0
                                                    }>X</a
                                            >
                                        </div>
                                    </div>
                                {/if}
                            {/each}
                        {/each}
                        <!-- End-list summary -->

                        <!-- Start-list summary -->
                        <div class="row list-summary">
                            <div class="col-xs-9">
                                <span class="title-summary">Subtotal</span>
                            </div>
                            <div class="col-xs-2 r-text">
                                <span class="prices"
                                    >${(subtotal / 100).toFixed(2)}</span
                                >
                            </div>
                        </div>
                        <!-- End-list summary -->

                        <!-- Start-list summary -->
                        <div class="row list-summary-total">
                            <div class="col-xs-9">
                                <span class="title-summary">Total</span>
                            </div>
                            <div class="col-xs-2 r-text">
                                <span class="prices"
                                    >${(total / 100).toFixed(2)}</span
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
                                    >Go to Payment</button
                                >
                            </div>
                        </div>
                        <!-- End-list summary -->
                    </div>
                </div>
            </div>
        {:else if typeof redirectCountDown == "number"}
            <div class="row">
                <p>
                    You didn't select event to join. You'll be redirected to <a
                        href="/">Home Page</a
                    >
                    after {redirectCountDown} seconds.
                </p>
            </div>
        {:else}
            <div class="row">
                <p>Going home...</p>
            </div>
        {/if}
    </div>
</div>
<style>
    /* Rich custom here */
    #basic-addon{
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        position: relative;
        display: inline-flex;
        vertical-align: middle;
        height: 40px!important;
        border-style: none!important;
    }
    .input-div {
        display: inline-block!important;
    }
    .spin_custom {
        height: 20px;
        width: 100%;
        border: solid !important;
        border-width: 1px !important;
        margin-top: 0px!important;
        margin-bottom: 0px!important;
        padding-top: 0px!important;
        padding-bottom: 0px!important;
        border-left-style: none!important;
        color:#424A80!important;
    }
    .plus_spin_custom {
        width:20px!important;
        border-radius: 0 5px 0px 0px!important;
        border-width:1px;
        border-bottom-style: none!important;
    }
    .minus_spin_custom {
        border-radius: 0 0px 5px 0px!important;
        border-width:1px;
    }
    .input-group {
        display: flex;
        justify-content: left;
        align-items: left;
    }
    /* End Rich custom here */
    .number {
        width: 60px;
        height: 40px;
        padding: 30%;
        color: #424A80;
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
        font-weight: 700;
        letter-spacing: .5px;
        font-size: 14px;
        -webkit-transition: all ease-in .2s;
        transition: all ease-in .2s;
        border: 1px solid #424A80;
    }
    .slot-select-custom {
		float: none;
		padding: 10px 15px 10px 10px;
		border-radius: 5px;
		text-align: left;
		font-weight: 700;
		letter-spacing: 0.5px;
		font-size: 12px;
		background: #fff;
		box-shadow: 0px 3px 5px 1px rgb(0 0 0 / 4%);
        border-color: #424A80;
		cursor: pointer;
		color: #424a80;
		margin-right: 10px;
	}
    @media (max-width: 764px) {
		.slot-select-custom {
			width: 130px;
			font-size: 12px;
			margin-top: -10px;
			/* margin-right: -10px; */
		}
        .number {
            width: 40px;
            height: 36px;
            font-size: 12px;
        }
        .plus_spin_custom {
            width:18px!important;
        }
        .minus_spin_custom {
            border-radius: 0 0px 5px 0px!important;
            border-width:1px;
        }
        .spin_custom {
            height: 18px;
            width: 100%;
        }
        #basic-addon{
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            position: relative;
            display: inline-flex;
            vertical-align: middle;
            height: 36px!important;
            border-style: none!important;
        }
	}
</style>