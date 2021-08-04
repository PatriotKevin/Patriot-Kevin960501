<script>
    import { createEventDispatcher } from 'svelte'

    const dispatch = createEventDispatcher()
    export let addon
    let priceDollar = (addon.price / 100).toFixed(2)
    $: addon.price = parseInt(priceDollar * 100)
</script>

<div class="row addons middle-md">

    <div class="col-md-7 col-xs-12">
        <label for="name">Addon Description</label> <br>
        <input type="text" bind:value={addon.description}/>
    </div>

    <div class="col-md-3 col-xs-5">
        <label for="">Price (0 = free)</label>
        <input type="number" step=".01" bind:value={priceDollar}/>
    </div>

    <div class="col-md-2 col-xs-2">
        <div class="del-addon">
            <a href="#" on:click={() => dispatch('delete')}><img src="/assets/img/icon/delete.svg" alt=""></a>
        </div>
    </div>
</div>