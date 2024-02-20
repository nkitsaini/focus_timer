<script>
    import * as R from 'remeda'
    import SummaryBanner from "../SummaryBanner.svelte";
    import CalendarHeatMap from "./YearCalendarHeatMap.svelte";
    import { DateTime } from 'luxon';
    import MultiMonthHeatMap from './MultiMonthHeatMap.svelte';
</script>
<SummaryBanner class="m-auto  border rounded mt-10" />
<MultiMonthHeatMap startDate={DateTime.now().plus({'days': 3})} values={R.concat(R.range(0, 40).map(x => Math.random()), R.range(0, 10).map(x => 0))} />
<!--
<CalendarHeatMap year={2023} values={R.concat(R.range(0, 40).map(x => Math.random()), R.range(0, 10).map(x => 0))}  />
<CalendarHeatMap date={DateTime.now()} values={R.concat(R.range(0, 40).map(x => Math.random()), R.range(0, 10).map(x => 0))}  />
-->
<div>
    <button type="button"> Set </button>
    <button> Set </button>
</div>
