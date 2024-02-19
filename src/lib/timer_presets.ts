import { dev } from "$app/environment";
import * as R from "remeda";

export interface TimerPreset {
	duration: number;
	keyword: "mouse" | "monkey" | "elephant" | "turtle" | "monkey-dev";
	tagline: string;
}

export const _ALL_TIMER_PRESETS: TimerPreset[] = [
	{
		duration: 25,
		keyword: "mouse",
		tagline: "quick and sneaky",
	},
	{
		duration: 1,
		keyword: "monkey-dev",
		tagline: "tactful with a goal",
	},
	{
		duration: 55,
		keyword: "monkey",
		tagline: "tactful with a goal",
	},
	{
		duration: 85,
		keyword: "elephant",
		tagline: "force of nature",
	},
	{
		duration: 115,
		keyword: "turtle",
		tagline: "long and steady",
	},
];

export function getPreset(keyword: TimerPreset["keyword"]): TimerPreset {
	return R.find(_ALL_TIMER_PRESETS, (x) => x.keyword === keyword)!;
}

export const TIMER_PRESETS: TimerPreset[] = R.filter(_ALL_TIMER_PRESETS, (x) =>
	x.keyword !== "monkey-dev",
);

export function getPoints(durationMs: number): number {
	let duration = durationMs/60/1000;
	let totalPoints = 0;
	if (duration <= 20) {
		totalPoints = 0;
	} else if (duration <= (30 + 60) / 2) {
		totalPoints = 0.5;
	} else if (duration <= (60 + 90) / 2) {
		totalPoints = 1;
	} else if (duration <= (90 + 120) / 2) {
		totalPoints = 1.5;
	} else if (duration <= (120 + 150) / 2) {
		totalPoints = 2;
	} else {
		totalPoints = Math.floor(duration / 30) / 2;
	}
	return totalPoints;
}
