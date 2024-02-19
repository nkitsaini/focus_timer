import { db, type TimerSessionRow } from "$lib/db";
import { liveQuery } from "dexie";
import { DateTime } from "luxon";
import * as R from "remeda";

class SummaryStore {
	sessions: TimerSessionRow[] | undefined = $state(undefined);
	constructor() {
		let month_back = DateTime.now().minus({ months: 1 });
		liveQuery(() => {
			return db.sessions
				.where("last_tick")
				.aboveOrEqual(month_back.toMillis())
				.toArray();
		}).subscribe((x) => {
			if (!R.isNil(x)) {
				this.sessions = x;
			}
		});
	}
}

export const summaryStore = new SummaryStore();
