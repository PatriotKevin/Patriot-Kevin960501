<script>
    import {goto} from '$app/navigation'
    import {apiAgent} from '$lib/helpers/apiAgent.svelte'
    let error
    let email

    async function sendReset() {
        try {
            await apiAgent.post({url:'/auth/forgot-password', body:{email}, token:null})
            goto('/auth/confirm')
        } catch(err) {
            error = err.message
        }
    }
</script>

<svelte:head>
	<title>Forgot Password</title>
</svelte:head>

<h2>Forgot Password</h2>
<div class="mt-10"></div>
<p>Enter your registered email below to receive password reset intruction.</p>
<form action="#" class="mt-30">

    <!-- email -->
    <label for="email">Email</label>
    <input name="email" type="email" bind:value={email}/>
    
    
    <div class="mt-10"></div>

    <button type="submit" on:click|preventDefault={sendReset}>Send</button>
    {#if error}<p class="error">{error}</p>{/if}
    <div class="mt-20"></div>
    
</form>

<style>
    .error {
        color: red;
    }
</style>