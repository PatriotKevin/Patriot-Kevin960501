<script>
    import { getEventDates } from "$lib/helpers/date_utils";
    import { getTicketsData } from "$lib/helpers/ticket_utils";
    import { config } from "$lib/helpers/config.svelte";

    export let ticketOptions;
    export let name;
    export let image;
    export let location;
    export let start;
    export let end;
    export let id;
    export let externalLink;

    $: price = getTicketsData(ticketOptions).price;
    $: quantity = getTicketsData(ticketOptions).quantity;
    $: eventDate = getEventDates(start, end);
    $: startingPrice = getTicketsData(ticketOptions).startingPrice;
</script>

<a href="/event/{id}">
    <div class="event-item">
        <div
            class="img-event-item"
            style="background-image: url({`${config.getServerURL(
                image.url
            )}`}); height: 222px; background-position: center; background-size: cover;"
        >
            {#if !externalLink || externalLink.length === 0}
                <div class="price">
                    <span
                        >{#if startingPrice && price > 0}<span class="starting"
                                >Starting at</span
                            >
                            ${price}{/if}
                        {#if startingPrice && price == 0}<span class="starting"
                                >Free Tickets Available</span
                            >
                        {/if}
                        {#if !startingPrice && price == 0}<span class="starting"
                                >Free</span
                            >{/if}
                        {#if !startingPrice && price > 0}<span class="starting">
                                ${price}</span
                            >{/if}
                    </span>
                    <!--<span>{#if startingPrice}<span class="starting">Starting at</span>{/if} ${ price === NaN ? 'N/A' : price }</span>-->
                </div>
            {/if}
        </div>

        <div class="event-item-content">
            {#if !externalLink || externalLink.length === 0}
                <p class="ticket-stock">
                    <span
                        ><img
                            src="/assets/img/icon/ticket-outlined.svg"
                            alt=""
                        /></span
                    >
                    <span>{quantity >= 0 ? quantity : "Unlimited"} </span>
                    {#if quantity >= 0}<span>Tickets Left</span>{/if}
                </p>
            {/if}

            <h2 class="event-heading">{name}</h2>

            <p class="loc-date">
                {location.street || ""}{location.city
                    ? `, ${location.city}`
                    : ""} <br><span>&#9679;</span>
                {eventDate}
            </p>
        </div>
    </div>
</a>

<style>
    .starting {
        font-weight: normal;
    }
</style>
