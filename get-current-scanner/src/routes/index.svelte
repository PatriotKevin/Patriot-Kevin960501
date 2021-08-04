<script context="module">
	export const ssr = false;
	import { apiAgent } from '$lib/helpers/apiAgent.svelte';
	import Header from '$lib/components/Header.svelte';
	import NavBar from '$lib/components/NavBar.svelte';
	import _reduce from '$lib/lodash/reduce';
	import { styleNumber } from '$lib/helpers/string_utils';
	import { price_number } from '$lib/helpers/num_utils';
	export async function load({ page }) {
		try {
			let token = page.query.get('token');
			if (token) {
				apiAgent.token = token;
				apiAgent.setPersistToken(token);
				const { firstName, lastName, id } = await apiAgent.get({ url: '/users/me' });
				apiAgent.setUser({ firstName, lastName, id });
			}
			let activeEventsCount = await apiAgent.get({
				url: '/events/count',
				params: { status: 'active', 'user.id': apiAgent.getUser().id }
			});
			let draftEventsCount = await apiAgent.get({
				url: '/events/count',
				params: { status_in: ['draft', 'approved'], 'user.id': apiAgent.getUser().id }
			});
			let paidTicketsCount = await apiAgent.get({
				url: '/tickets/count',
				params: { status: 'paid' }
			});
			let redeemedTicketsCount = await apiAgent.get({
				url: '/tickets/count',
				params: { status: 'redeemed' }
			});
			let refundedTicketsCount = await apiAgent.get({
				url: '/tickets/count',
				params: { status: 'refunded' }
			});
			let withdrawnTicketsCount = await apiAgent.get({
				url: '/tickets/count',
				params: { status: 'withdrawn' }
			});
			let soldTickets = await apiAgent.get({
				url: '/tickets',
				params: { status_in: ['paid', 'redeemed', 'withdrawn'] }
			});
			return {
				props: {
					activeEventsCount,
					draftEventsCount,
					paidTicketsCount,
					redeemedTicketsCount,
					refundedTicketsCount,
					withdrawnTicketsCount,
					soldTickets
				}
			};
		} catch {
			return { props: { activeEventsCount: 'N/A', draftEventsCount: 'N/A' } };
		}
	}
</script>

<script>
	export let activeEventsCount;
	export let draftEventsCount;
	export let paidTicketsCount;
	export let redeemedTicketsCount;
	export let refundedTicketsCount;
	export let withdrawnTicketsCount;
	export let soldTickets;
	console.log({
		paidTicketsCount,
		redeemedTicketsCount,
		refundedTicketsCount,
		withdrawnTicketsCount,
		soldTickets
	});
	const totalSales = _reduce(
		soldTickets,
		(sum, ticket) => {
			sum += ticket.price;
			for (const addon of ticket.addons || []) {
				sum += addon.price;
			}
			return sum;
		},
		0
	);
</script>

<svelte:head>
	<title>Dashboard</title>
</svelte:head>
<Header />
<NavBar />
<div class="container-fluid">
	<div class="row">
		<!-- Start Card -->
		<div class="col-md-4 col-xs-12">
			<div class="card">
				<!-- title -->
				<div class="row middle-xs">
					<div class="col-xs-8">
						<h3>Active Events</h3>
					</div>
					<div class="col-xs-4">
						<div class="r-text">
							<a href="/events?status=active"
								><nobr>Details <i class="bx bx-right-arrow-alt" /></nobr></a
							>
						</div>
					</div>
				</div>

				<!-- Total -->
				<div class="total-c">
					<h2>{styleNumber(activeEventsCount)}</h2>
				</div>
			</div>
		</div>

		<!-- Start Card -->
		<div class="col-md-4 col-xs-12">
			<div class="card">
				<!-- title -->
				<div class="row middle-xs">
					<div class="col-xs-8">
						<h3>Draft Events</h3>
					</div>
					<div class="col-xs-4">
						<div class="r-text">
							<a href="/events?status=approved"
								><nobr>Details <i class="bx bx-right-arrow-alt" /></nobr></a
							>
						</div>
					</div>
				</div>

				<!-- Total -->
				<div class="total-c">
					<h2>{styleNumber(draftEventsCount)}</h2>
				</div>
			</div>
		</div>

		<!-- Start Card -->
		<div class="col-md-4 col-xs-12">
			<div class="card">
				<!-- title -->
				<div class="row middle-xs">
					<div class="col-xs-12">
						<h3>Total Transaction</h3>
					</div>
				</div>

				<!-- Total -->
				<div class="total-c">
					<h2>
						{styleNumber(
							paidTicketsCount + redeemedTicketsCount + refundedTicketsCount + withdrawnTicketsCount
						)}
					</h2>
				</div>
			</div>
		</div>

		<!-- Start Card -->
		<div class="col-md-4 col-xs-12">
			<div class="card">
				<!-- title -->
				<div class="row middle-xs">
					<div class="col-xs-12">
						<h3>Total Ticket Sales</h3>
					</div>
				</div>

				<!-- Total -->
				<div class="total-c">
					<h2>{styleNumber(paidTicketsCount + redeemedTicketsCount)}</h2>
				</div>
			</div>
		</div>

		<!-- Start Card -->
		<div class="col-md-4 col-xs-12">
			<div class="card">
				<!-- title -->
				<div class="row middle-xs">
					<div class="col-xs-12">
						<h3>Total Sales</h3>
					</div>
				</div>

				<!-- Total -->
				<div class="total-c">
					<h2>${price_number(totalSales)}</h2>
				</div>
			</div>
		</div>

		<!-- Start Card -->
		<div class="col-md-4 col-xs-12">
			<div class="card">
				<!-- title -->
				<div class="row middle-xs">
					<div class="col-xs-12">
						<h3>Total Visitor</h3>
					</div>
				</div>

				<!-- Total -->
				<div class="total-c">
					<h2>{styleNumber(redeemedTicketsCount)}</h2>
				</div>
			</div>
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
