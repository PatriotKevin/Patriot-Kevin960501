<script context="module">
	export let ssr = false; // Because the client time zone counts.
	import { apiAgent } from "$lib/helpers/apiAgent.svelte";

	export async function load({}) {
		const pageSize = 6;
		let eventName = "";
		let today = new Date();
		today.setHours(0);
		today.setMinutes(0);
		today.setSeconds(0);
		let startDate = today.toISOString();
		let categoryName = "";
		try {
			const total = await apiAgent.get({
				url: "/events",
				params: {
					status: "active",
					end_gt: startDate,
					"categories.name_contains": categoryName,
					name_contains: eventName,
				},
				token: null,
			});
			let events = await apiAgent.get({
				url: "/events",
				params: {
					status: "active",
					name_contains: eventName,
					"categories.name_contains": categoryName,
					end_gt: startDate,
					_sort: "start:ASC",
					_limit: 6,
				},
				token: null,
			});
			let categories = await apiAgent.get({
				url: "/categories",
				params: {
					_sort: "id:ASC",
				},
				token: null,
			});
			const pageContent = await apiAgent.get({
				url: "/event-listing-page",
				token: null,
			});
			return {
				props: { events, categories, total, pageSize, pageContent },
			};
		} catch (err) {
			return {
				props: {
					events: [],
					categories: [],
					total: 0,
					pageSize,
					pageContent: {},
				},
			};
		}
	}
</script>

<script>
	import ContactModal from "$lib/components/ContactModal.svelte";
	import Nav from "$lib/components/Nav.svelte";
	import Footer from "$lib/components/Footer.svelte";
	import EventCard from "$lib/components/EventCard.svelte";
	import Pagination from "$lib/components/Pagination.svelte";
	import { getFormattedDateString } from "$lib/helpers/date_utils";
	import { goto } from "$app/navigation";
	import { config } from "$lib/helpers/config.svelte";
	export let events;
	export let categories;
	export let pageSize;
	export let pageContent;
	export let total;
	export let filtershow = false;

	const openFilter = () => (filtershow = !filtershow);

	export let currentPage = 1;
	let categoryName = "";
	let startDate = getFormattedDateString(new Date());
	let endDate = getFormattedDateString(new Date("2030-01-01"));
	export let eventName = "";

	$: {
		getPaginatedEvents(currentPage, categoryName, eventName);
	}

	async function getPaginatedEvents(page) {
		total = await apiAgent.get({
			url: "/events",
			params: {
				status: "active",
				end_gt: startDate,
				"categories.name_contains": categoryName,
				name_contains: eventName,
			},
			token: null,
		});
		try {
			events = await apiAgent.get({
				url: "/events",
				params: {
					status: "active",
					name_contains: eventName,
					"categories.name_contains": categoryName,
					end_gt: startDate,
					_sort: "start:ASC",
					_start: (page - 1) * 6,
					_limit: 6,
				},
				token: null,
			});
		} catch (err) {
			events = [];
		}
	}

	let eventString = "";

	const onKeyPress = (e) => {
		if (e.charCode === 13) {
			eventName = eventString;
			goto("/#event-list");
		}
	};
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<ContactModal />

<Nav />

<div class="hero">
	<div class="container">
		<div class="row middle-lg middle-md col reverse">
			<div class="col-md-6 col-xs-12">
				<div class="hero-content">
					<h2>{pageContent.heading}</h2>
					<p>
						{pageContent.subheading}
					</p>
					<div class="search-bar" id="searchWeb">
						<input
							type="text"
							placeholder={pageContent.searchHint}
							on:keypress={onKeyPress}
							bind:value={eventString}
						/>
					</div>
				</div>
			</div>
			<div class="col-md-6 col-xs-12">
				<div class="hero-img">
					<img
						class="img-full"
						src={config.getServerURL(pageContent.heroImage.url)}
						alt={pageContent.imageAlt}
					/>
				</div>
			</div>
		</div>
	</div>
</div>

