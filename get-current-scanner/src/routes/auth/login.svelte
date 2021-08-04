<script>
    import { goto } from '$app/navigation'
    import { apiAgent } from "$lib/helpers/apiAgent.svelte";
    import { config } from '$lib/helpers/config.svelte';
    
    let email
    let password
    let errorMessage

    async function login() {
        errorMessage = null
        if(!(email || password)) {
            error = 'You must provide both an email and password to login'
            return
        }
        try {
            apiAgent.token = null
            let resp = await apiAgent.post({url:"auth/local", body: {identifier:email, password}, token:null})
            apiAgent.token = resp.jwt
            apiAgent.setUser(resp.user)
            apiAgent.setPersistToken(resp.jwt)
            goto('/')
        }
        catch (err) {
            if(err.responded && err.id === 'Auth.form.error.confirmed') {
                goto('/auth/verify')
            } else {
                errorMessage = err.message
            }
        }
    }
</script>

<svelte:head>
	<title>Event Organizer Login</title>
</svelte:head>

<h2>Login</h2>
<div class="mt-10"></div>
<p>Let's sign you in</p>

<form action="#" class="mt-30">
    <!-- email -->
    <label for="email">Email</label>
    <input name="login[email]" type="email" bind:value={email}/>
    
    <!-- password -->
    <label for="password">Password</label>
    <input class="password" name="login[password]" type="password" bind:value={password}/>
    
    <div class="mt-20"></div>
    <a href={config.getWebsiteURL("/auth/forgot")}>Forgot Password ?</a>
    <div class="mt-10"></div>

    {#if errorMessage != null}
    <p class="error">{errorMessage}</p>
    {/if}
    <button type="submit" on:click|preventDefault={login}>Login</button>

    <div class="mt-20"></div>
    <p>Don’t have an account ? <a href={config.getWebsiteURL("/auth/register")} style="color:rgb(23,158,160)">Register</a></p>
</form>

<style>
    .error {
        color: red;
    }
    .email-confirm {
        color: green; 
        text-align: center;
    }
</style>
