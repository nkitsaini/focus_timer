<script lang="ts">
	import { dev } from "$app/environment";
	import type { TimerOptionDetail } from "$lib";
	import { onDestroy, onMount } from "svelte";
	import { Howl } from "howler";
	let finishSound: Howl;

	let seek_speed = 20;
	if (!dev) {
		seek_speed = 1;
	}

	let { option } = $props<{ option: TimerOptionDetail }>();
	let start = Date.now();
	console.log("started at", start);
	let now = $state(Date.now());
	let duration_passed = $derived(((now - start) * seek_speed) / (1000 * 60));

	let duration_remaining = $derived(
		Math.max(0, option.duration - duration_passed),
	);
	let duration_surpassed = $derived(
		Math.max(0, duration_passed - option.duration),
	);
	let seconds_surpassed = $derived(Math.floor(duration_surpassed * 60) % 60);
	let minutes_surpassed = $derived(Math.floor(duration_surpassed));
	let seconds_remaining = $derived(Math.floor(duration_remaining * 60) % 60);
	let minutes_remaining = $derived(Math.floor(duration_remaining));
	let percentage_completed = $derived(
		Math.min(duration_passed / option.duration, 1) * 100,
	);
	let is_completed = $derived(duration_remaining == 0);
	$effect(() => {
		if (is_completed) {
			finishSound.play();
		}
	});

	let interval: number;
	onMount(() => {
		finishSound = new Howl({
			src: ["/notification.mp3"],
		});
		interval = setInterval(() => {
			now = Date.now();
		}, 100);
	});
	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<div class="flex flex-col items-center w-content">
	<div
		class=" glass rounded border w-64 h-96 font-mono text-orange-950 flex flex-col justify-center items-center"
		style="--complete-percentage: {percentage_completed}%"
	>
		<div class="text-2xl capitalize text-orange-950">{option.keyword}</div>
		<div class="capitalize text-orange-950 border-b border-orange-950">
			{option.tagline}
		</div>
		<div class="text-2xl">
			{#if is_completed}
				+{minutes_surpassed
					.toString()
					.padStart(2, "0")}:{seconds_surpassed
					.toString()
					.padStart(2, "0")}
			{:else}
				{minutes_remaining
					.toString()
					.padStart(2, "0")}:{seconds_remaining
					.toString()
					.padStart(2, "0")}
			{/if}
		</div>
	</div>
</div>

<style>
	.glass {
		transition: var(--complete-percentage) 1s;
		background: linear-gradient(
			to bottom,
			theme("colors.orange.200") var(--complete-percentage),
			theme("colors.orange.300") var(--complete-percentage)
		);
	}
</style>
