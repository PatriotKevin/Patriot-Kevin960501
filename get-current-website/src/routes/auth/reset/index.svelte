<script context="module">
    export async function load({ page }) {
        return {
            props: {
                code: page.query.get("code"),
            },
        };
    }
</script>

<script>
    import { goto } from "$app/navigation";
    import { apiAgent } from "$lib/helpers/apiAgent.svelte";
    let password = "";
    let passwordConfirmation = "";
    let error;
    export let code;
    let passwordMismatch;

    const showPrompt = (password_, passwordConfirmation_) => {
        error = null // Hide error message.
        if (password_ === passwordConfirmation_) {
            passwordMismatch = undefined;
        }
        if (!password_) {
            passwordMismatch = "Please enter new password."; // @dev/amartis: Review English message.
            return
        }
        if (password_.length < 8) {
            passwordMismatch = "Password must have be at least 8 characters."
            return
        }
        if (!passwordConfirmation_) {
            passwordMismatch = "Please enter confirm password."; // @dev/amartis: Review English message.
            return
        }
        if (password_ != passwordConfirmation_) {
            passwordMismatch = "Your passwords do not match!";
            return
        }
        passwordMismatch = null
    }
    $: showPrompt(password, passwordConfirmation)

    async function changePassword() {
        if (passwordMismatch) {
            return;
        }
        try {
            await apiAgent.post({
                url: "/auth/reset-password",
                body: { code, password, passwordConfirmation },
                token: null,
            });
            alert("Your password has been successfully reset.");
            goto("/auth/login");
        } catch (err) {
            error = err.message;
        }
    }
</script>

<svelte:head>
    <title>Reset Password</title>
</svelte:head>

<h2>Reset Password</h2>
<div class="mt-10" />
<p>Enter your new passwsord below.</p>
<form action="#" class="mt-30">
    <div class="mt-10" />
    <input
        type="password"
        bind:value={password}
        placeholder="Enter new password"
    />
    <input
        type="password"
        bind:value={passwordConfirmation}
        placeholder="Confirm new password"
    />

    <button type="submit" on:click|preventDefault={changePassword}
        >Change Password</button
    >
    {#if passwordMismatch}<p class="error">{passwordMismatch}</p>{/if}
    {#if error}<p class="error">{error}</p>{/if}
    <div class="mt-20" />
</form>

<style>
    .error {
        color: red;
    }
</style>
