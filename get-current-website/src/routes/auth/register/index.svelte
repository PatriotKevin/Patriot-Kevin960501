<script context="module">
    export const ssr = false;

</script>
<script>
    import { goto } from '$app/navigation'
    import { apiAgent } from '$lib/helpers/apiAgent.svelte'

    const urlParams = new URLSearchParams(window.location.search);
    const fromDashboard = urlParams.has('dashboard');
    console.log({fromDashboard})

    let email
    $: username = email
    let firstName
    let lastName
    let organization
    let password
    

    let confirmEmail
    let confirmPassword
    let passwordMismatch
    let emailMismatch
    let error

    $: user = {
        email,
        username,
        firstName,
        lastName,
        organization,
        password
    }

    async function register() {
        if (passwordMismatch) {
            return
        }
        if (password.length < 8) {
            alert('Password must have be at least 8 characters.')
            return
        }
        error = undefined
        if(!(email || username || firstName || lastName || organization || password)) {
            error = 'All fields are required'
            return
        }
        try {
            await apiAgent.post({url: '/auth/local/register'+(fromDashboard ? '?dashboard=true' : ''), body:user, token: null})
            goto('/auth/verify')
        } catch(err) {
            error = err.message
        }
    }

    $: if(email === confirmEmail) {
        emailMismatch = undefined
    }

    $: if(email != confirmEmail) {
        emailMismatch = 'Your emails do not match!'
    }

    $: if(password === confirmPassword) {
        passwordMismatch = undefined
    }

    $: if(password != confirmPassword) {
        passwordMismatch = 'Your passwords do not match!'
    }
</script>

<svelte:head>
	<title>Event Organizer Registration</title>
</svelte:head>

<h2>Sign Up</h2>
<div class="mt-10"></div>
<p>Create an account</p>
<form action="#" class="mt-30">

    <!-- email -->
    <label for="email">Email</label>
    <input name="email" type="email" bind:value={email}/>

    <!-- confirm email -->
    <label for="confirm-email">Confirm Email</label>
    <input name="confirm-email" type="email" bind:value={confirmEmail}/>
    {#if emailMismatch}<p class="error">{emailMismatch}</p>{/if}
    <div class="row">
        <div class="col-md-6 col-xs-12">
            <!-- First Name -->
            <label for="firstname">First Name</label>
            <input name="firstname" type="text" bind:value={firstName}/>
        </div>
        <div class="col-md-6 col-xs-12">
            <!-- First Name -->
            <label for="lastname">Last Name</label>
            <input type="text" name="lastname" bind:value={lastName}/>
        </div>
    </div>

        <!-- Organization -->
        <label for="organization">Organization</label>
        <input name="organization" type="text" bind:value={organization}/>

    <!-- password -->
    <label for="password">Password</label>
    <input class="password" name="password" type="password" bind:value={password}/>

    <label for="confirmpassword">Confirm Password</label>
    <input class="password" name="confirmpassword" type="password" bind:value={confirmPassword}/>
    {#if passwordMismatch}<p class="error">{passwordMismatch}</p>{/if}
    <p>Password must have be at least 8 characters</p>
    <div class="mt-10"></div>
    {#if error}<p class="error">{error}</p>{/if}
    <button type="submit" on:click|preventDefault={register}>Sign Up</button>

    <div class="mt-20"></div>
    <p>Already have an account ? <a href="/auth/login" style="color:rgb(23,158,160)">Sign in</a></p>
</form>

<style>
    .error {
        color: red;
    }
</style>