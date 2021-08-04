<script>
	import { createEventDispatcher } from 'svelte';

	export let currentPage
	export let lastPage

	const dispatch = createEventDispatcher()

	function increasePage() {
		dispatch('pageIncrease')
	}
	function decreasePage() {
		dispatch('pageDecrease')
	}
</script>

<div class="container">
	<div class="row center-xs">
		<div class="col-12">
			<div class="pagination">
				<ul>
					<li><a class:disable={currentPage === 1} on:click={decreasePage}>Prev</a></li>
					<li><a class:disable={lastPage} on:click={increasePage}>Next</a></li>
				</ul>
			</div>

		</div>
	</div>
</div>

<style>
	a:hover {
		cursor: pointer;
	}
</style>