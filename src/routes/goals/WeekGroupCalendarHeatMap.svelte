<script lang="ts">
  import WeekCalendarHeatMap from "./WeekCalendarHeatMap.svelte";

  let {
    values,
    class: className,
    label,
    heatMapAlignment,
  } = $props<{
    /** [week_one_values, week_two_values, ...] */
    values: (number|null)[][];
    class?: string;
    label?: string;
    heatMapAlignment?: "left" | "right";
  }>();
</script>


<div
  class="{className} w-max flex flex-col"
>
  <div class="flex gap-[0.15rem]" class:self-end={heatMapAlignment === "right"} class:self-start={heatMapAlignment === "left"}>
    {#each values as weekValues}
      <WeekCalendarHeatMap values={weekValues} />
    {/each}
  </div>
  {#if label}
    <div class="text-center self-center">{label}</div>
  {/if}
</div>
