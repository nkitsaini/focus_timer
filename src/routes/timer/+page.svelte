<script lang="ts">
  import { dev, browser } from "$app/environment";
  import { getPreset, type TimerPreset } from "$lib/timer_presets";
  import { humanizeTimestamp } from "$lib/time_util";
  import { db } from "$lib/db";
  import { shortcut } from "$lib/shortcut";
  import { onMount, onDestroy, unstate } from "svelte";
  import { Howl } from "howler";
  import * as ICONS from "radix-icons-svelte";
  import * as R from "remeda";
  import {
    TimerClock,
    splitTimestamp,
    type UserEvent,
    type UserStartedEvent,
  } from "$lib/timer_clock.svelte";
  import { SpeedAdjustableClock } from "$lib/clock.svelte";
  import { page } from "$app/stores";
  import { replaceState, goto } from "$app/navigation";
  let finishSound: Howl;
  let faviconCanvasElement: HTMLCanvasElement | null = $state(null);
  let seek_speed = 1000;
  let textareaMessage = $state("");
  if (!dev) {
    seek_speed = 1;
  }

  $effect(() => {
    if (R.isNil($page.state.timerPreset)) {
      goto("/", {
        replaceState: true,
        state: { timerPreset: undefined },
      });
    }
  });

  // let { preset, updateTitle, updateFavicon } = $props<{
  // 	preset: TimerPreset;
  // 	updateTitle: (title: string) => {};
  // 	updateFavicon: (url: string, type?: string) => void;
  // }>();

  // The page redirects if preset is not defined. `monkey` is just a default to make svelte
  // not throw an error
  let preset = JSON.parse(
    $page.state.timerPreset || JSON.stringify(getPreset("monkey")),
  ) as TimerPreset;

  let clock = new SpeedAdjustableClock(seek_speed);
  let timer = new TimerClock(preset, clock);

  let { seconds: seconds_surpassed, minutes: minutes_surpassed } = $derived(
    splitTimestamp(timer.state.surpassedDuration),
  );
  let { seconds: seconds_remaining, minutes: minutes_remaining } = $derived(
    splitTimestamp(timer.state.remainingDuration),
  );

  let isFinishSoundPlayed = false;

  let timerString = $derived(
    timer.state.isCompleted
      ? `+${minutes_surpassed.toString().padStart(2, "0")}:${seconds_surpassed
          .toString()
          .padStart(2, "0")}`
      : `${minutes_remaining.toString().padStart(2, "0")}:${seconds_remaining
          .toString()
          .padStart(2, "0")}`,
  );

  $effect(() => {
    if (timer.state.isCompleted && !isFinishSoundPlayed) {
      isFinishSoundPlayed = true;
      finishSound.play();
    }
  });

  let canvasURL: string | null = $state(null);
  let faviconSVGContent = $derived(`
			<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
			  <rect width="50" height="100" x="25" y="0" fill="#fdba74" rx="10" ry="10" />
			  <rect width="50" height="${Math.max(
          0,
          100 - timer.state.percentCompleted,
        )}" x="25" y="${Math.min(
          100,
          timer.state.percentCompleted,
        )}" fill="#ea580c" rx="10" ry="10" />
			</svg>
	`);
  onMount(async () => {
    finishSound = new Howl({
      src: ["/notification.mp3"],
    });
    //@ts-ignore
    window.get_state = () => {
      console.log(timer.state);
    };
  });

  async function updateFaviconURL(svgContent: string) {
    let svg = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    let domURL = self.URL || self.webkitURL || self;
    let url = domURL.createObjectURL(svg);
    let img = new Image();
    img.onload = function () {
      let ctx = faviconCanvasElement!.getContext("2d")!;
      ctx.clearRect(
        0,
        0,
        faviconCanvasElement!.width,
        faviconCanvasElement!.height,
      );
      ctx.drawImage(img, 0, 0);
      domURL.revokeObjectURL(url);
      canvasURL = faviconCanvasElement!.toDataURL("image/png");
    };
    img.src = url;
  }
  let updateFaviconURLDebounced = R.debounce(updateFaviconURL, {
    timing: "trailing",
    waitMs: 100,
    maxWaitMs: dev ? 200 : 60 * 1000,
  });

  let sessionId: null | number = null;
  async function updateDb(now: number, events: UserEvent[]) {
    if (sessionId === null) {
      sessionId = await db!.sessions.add({
        startEvent: events[0] as UserStartedEvent,
        events: events,
        last_tick: now,
      });
    } else {
      await db!.sessions.update(sessionId, {
        startEvent: events[0] as UserStartedEvent,
        events,
        last_tick: now,
      });
    }
  }
  let updateDbDebounced = R.debounce(updateDb, {
    timing: "trailing",
    waitMs: 100,
    maxWaitMs: dev ? 200 : 1000,
  });
  $effect(() => {
    updateDbDebounced.call(unstate(clock.now), unstate(timer.userEvents));
  });

  let faviconLink = $derived.by(() => {
    if (canvasURL) {
      return { url: canvasURL, type: "image/png" };
    } else {
      return { url: "/favicon.svg", type: "image/svg+xml" };
    }
  });
  let titleString = $derived.by(() => {
    let pauseString = "";
    if (timer.state.isPaused) {
      pauseString = "- Paused ";
    }
    return `Timer ${pauseString}(${
      dev ? timerString : timerString.slice(0, -3) + " m"
    })`;
  });

  $effect(() => {
    if (faviconCanvasElement) {
      updateFaviconURLDebounced.call(faviconSVGContent);
    }
  });


  let shouldWarnBeforeUnload = $derived(!timer.state.isCompleted || !timer.state.isPaused);

  function beforeUnloadHandler(event) {
    if (shouldWarnBeforeUnload) {
      event.preventDefault();
      event.returnValue = true;
    }
  }
  $effect(() => {
    if (!browser) {
      return
    }
    if (shouldWarnBeforeUnload) {
      window.addEventListener("beforeunload", beforeUnloadHandler)
    } else {
      window.removeEventListener("beforeunload", beforeUnloadHandler)
    }
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener("beforeunload", beforeUnloadHandler)
    }
  });

  function handleTextAreaKeyPress() {
    let message = textareaMessage.trim();
    if (message.length !== 0) {
      timer.add_note(message);
      textareaMessage = "";
    }
  }
  onMount(() => {
    // To allow seek adjusting for testing
    // @ts-ignore
    window.timer_clock = clock;
  });
