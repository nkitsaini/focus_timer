<script lang="ts">
    import { assert } from "$lib";
    import HeatMapCell from "./HeatMapCell.svelte";

  let {orientation="vertical", values, class: className} = $props<{
    orientation?: "horizontal" | "vertical";
    values: (number | null)[];
    class?: string;
  }>();

  assert(values.length <= 7);
  while (values.length < 7) {
    values.push(null);
  }
</script>


<div class="flex gap-[0.15rem] {className}" class:flex-col={orientation==='vertical'}>
  {#each values as value}
    <HeatMapCell value={value} />
  {/each}
</div>

