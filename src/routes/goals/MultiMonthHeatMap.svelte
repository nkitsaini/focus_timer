<script lang="ts">
  import { assert } from "$lib";
  import { DateTime } from "luxon";
  import WeekGroupCalendarHeatMap from "./WeekGroupCalendarHeatMap.svelte";
  let {
    values,
    startDate,
    class: className,
  } = $props<{
    values: (number | null)[];
    class?: string;
    startDate: DateTime;
  }>();

  let endDate = startDate.plus({ days: values.length - 1 });

  assert(values.length !== 0);

  let prefixBuffer: (null | number)[] = [];
  while (startDate.weekday !== 1) {
    prefixBuffer.push(null);
    startDate = startDate.minus({ days: 1 });
  }
  values = prefixBuffer.concat(values);

  function getIndexForDate(date: DateTime) {
    return date.diff(startDate, "days").days;
  }

  function getValuesForMonth(monthStart: DateTime) {
    let start = monthStart;
    if (start < startDate) {
      start = startDate;
    }
    let end = monthStart.endOf("month");
    let startIdx = start.diff(startDate, "days").days;
    let endIdx = end.diff(startDate, "days").days;
    let rv: (number | null)[][] = [[]];
    while (start.weekday !== 1) {
      rv[0].push(null);
      start = start.minus({ days: 1 });
    }
    for (const value of values.slice(Math.max(startIdx, 0), endIdx + 1)) {
      if (rv[rv.length - 1].length === 7) {
        rv.push([]);
      }
      rv[rv.length - 1].push(value);
    }
    return rv;
  }

  let monthBlocks: {
    date: DateTime;
    values: (number | null)[][];
    alignment: "left" | "right";
    label: string;
  }[] = [];
  let currDate = startDate.startOf("month");
  while (currDate <= endDate) {
    monthBlocks.push({
      date: currDate,
      values: getValuesForMonth(currDate),
      alignment: "left",
      label: currDate.monthShort!,
    });
    currDate = currDate.plus({ months: 1 });
  }
  monthBlocks[0].alignment = "right";
</script>

<div class="flex gap-2 {className}">
  {#each monthBlocks as block}
    <WeekGroupCalendarHeatMap
      label={block.label}
      values={block.values}
      class={className}
      heatMapAlignment={block.alignment}
    />
  {/each}
</div>
