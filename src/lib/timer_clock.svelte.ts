import { assert } from "$lib"
import * as R from 'remeda'
import { SIMPLE_CLOCK, type Clock } from "./clock.svelte"
import { _ALL_TIMER_PRESETS, getPreset, type TimerPreset } from "./timer_presets"


export type UserPauseEvent = {
	kind: 'paused',
	timestamp: number
}
export type UserResumeEvent = {
	kind: 'resumed',
	timestamp: number
}
export type UserStartedEvent = {
	kind: 'started',
	timestamp: number,
	timerPreset: TimerPreset
}
export type UserNoteEvent = {
	kind: 'noteAdded',
	timestamp: number,
	message: string
}

export type UserEvent = UserNoteEvent | UserPauseEvent | UserResumeEvent | UserStartedEvent

export type TimelineEvent = UserEvent | {
	kind: 'finished',
	timestamp: number,
	totalPauseDuration: number
}

export interface TimerClockState {
	startAt: number,
	timeline: TimelineEvent[]

	totalPauseDuration: number,
	totalDuration: number,
	totalEffectiveDuration: number,

	remainingDuration: number,
	surpassedDuration: number,

	/** Can be over 100% depending on time elapsed */
	percentCompleted: number,

	isCompleted: boolean
	isPaused: boolean,
	lastPausedEvent: null | UserPauseEvent
	userEvents: UserEvent[]
}

export function parseEvents(now: number, userEvents: UserEvent[]): TimerClockState {
	assert(userEvents.length != 0)
	assert(userEvents[0].kind === "started")
	assert(now >= R.last(userEvents)!.timestamp)

	let pauseDuration = 0;
	let totalPassedDuration = 0;
	let lastPausedEvent:UserPauseEvent | null = null;
	let timerDuration = userEvents[0].timerPreset.duration * 60 * 1000;
	let timelineEvents: TimelineEvent[] = []
	let isCompleted = false;
	function totalPauseDuration(now: number) {
		let rv =  pauseDuration 
		if (lastPausedEvent) {
			rv += now - lastPausedEvent.timestamp
		}
		return rv
	}
	for (const [idx, event] of userEvents.entries()) {
		if (event.kind === "started") {
			timelineEvents.push(event)
			continue;
		}
		
		let elapsedTime = event.timestamp - userEvents[idx - 1].timestamp
		if (event.kind === "paused") {
			timelineEvents.push(event)
			lastPausedEvent = event
		} else if (event.kind === 'resumed') {
			assert(lastPausedEvent !== null)
			timelineEvents.push(event)
			pauseDuration += event.timestamp - lastPausedEvent.timestamp;
			lastPausedEvent = null;
		} else if (event.kind === 'noteAdded') {
			timelineEvents.push(event)
		} else {
			throw new Error("unreachable")
		}
		totalPassedDuration += elapsedTime
		if (lastPausedEvent && !['paused', 'resumed'].includes(event.kind)) {
			// paused and resumed handle the timing themselves
			pauseDuration += elapsedTime
		}
		if (!isCompleted && totalPassedDuration - pauseDuration >= timerDuration) {
			isCompleted = true;
			let diff = totalPassedDuration - pauseDuration - timerDuration;
			timelineEvents.push({ kind: 'finished', timestamp: event.timestamp - diff, totalPauseDuration: pauseDuration })
		}
	}
	if (now > R.last(userEvents)!.timestamp) {
		let elapsed = now - R.last(userEvents)!.timestamp
		if (lastPausedEvent !== null) {
			pauseDuration += elapsed
		}
		totalPassedDuration += elapsed
		if (!isCompleted && totalPassedDuration - pauseDuration >= timerDuration) {
			isCompleted = true;
			let diff = totalPassedDuration - pauseDuration - timerDuration;
			timelineEvents.push({ kind: 'finished', timestamp: now - diff, totalPauseDuration: pauseDuration })
		}
	}
	timelineEvents = R.sortBy(timelineEvents, (e) => e.timestamp)

	let effectiveDuration = totalPassedDuration - pauseDuration;
	return {
		userEvents: userEvents,
		startAt: userEvents[0].timestamp,
		timeline: timelineEvents,
		isPaused: lastPausedEvent !== null,
		isCompleted,
		totalPauseDuration: pauseDuration,
		totalDuration: totalPassedDuration,
		totalEffectiveDuration: effectiveDuration,
		remainingDuration: isCompleted ? 0 : timerDuration - effectiveDuration,
		surpassedDuration: isCompleted ? effectiveDuration - timerDuration : 0,
		percentCompleted: (effectiveDuration * 100) / timerDuration,
		lastPausedEvent
	}
}

export function splitTimestamp(ts: number) {
	ts = Math.floor(ts / 1000)
	let seconds = ts % 60;
	let minutes = Math.floor(ts / 60)
	return { minutes, seconds }
}

export class TimerClock {
	clock: Clock = $state(SIMPLE_CLOCK)
	userEvents: UserEvent[] = $state([{kind: 'started', timestamp: this.clock.now - 1000, timerPreset: getPreset('monkey-dev')}])
	state: TimerClockState = $derived(parseEvents(this.clock.now, this.userEvents))
	constructor(timerPreset:TimerPreset, clock?: Clock) {
		clock = clock || SIMPLE_CLOCK
    this.clock = clock
		this.userEvents = [{
			kind: "started",
			timestamp: clock.startAt,
			timerPreset: timerPreset
		}]
	}

	pause() {
		if (!this.state.isPaused) {
			this.userEvents.push({
				kind: 'paused',
				timestamp: this.clock.now
			})
		}
	}

	resume() {
		let now = this.clock.now
		if (this.state.isPaused) {
			assert(this.state.lastPausedEvent)
			this.userEvents.push({
				kind: 'resumed',
				timestamp: now,
			})
		}
	}

	add_note(message: string) {
		this.userEvents.push({
			kind: 'noteAdded',
			timestamp: this.clock.now,
			message: message
		})
	}
}
