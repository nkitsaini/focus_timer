<script lang="ts">
	import { page } from "$app/stores";
	import { TIMER_PRESETS } from "$lib/timer_presets";
	import { goto, pushState } from "$app/navigation";
	import TimerOption from "./TimerOption.svelte";

	import { dev } from "$app/environment";
	import HourGlass from "./HourGlass.svelte";
	import { insertRandomFakeSessionsForPastMonth } from "$lib/fake_session_creator";
	import SummaryBanner from "./SummaryBanner.svelte";

	let titleString = $state("Timer");
	let defaultLinkDetail = {
		url: "/favicon.svg",
		type: "image/svg+xml",
	};
	let linkDetail = $state<{ url: string; type?: string }>(defaultLinkDetail);
	$effect(() => {
		if ($page.state.timerPreset === undefined) {
			titleString = "Timer";
			linkDetail = defaultLinkDetail;
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={linkDetail.url} type={linkDetail.type} />
	<title>{titleString}</title>
</svelte:head>

<SummaryBanner class="m-auto  border rounded mt-10" />
<div class="m-auto mt-20">
	<TimerOption
		presets={TIMER_PRESETS}
		defaultOption={1}
		onselect={(e) =>
			goto("/timer", {
				state: {
					timerPreset: JSON.stringify(e),
				},
			})}
	/>
</div>
{#if dev}
	<div class="w-max m-auto">
		<button
			class="border p-2 mt-4"
			onclick={async () => {
				console.log("Inserting");
				await insertRandomFakeSessionsForPastMonth();
				console.log("Done inserting");
			}}
		>
			Insert Fake Session
		</button>
	</div>
{/if}
