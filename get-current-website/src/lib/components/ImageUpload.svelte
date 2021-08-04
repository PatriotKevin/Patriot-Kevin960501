<!-- Logo Upload -->
<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher()

	function increasePage() {
		dispatch('pageIncrease')
	}
    let files
    export let imgSrc
    $: {
        if(files && files.length > 0) {
            imgSrc = URL.createObjectURL(files[0])
            dispatch('upload', {
			    file: files[0]
		    })
        }
    }
</script>
<div style={`--image-preview: url(${imgSrc})`}>
    <h3>Event Banner</h3>
    <form class="dropzone needsclick" class:image-preview={imgSrc} class:bad={!imgSrc} id="ebanner-upload">
        <div class="dz-message needsclick">
            {#if !files}
                <h2>Drag or click to add event image</h2>
            {:else}
                <h2>Drag or click to change event image</h2>
            {/if}
            <input type="file" bind:files accept="image/jpeg,image/png" size="1">
            <span>Poster/Banner Image. Use high quality image: 1920x1080px.
                <br>
                JPEG or PNG, no larger than 1MB</span>
        </div>
    </form>
</div>
<style>
    .image-preview {
        background: linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ), var(--image-preview);
        background-repeat: no-repeat;
        background-size: cover;
        background-position: center center;
    }

    .image-preview.dropzone h2, .image-preview.dropzone span{
        color: white;
    }
    input {
        opacity:0;
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
    }
    input:hover {
        cursor: pointer;
    }
    .dropzone.bad {
        border: 2px dashed #FAA8A8
    }
</style>