<script>
  import { onMount, createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  export let url;
  export let async;
  let script;

  onMount(async () => {
    script.addEventListener('load', () => {
      dispatch('loaded');
    })

    script.addEventListener('error', (event) => {
      console.error("something went wrong", event);
      dispatch('error');
    });
  });
</script>

<svelte:head>
  {#if async}
    <script bind:this={script} src={url} async/>
  {:else}
    <script bind:this={script} src={url} />
  {/if}
</svelte:head>
