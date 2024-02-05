import { assert } from "$lib"
import * as R from 'remeda'

/** Return UTC ms */
function get_now(): number {
	return Date.now()
}

let CURRENT_TIME = $state(get_now())

setInterval(() => CURRENT_TIME = get_now(), 50)


type TimelineEvent = {
	kind: 'started',
	timestamp: number
} | {
	kind: 'paused',
	timestamp: number
} | {
	kind: 'resumed',
	timestamp: number,
	pauseDuration: number,
} | {
	kind: 'finished',
	timestamp: number,
	totalPauseDuration: number,
}
interface TimerClockState {
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
	timestamps: number[]
}

function parseTimestamps(now: number, timestamps: number[], timerDuration: number): TimerClockState {
	assert(timestamps.length != 0)
	// console.log(now, timestamps.slice(-1)[0])
	assert(now >= timestamps.slice(-1)[0])

	let isPaused = timestamps.length % 2 == 0
	let pauseDuration = 0;
	let totalPassedDuration = 0;
	let events: TimelineEvent[] = []
	let isCompleted = false;
	for (const [idx, ts] of timestamps.entries()) {
		if (idx === 0) {
			events.push({ kind: 'started', timestamp: ts })
		} else if (idx % 2 != 0) {
			let elapsedTime = ts - timestamps[idx - 1]
			events.push({ kind: 'paused', timestamp: ts })
			totalPassedDuration += elapsedTime
		} else if (idx % 2 == 0) {
			let elapsedTime = ts - timestamps[idx - 1]
			events.push({ kind: 'resumed', timestamp: ts, pauseDuration: elapsedTime })
			pauseDuration += elapsedTime
			totalPassedDuration += elapsedTime
		} else {
			throw new Error("unreachable")
		}
		if (!isCompleted && totalPassedDuration - pauseDuration >= timerDuration) {
			isCompleted = true;
			let diff = totalPassedDuration - pauseDuration - timerDuration;
			events.push({ kind: 'finished', timestamp: ts - diff, totalPauseDuration: pauseDuration })
		}
	}
	if (now > timestamps.slice(-1)[0]) {
		let elapsed = now - timestamps.slice(-1)[0]
		if (isPaused) {
			pauseDuration += elapsed
		}
		totalPassedDuration += elapsed
		if (!isCompleted && totalPassedDuration - pauseDuration >= timerDuration) {
			isCompleted = true;
			let diff = totalPassedDuration - pauseDuration - timerDuration;
			events.push({ kind: 'finished', timestamp: now - diff, totalPauseDuration: pauseDuration })
		}
	}
	events = R.sortBy(events, (e) => e.timestamp)

	let effectiveDuration = totalPassedDuration - pauseDuration;
	return {
		startAt: timestamps[0],
		timeline: events,
		isPaused,
		isCompleted,
		totalPauseDuration: pauseDuration,
		totalDuration: totalPassedDuration,
		totalEffectiveDuration: effectiveDuration,
		remainingDuration: isCompleted ? 0 : timerDuration - effectiveDuration,
		surpassedDuration: isCompleted ? effectiveDuration - timerDuration : 0,
		percentCompleted: (effectiveDuration * 100) / timerDuration,
		timestamps

	}
}

export function splitTimestamp(ts: number) {
	ts = Math.floor(ts / 1000)
	let seconds = ts % 60;
	let minutes = Math.floor(ts / 60)
	return { minutes, seconds }
}

export class TimerClock {
	/** timestamps = [startTime, pauseTime, resumeTime, pauseTime, resumeTime, ...] */
	timestamps: number[] = $state([CURRENT_TIME - 1000])
	timerDuration: number = $state(0)
	state: TimerClockState = $derived(parseTimestamps(CURRENT_TIME, this.timestamps, this.timerDuration))
	constructor(timerDuration: number) {
		this.timerDuration = timerDuration
		this.timestamps = [CURRENT_TIME]
	}

	pause() {
		if (!this.state.isPaused) {
			this.timestamps.push(CURRENT_TIME)
		}
	}

	resume() {
		if (this.state.isPaused) {
			this.timestamps.push(CURRENT_TIME)
		}
	}
}