import { dev } from "$app/environment";
import * as R from 'remeda'

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
	return R.find(_ALL_TIMER_PRESETS, x => x.keyword===keyword)!;
}

export const TIMER_PRESETS: TimerPreset[] = R.filter(_ALL_TIMER_PRESETS, x => dev?x.keyword!=="monkey":x.keyword!=="monkey-dev");
