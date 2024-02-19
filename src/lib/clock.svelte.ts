import { DateTime } from "luxon";

/** Return UTC ms */
export function get_now(): number {
	return DateTime.now().toMillis()
}

export interface Clock {
  startAt: number
  now: number
  elapsedDuration: number
}

class _Ticker {
  now = $state(get_now())

  constructor() {
		setInterval(() => this.now = get_now(), 50)
  }
}

export const TICKER = new _Ticker();



export class SpeedAdjustableClock implements Clock {
  seekSpeed = $state(1)
  startAt = $state(TICKER.now)
  now = $derived(this._calculateEffectiveNow())
  elapsedDuration = $derived(this.now - this.startAt)

  constructor(speed: number=1, startAt?: number) {
    this.seekSpeed = speed
    this.startAt = startAt || TICKER.now
  }

  setSeek(speed: number) {
    this.seekSpeed = speed
  }

  _calculateEffectiveNow() {
    return this.startAt + (TICKER.now - this.startAt) * this.seekSpeed
  }
}

export class ControlledClock implements Clock {
  startAt: number = $state(TICKER.now)
  now = $derived(TICKER.now)
  elapsedDuration = $derived(this.now - this.startAt)
  constructor(startAt?: number) {
    this.startAt = startAt || TICKER.now
  }
  setTime(now: number) {
    this.now = now
  }
}

export const SIMPLE_CLOCK = new SpeedAdjustableClock()
