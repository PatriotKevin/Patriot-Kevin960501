<script>
    import {apiAgent} from '$lib/helpers/apiAgent.svelte'
    let shown = false
    let replyTo = ""
    let subject = ""
    let content = ""
    function validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    async function sendMessage(e) {
        if (!replyTo) {
            alert('Please provide your email for reach.')
            e.stopPropagation()
            return
        }
        if (!validateEmail(replyTo)) {
            alert('Please provide valid email address.')
            e.stopPropagation()
            return
        }
        if (!subject) {
            alert('Subject is missing.')
            e.stopPropagation()
            return
        }
        if (!content) {
            alert('Content is missing.')
            e.stopPropagation()
            return
        }
        try {
            await apiAgent.post({url:'/messages', body:{replyTo, subject, content}})
            alert('Successfully sent your message.') //@dev/amartis: Review English.
            replyTo = ''
            subject = ''
            content = ''
            // shown = false
        }
        catch {
            //[UI/UX] @dev/amartis: Replace with more beautiful component.
            alert('An error occurred while sending your message. Please try again later.')
        }
    }

</script>

<div id="modal-message" class="modal" class:shown={shown} class:hidden={!shown}>
    <div class="container">
        <div class="row">
            <div class="col-md-12 col-xs-12">
                <div class="modal-content form-main">
                    <h2>Send Message</h2>
                    
                    <div class="mt-20"></div>

                    <label for="subject">Your Email</label>
                    <input type="email" name="replyTo" id="replyTo" bind:value={replyTo} required/>
              
                    <label for="subject">Subject</label>
                    <input type="text" name="subject" id="subject" bind:value={subject} required/>

                    <label for="message">Message</label>
                    <textarea  cols="30" rows="10" name="message" id="message" bind:value={content} required></textarea>

                    <div class="mt-20"></div>
                    <a class="main-btn" href="#" rel="modal:close" on:click={sendMessage}>Send</a>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    .shown {
        display: inline-block;
    }
    .hidden {
        display: none;
    }
    .form-main input:invalid {
        border: 2px solid #FAA8A8;
    }
    .form-main textarea:invalid {
        border: 2px solid #FAA8A8;
    }
</style>