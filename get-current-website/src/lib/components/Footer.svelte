<script>
    import { apiAgent } from "$lib/helpers/apiAgent.svelte";
    import { config } from "$lib/helpers/config.svelte";
    let token = apiAgent.getPersistedToken();
    const signOut = (e) => {
        apiAgent.setPersistToken(null);
        apiAgent.token = null;
        token = null;
    };
</script>

<footer>
    <div class="container">
        <a id="footer" />
        <div class="row col reverse">
            <div class="col-md-6 col-xs-12">
                <p>&copy; Copyright 2021 Getcurrent.ca</p>
            </div>
            <div class="col-md-6 col-xs-12 r-text">
                <ul>
                    <li class="mobile-only">
                        <a
                            href="https://getcurrent.ca/for-events"
                            target="_blank">Get Current for Events</a
                        >
                    </li>
                    <li class="mobile-only">
                        <a
                            href="https://getcurrent.ca/business/"
                            target="_blank">Get Current for Business</a
                        >
                    </li>
                    <li class="mobile-only">
                        <a href="#modal-message" rel="modal:open">Contact Us</a>
                    </li>
                    <li>
                        <a href="https://getcurrent.ca/help" target="_blank"
                            >Help</a
                        >
                    </li>
                    {#if !token}
                        <li>
                            <a href={`${config.dashboardURL}/auth/login`}
                                >Sign in</a
                            >
                        </li>
                    {:else}
                        <li>
                            <a
                                href={`${config.dashboardURL}`}
                                title="Sign in to dashboard with same email and password."
                                >Dashboard</a
                            >
                        </li>
                        <li>
                            <a href="#" on:click|preventDefault={signOut}
                                >Sign out</a
                            >
                        </li>
                        <!-- <li><a href="/auth/promotion-register">Event Sponsor Registration</a></li> -->
                    {/if}
                </ul>
            </div>
        </div>
    </div>
</footer>

<style>
    .mobile-only {
        display: none;
    }
    @media (max-width: 764px) {
        .mobile-only {
            display: inline;
        }
    }
</style>
