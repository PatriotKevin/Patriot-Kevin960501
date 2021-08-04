<script context="module">
    export let ssr = false
    import { apiAgent } from '$lib/helpers/apiAgent.svelte'
    export async function load() {
        let categories = await apiAgent.get({url:'/categories', params:{_sort:'name:ASC', token:null}, autoRedirect:false, token: null})
        return {props: {categories}}
    }
</script>
<script>
    export let categories
    let category
    let imgDataLogo = null
    let imgFilesLogo = null
    $: console.log(imgFilesLogo)
</script>


<svelte:head>
	<title>Sponsor Registration</title>
</svelte:head>

<h2>Sponsor</h2>
<div class="mt-10"></div>

<p>Submit yout local business promotion.</p>

<div class="row">
    <div class="col-md-6 col-xs-12 dz">

        <!-- Logo Upload -->
        <!-- <div style={`--image-preview: url(${imgDataLogo})`}>
            <h3>Logo</h3>
            <form class="dropzone needsclick" class:image-preview={imgDataLogo} id="ebanner-upload">
                <div class="dz-message needsclick">
                    {#if !imgFilesLogo}
                        <h2>Click to add an event image</h2>
                    {:else}
                        <h2>Click to change event image</h2>
                    {/if}
                    <input type="file" bind:files={imgFilesLogo} accept="image/jpeg,image/png" size="1">
                    <span>Drag & drop or browse</span>
                </div>
            </form>
        </div> -->
        
        <h3>Logo</h3>
        <form class="dropzone needsclick" id="logo-upload" action="/upload">
            
            <div class="dz-message needsclick">
                <span>Drag & drop or browse</span>
            </div>
            
        </form>

        <div class="mt-10"></div>
        <p>500x500px. max 500kb</p>
    </div>

    <div class="col-md-6 col-xs-12 dz">

        <!-- Logo Upload -->
        <h3>Ad Banner</h3>
        <form class="dropzone needsclick" id="banner-upload" action="/upload">
            
            <div class="dz-message needsclick">
                <span>Drag & drop or browse</span>
            </div>
            
        </form>

        <div class="mt-10"></div>
        <p>1920x1080px. max 1MB</p>
    </div>
</div>

<form action="#" class="mt-10">


    <!-- Name -->
    <label for="name">Organization</label>
    <input type="text" />

    <!-- Website -->
    <label for="name">Website</label>
    <input type="text" />

    <!-- Category -->
    <label for="category">Category</label>
    <select name="category" id="category" class="custom-select sources mb-20" placeholder="Select category" bind:value={category}>
        {#each categories as category}
            <option value={category.id}>{category.name}</option>
        {/each}
    </select>

    <!-- Phone -->
    <label for="phone">Phone</label>
    <input type="tel" />

    <!-- Category -->
    <label for="info">Additional info</label>
    <textarea name="" id="" cols="30" rows="10"></textarea>

    <div class="mt-10"></div>

    <button type="submit" onclick="window.location.href = '/';">Submit</button>


</form>