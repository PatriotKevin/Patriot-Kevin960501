<script context="module">
    export const ssr = false;
    import { config } from '$lib/helpers/config.svelte'
    import { apiAgent } from '$lib/helpers/apiAgent.svelte'
    import Header from '$lib/components/Header.svelte'
    import NavBar from '$lib/components/NavBar.svelte'
    import Pagination from '$lib/components/Pagination.svelte'
    import { getEventDates, getEventTimes } from '$lib/helpers/date_utils'
    import { capitalizeLeading, getFullName } from '$lib/helpers/string_utils'
    const pageSize = 10
    export async function load({page}) {
        // @dev/amartis: temporary fix due to sveltekit issue.
        if (!page.params.slug) {
            page.params.slug = page.path.substr(page.path.lastIndexOf('/')+1)
        }
        const event = await apiAgent.get({url:`/events/${page.params.slug}`})
        const total = await apiAgent.get({url:`/tickets/count`, 
            params:{
                "event.id":event.id, 
                "status_in":['paid','refunded','redeemed','withdrawn']
            }
        })
        //@dev/amartis: Currently sorting by id. Should we provide more options to the user? If so, design needed.
        const tickets = await apiAgent.get({
            url:`/tickets`, 
            params:{
                _sort:"id:ASC",
                _limit:pageSize,
                "event.id":event.id, 
                "status_in":['paid','refunded','redeemed','withdrawn']
            }
        })
        return { props: { event, tickets, total }}
    }
</script>
    
<script>
    export let event
    export let tickets
    export let total
    // Related with pagination
    let currentPage = 1
    let filterInput = ""
    async function loadData(page, filter) {
        try {
            let filterQueries = []
            if (filter.length > 0) {
                if (filter == parseInt(filter)) {
                    filterQueries.push({'id_contains':filter})
                }
                if (filter.indexOf(' ')>=0) {
                    // Different filters for first name and last name
                    const filterFirstName = filter.substr(0, filter.indexOf(' '))
                    const filterLastName = filter.substr(filter.indexOf(' ')+1)
                    filterQueries.push([{'customer.firstName_contains':filterFirstName},{'customer.lastName_contains':filterLastName}])
                }
                else {
                    filterQueries.push({_or: [{'customer.firstName_contains':filter}, {'customer.lastName_contains':filter}]})
                }
                filterQueries.push({'ticket_type.name_contains':filter})
            }
            console.log('filterQueries', filterQueries)
            
            total = await apiAgent.get({
                url:`/tickets/count`,
                params: {
                    _where:[
                        {'event.id':event.id},
                        {'status_in':['paid', 'redeemed']},
                        {_or: filterQueries}
                    ]
                }
            })
            tickets = await apiAgent.get({
                url:`/tickets`, 
                params:{
                    _sort:"id:ASC",
                    _limit:pageSize,
                    _start:(page-1)*pageSize,
                    _where:[
                        {'event.id':event.id},
                        {'status_in':['paid', 'redeemed']},
                        {_or: filterQueries}
                    ]
                }
            })
            console.log('tickets', tickets)
        }
        catch {
            tickets = []
        }
    }
    async function checkin(ticket) {
        try {
            let response = await apiAgent.put({url:`/tickets/${ticket.id}`, body:{status:'redeemed'}})
        }
        catch (error) {
            alert(error.message || 'Failed to check in') // @dev/amartis: Review English message.
        }
        await loadData(currentPage, filterInput)
    }
    async function uncheck(ticket) {
        try {
            let response = await apiAgent.put({url:`/tickets/${ticket.id}`, body:{status:'paid'}})
        }
        catch (error) {
            alert(error.message || 'Failed to check in') // @dev/amartis: Review English message.
        }
        await loadData(currentPage, filterInput)
    }
    $: loadData(currentPage, filterInput)
</script>

<svelte:head>
    <title>My Events</title>
</svelte:head>
<Header event={event}/>
<NavBar event={event}/>

<div class="container-fluid">
    <div class="row">
        <div class="col-xs-12">

            <h4>Customer Check-in</h4>
            <div class="mt-20"></div>
            <div class="table-search">
                <div class="form-main">
                    <i class='bx bx-search'></i>
                    <input type="text" id="search" placeholder="Search" bind:value={filterInput}/>
                </div>
            </div>


            <div class="table-data">
                <table>
                    <thead>
                        <tr>
                            <th scope="col">Customer Name</th>
                            <th scope="col">Ticket Number</th>
                            <th scope="col">Ticket Type</th>
                            <th scope="col" style="text-align:center;">Check-in Status</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each tickets as ticket}
                            <tr>
                                <td data-label="Customer Name">{getFullName(ticket.customer.firstName, ticket.customer.lastName)}</td>
                                <td class="num" data-label="Ticket Number">{ticket.id}</td>
                                <td data-label="Ticket Type">{ticket.ticket_type.name}</td>
                                {#if ticket.status == 'redeemed'}
                                    <td class="status" data-label="Check-in Status"><i class='bx bxs-check-circle'></i></td>
                                    <td data-label="Action"><button class="main-btn uncheck" on:click={uncheck(ticket)}>Uncheck</button></td>
                                {:else}
                                    <td class="status" data-label="Check-in Status"><i class='bx bx-x-circle'></i></td>
                                    <td data-label="Action"><button class="main-btn" on:click={checkin(ticket)}>Check-in</button></td>
                                {/if}
                            </tr>
                        {/each}
                    </tbody>
                </table>
                {#if tickets.length == 0}
                <p>There are no customers</p>
                {/if}
            </div>


        </div>
        {#if total > pageSize}
        <Pagination 
            lastPage={ currentPage >= (total/pageSize) }
            currentPage={currentPage}
            on:pageIncrease = {e => {currentPage++}}
            on:pageDecrease = {e => {currentPage--}}
        />
        {/if}
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
    .form-main {
        padding: 0
    }
</style>