<div class="container">
	<div class="row mt-30 mb-30">
		<div class="col-xs-4">
			<div id="event-list" class="event-list-heading">
				<h2>Upcoming Events</h2>
			</div>
		</div>
		<div class="col-xs-8 r-text">
			<div class="pick-date">
				<!-- svelte-ignore a11y-no-onchange -->
				<select
					class="category-select-custom"
					placeholder="Select category"
					bind:value={categoryName}
					required
				>
					<option value="">All</option>
					{#each categories as category}
						<option value={category.name}>{category.name}</option>
					{/each}
				</select>
				<!-- Filter Button -->
				<button class="filter-btn" on:click={openFilter}>
					<img src="assets/img/icon/filter.svg" alt="" />
					Date
				</button>
			</div>
		</div>
		{#if filtershow}
			<!-- Date Field -->
			<div class="container">
				<div class="row">
					<div class="col-md-4 col-md-offset-8 col-xs-12">
						<!-- filter field -->
						<div class="filter" id="DateFilter">
							<div class="row">
								<!-- Start Date -->
								<div class="col-md-6 col-xs-12 mt-20">
									<label for="StartDate">Start Date</label>
									<input
										type="date"
										name="start-date"
										id="start-date"
										bind:value={startDate}
									/>
								</div>
								<!-- End Date -->
								<div class="col-md-6 col-xs-12 mt-20">
									<label for="EndDate">End Date</label>
									<input
										type="date"
										name="end-date"
										id="end-date"
										bind:value={endDate}
									/>
								</div>

								<!-- OK button -->
								<div class="col-md-12 col-xs-12 mt-20">
									<div class="fitter-btn-list">
										<ul>
											<li>
												<button
													class="main-btn"
													on:click={() => {
														openFilter();
														getPaginatedEvents(
															currentPage
														);
													}}>Search by date</button
												>
											</li>
											<li>
												<button
													class="main-btn cnc"
													on:click={openFilter}
													>Cancel</button
												>
											</li>
										</ul>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- <div class="col-xs-6 r-text">
			{#if !window.chrome}
				<img
					class="calendar-icon"
					src="/assets/img/icon/calendar.svg"
					alt=""
				/>
			{/if}
			<input type="date" bind:value={setDate}/>
		</div> -->
	</div>
</div>

<div class="event-list">
	<div class="container">
		<div class="row mt-20">
			{#each events as event}
				<div class="col-md-4 col-xs-12">
					<EventCard {...event} />
				</div>
			{:else}
				<p>There are no more events</p>
			{/each}
		</div>
	</div>
</div>

{#if total.length > pageSize}
	<Pagination
		lastPage={currentPage >= total.length / pageSize}
		{currentPage}
		on:pageIncrease={(e) => {
			currentPage++;
		}}
		on:pageDecrease={(e) => {
			currentPage--;
		}}
	/>
{/if}

<Footer />

<style>
	input {
		border: 2px solid #ffffff;
		outline: none;
		background: #f1f5f9;
		padding: 5px 15px;
		border-radius: 5px;
		-webkit-transition: all ease-in 0.2s;
		transition: all ease-in 0.2s;
	}
	.filter-btn {
		padding: 10px 15px 10px 40px;
		border-radius: 5px;
		font-weight: 700;
		letter-spacing: 0.5px;
		font-size: 14px;
		background: #fff;
		box-shadow: 0px 3px 5px 1px rgba(0, 0, 0, 0.04);
		position: relative;
		border: none;
		cursor: pointer;
		color: #424a80;
	}

	.filter-btn img {
		position: absolute;
		left: 15px;
		top: 12px;
	}
	.pick-date {
		position: relative;
	}
	.filter {
		padding: 5px 20px 20px 20px;
		background: #fff;
		box-shadow: 0px 3px 5px 1px rgba(0, 0, 0, 0.04);
		border-radius: 5px;
		margin-bottom: 20px;
		margin-top: 10px;
	}

	.filter .main-btn.cnc {
		background: #dfdfdf;
		border-color: #dfdfdf;
		color: rgb(61, 61, 61);
		cursor: pointer;
	}

	.filter .main-btn {
		cursor: pointer;
	}

	.filter label {
		text-align: left;
	}

	.filter input {
		padding: 10px;
		border: none;
		width: 100%;
		outline: none;
		background: #edeff5;
	}

	.fitter-btn-list ul {
		list-style: none;
	}

	.fitter-btn-list ul li {
		display: inline-block;
	}

	input[type="date"]::-webkit-calendar-picker-indicator {
		margin: 0;
	}

	@media (max-width: 764px) {
		.filter-btn {
			font-size: 12px;
			margin-top: -10px;
		}
		.category-select-custom {
			width: 70px;
			font-size: 12px;
			margin-top: -10px;
			/* margin-right: -10px; */
		}
	}
	.category-select-custom {
		float: none;
		padding: 10px 15px 10px 10px;
		border-radius: 5px;
		text-align: left;
		font-weight: 700;
		letter-spacing: 0.5px;
		font-size: 12px;
		background: #fff;
		box-shadow: 0px 3px 5px 1px rgb(0 0 0 / 4%);
		border: none;
		cursor: pointer;
		color: #424a80;
		margin-right: 10px;
	}
	.search-bar input {
		padding: 10px 10px 10px 40px;
		background-image: url("/assets/img/icon/Search.svg");
		background-size: 16px;
		background-repeat: no-repeat;
		background-position: 12px 48%;
		border: none;
		border-radius: 5px;
		background-color: #edeff5;
		width: 100%;
	}
</style>
