<script lang="ts">
  import {DateTime, Interval} from 'luxon'
  import * as R from 'remeda'
  import MonthCalendarHeatMap from './MonthCalendarHeatMap.svelte';

  let {year, date, values} = $props<{
    /** Between 0 and 1 (inclusive)*/
    values: number[],
  } & ({
    date?: undefined,
    year: number,
  } | 
    {
    year?: undefined,
    date: DateTime,
    }
  )>();

  let startDate = R.isNil(date)? DateTime.fromObject({year}): date;
  let endDate = startDate.plus({days: values.length - 1});

  let months: DateTime[] = [];
  let currDate = startDate.startOf('month');
  while (currDate <= endDate) {
    months.push(currDate);
    currDate = currDate.plus({months: 1});
  }

  function getValuesForMonth(monthStartDate: DateTime) {
    let start = monthStartDate <startDate?startDate: monthStartDate;

    let startIdx = start.diff(startDate, 'days').days
    let daysInMonth = monthStartDate.daysInMonth!;
    let monthValues: (number | null)[] = []; 
    for (let i =1; i < start.day; i++) {
      monthValues.push(null);
    }
    monthValues.push(...values.slice(startIdx, startIdx + daysInMonth - start.day + 1))

    return {values: monthValues, day: 1};
  }


  
</script>

{values.length}
<div class="flex gap-2">
  {#each months as month}
    <MonthCalendarHeatMap year={month.year} month={month.month} values={getValuesForMonth(month).values} day={getValuesForMonth(month).day}  />
  {/each}
</div>
