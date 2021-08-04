<script context="module">
    export let ssr = false;

    import { apiAgent } from "$lib/helpers/apiAgent.svelte";
    import { geoDistance } from "$lib/helpers/number_utils";
    import { config } from "$lib/helpers/config.svelte";
    import _intersection from "$lib/lodash/intersection";
    function getRandom(arr, n) {
        var result = new Array(n),
            len = arr.length,
            taken = new Array(len);
        if (n > len)
            throw new RangeError(
                "getRandom: more elements taken than available"
            );
        while (n--) {
            var x = Math.floor(Math.random() * len);
            result[n] = arr[x in taken ? taken[x] : x];
            taken[x] = --len in taken ? taken[len] : len;
        }
        return result;
    }
    function safeURL(domainOrURL) {
        if (!domainOrURL) return "#";
        if (
            domainOrURL.indexOf("http://") == 0 ||
            domainOrURL.indexOf("https://") == 0
        ) {
            return domainOrURL;
        }
        return "http://" + domainOrURL;
    }
    export async function load({ page }) {
        const event = await apiAgent.get({
            url: `/events/${page.params.slug}`,
            token: null,
        });
        const includedSponsors = event.includedSponsors || [];
        const excludedSponsors = event.excludedSponsors || [];
        const fetchedIds = includedSponsors
            .map((sponsor) => sponsor.id)
            .concat(excludedSponsors.map((sponsor) => sponsor.id));
        //let matchCases = (event.categories || []).map(category => ({categories_contains: category.id}))
        // matchCases.push({alwaysShow: true})
        let sponsors = await apiAgent.get({
            url: `/sponsors`,
            token: null,
            params: {
                id_nin: fetchedIds,
                // _or: matchCases,
                _limit: -1,
            },
        });

        // Filter: within range
        sponsors = sponsors.filter(
            (sponsor) =>
                config.sponsorDistance >
                geoDistance(
                    event.location.latitude,
                    event.location.longitude,
                    sponsor.address.latitude,
                    sponsor.address.longitude
                )
        );

        // Pick premium sponsors
        const premium_included_sponsors = includedSponsors.filter(
            (sponsor) => sponsor.premium
        );
        const premium_second_pool_sponsors = sponsors.filter(
            (sponsor) =>
                sponsor.premium &&
                (sponsor.alwaysShow ||
                    _intersection(
                        sponsor.categories.map((category) => category.id),
                        event.categories.map((category) => category.id)
                    ).length > 0)
        );
        const premium_third_pool_sponsors = sponsors.filter(
            (sponsor) =>
                sponsor.premium &&
                !sponsor.alwaysShow &&
                _intersection(
                    sponsor.categories.map((category) => category.id),
                    event.categories.map((category) => category.id)
                ).length == 0
        );

        let premium_sponsors = [];
        var stillToFill = config.sponsorMaxPremium;
        if (stillToFill) {
            const sponsors_to_add = getRandom(
                premium_included_sponsors,
                Math.min(premium_included_sponsors.length, stillToFill)
            );
            premium_sponsors = premium_sponsors.concat(sponsors_to_add);
            stillToFill -= sponsors_to_add.length;
        }
        if (stillToFill) {
            const sponsors_to_add = getRandom(
                premium_second_pool_sponsors,
                Math.min(premium_second_pool_sponsors.length, stillToFill)
            );
            premium_sponsors = premium_sponsors.concat(sponsors_to_add);
            stillToFill -= sponsors_to_add.length;
        }
        if (stillToFill) {
            const sponsors_to_add = getRandom(
                premium_third_pool_sponsors,
                Math.min(premium_third_pool_sponsors.length, stillToFill)
            );
            premium_sponsors = premium_sponsors.concat(sponsors_to_add);
            stillToFill -= sponsors_to_add.length;
        }
        //save preminum_sponsor ids
        const presponsorIds = await premium_sponsors.map(
            (sponsor) => sponsor.id
        );
        browserSet("purchased-sponsor-ids", presponsorIds);

        // Pick regular sponsors
        const regular_included_sponsors = includedSponsors.filter(
            (sponsor) => !sponsor.premium
        );
        const regular_second_pool_sponsors = sponsors.filter(
            (sponsor) =>
                !sponsor.premium &&
                (sponsor.alwaysShow ||
                    _intersection(
                        sponsor.categories.map((category) => category.id),
                        event.categories.map((category) => category.id)
                    ).length > 0)
        );
        const regular_third_pool_sponsors = sponsors.filter(
            (sponsor) =>
                !sponsor.premium &&
                !sponsor.alwaysShow &&
                _intersection(
                    sponsor.categories.map((category) => category.id),
                    event.categories.map((category) => category.id)
                ).length == 0
        );

        let regular_sponsors = [];
        stillToFill = config.sponsorMaxRegular;
        if (stillToFill) {
            const sponsors_to_add = getRandom(
                regular_included_sponsors,
                Math.min(regular_included_sponsors.length, stillToFill)
            );
            regular_sponsors = regular_sponsors.concat(sponsors_to_add);
            stillToFill -= sponsors_to_add.length;
        }
        if (stillToFill) {
            const sponsors_to_add = getRandom(
                regular_second_pool_sponsors,
                Math.min(regular_second_pool_sponsors.length, stillToFill)
            );
            regular_sponsors = regular_sponsors.concat(sponsors_to_add);
            stillToFill -= sponsors_to_add.length;
        }
        if (stillToFill) {
            const sponsors_to_add = getRandom(
                regular_third_pool_sponsors,
                Math.min(regular_third_pool_sponsors.length, stillToFill)
            );
            regular_sponsors = regular_sponsors.concat(sponsors_to_add);
            stillToFill -= sponsors_to_add.length;
        }

        return { props: { event, premium_sponsors, regular_sponsors } };
    }
