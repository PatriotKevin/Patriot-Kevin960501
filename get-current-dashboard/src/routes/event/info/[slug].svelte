<script context="module">
	export const ssr = false;
    import { browser } from '$app/env'
    import { config } from '$lib/helpers/config.svelte'
    import { apiAgent } from '$lib/helpers/apiAgent.svelte'
    import Header from '$lib/components/Header.svelte'
    import NavBar from '$lib/components/NavBar.svelte'
    import { getEventDates, getEventTimes } from '$lib/helpers/date_utils'
    export async function load({page}) {
        // @dev/amartis: temporary fix due to sveltekit issue.
        if (!page.params.slug) {
            page.params.slug = page.path.substr(page.path.lastIndexOf('/')+1)
        }
        const event = await apiAgent.get({url:`/events/${page.params.slug}`})
        const totalTransaction = await apiAgent.get({url:`/tickets/count`, params:{"event.id":page.params.slug}})
        const visitorsCount = await apiAgent.get({url:`/tickets/count`, params:{"event.id":page.params.slug, "status": "redeemed"}})
        const paidTickets = await apiAgent.get({url:`/tickets`, params:{"event.id":page.params.slug, "status":["paid", "redeemed","withdrawn"]}})
        return { props: { event, totalTransaction, visitorsCount, paidTickets }}
    }
</script>

<script>
    import { price_number } from '$lib/helpers/num_utils'
    import _reduce from '$lib/lodash/reduce'
    export let event
    export let paidTickets
    export let totalTransaction
    export let visitorsCount
    let totalSales = 0
    const transactions = {} // {"stripe-intent-id":sum}
    // @dev/amartis : Need dedicated API that returns the sum
    paidTickets.forEach(ticket => {
        let paymentOnTicket = ticket.price
        for (const addon of ticket.addons || []) {
            paymentOnTicket += addon.price
        }
        if (!transactions[ticket.stripeIntentId]) {
            transactions[ticket.stripeIntentId] = 0
        }
        transactions[ticket.stripeIntentId] += paymentOnTicket
        totalSales += paymentOnTicket
    });
    const countTransactionsPriced =  _reduce(transactions, (sum, val) => (sum + (val > 0 ? 1 : 0)), 0)
    const fee = config.getFee(totalSales, countTransactionsPriced)
    const totalRevenue = totalSales - fee

    const copyInviteLink = (e) => {
          /* Get the text field */
        var input = jQuery("#gc-invite-link");

        var success   = true,
            range     = document.createRange(),
            selection;

        // For IE.
        if (window.clipboardData) {
            window.clipboardData.setData("Text", input.val());        
        } else {
            // Create a temporary element off screen.
            var tmpElem = jQuery('<div>');
            tmpElem.css({
                position: "absolute",
                left:     "-1000px",
                top:      "-1000px",
            });
            // Add the input value to the temp element.
            tmpElem.text(input.val());
            jQuery("body").append(tmpElem);
            // Select temp element.
            range.selectNodeContents(tmpElem.get(0));
            selection = window.getSelection ();
            selection.removeAllRanges ();
            selection.addRange (range);
            // Lets copy.
            try { 
                success = document.execCommand ("copy", false, null);
            }
            catch (e) {
                window.prompt("Please copy manually the selected text", input.val());
            }
            if (success) {
                alert (`Copied the invite link: ${input.val()}`);
                // remove temp element.
                tmpElem.remove();
            }
        }
    }
</script>

<svelte:head>
    <title>My Events</title>
</svelte:head>
<Header event={event}/>
<NavBar event={event}/>
<div class="container-fluid">
    <div class="row">


        <!-- Start Card -->
        <div class="col-lg-4 col-md-6 col-xs-12">
            <div class="card-event">

                <!-- image -->
                <div class="img-card-event">
                    <img class="img-full" src={config.getServerURL(event.image.url)} alt="">
                </div>

                <!-- Detail -->
                <div class="card-content">
                    <h2 class="title">{event.name || ""}</h2>
                    {#each event.categories || [] as category}
                        <p class="tag">{category.name}</p>
                    {:else}
                        <p></p>
                    {/each}
                    <ul>
                        <li><i class='bx bx-calendar'></i><span>{getEventDates(event.start, event.end)}</span></li>
                        <li><i class='bx bx-time'></i><span>{getEventTimes(event.start, event.end)}</span></li>
                        <li><i class='bx bx-map'></i><span>{config.descEventLocation(event.location)}</span></li>
                    </ul>
                </div>

            </div>
        </div>

        <!-- Start Card -->
        <div 
            class="col-lg-4 col-md-6 col-xs-12"
            style="
                display: flex; 
                flex-direction: column; 
                justify-content: space-between;"
        >

            <div class="card">
                <!-- title -->
                <div class="row middle-xs">
                    <div class="col-xs-6">
                        <h3>Ticket Sold</h3>
                    </div>

                </div>

                <!-- Total -->
                <div class="total-c">
                    <h2>{totalTransaction}</h2>
                </div>
            </div>

            <div class="card">
                <!-- title -->
                <div class="row middle-xs">
                    <div class="col-xs-6">
                        <h3>Revenue</h3>
                    </div>

                </div>

                <!-- Total -->
                <div class="total-c">
                    <h2>${price_number(totalRevenue)}</h2>
                </div>
            </div>

            <div class="card">
                <!-- title -->
                <div class="row middle-xs">
                    <div class="col-xs-6">
                        <h3>Visitor</h3>
                    </div>

                </div>

                <!-- Total -->
                <div class="total-c">
                    <h2>{visitorsCount}</h2>
                </div>
            </div>

        </div>

        <!-- link copy -->

        <div class="col-lg-8 col-md-8 col-xs-12">
            <div class="copy-link card">
                <div class="middle-xs">
                    <div class="row links">
                        <div class="col-xs-9">
                            <h3>Link Invite event</h3>
                        </div>
                        <div class="col-xs-3 r-text" on:click={copyInviteLink}>
                            <span><i class='bx bx-copy'></i>COPY</span>
                        </div>
                        <p>{config.getWebsiteURL(`/event/${event.id}`)}</p>
                        <input type="hidden"  id="gc-invite-link" value={config.getWebsiteURL(`/event/${event.id}`)}>
                    </div>
                </div>
            </div>
        </div>


    </div>
</div>
<style>
    .container-fluid {
        padding-left: 265px;
        margin-top: 90px;
    }
    @media screen and (max-width: 768px) {
        .container-fluid {
            padding-right: 1rem;
            padding-left: 1rem;
        }
    }
</style>