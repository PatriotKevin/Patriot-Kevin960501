<script context="module">
    export const ssr = false;
    import { config } from '$lib/helpers/config.svelte';
    export async function load({page}) {
        const statusEvents = page.query.get('status') || 'active'
        const pageSize = config.pageSize
        const total = await apiAgent.get({url: '/events/count', params:{status:statusEvents, 'user.id':apiAgent.getUser().id}})
        const events = await apiAgent.get({url:'/events', params:{status:statusEvents, 'user.id':apiAgent.getUser().id, _sort:'start:ASC',_limit:pageSize}})
        return { props: { statusEvents, events, total, pageSize }}
    }
</script>

<script>
    import Header from '$lib/components/Header.svelte'
    import NavBar from '$lib/components/NavBar.svelte'
    import EventCard from '$lib/components/EventCard.svelte'
    import Pagination from '$lib/components/Pagination.svelte'
    import { apiAgent } from '$lib/helpers/apiAgent.svelte';

    export let statusEvents // status of events on this page.
    export let events
    export let total
    export let pageSize

    let currentPage = 1
    let errorMessage = null

    async function getEventsForPage(page) {
        try {
            events = await apiAgent.get({url:'/events', params:{'user.id':apiAgent.getUser().id, status:statusEvents, _sort:'start:ASC', _limit:pageSize, _start:(page - 1) * pageSize}})
        } catch(err) {
            events = []
        }
    }

    async function publish(event) {
        if (event.status != 'approved') return
        try {
            await apiAgent.put({url: `/events/${event.id}`, body:{status:'active'}})
            getEventsForPage(currentPage)
        }
        catch (error){
            errorMessage = error.message
        }
    }

    $: getEventsForPage(currentPage)
</script>

<svelte:head>
    <title>My Events</title>
</svelte:head>
<Header/>
<NavBar/>
<div class="container-fluid">
    <div class="row">
        <div class="col-xs-12">
            <div class="tab-bar">
                <ul>
                    <li><a href="/events?status=active" class:active-tab={statusEvents=='active'}>Active Events</a></li>
                    <li><a href="/events?status=approved" class:active-tab={statusEvents=='draft' || statusEvents=='approved'}>Draft Events</a></li>
                    <li><a href="/events?status=past" class:active-tab={statusEvents=='past'}>Past Events</a></li>
                </ul>
            </div>
        </div>
        {#if statusEvents == 'draft' || statusEvents == 'approved'}
            <div class="col-xs-12">
                <div class="tab-bar-2">
                    <ul>                      
                        <li><a href="/events?status=approved" class:active-tab={statusEvents=='approved'}>Approved Events</a></li>
                        <li><a href="/events?status=draft" class:active-tab={statusEvents=='draft'}>Awaiting Approval</a></li>
                    </ul>
                </div>
            </div>
        {/if}
        {#if errorMessage}
            <div class="col-xs-12">
                <p class="error">{errorMessage}</p>
            </div>
        {/if}
        {#each events || [] as event}
            <EventCard event={event} on:publish={publish(event)}/>
        {:else}
            <p>There are no events</p>
        {/each}
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
        padding-left: 257px;
        margin-top: 90px;
    }
    @media screen and (max-width: 768px) {
        .container-fluid {
            padding-right: 1rem;
            padding-left: 1rem;
        }
    }
</style>