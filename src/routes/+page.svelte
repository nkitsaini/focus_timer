<script lang="ts">
	import { page } from "$app/stores";
	import  { type TimerPreset, TIMER_PRESETS } from "$lib/timer_presets";
	import { pushState } from "$app/navigation";
	import * as R from 'remeda'
	import TimerOption from "./TimerOption.svelte";
	import { parseEvents } from "$lib/timer_clock.svelte";
	import { humanizeTimestamp } from "$lib/time_util";
	import { dev } from "$app/environment";
	import { liveQuery } from "dexie";
	import { db, type TimerSessionRow } from "$lib/db";
	import HourGlass from "./HourGlass.svelte";
	import { onMount } from "svelte";
    import { insertRandomFakeSessionsForPastMonth } from "$lib/fake_session_creator";

	let titleString = $state("Timer");
	let defaultLinkDetail = {
		url: "/favicon.svg",
		type: "image/svg+xml",
	};
	let linkDetail = $state<{url: string, type?: string}>(defaultLinkDetail);
	$effect(() => {
		if ($page.state.timerPreset === undefined) {
			titleString = "Timer";
			linkDetail = defaultLinkDetail;
		}
	});

	let _timerSessions = liveQuery(() => {
		return db!.sessions.toArray();
	});

	let timerSessions = $derived(
		R.sortBy(($_timerSessions || []).map((x) => parseEvents(x.last_tick, x.events)), x => x.startAt).reverse(),
	);

	let selectedOption: TimerPreset | null = $state(null);
	onMount(() => {
		// @ts-ignore
		window.set_seek = () => {
		
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={linkDetail.url} type={linkDetail.type} />
	<title>{titleString}</title>
</svelte:head>

{#if $page.state.timerPreset === undefined}
	<h1 class="text-4xl text-center text-gray-600">Start the timer</h1>
	<div class="m-auto mt-10">
		<TimerOption
			presets={TIMER_PRESETS}
			defaultOption={1}
			onselect={(e) =>
				pushState("", {
					timerPreset: JSON.stringify(e),
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
	<button onclick={async () => {
		console.log("Inserting")
		await insertRandomFakeSessionsForPastMonth()
		console.log("Done inserting")
	}} > Insert Fake Session </button>
{:else}
	<HourGlass
		preset={JSON.parse($page.state.timerPreset)}
		updateTitle={(x) => (titleString = x)}
		updateFavicon={(url, type) => {
			linkDetail = { url, type };
		}}
	/>
{/if}
