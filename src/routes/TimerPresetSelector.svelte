<script lang="ts">
	import { getPoints, type TimerPreset } from "$lib/timer_presets";

	let { presets, defaultOption, onselect } = $props<{
		presets: TimerPreset[];
		defaultOption: number;
		onselect: (option: TimerPreset) => void;
	}>();

	let selectedIndex: number = $state(defaultOption);
	let selectedOption = $derived(presets[selectedIndex]);
	// let selected
</script>

<div class="flex w-full flex-col gap-4 items-center mt-10">
	<div class="text-center">
		<span class="text-center text-2xl capitalize text-orange-950">
			{selectedOption.tagline}
		</span>
		<br />
		<span class=" text-sm capitalize text-orange-950">
			{selectedOption.duration} Minutes | {getPoints(
				selectedOption.duration * 60 * 1000,
			)} Points
		</span>
	</div>
	<div class="flex w-max gap-4 m-auto">
		{#each presets as option, idx}
			<button
				class="rounded border p-4 inline-flex text-orange-950 items-center flex-col w-32 hover:border-gray-400 {idx ==
				selectedIndex
					? 'bg-orange-100'
					: ''}"
				onclick={() => (selectedIndex = idx)}
			>
				<div class="font-mono text-2xl">
					<!-- {hours}:{minutes} -->
					{getPoints(option.duration * 60 * 1000)}
				</div>
				<div>
					<span class="capitalize text-center">{option.keyword}</span>
				</div>
			</button>
		{/each}
	</div>
	<button
		onclick={() => {
			onselect(selectedOption);
		}}
		class="rounded border w-max text-2xl px-4 py-2 rounded bg-orange-200">Start</button
	>
</div>
