<script context="module">
    export const ssr = false;
    import { apiAgent } from '$lib/helpers/apiAgent.svelte'
    import Header from '$lib/components/Header.svelte'
    import NavBar from '$lib/components/NavBar.svelte'
    export async function load({page}) {
        // @dev/amartis: temporary fix due to sveltekit issue.
        if (!page.params.slug) {
            page.params.slug = page.path.substr(page.path.lastIndexOf('/')+1)
        }
        const event = await apiAgent.get({url:`/events/${page.params.slug}`})
        const eventTickets = event.ticketOptions
        const pNotChecked = []
        const pCheckedIn = []
        const totalNotCheckedIn = await apiAgent.get({url:`/tickets/count`, params:{'event':page.params.slug, 'status':'paid'}})
        const totalCheckedIn = await apiAgent.get({url:`/tickets/count`, params:{'event':page.params.slug, 'status':'redeemed'}})
        const totalSold = totalNotCheckedIn + totalCheckedIn

        for (const eventTicket of eventTickets) {
            pNotChecked.push(await apiAgent.get({url:`/tickets/count`, params:{'event':page.params.slug, 'status':'paid', 'ticketOptionId':eventTicket.id}}))
            pCheckedIn.push(await apiAgent.get({url:`/tickets/count`, params:{'event':page.params.slug, 'status':'redeemed', 'ticketOptionId':eventTicket.id}}))
        }
        const countsCheckedIn = await Promise.all(pCheckedIn)
        const countsNotCheckedIn = await Promise.all(pNotChecked)
        console.log()
        for (const key in eventTickets) {
            if (eventTickets.hasOwnProperty(key)) {
                eventTickets[key]['countChecked'] = countsCheckedIn[key]
                eventTickets[key]['countUnchecked'] = countsNotCheckedIn[key]
            }
        }
        return { props: { event, eventTickets, totalSold, totalCheckedIn, totalNotCheckedIn }}
    }
</script>

<script>
    export let event
    export let totalSold
    export let totalCheckedIn
    export let totalNotCheckedIn
    export let eventTickets
</script>

<svelte:head>
    <title>My Events</title>
</svelte:head>
<Header event={event}/>
<NavBar event={event}/>

<div class="container-fluid">
    <div class="row">
        <div class="col-xs-12">
            <h4>Check-in Report</h4>
            <div class="mt-20"></div>

            <!--==== Card-list =====-->
            <div class="row">
                <!-- Start Card -->
                <div class="col-md-4 col-xs-12">
                    <div class="card">
                        <!-- title -->
                        <div class="row middle-xs">
                            <div class="col-xs-12">
                                <h3>Tickets Sold</h3>
                            </div>
                        </div>

                        <!-- Total -->
                        <div class="total-c">
                            <h2>{totalSold}</h2>
                        </div>
                    </div>
                </div>

                <!-- Start Card -->
                <div class="col-md-4 col-xs-12">
                    <div class="card">
                        <!-- title -->
                        <div class="row middle-xs">
                            <div class="col-xs-12">
                                <h3>Checked-in</h3>
                            </div>
                        </div>

                        <!-- Total -->
                        <div class="total-c">
                            <h2>{totalCheckedIn}/{totalSold}</h2>
                        </div>
                    </div>
                </div>

                <!-- Start Card -->
                <div class="col-md-4 col-xs-12">
                    <div class="card">
                        <!-- title -->
                        <div class="row middle-xs">
                            <div class="col-xs-12">
                                <h3>Not Checked-in</h3>
                            </div>
                        </div>

                        <!-- Total -->
                        <div class="total-c">
                            <h2>{totalNotCheckedIn}</h2>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-20"></div>

            <!-- Table -->
            <div class="table-data">

                <table>
                    <thead>
                        <tr>
                            <th scope="col">Ticket Type</th>
                            <th scope="col">Ticket Sold</th>
                            <th scope="col">Checked-in</th>
                            <th scope="col">Not Checked-in</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each eventTickets as eventTicket}
                            <tr>
                                <td data-label="Ticket Type">{eventTicket.ticket_type.name}</td>
                                <td class="num" data-label="Ticket Sold">{eventTicket.countChecked + eventTicket.countUnchecked}</td>
                                <td data-label="Checked-in">{eventTicket.countChecked}/{eventTicket.countChecked + eventTicket.countUnchecked}</td>
                                <td data-label="Not Checked-in"><span>{eventTicket.countUnchecked}</span></td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
                {#if eventTickets.length == 0}
                <!--@dev/amartis: Message to show when no ticket was created for the event-->
                <p>Ticket(s) need to be created for the event.</p>
                {/if}
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