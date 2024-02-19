import { DatabaseDexie } from "./db";
import * as R from 'remeda'
import { describe, it, expect } from "vitest";
import { _ALL_TIMER_PRESETS } from "./timer_presets";

describe("DatabaseDexie", () => {
	it("should be defined", () => {
		expect(DatabaseDexie).toBeDefined();
	});
	it("should be valid migration v1->v2", () => {
		let monkey_dev = R.find(_ALL_TIMER_PRESETS, x => x.keyword==='monkey-dev')!;
		let session: any = {
			events: [
				{ kind: "started", timestamp: 1708321524351, timerDuration: 60000 },
				{ kind: "paused", timestamp: 1708321545684 },
				{ kind: "resumed", timestamp: 1708321547862, pauseDuration: 2178 },
			],
			last_tick: 1708321549041,
			id: 10,
		};
		DatabaseDexie._sessionV1ToSessionV2(session);
		expect(session.startEvent).toEqual({
			kind: "started",
			timestamp: 1708321524351,
			timerPreset: monkey_dev,
		});

		expect(session.events[0]).toEqual(session.startEvent);
		expect(session.events[1]).toEqual({ kind: "paused", timestamp: 1708321545684 });
		expect(session.events[2]).toEqual({ kind: "resumed", timestamp: 1708321547862 });

		expect(session.id).toEqual(10);
		expect(session.last_tick).toEqual(1708321549041);
	});
});
