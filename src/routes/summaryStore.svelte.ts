import { db, type TimerSessionRow } from "$lib/db";
import { liveQuery } from "dexie";
import { DateTime } from "luxon";
import * as R from "remeda";

class SummaryStore {
	sessions: TimerSessionRow[] | undefined = $state(undefined);
	constructor() {
		let year_back = DateTime.now().minus({ years: 1 });
		liveQuery(() => {
			return db.sessions
				.where("last_tick")
				.aboveOrEqual(year_back.toMillis())
				.toArray();
		}).subscribe((x) => {
			if (!R.isNil(x)) {
				this.sessions = x;
			}
		});
	}
}

export const summaryStore = new SummaryStore();
