<script lang="ts">
	import { assert, type TimerOptionDetail } from "$lib";

	let { options, defaultOption, onselect } = $props<{
		options: TimerOptionDetail[];
		defaultOption: number;
		onselect: (option: TimerOptionDetail) => void;
	}>();

	let selectedIndex: number = $state(defaultOption);
	let selectedOption = $derived(options[selectedIndex]);
	// let selected
</script>

<div class="flex w-full flex-col gap-4 items-center">
	<div class="flex w-max gap-4 m-auto mt-10">
		{#each options as option, idx}
			<div
				class="border p-4 inline-flex text-orange-950 items-center flex-col w-32 {idx ==
				selectedIndex
					? 'bg-orange-100'
					: ''}"
				onclick={() => (selectedIndex = idx)}
			>
				<div class="font-mono text-2xl">
					<!-- {hours}:{minutes} -->
					{option.duration}
				</div>
				<div>
					<span class="capitalize text-center">{option.keyword}</span>
				</div>
			</div>
		{/each}
	</div>
	<span class="text-center text-2xl capitalize text-orange-950"
		>{selectedOption.tagline}</span
	>
	<button
		onclick={() => {
			onselect(selectedOption);
		}}
		class="border w-max text-2xl px-4 py-2 rounded bg-orange-200"
		>Start</button
	>
</div>
