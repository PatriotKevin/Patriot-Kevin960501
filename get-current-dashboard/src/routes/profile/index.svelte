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
    import _pick from '$lib/lodash/pick'

    export let user
    const save = async (e) => {
        console.log(e)
        try {
            await apiAgent.put({url:`/users/${user.id}`, body:_pick(user, ['firstName','lastName','organization', 'phone', 'website','address','additionalInfo'])})
            alert('Successfully saved.')
        }
        catch (error) {
            alert(`Failed to save your information.\n${error.message || ''}`)
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
                    <li><a class="active-tab" href="/profile">Basic&nbsp;Information</a></li>
                    <li><a href="/profile/payout">Payout&nbsp;Setting</a></li>
                    <li><a href="/profile/password">Password&nbsp;Change</a></li>
                </ul>
            </div>
            <form class="form-main" action="#">
                <div class="row">
                    <div class="col-md-6 col-xs-12">
                        <label for="first-name">First Name</label>
                        <input id="first-name" type="text" bind:value={user.firstName}/>
                    </div>
                    <div class="col-md-6 col-xs-12">
                        <label for="last-name">Last Name</label>
                        <input id="last-name" type="tel" bind:value={user.lastName}/>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 col-xs-12">
                        <label for="org-name">Organization Name</label>
                        <input id="org-name" type="text" bind:value={user.organization}/>
                    </div>
                    <div class="col-md-6 col-xs-12">
                        <label for="phone-num">Phone Number</label>
                        <input id="phone-num" type="tel" bind:value={user.phone}/>
                    </div>
                </div>

                <div class="row">
                    <div class="col-xs-12">
                       
                        <label for="website">Website</label>
                        <input id="website" type="text" bind:value={user.website}/>

                        <label for="address">Address</label>
                        <textarea name="" id="address" cols="30" rows="5" bind:value={user.address}></textarea>

                        <label for="additional">Additional Information</label>
                        <textarea name="" id="additional" cols="30" rows="10" bind:value={user.additionalInfo}></textarea>

                        <button class="main-btn" on:click|preventDefault={save}>Save changes</button>
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