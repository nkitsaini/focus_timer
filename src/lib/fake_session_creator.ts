import {DateTime} from 'luxon'
import * as R from 'remeda'
import { get_now } from "./clock.svelte";
import { db, type TimerSessionRow } from "./db";
import type { UserEvent } from "./timer_clock.svelte";
import { getPreset } from "./timer_presets";
import { assert } from '$lib';

const FAKE_SESSION_NAMES = ["mouse-complete", "mouse-incomplete", "mouse-extended"] as const;
type FakeSessionName = typeof FAKE_SESSION_NAMES[number];

const FAKE_SESSIONS: {[key in FakeSessionName]: {events: UserEvent[], last_tick: number}} = {
  "mouse-complete": {events: [
    {kind: 'started', timestamp: 0, timerPreset: getPreset('mouse')},
    {kind: 'paused', timestamp: 1000},
    {kind: 'resumed', timestamp: 2000},
  ], last_tick: (getPreset('mouse').duration + 1) * 60 * 1000},

  "mouse-extended": {events: [
    {kind: 'started', timestamp: 0, timerPreset: getPreset('mouse')},
    {kind: 'paused', timestamp: 1000},
    {kind: 'resumed', timestamp: 2000},
  ], last_tick: (getPreset('mouse').duration * 2) * 60 * 1000},

  "mouse-incomplete": {events: [
    {kind: 'started', timestamp: 0, timerPreset: getPreset('mouse')},
    {kind: 'paused', timestamp: 60000},
    {kind: 'noteAdded', timestamp: 120000, message: "This is a note"},
  ], last_tick: getPreset('mouse').duration * 60 * 1000},
}

export function getFakeSession(key: FakeSessionName, startAt?: number): TimerSessionRow {
  startAt = startAt ?? get_now()
  let session = R.clone(FAKE_SESSIONS[key]);
  assert(session.events[0].kind === "started")
  assert(session.events[0].timestamp === 0)
  for (let e of session.events) {
    e.timestamp += startAt
  }
  session.last_tick += startAt
  return {
    ...session,
    startEvent: session.events[0]
  }
}

export async function insertFakeSession(key: FakeSessionName, startAt?: number) {
  await db.sessions.add(getFakeSession(key, startAt))
}

// TODO: Make it based on a seed. It might bite someday.
export async function insertRandomFakeSessionsForPastMonth(count = 100) {
  let millisecondsInAMonth = 60 * 60 * 24 *  30 * 1000;
  let now = get_now()
  for (let i = 0; i < count; i++) {
    let ts = now - Math.random() * millisecondsInAMonth;
    let key = R.sample(FAKE_SESSION_NAMES, 1)[0];
    console.log("======= sample key", key)
    await insertFakeSession(key, ts)
  }
}
