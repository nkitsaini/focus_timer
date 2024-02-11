<script lang="ts">
	import { dev } from "$app/environment";
	import type { TimerOptionDetail } from "$lib";
	import { onDestroy, onMount } from "svelte";
	import { Howl } from "howler";
	import * as ICONS from "radix-icons-svelte";
	import * as R from "remeda";
	import { TimerClock, splitTimestamp } from "$lib/timer_clock.svelte";
	let finishSound: Howl;
	let faviconSVGElement: SVGElement;
	let faviconCanvasElement: HTMLCanvasElement;
	let  faviconImageElement: HTMLImageElement;
	let seek_speed = 20;
	if (!dev) {
		seek_speed = 1;
	}

	let { option } = $props<{ option: TimerOptionDetail }>();
	let timer = new TimerClock((option.duration * 60 * 1000) / seek_speed);

	let { seconds: seconds_surpassed, minutes: minutes_surpassed } = $derived(
		splitTimestamp(timer.state.surpassedDuration),
	);
	let { seconds: seconds_remaining, minutes: minutes_remaining } = $derived(
		splitTimestamp(timer.state.remainingDuration),
	);

	let isFinishSoundPlayed = false;

	let timerString = $derived(
		timer.state.isCompleted
			? `+${minutes_surpassed.toString().padStart(2, "0")}:${seconds_surpassed
					.toString()
					.padStart(2, "0")}`
			: `${minutes_remaining.toString().padStart(2, "0")}:${seconds_remaining
					.toString()
					.padStart(2, "0")}`,
	);

	$effect(() => {
		if (timer.state.isCompleted && !isFinishSoundPlayed) {
			isFinishSoundPlayed = true;
			finishSound.play();
		}
	});

	function humanize(timestamp: number) {
		let date = new Date(timestamp);
		return date.toLocaleString();
	}

	let interval: number;
	let canvasURL: string | null = $state(null);
	let faviconSVGContent = $derived(`
			<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
			  <rect width="50" height="100" x="25" y="0" fill="#fdba74" rx="10" ry="10" />
			  <rect width="50" height="${Math.max(0, 100- timer.state.percentCompleted)}" x="25" y="${Math.min(100, timer.state.percentCompleted)}" fill="#eaf80c" rx="10" ry="10" />
			</svg>
	`)
	onMount(async () => {
		finishSound = new Howl({
			src: ["/notification.mp3"],
		});
		//@ts-ignore
		window.get_state = () => {
			console.log(timer.state);
		};
		async function drawInlineSVG(
			ctx: CanvasRenderingContext2D,
			rawSVG: string,
		) {
			var svg = new Blob([rawSVG], { type: "image/svg+xml;charset=utf-8" }),
				domURL = self.URL || self.webkitURL || self,
				url = domURL.createObjectURL(svg),
				img = new Image();

			let promise = new Promise((r) => {
				img.onload = function () {
					ctx.drawImage(img, 0, 0);
					domURL.revokeObjectURL(url);
					r(null);
				};
			});
			img.src = url;
			await promise;
		}
		//const canvas = document.getElementById("my_canvas") as HTMLCanvasElement;
		// canvas.height = 100;
		// canvas.width = 100;
		// const ctx = canvas.getContext("2d")!;
		// ctx.drawImage(faviconSVGElement, 0, 0);

		// await drawInlineSVG(
		// 	ctx,
		// 	`
		// <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
		//   <rect width="50" height="100" x="25" y="0" fill="#fdba74" rx="10" ry="10" />
		//   <rect width="50" height="50" x="25" y="50" fill="#eaf80c" rx="10" ry="10" />
		// </svg>
		// `,
		// );
		// canvasURL = canvas.toDataURL("image/x-icon");
		// console.log("URL", canvas.toDataURL("image/x-icon"));
	});

	async function updateFavicon(svgContent: string) {
		console.log("in update favicon")
		let svg = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
		let domURL = self.URL || self.webkitURL || self;
		let url = domURL.createObjectURL(svg);
		let img = new Image();
		img.onload = function () {
		console.log("image onload triggered")
			let ctx = faviconCanvasElement.getContext('2d')!;
			ctx.clearRect(0, 0, faviconCanvasElement.width, faviconCanvasElement.height);
			ctx.drawImage(img, 0, 0);
			domURL.revokeObjectURL(url);
			canvasURL = faviconCanvasElement.toDataURL("image/png");
		};
		console.log("blob url", url)
		img.src = url;
		document.getElementById('image-div')!.appendChild(img)
		console.log("image waiting onload")
	}
	let updateFaviconDebounced = R.debounce(updateFavicon, {timing: 'trailing', waitMs: 1000, maxWaitMs: dev?1000:10000})
	$effect(() => {
	console.log("Calling update")
		updateFaviconDebounced.call(faviconSVGContent)
	})
	$effect(() => {
		console.log("canvasurl => ", canvasURL);
	});
	onDestroy(() => {
		clearInterval(interval);
	});
	$inspect(canvasURL)
	//$effect(() => {
	//	faviconSVGUrl;
	//	console.log("== rendering svg")
	//	const ctx = faviconCanvasElement.getContext("2d")!;
	//	ctx.drawImage(faviconImageElement, 0, 0);
	//})
