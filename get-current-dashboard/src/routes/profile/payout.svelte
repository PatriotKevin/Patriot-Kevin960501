<script context="module">
    export const ssr = false
    import { apiAgent } from '$lib/helpers/apiAgent.svelte'

    export async function load() {
        const user = await apiAgent.get({url:`/users/me`})
        return {props: {user}}
    }
</script>
<script>
    import Header from '$lib/components/Header.svelte'
    import NavBar from '$lib/components/NavBar.svelte'
    import _cloneDeep from '$lib/lodash/cloneDeep'
    import { config } from '$lib/helpers/config.svelte';

    export let user

    async function connectStripe() {
        const apiResponse = await apiAgent.post({url:'/payout/connect'})
        window.location.href = apiResponse.redirect
    }

    async function loginStripe() {
        const apiResponse = await apiAgent.post({url:'/payout/account'})
        window.location.href = apiResponse.redirect
    }
</script>

<svelte:head>
    <title>Profile</title>
</svelte:head>
<Header/>
<NavBar/>

<div class="container-fluid custom-container">
    <div class="row">

        <!-- Start form -->
        <div class="col-md-7 col-xs-12">
            <div class="tab-bar">
                <ul>
                    <li><a href="/profile">Basic&nbsp;Information</a></li>
                    <li><a class="active-tab" href="/profile/payout">Payout&nbsp;Setting</a></li>
                    <li><a href="/profile/password">Password&nbsp;Change</a></li>
                </ul>
            </div>
            {#if !user.stripeConnectId}
                <div class="alert">
                    <p>You need to set up Stripe Connect account to withdraw your money.</p>
                </div>
                <div class="mt-30"></div>
                <button class="main-btn" style="cursor: pointer;" on:click={connectStripe}>Connect with Stripe</button>
            {/if}
            {#if user.stripeConnectId && user.stripeConnectId.startsWith('creating_')}
                <div class="alert">
                    <p>You seems to have aborted in the middle of signing up Stripe Connect account.</p>
                </div>
                <div class="mt-30"></div>
                <button class="main-btn" style="cursor: pointer;" on:click={connectStripe}>Connect with Stripe</button>
            {/if}
            {#if user.stripeConnectId && !user.stripeConnectId.startsWith('creating_')}
                <div>
                    <p>You already have set up Stripe Account</p>
                </div>
                <div class="mt-20"></div>
                <button class="main-btn" style="cursor: pointer;" on:click={loginStripe}>Stripe Dashboard</button>
            {/if}
        </div>

    </div>
</div>

<style>
    /**Profile Pages Common*/
    .form-main {
        padding: 0;
        margin: 0;
    }
    input.bad:focus, input.bad {
        border: 2px solid #FAA8A8;
    }
    .container-fluid {
        padding-left: 265px;
        margin-top: 90px;
    }
    .tab-bar ul {
        display:flex;
        /* justify-content: space-around;
        -webkit-justify-content: space-around; */
    }
    .tab-bar ul li {
        flex: 1;
    }
    .tab-bar ul li a {
        display:block;
        text-align: center;
    }
    @media screen and (max-width: 768px) {
        :global(.container-fluid) {
            padding-right: 1rem;
            padding-left: 1rem;
        }
        .custom-container {
            padding-left:10px!important;
            padding-right:10px!important;
        }
    }
</style>