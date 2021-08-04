<script>
    import { apiAgent } from '$lib/helpers/apiAgent.svelte'

    const validateEmail = (strEmail) => {
        const emailRegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/; // The RegExp from Strapi Auth.js
        return emailRegExp.test(strEmail);
        // const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        // return re.test(String(strEmail).toLowerCase());
    }
    let email
    let emailValid = false
    $: emailValid = validateEmail(email)
    let error
    async function sendConfirmation() {
        if (!emailValid) {
            alert("Please input valid email.")
        }
        error = undefined
        try {
            await apiAgent.post({url:'/auth/send-email-confirmation', body: {email}})
            alert('A new confirmation email has been sent!')
        } catch(err) {
            error = err.message
        }
    }
</script>

<h1>Email Verification Required</h1>
<p>You must verify your email address, please continue by clicking the link in the email you received.</p>
<p>If you did not receive an email then use the field below to resend a confirmation email.</p>
<input type="email" bind:value={email} class:bad={!emailValid} placeholder="Enter email to resend confirmation">
<button on:click={sendConfirmation}>Resend Confirmation</button>
{#if error}<p class="error">{error}</p><a href="/auth/login">Sign in</a>{/if}
<style>
    p {
        margin-top: 40px;
        font-size: 18px;
    }
    a {
      float: right;
      margin-top: 5px;
    }

    input {
        margin-top: 30px;
    }

    .error {
        color: red;
    }

    input.bad {
        border: 2px solid #FAA8A8;
    }
</style>