</script>

<svelte:head>
  <link rel="icon" href={faviconLink.url} type={faviconLink.type} />
  <title>{titleString}</title>
</svelte:head>

{#if R.isNil($page.state.timerPreset)}
  No timer selected. Redirecting...
{:else}
  <div class="flex flex-col items-center w-content">
    <div
      class=" glass rounded border w-64 h-96 font-mono text-orange-950 flex flex-col justify-center items-center"
      style="--complete-percentage: {Math.min(
        100,
        timer.state.percentCompleted,
      )}%"
    >
      <div class="text-2xl capitalize text-orange-950">{preset.keyword}</div>
      <div class="capitalize text-orange-950 border-b border-orange-950">
        {preset.tagline}
      </div>
      <div class="text-2xl">
        {timerString}
      </div>
    </div>
  </div>

  <div class="flex justify-center items-center mt-4">
    {#if timer.state.isPaused}
      <button class="border p-4 bg-orange-100" onclick={() => timer.resume()}
        ><ICONS.Resume class="inline-block mr-2" size={16} />Resume</button
      >
    {:else}
      <button class="border p-4 bg-orange-100" onclick={() => timer.pause()}
        ><ICONS.Pause class="inline-block mr-2" size={16} />Pause</button
      >
    {/if}
  </div>

  <br />

  <div class="flex flex-col justify-center items-center mt-4">
    <!-- Notes -->
    <div class="flex flex-row items-center gap-2">
      <textarea
        class="border w-96 bg-orange-50"
        placeholder="Type and Press `Ctrl+Enter` to Add Note"
        bind:value={textareaMessage}
        use:shortcut={{
          control: true,
          code: "Enter",
          callback: handleTextAreaKeyPress,
        }}
      />
      <button
        class="border px-4 py-2 bg-orange-100 w-max"
        onclick={handleTextAreaKeyPress}
      >
        <ICONS.Pencil2 class="inline-block mr-2" size={16} />Add
      </button>
    </div>
    <br />
    <!-- Timeline -->
    <span class="text-orange-950 text-lg mt-4">Timeline: </span>
    <div class="flex flex-col w-96 gap-2">
      {#each R.reverse(timer.state.timeline) as event}
        {#if event.kind === "noteAdded"}
          <div class="w-full">
            <div class="w-full flex justify-between">
              <span class="capitalize">Note</span>
              <span>{humanizeTimestamp(event.timestamp)}</span>
            </div>
            <p></p>
            <pre class="text-orange-900">{event.message}</pre>
          </div>
        {:else}
          <div class="w-full flex justify-between">
            <span class="capitalize">{event.kind}</span>
            <span>{humanizeTimestamp(event.timestamp)}</span>
          </div>
        {/if}
        <hr />
      {/each}
    </div>
  </div>

  <!-- Used to render dynamic favicon -->
  <canvas
    class="hidden"
    bind:this={faviconCanvasElement}
    height="100"
    width="100"
    id="my_canvas"
  />
{/if}

<style>
  .glass {
    transition: var(--complete-percentage) 1s;
    background: linear-gradient(
      to bottom,
      theme("colors.orange.200") var(--complete-percentage),
      theme("colors.orange.300") var(--complete-percentage)
    );
  }
</style>
