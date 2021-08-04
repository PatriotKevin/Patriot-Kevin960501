<script context="module">
    export const ssr = false;
    import { config } from '$lib/helpers/config.svelte'
    import { apiAgent } from '$lib/helpers/apiAgent.svelte'
    import Header from '$lib/components/Header.svelte'
    import NavBar from '$lib/components/NavBar.svelte'
    export async function load({page}) {
        // @dev/amartis: temporary fix due to sveltekit issue.
        if (!page.params.slug) {
            page.params.slug = page.path.substr(page.path.lastIndexOf('/')+1)
        }
        const user = await apiAgent.get({url:`/users/me`})
        const event = await apiAgent.get({url:`/events/${page.params.slug}`})
        return {props: {user, event}}
    }
</script>

<script>
    export let user
    export let event
    let subject = ""
    let content = ""
    async function send() {
        if (!subject) {
            alert('Subject is missing.')
            return
        }
        
        if (!content) {
            alert('Content is missing.')
            return
        }
        
        await apiAgent.post({url:`/messages`, body: {
            replyTo: user.email,
            subject,
            content,
            event: event.id
        }})
        alert("Successfully sent message.") // @dev/amartis: Review English message.
        subject = ""
        content = ""
    }
</script>

<svelte:head>
    <title>My Events</title>
</svelte:head>
<Header event={event}/>
<NavBar event={event}/>

<div class="container-fluid">
    <div class="row">
        <div class="col-md-7 col-xs-12">
            <h4>Send Message</h4>
            <form class="form-main" style="margin:0px;" action="#">
                <div class="row">
                    <div class="col-xs-12">
                       
                        <label>Subject</label>
                        <input type="text" bind:value={subject}/>

                        <label>Message</label>
                        <textarea name="" id="" cols="30" rows="10" bind:value={content}></textarea>

                        <button class="main-btn" on:click|preventDefault = {send}>Send</button>
                    </div>
                </div>                   
                <div class="mt-50"></div>
            </form>
        </div>
    </div>
</div>

<style>
    .container-fluid {
        padding-left: 265px;
        margin-top: 90px;
    }
    @media screen and (max-width: 768px) {
        .container-fluid {
            padding-right: 1rem;
            padding-left: 1rem;
        }
    }
</style>