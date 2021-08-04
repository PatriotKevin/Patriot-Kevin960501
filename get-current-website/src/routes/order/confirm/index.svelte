<script context="module">
    export const ssr = false
</script>
<script>
    import { apiAgent } from "$lib/helpers/apiAgent.svelte";
    import { browserGet, browserSet } from "$lib/helpers/browser_utils";
    import TicketCard from "$lib/components/TicketCard.svelte";
    const orderedTicketIds = browserGet("purchased-ticket-ids") || [];
    const promosSponsorIDs = browserGet("purchased-sponsor-ids") || [];
    const onDone = (e) => {
        browserSet("purchased-ticket-ids",[])
        browserSet("purchased-sponsor-ids",[])
        window.location.href = '/';
    }
    $: {onResend();}
    const onResend = async (e) => {
        if (orderedTicketIds.length == 0) {
            alert("You haven't ordered any tickets yet.")
            window.location.href = '/';
            return
        }
        try {
            const response = await apiAgent.get({
                url: '/ticket/resend',
                token:null,
                params:{ticketIds:orderedTicketIds, sponsorIds: promosSponsorIDs}
            })
            alert(
                (
                    (response.updated.length ? `Newly sent ${response.updated.length} ticket(s).\n`:'') +
                    (response.resent.length ? `Sent ${response.resent.length} ticket(s).` : '')
                ) || "Couldn't find any ticket to send."
            )
            unpaid = response.unpaid
            for (const ticket of unpaid) {
                ticket.ticketOption = ticket.event.ticketOptions.find(option => option.id == ticket.ticketOptionId)
            }
            unsent = response.unsent
            for (const ticket of unsent) {
                ticket.ticketOption = ticket.event.ticketOptions.find(option => option.id == ticket.ticketOptionId)
            }
        }
        catch (error) {
            alert(`Some error occurred while requesting server for resend.\nmessage: ${error.message}`)
        }
    }
    let unpaid = []
    let unsent = []
</script>
<svelte:head>
	<title>Step 3 - Confirmation</title>
</svelte:head>

<div class="container">
    <div class="row">
        <div class="col-lg-6 col-lg-offset-3 col-xs-12">
            <div class="form-main mt-60">
                <h2>Thank you !</h2>
                <div class="mt-10"></div>
                <p>We have sent a digital ticket to your email !</p>
                <form action="#" class="mt-30">
                    
                    <div class="mt-10"></div>

                    <button type="submit" on:click|preventDefault={onDone}>Done</button>

                    <div class="mt-20"></div>
                    <p>Didn't receive a ticket ? <a href="#" style="color: green;" on:click|preventDefault={onResend}>Resend</a></p>
                </form>
            </div>
            {#if unpaid.length > 0}
            <div>
                <p style="color:#FA8888;" title="There may be some problem related with processing payment.">The following tickets are not paid yet</p>
                <div class="row">
                    {#each unpaid as ticket}
                        <TicketCard ticketOption={ticket.ticketOption} showOnly={true}></TicketCard>
                    {/each}
                </div>
            </div>
            {/if}
            {#if unsent.length > 0}
            <div>
                <p title="Didn't send withdrawn, refunded or redeemed tickets">The following tickets are refunded, withdrawn or already redeemed</p>
                <div class="row">
                    {#each unsent as ticket}
                        <TicketCard ticketOption={ticket.ticketOption} showOnly={true}></TicketCard>
                    {/each}
                </div>
            </div>
            {/if}
        </div>
    </div>
</div>