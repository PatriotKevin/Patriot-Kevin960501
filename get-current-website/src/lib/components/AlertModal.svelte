<script>
    import {goto} from '$app/navigation'

    export let text
    export let backText
    export let submitText
    export let submitLink

    import { createEventDispatcher } from 'svelte'

    const dispatch = createEventDispatcher()

    function takeAction() {
        if(submitLink != '#') {
            goto(submitLink)  
        } else {
            dispatch('success')
        }
    }
</script>

<div id="modal-alert" class="modal">
    <div class="container">
        <div class="row">
            <div class="col-md-12 col-xs-12">
                <div class="modal-content c-text">

                    <img src="/assets/img/icon/alert.svg" alt="">
                    <div class="mt-10"></div>
                    <p>{text}</p>
                    <div class="mt-20"></div>
                    <ul class="btn-bottom">
                        <li><a class="main-btn-2" href="#" rel="modal:close">{backText}</a></li>
                        {#if submitLink && submitText}
                            <li><a class="main-btn a" href="#" on:click={takeAction} rel="modal:close">{submitText}</a></li>
                        {/if}
                    </ul>
                    <div class="mb-30"></div>

                </div>
            </div>
        </div>
    </div>
 </div>