</script>

<script>
    import Nav from "$lib/components/Nav.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import { getEventDates, getEventTimes } from "$lib/helpers/date_utils";
    import { getTicketsData } from "$lib/helpers/ticket_utils";
    import { browserSet } from "$lib/helpers/browser_utils";
    import LibLoader from "$lib/helpers/LibLoader.svelte";
    import ContactModal from "$lib/components/ContactModal.svelte";

    export let event;
    export let premium_sponsors;
    export let regular_sponsors;
    let countSponsors = premium_sponsors.length + regular_sponsors.length;
    let today = new Date();
    let currentDate = today.toISOString();
    browserSet("purchase-event", event);
    let map;
    const onMapJsLoaded = () => {
        console.log("onMapJsLoaded");
        setTimeout(() => {
            const eventLocation = {
                lat: event.location.latitude,
                lng: event.location.longitude,
            };
            map = new google.maps.Map(document.getElementById("map"), {
                zoom: 17,
                center: eventLocation,
            });
            const strLabel =
                (event.location.venueName
                    ? event.location.venueName + " - "
                    : "") + event.location.street;
            const pinSymbol = (color) => {
                return {
                    path:
                        "M 0,0 C -2,-20 -10,-22 -10,-30 A 10,10 0 1,1 10,-30 C 10,-22 2,-20 0,0 z",
                    fillColor: color,
                    fillOpacity: 1,
                    strokeColor: "#000",
                    strokeWeight: 1,
                    scale: 1,
                    labelOrigin: new google.maps.Point(15, -55),
                };
            };
            new google.maps.Marker({
                position: eventLocation,
                label: {
                    text: strLabel,
                    color: "green",
                    fontSize: "20px",
                    fontWeight: "900",
                },
                map: map,
                icon: pinSymbol("red"),
            });
            // googleApiReady = true
        }, 2000);
    };
</script>

<svelte:head>
    <title>{event.name}</title>
