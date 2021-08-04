<script>
    import { goto } from '$app/navigation'
    import { apiAgent } from '$lib/helpers/apiAgent.svelte';
    import { onMount } from 'svelte';
    import { config } from '$lib/helpers/config.svelte';
    export let event
    onMount(() => {
        if (!apiAgent.getToken())
            goto('/auth/login')
    })
    const pageURL = window.location.href
    const toggleMenu = (e) => {
        let navBar = jQuery('.l-navbar')
        if (!navBar) {
            console.log('.l-navbar not found.')
            return;
        }
        if (navBar.css('left')[0]=='-') {
            navBar.css('left','0%')
        }
        else {
            navBar.css('left', '-100%')
        }
    }
</script>
<header class="header" id="header">

    <div class="header__toggle" on:click={toggleMenu}>
        <i class='bx bx-menu' id="header-toggle"></i>
    </div>

    <div class="title-main">
        {#if event}
        <h2>{event.name}</h2>
        {:else if window.location.pathname.indexOf('/events')==0}
        <h2>Events</h2>
        {:else if window.location.pathname.indexOf('/profile')==0}
        <h2>Profile</h2>
        {:else}
        <h2>Dashboard</h2>
        {/if}
    </div>

    <div class="btn">
        <a href={config.getWebsiteURL(`/event/create?from=${pageURL}`)} class="main-btn">Create&nbsp;your&nbsp;Event!</a>
    </div>

</header>