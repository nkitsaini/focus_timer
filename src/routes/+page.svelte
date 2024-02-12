<script lang="ts">
	import { page } from "$app/stores";
	import type { TimerOptionDetail } from "$lib";
	import { goto, pushState } from "$app/navigation";
	import * as R from 'remeda'
	import TimerOption from "./TimerOption.svelte";
	import { parseEvents } from "$lib/timer_clock.svelte";
	import { humanizeTimestamp } from "$lib/time_util";
	import { dev } from "$app/environment";
	import { liveQuery } from "dexie";
	import { db, type TimerSessionRow } from "$lib/db";
	import HourGlass from "./HourGlass.svelte";
	import { onMount } from "svelte";
	const OPTIONS: TimerOptionDetail[] = $state([
		{
			duration: 25,
			keyword: "mouse",
			tagline: "quick and sneaky",
		},
		{
			duration: dev ? 1 : 55,
			keyword: "monkey",
			tagline: "tactful with a goal",
		},
		{
			duration: 85,
			keyword: "elephant",
			tagline: "force of nature",
		},
		{
			duration: 115,
			keyword: "turtle",
			tagline: "long and steady",
		},
	]);

	let titleString = $state("Timer");
	let defaultLinkDetail = {
		url: "/favicon.svg",
		type: "image/svg+xml",
	};
	let linkDetail = $state(defaultLinkDetail);
	$effect(() => {
		if ($page.state.timerDetail === undefined) {
			titleString = "Timer";
			linkDetail = defaultLinkDetail;
		}
	});

	let _timerSessions = liveQuery(() => {
		return db.sessions.toArray();
	});

	let timerSessions = $derived(
		R.sortBy(($_timerSessions || []).map((x) => parseEvents(x.last_tick, x.events)), x => x.startAt).reverse(),
	);

	let selectedOption: TimerOptionDetail | null = $state(null);
	onMount(() => {
		// @ts-ignore
		window.set_dev = () => {
			OPTIONS[1].duration = 1;
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={linkDetail.url} type={linkDetail.type} size="any" />
	<title>{titleString}</title>
</svelte:head>

{#if $page.state.timerDetail === undefined}
	<h1 class="text-4xl text-center text-gray-600">Start the timer</h1>
	<div class="m-auto mt-10">
		<TimerOption
			options={OPTIONS}
			defaultOption={1}
			onselect={(e) =>
				pushState("", {
					timerDetail: JSON.stringify(e),
				})}
		/>
	</div>
	<div class="m-auto w-max mt-2">
		<div class="text-center text-lg ">Recent Sessions: </div>
		{#each timerSessions as session}
			<p class="mt-2">
				{humanizeTimestamp(session.startAt)} - {Math.floor(
					session.totalEffectiveDuration / (60 * 1000),
				)} minutes
			</p>
		{/each}
	</div>
{:else}
	<HourGlass
		option={JSON.parse($page.state.timerDetail)}
		updateTitle={(x) => (titleString = x)}
		updateFavicon={(url, type) => {
			linkDetail = { url, type };
		}}
	/>
{/if}
