<script>
    import { config } from '$lib/helpers/config.svelte';
    import { getEventDates, getEventTimes } from '$lib/helpers/date_utils';

    import { createEventDispatcher } from 'svelte';
        
    export let event

    const dispatch = createEventDispatcher()
    function publish() {
        dispatch('publish')
    }
</script>

<div class="col-lg-4 col-md-6 col-xs-12">
    <div class="card-event">
        {#if event.status == 'active' || event.status == 'past'}
        <a href={'/event/info/'+event.id}>
            <!-- image -->
            <div class="img-card-event">
                <img class="img-full" src={config.getServerURL(event.image.url)} alt="">
            </div>

            <!-- Detail -->
            <div class="card-content">
                <h2 class="title">{event.name}</h2>
                <!-- {#each event.categories as category}
                    <p class="tag">{category.name}</p>
                {/each} -->
                <ul>
                    <li><i class='bx bx-calendar'></i><span>{getEventDates(event.start, event.end)}</span></li>
                    <li><i class='bx bx-time'></i><span>{getEventTimes(event.start, event.end)}</span></li>
                    <li><i class='bx bx-map'></i><span>{config.descEventLocation(event.location)}</span></li>
                </ul>
            </div>
        </a>
        {:else}
        <!-- image -->
        <div class="img-card-event">
            <img class="img-full" src={config.getServerURL(event.image.url)} alt="">
        </div>

        <!-- Detail -->
        <div class="card-content">
            <h2 class="title">{event.name}</h2>
            <!-- {#each event.categories as category}
                <p class="tag">{category.name}</p>
            {/each} -->
            <ul>
                <li><i class='bx bx-calendar'></i><span>{getEventDates(event.start, event.end)}</span></li>
                <li><i class='bx bx-time'></i><span>{getEventTimes(event.start, event.end)}</span></li>
                <li><i class='bx bx-map'></i><span>{config.descEventLocation(event.location)}</span></li>
            </ul>
            {#if event.status == 'approved'}
                <div class="mt-20"></div>
                <a class="main-btn" href='#' on:click|preventDefault={publish}>Publish live</a>    
            {/if}
            {#if event.status == 'draft'}
                <div class="mt-20"></div>
                <a class="main-btn disable">Awaiting Approval</a>
            {/if}
        </div>
        {/if}
    </div>
</div>
<style>
    .img-full {
        height: 295px;
    }
</style>