</svelte:head>
<LibLoader
    url={`https://maps.googleapis.com/maps/api/js?key=${config.googleApiKey}&callback=&libraries=&v=weekly`}
    on:loaded={onMapJsLoaded}
    async={true}
/>
<ContactModal />
<Nav />
{#if !event}
    <p>Could not find event.</p>
{:else}
    <div class="mt-30" />

    <div class="full-bg">
        <div class="img-bg">
            <div class="overlay" />
            <img
                class="img-full"
                src={config.getServerURL(event.image.url)}
                alt=""
            />
        </div>
    </div>

    <!-- Start event header -->
    <div class="event-header">
        <div class="container">
            <div class="row">
                <div class="col-md-8 col-xs-12">
                    <div
                        class="img-event-detail"
                        style="background-image: url({`${config.getServerURL(
                            event.image.url
                        )}`}); height: 250px; background-position: center; background-size: cover;"
                    >
                        <!--
                        <img
                            class="img-full"
                            src={config.getServerURL(event.image.url)}
                            alt=""
                        />
                        -->
                    </div>
                </div>
                <div class="col-md-4 col-xs-12 relative">
                    <div class="event-detail-content">
                        <h2>{event.name}</h2>
                        <p class="location">
                            {event.location.street || ""}{event.location.city
                                ? ", " + event.location.city
                                : ""}
                        </p>
                        <p class="time">
                            {getEventTimes(event.start, event.end)}
                        </p>
                        <p class="date">
                            {getEventDates(event.start, event.end)}
                        </p>
                        {#if !event.externalLink}
                            <p class="ticket-stock" title="Number of tickets">
                                <span
                                    ><img
                                        src="/assets/img/icon/ticket-outlined.svg"
                                        alt=""
                                    /></span
                                >
                                <span
                                    >{getTicketsData(event.ticketOptions)
                                        .quantity >= 0
                                        ? getTicketsData(event.ticketOptions)
                                              .quantity
                                        : "Unlimited"}
                                </span>
                                {#if getTicketsData(event.ticketOptions).quantity >= 0}
                                    <span>Tickets Left</span>
                                {/if}
                            </p>
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- end event header -->

    <!-- Start Pricing -->
    <div class="event-detail-pricing">
        <div class="container">
            <div class="row">
                <div class="col-md-8 col-xs-6">
                    <p class="price">
                        {#if !event.externalLink}
                            {#if getTicketsData(event.ticketOptions).startingPrice}
                                <span>Starting at</span> ${getTicketsData(
                                    event.ticketOptions
                                ).price}
                            {:else}
                                Free
                            {/if}
                        {/if}
                    </p>
                </div>
                <div class="col-md-4 col-xs-6">
                    {#if event.externalLink}
                        <a
                            href={event.externalLink.startsWith('http') || event.externalLink.startsWith('https') ? event.externalLink : 'http://' + event.externalLink}
                            class="main-btn"
                            target="_blank"
                            rel="noopener noreferrer">Get More Details</a
                        >
                    {:else}
                        {#if event.end > currentDate}
                            <a href="/order/select-ticket" class="main-btn"
                                >GET YOUR TICKET</a
                            >
                        {/if}
                    {/if}
                </div>
            </div>
        </div>
    </div>
    <!-- End Pricing -->
    <!-- Start Event Info -->
    <div class="event-detail-info">
        <div class="container">
            <div class="row">
                <div class="col-md-8 col-xs-12 info-event">
                    <div class="event-info-text block">
                        <h2 class="title">Event Detail</h2>
                        {@html event.description}

                        <ul class="tags">
                            {#each event.categories as category}
                                <li>{category.name}</li>
                            {/each}
                        </ul>
                    </div>

                    <!-- location -->
                    <div class="block">
                        <h2 class="title">Location</h2>
                        <div id="map" style="height:307px;" />
                    </div>
                </div>
                <div class="col-md-4 col-xs-12">
                    {#if countSponsors > 0}
                        <!-- Start Sponsor ads -->
                        <div class="ads block">
                            <h2 class="title">Shop Local</h2>

                            <!-- start loop premium ad -->
                            {#each premium_sponsors as sponsor}
                                <div class="img-ad">
                                    {#if sponsor.website}
                                        <a
                                            href={safeURL(sponsor.website)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <img
                                                class="img-full"
                                                src={`${config.getServerURL(
                                                    sponsor.adImageUrl
                                                )}`}
                                                alt="Image for {sponsor.name}"
                                                title={sponsor.name}
                                            />
                                            <!-- <div class="cnt">
                                <h4 class="ad-heads">{sponsor.name}</h4>
                                <p class="ad-desc">{sponsor.description}</p>
                            </div> -->
                                        </a>
                                    {:else}
                                        <img
                                            class="img-full"
                                            src={`${config.getServerURL(
                                                sponsor.adImageUrl
                                            )}`}
                                            alt="Image for {sponsor.name}"
                                            title={sponsor.name}
                                        />
                                        <!-- <div class="cnt">
                            <h4 class="ad-heads">{sponsor.name}</h4>
                            <p class="ad-desc">{sponsor.description}</p>
                        </div> -->
                                    {/if}
                                </div>
                            {/each}
                            <!-- end loop premium ad -->

                            <!-- start loop regular ad -->
                            {#each regular_sponsors as sponsor}
                                <div class="img-ad">
                                    {#if sponsor.website}
                                        <a
                                            href={safeURL(sponsor.website)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <p class="ad-desc">
                                                <span class="sponsorname"
                                                    >{sponsor.name} -</span
                                                >
                                                {sponsor.description}
                                            </p>
                                            <!-- <div class="cnt">
                                <h4 class="ad-heads">{sponsor.name}</h4>
                                <p class="ad-desc">{sponsor.description}</p>
                            </div> -->
                                        </a>
                                    {:else}
                                        <div class="cnt">
                                            <p class="ad-desc">
                                                <span class="sponsorname"
                                                    >{sponsor.name} -</span
                                                >
                                                {sponsor.description}
                                            </p>
                                            <!-- <h4 class="ad-heads">{sponsor.name}</h4>
                            <p class="ad-desc">{sponsor.description}</p> -->
                                        </div>
                                    {/if}
                                </div>
                            {/each}
                            <!-- end loop regular ad -->
                        </div>
                        <!-- End Sponsor ads -->
                    {/if}

                    <!-- EO -->
                    <div class="block">
                        <h2 class="title">Event Organizer</h2>
                        <p>{event.organizer || "Not Specified"}</p>
                    </div>

                    <!-- PHone -->
                    <div class="block">
                        <h2 class="title">Phone Number</h2>
                        <p>
                            {#if event.phone}
                                <a href={`tel:${event.phone}`}
                                    >{event.phone || "N/A"}</a
                                >
                            {:else}
                                <p>Not Specified</p>
                            {/if}
                        </p>
                    </div>

                    <!-- External Link -->
                    {#if event.externalLink}
                        <div class="block">
                            <h2 class="title">External Link</h2>
                            <p>{event.externalLink}</p>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
    <!-- End Event Info -->
{/if}

<!-- NEW CSS -->
<style>
    .premiumAd {
        margin-bottom: 20px;
    }

    .premiumAd img {
        display: block;
        width: 100%;
    }

    .regularAd {
        margin-bottom: 20px;
        -webkit-transition: 0.2s all ease-in;
        transition: 0.2s all ease-in;
    }

    .regularAd:hover {
        opacity: 0.8;
    }

    .regularAd p {
        font-weight: 500;
    }

    .regularAd p span {
        font-weight: 600;
        color: #4a538d;
    }

    @media (min-width: 1024px) {
        .info-event {
            padding-right: 40px;
        }
    }
    .sponsorname {
        font-weight: bold;
    }
</style>