</script>

<svelte:head>
	{#if canvasURL !== null}
		<link rel="icon" href={canvasURL} sizes="any" type="image/png" />
	{/if}
	<link rel="icon" href="/favicon.svg" sizes="any" type="image/svg+xml" />
	<title>Timer ({dev ? timerString : timerString.slice(0, -3)})</title>
</svelte:head>

{faviconSVGContent}
<div id="image-div" class="p-2 border border-red-800"> </div>
<img src={canvasURL} alt="final" />
<!-- <img height=100 width=100 bind:this={faviconImageElement} src={faviconSVGUrl} alt="hidden-favicon" onchange={(e) => { -->
	<!-- console.log("on load called") -->
		<!-- const ctx = faviconCanvasElement.getContext("2d")!; -->
		<!-- ctx.drawImage(e.currentTarget as HTMLImageElement, 0, 0); -->
<!-- }}/> -->

<div class="border border-red-700 p-2 w-max h-max">
	<canvas bind:this={faviconCanvasElement} height=100 width=100 id="my_canvas" />
</div>

<svg
	bind:this={faviconSVGElement}
	width="100"
	height="100"
	xmlns="http://www.w3.org/2000/svg"
>
	<rect width="50" height="100" x="25" y="0" fill="#fdba74" rx="10" ry="10" />
	<rect
		width="50"
		height={Math.max(0, 100 - timer.state.percentCompleted)}
		x="25"
		y={Math.min(100, timer.state.percentCompleted)}
		fill="#eaf80c"
		rx="10"
		ry="10"
	/>
</svg>

<div class="flex flex-col items-center w-content">
	<div
		class=" glass rounded border w-64 h-96 font-mono text-orange-950 flex flex-col justify-center items-center"
		style="--complete-percentage: {Math.min(
			100,
			timer.state.percentCompleted,
		)}%"
	>
		<div class="text-2xl capitalize text-orange-950">{option.keyword}</div>
		<div class="capitalize text-orange-950 border-b border-orange-950">
			{option.tagline}
		</div>
		<div class="text-2xl">
			{timerString}
		</div>
	</div>
</div>

<div class="flex justify-center items-center mt-4">
	{#if timer.state.isPaused}
		<button class="border p-4 bg-orange-50" onclick={() => timer.resume()}
			><ICONS.Resume class="inline-block mr-2" size={16} />Resume</button
		>
	{:else}
		<button class="border p-4 bg-orange-50" onclick={() => timer.pause()}
			><ICONS.Pause class="inline-block mr-2" size={16} />Pause</button
		>
	{/if}
</div>

<br />

<!-- TODO: fix overflow -->
<div class="flex flex-col justify-center items-center mt-4 overflow-scroll">
	<span class="text-orange-950 text-lg">Timeline: </span>
	<div class="grid grid-cols-2 gap-2 text-orange-950">
		{#each R.reverse(timer.state.timeline) as event}
			<span class="capitalize">{event.kind}</span>
			<span>{humanize(event.timestamp)}</span>
		{/each}
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
