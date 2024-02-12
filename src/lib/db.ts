import Dexie, {type Table} from 'dexie';
import type { TimelineEvent, UserEvent } from './timer_clock.svelte';

export interface TimerSessionRow {
  id?: number;
  events: UserEvent[];
  last_tick: number;
}

export class DatabaseDexie extends Dexie {
  sessions!: Table<TimerSessionRow>; 

  constructor() {
    super('timer-db');
    this.version(1).stores({
      sessions: '++id,events,last_tick'
    });
  }
}

export const db = new DatabaseDexie();


