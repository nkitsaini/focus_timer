import Dexie, {type Table} from 'dexie';
import * as R from 'remeda'
import type { UserEvent } from './timer_clock.svelte';
import { assert, } from '$lib';
import { TIMER_PRESETS, _ALL_TIMER_PRESETS, type TimerPreset } from './timer_presets';
import { browser } from '$app/environment';

export interface TimerSessionRow {
  id?: number;
  startEvent: Extract<UserEvent, {kind: 'started'}>,
  events: UserEvent[];
  last_tick: number;
}

export class DatabaseDexie extends Dexie {
  sessions!: Table<TimerSessionRow>; 

  constructor() {
    super('timer-db');
    this.version(1).stores({
      // `ResumeEvent` had a `PuasedDuration`
      sessions: '++id,events,last_tick'
    });

    this.version(3).stores({
      // removed `PuasedDuration` from `ResumeEvent`
      // `StartAt` event stores whole `timer_preset` instead of just duration.
      // and the same is also copied to indexes
      sessions: '++id,startEvent,last_tick'
    }).upgrade(tx => {
      tx.table('sessions').toCollection().modify(session => {
        DatabaseDexie._sessionV1ToSessionV2(session)
      })
    });
  }

  static _sessionV1ToSessionV2(session: any) {
      let timerPreset = R.find(_ALL_TIMER_PRESETS, (t) => {
        return t.duration * 60 * 1000 === session.events[0].timerDuration;
      })

      assert(timerPreset !== null);
      assert(session.events.length !== 0);
      assert(session.events[0].kind === "started");
      delete session.events[0].timerDuration
      for (let e of session.events) {
        if (e.kind === "resumed") {
          delete e.pauseDuration
        }
      }

      session.events[0].timerPreset = timerPreset
      session.startEvent = session.events[0]
  }
}

export const db = browser?
   new DatabaseDexie():undefined


