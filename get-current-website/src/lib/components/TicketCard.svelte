<script>
    import { getEventDates, getEventTimes, getTimeString } from '$lib/helpers/date_utils'
    import { createEventDispatcher } from 'svelte'

    const dispatch = createEventDispatcher()
    export let ticketOption
    export let showOnly
</script>

<div class="col-md-6 col-xs-12">
    <div class="ticket">
        <div class="v-line">
            <div class="t-dot"></div>
            <b class="b-dot"></b>
        </div>
        <div class="row ticket-header">
            {#if showOnly}
            <div class="col-xs-12">
                <h3 class="title">{ticketOption.ticketTypeName || ticketOption.ticket_type.name}</h3>
            </div>
            {:else}
            <div class="col-xs-8">
                <h3 class="title">{ticketOption.ticketTypeName || ticketOption.ticket_type.name}</h3>
            </div>
            <div class="col-xs-4">
                <ul>
                    <a href="#modal-ticket" rel="modal:open" on:click={() => dispatch('edit')}><li><img src="/assets/img/icon/edit.svg" alt=""></li></a>
                    <a href="#" on:click|preventDefault={() => dispatch('delete')}><li><img src="/assets/img/icon/delete.svg" alt=""></li></a>
                </ul>
            </div>
            {/if}
        </div>
        <p class="ticket-slot"><span>
            {#if ticketOption.quantity >= 0}
                {ticketOption.quantity}
            {:else}
                Unlimited
            {/if}
        </span> Tickets</p>
        <p class="ticket-slot">$ <span>
            {#if ticketOption.price > 0}
                {(ticketOption.price / 100).toFixed(2)}
            {:else}
                Free
            {/if}
        </span></p>
        <p class="ticket-date"><span>{getEventDates(ticketOption.start, ticketOption.end)}</span></p>
        <p class="ticket-time"><span>{getEventTimes(ticketOption.start, ticketOption.end)}</span></p>
    </div>
</div>

<style>
    li {
        cursor: pointer;
    }
</style>