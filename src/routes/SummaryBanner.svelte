<script lang="ts">
  import { parseEvents, type TimerClockState } from "$lib/timer_clock.svelte";
  import { DateTime } from "luxon";
  import { summaryStore } from "./summaryStore.svelte";
  import * as R from "remeda";
  import { getPoints } from "$lib/timer_presets";
    import CalendarHeatMap from "./goals/YearCalendarHeatMap.svelte";

  const { class: className = "" } = $props<{ class?: string }>();

  // To remove flicker while navigating between pages
  let timerSessions = $derived(
    R.sortBy(
      (summaryStore.sessions || []).map((x) => parseEvents(x.last_tick, x.events)),
      (x) => x.startAt,
    ).reverse(),
  );

  interface IntervalSessionSummary {
    sessions: TimerClockState[];
    totalPoints: number;
  }

  interface Summary {
    today: IntervalSessionSummary;
    past_week_by_day: IntervalSessionSummary[];
    week: IntervalSessionSummary;
    month: IntervalSessionSummary;
  }

  function getIntervalSummary(
    sessions: TimerClockState[],
  ): IntervalSessionSummary {
    let totalPoints = sessions
      .map((x) => getPoints(x.totalEffectiveDuration))
      .reduce((a, b) => a + b, 0);

    return {
      sessions,
      totalPoints,
    };
  }

  function summarizeSessions(sessions: TimerClockState[]): Summary {
    let now = DateTime.now();

    let today = sessions.filter((x) =>
      now.hasSame(DateTime.fromMillis(x.startAt), "day"),
    );
    let past_week_by_day: TimerClockState[][] = [];
    for (let i = 0; i < 7; i++) {
      let day = now.minus({ days: i });
      let sessions_ = sessions.filter((x) =>
        day.hasSame(DateTime.fromMillis(x.startAt), "day"),
      );
      past_week_by_day.push(sessions_);
    }
    let week = sessions.filter((x) =>
      now.hasSame(DateTime.fromMillis(x.startAt), "week"),
    );
    let month = sessions.filter((x) =>
      now.hasSame(DateTime.fromMillis(x.startAt), "month"),
    );
    return {
      today: getIntervalSummary(today),
      past_week_by_day: past_week_by_day.map(getIntervalSummary),
      week: getIntervalSummary(week),
      month: getIntervalSummary(month),
    };
  }

  let summaries = $derived(summarizeSessions(timerSessions));
</script>

<a
  href="/goals"
  class="w-max p-5 block {className} text-orange-950 px-16 hover:bg-orange-100"
>
  <h1 class="text-center text-2xl">Score Card</h1>
  {#if R.isNil(summaryStore.sessions)}
    <div class="grid grid-cols-2 text-left w-max mt-4 m-auto gap-x-4">
      <span>Today:</span> <span></span>
      <span>Week:</span> <span></span>
      <span>Month:</span> <span></span>
    </div>
  {:else}
    <div class="grid grid-cols-2 text-left w-max mt-4 m-auto gap-x-4">
      <span>Today:</span> <span>{summaries.today.totalPoints}</span>
      <span>Week:</span> <span>{summaries.week.totalPoints}</span>
      <span>Month:</span> <span>{summaries.month.totalPoints}</span>
    </div>
  {/if}
</a>
