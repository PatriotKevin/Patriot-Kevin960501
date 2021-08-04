<script>
    import { goto } from '$app/navigation';
    import { page } from '$app/stores'
    import { apiAgent } from '$lib/helpers/apiAgent.svelte';
    import { config } from '$lib/helpers/config.svelte';
    export let event
    function logOut() {
        apiAgent.setPersistToken(null)
        apiAgent.token = null
        goto('/auth/login')
    }
    const pageURL = window.location.href
    const closeMenu = (e) => {
        jQuery('.l-navbar').css('left', '-100%')
    }

    let divTag
    let aTagWidth
    const onATagUpdate = (width) => {
        if (width && divTag) {
            divTag.style.maxWidth = (width - 20)+"px"
        }
    }
    $: onATagUpdate(aTagWidth)
</script>
<div class="l-navbar" id="nav-bar">
    <nav class="nav">
        <div>
            <div class="close-menu" style="cursor: pointer;" on:click={closeMenu}>
                <i class='bx bx-x-circle'></i>
            </div>
            <a href="/" class="nav__logo">
                <img src="/assets/img/logo.svg" alt="">
            </a>

            <div class="nav__list">

                <!-- <a class="main-btn" href="/create-event">Create&nbsp;Event</a> -->
                <a href={config.getWebsiteURL(`/event/create?from=${pageURL}`)} class="main-btn">Create&nbsp;your&nbsp;Event!</a>

                <a href="/" class="nav__link" class:active={$page.path == '/'}>
                    <i class='bx bxs-home'></i>
                    <span class="nav__name">Dashboard</span>
                </a>

                <a href="/events?status=active" class="nav__link" class:active={$page.path.search('/event')==0}>
                    <i class='bx bx-list-ul'></i>
                    <span class="nav__name">My Events</span>
                </a>

                <a href="/profile" class="nav__link" class:active={$page.path.search('/profile')==0}>
                    <i class='bx bx-user'></i>
                    <span class="nav__name">Profile</span>
                </a>
            </div>
            <!--@dev/amartis: Not Showing Nav Items related with a single event if the event is not found-->
            {#if $page.path.search('/event/')==0 && event}
            <div class="nav__list">

                <p>Event Dashboard</p>

                <a bind:clientWidth={aTagWidth} href={"/event/info/"+event.id} class="nav__link" class:active={$page.path.search('/event/info')==0}>
                    <div bind:this={divTag} style="max-width:155px;overflow-x:clip;"><span class="nav__name title">{event ? event.name : 'Event Not Found'}</span></div>
                </a>

                <a href={"/event/sales/"+event.id} class="nav__link" class:active={$page.path.search('/event/sales')==0}>
                    <span class="nav__name">Sales Report</span>
                </a>

                <a href={"/event/customer/"+event.id} class="nav__link" class:active={$page.path.search('/event/customer')==0}>
                    <span class="nav__name">Customer Data</span>
                </a>

                <a href={"/event/checkin/"+event.id} class="nav__link" class:active={$page.path.search('/event/checkin')==0}>
                    <span class="nav__name">Customer Check-in</span>
                </a>

                <a href={"/event/report/"+event.id} class="nav__link" class:active={$page.path.search('/event/report')==0}>
                    <span class="nav__name">Check-in Report</span>
                </a>

                <a href={"/event/message/"+event.id} class="nav__link" class:active={$page.path.search('/event/message')==0}>
                    <span class="nav__name">Send Message</span>
                </a>

            </div>
            {/if}
        </div>
        <a href="/auth/logout" class="nav__link" on:click|preventDefault={logOut}>
            <i class='bx bx-log-out'></i>
            <span class="nav__name">Log Out</span>
        </a>
    </nav>
</div>