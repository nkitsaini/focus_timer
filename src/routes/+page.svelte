<script lang="ts">
	import type { TimerOptionDetail } from "$lib";
	import TimerOption from "./TimerOption.svelte";
	import { dev } from "$app/environment";
	import HourGlass from "./HourGlass.svelte";
	const OPTIONS: TimerOptionDetail[] = [
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
	];
	// let selectedOption: TimerOptionDetail | null = $state(OPTIONS[1]);
	let selectedOption: TimerOptionDetail | null = $state(null);
</script>

{#if selectedOption === null}
	<h1 class="text-4xl text-center text-gray-600">Start the timer</h1>
	<div class="m-auto mt-10">
		<TimerOption
			options={OPTIONS}
			defaultOption={1}
			onselect={(e) => (selectedOption = e)}
		/>
	</div>
{:else}
	<HourGlass option={selectedOption} />
{/if}
