<script lang="ts">
  import { DateTime } from "luxon";
  import * as R from "remeda";
  import HeatMapCell from "./HeatMapCell.svelte";
  import { assert } from "$lib";
    import WeekCalendarHeatMap from "./WeekCalendarHeatMap.svelte";
    import WeekGroupCalendarHeatMap from "./WeekGroupCalendarHeatMap.svelte";
  let {
    year,
    month,
    values,
    class: className,
    day = 1,
  } = $props<{
    year: number;

    /** 1=Jan, 12=Dec */
    month: number;

    day?: number;

    /**
    Between 0 and 1 (inclusive), null values are not visible.
    Always starts from day 1 and if end-values are missing they are assumed to be null.
    */
    values: (number | null)[];

    class?: string;
  }>();

  let startDate = DateTime.fromObject({ year, month, day });
  let monthStartDay = startDate.weekday - 1;
  console.log("====== values", values.length, startDate.daysInMonth, startDate.day, startDate.toISO())
  assert(values.length <= (startDate.daysInMonth! - startDate.day + 1));

  let adjustedValues: (null | number)[] = R.range(0, monthStartDay).map(
    () => null,
  );
  adjustedValues.push(...values);
  let grid: (number | null)[][] = R.range(0, 7).map(() => []);
  for (let i = 0; i < adjustedValues.length; i++) {
    let week = i % 7;
    grid[week].push(adjustedValues[i]);
  }
</script>

<WeekCalendarHeatMap values={[1, 0.5, 1, 0]} orientation='horizontal' />
<WeekCalendarHeatMap values={[1, 0, 1, 0]} orientation='vertical' />
<WeekGroupCalendarHeatMap values={[[1, 0, 1, 0], [1, 0.1, 0.1, 0.2], [1, 0.1, 0.1, 0.2], [1, 0.1, 0.1, 0.2]]} label="hey" />
<WeekGroupCalendarHeatMap values={[[1, 0, 1, 0], [1, 0.1, 0.1, 0.2], [1, 0.1, 0.1, 0.2], [1, 0.1, 0.1, 0.2]]} />
<WeekGroupCalendarHeatMap values={[[1, 0, 1, 0], [1, 0.1, 0.1, 0.2], [1, 0.1, 0.1, 0.2], [1, 0.1, 0.1, 0.2]]} label="hey2" heatMapAlignment='left' />
<WeekGroupCalendarHeatMap values={[[1, 0, 1, 0],]} label="hey3" heatMapAlignment='left' />
<WeekGroupCalendarHeatMap values={[[1, 0, 1, 0],]} label="hey4" heatMapAlignment='right' />
<WeekGroupCalendarHeatMap values={[[1, 0, 1, 0],]} heatMapAlignment='right' />

<div class={className}>
  <div class="flex gap-[0.15rem] flex-col">
    {#each grid as row}
      <div class="flex gap-[0.15rem]">
        {#each row as cell}
          <HeatMapCell value={cell} />
        {/each}
      </div>
    {/each}
  </div>
  <span>{startDate.monthShort}</span>
</div>
