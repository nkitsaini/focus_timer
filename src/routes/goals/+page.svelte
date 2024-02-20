<script>
    import * as R from 'remeda'
    import SummaryBanner from "../SummaryBanner.svelte";
    import { DateTime } from 'luxon';
    import MultiMonthHeatMap from './MultiMonthHeatMap.svelte';
    import { summaryStore } from '../summaryStore.svelte';
    summaryStore.sessions
</script>
<SummaryBanner class="m-auto  border rounded mt-10" />
