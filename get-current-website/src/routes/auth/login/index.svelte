<script context="module">
    export async function load({ page }) {
        return {
            props: {
                confirmed: page.query.get("confirmed") === "true",
            },
        };
    }
</script>

<script>
    import { goto } from "$app/navigation";
    import { browserSet, browserGet } from "$lib/helpers/browser_utils";
    import { apiAgent } from "$lib/helpers/apiAgent.svelte";
    import { config } from '$lib/helpers/config.svelte'

    export let confirmed;
    let email;
    let password;
    let error;

    async function login() {
        error = undefined;
        if (!(email || password)) {
            error = "You must provide both an email and password to login";
            return;
        }
        try {
            const body = await apiAgent.post({
                url: "/auth/local",
                body: { identifier: email, password: password },
                token: null,
            });
            apiAgent.token = body.jwt;
            apiAgent.setPersistToken(body.jwt);
            // browserSet('get-current-jwt-token', body.jwt)

            if (browserGet("get-current-temp-event")) {
                goto("/event/create");
            } else {
                goto("/event/create");
                // goto(config.dashboardURL);
                // goto('/')
            }
        } catch (err) {
            if (err.id === "Auth.form.error.confirmed") {
                goto("/auth/verify");
            } else {
                error = err.message;
            }
        }
    }
</script>

<svelte:head>
    <title>Event Organizer Login</title>
</svelte:head>

<h2>Login</h2>
<div class="mt-10" />
<p>Let's sign you in</p>

<form action="#" class="mt-30">
    {#if confirmed}
        <p class="email-confirm">
            Your email has been confirmed!
        </p>
    {/if}
    <!-- email -->
    <label for="email">Email</label>
    <input name="email" type="email" bind:value={email} />

    <!-- password -->
    <label for="password">Password</label>
    <input
        class="password"
        name="password"
        type="password"
        bind:value={password}
    />

    <div class="mt-20" />
    <a href="/auth/forgot">Forgot Password ?</a>
    <div class="mt-10" />

    {#if error}<p class="error">{error}</p>{/if}
    <button type="submit" on:click|preventDefault={login}>Login</button>

    <div class="mt-20" />
    <p>Don’t have an account ? <a href="/auth/register" style="color:rgb(23,158,160)">Register</a></p>
</form>

<style>
    .error {
        color: red;
    }
    .email-confirm {
        color: green;
        text-align: center;
    }
    .blocker {
        display: none;
    }
</style>
