<script context="module">
    export const ssr = false
    import { apiAgent } from '$lib/helpers/apiAgent.svelte'
    export async function load({}) {
        const user = await apiAgent.get({url:`/users/me`})
        return {props: {user}}
    }
</script>
<script>
    import Header from '$lib/components/Header.svelte'
    import NavBar from '$lib/components/NavBar.svelte'
    export let user
    let oldPassword = ''
    let newPassword = ''
    let confirmPassword = ''
    let inputOldPassword
    let inputNewPassword
    let inputConfirmPassword
    let errorMessage = null

    const updatePassword = async (e) => {
        if (errorMessage) {
            alert(errorMessage)
            return
        }
        if (!oldPassword) {
            alert('Please enter old password') // @dev/amartis: Review English message.
            inputOldPassword.classList.add('bad')
            return
        }
        if (!newPassword) {
            alert ('Please enter new password') // @dev/amartis: Review English message.
            inputNewPassword.classList.add('bad')
            return
        }
        if (!confirmPassword) {
            alert ('Please confirm new password') // @dev/amartis: Review English message.
            inputConfirmPassword.classList.add('bad')
            return
        }
        if (newPassword != confirmPassword) {
            alert("Passwords don't match") // @dev/amartis: Review English message.
            inputNewPassword.classList.add('bad')
            inputConfirmPassword.classList.add('bad')
            return
        }
        try {
            await apiAgent.put({url:`/users/${user.id}`, body:{password:newPassword, oldPassword}})
            alert('Successfully saved.')
        }
        catch (error) {
            alert(`Failed to save your information.\n${error.message || ''}`)
        }
    }

    const onChange = async (e) => {
        errorMessage = ''
        if (e.target == inputOldPassword) {
            if (!oldPassword) {
                inputOldPassword.classList.add('bad')
                errorMessage = errorMessage || 'Please input old password'
            }
            else {
                inputOldPassword.classList.remove('bad')
            }
        }
        else if (e.target == inputNewPassword || e.target == inputConfirmPassword) {
            if (!inputNewPassword.value) {
                inputNewPassword.classList.add('bad')
                errorMessage = errorMessage || 'Please input new password'
            }
            else {
                inputNewPassword.classList.remove('bad')
            }
            if (!inputConfirmPassword.value) {
                inputConfirmPassword.classList.add('bad')
                errorMessage = errorMessage || 'Please input confirm password'
            }
            else {
                inputConfirmPassword.classList.remove('bad')
            }
            if (inputNewPassword.value && inputConfirmPassword.value && newPassword != confirmPassword) {
                errorMessage = errorMessage || "Passwords don't match"
                if (newPassword.length == confirmPassword.length ) {
                    inputNewPassword.classList.add('bad')
                    inputConfirmPassword.classList.add('bad')
                }
                else if (newPassword.length > confirmPassword.length) {
                    inputConfirmPassword.classList.add('bad')
                }
                else {
                    inputNewPassword.classList.add('bad')
                }
            }
        }
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
                    <li><a href="/profile/payout">Payout&nbsp;Setting</a></li>
                    <li><a class="active-tab" href="/profile/password">Password&nbsp;Change</a></li>
                </ul>
            </div>
            <form class="form-main" action="#">
                <div class="row">
                    <div class="col-xs-12">

                        <label>Old Password</label>
                        <input type="password" bind:value={oldPassword} bind:this={inputOldPassword} on:keyup={onChange}/>

                        <label>New Password</label>
                        <input type="password" bind:value={newPassword} bind:this={inputNewPassword} on:keyup={onChange}/>

                        <label>Confirm New Password</label>
                        <input type="password" bind:value={confirmPassword} bind:this={inputConfirmPassword} on:keyup={onChange}/>

                        <div class="mt-10"></div>
                        {#if errorMessage}<p class="error">{errorMessage}</p>{/if}
                        <button class="main-btn" on:click|preventDefault={updatePassword}>Save changes</button>
                    </div>
                </div>                   
                <div class="mt-50"></div>
            </form>
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