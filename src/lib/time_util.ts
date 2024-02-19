import {DateTime} from 'luxon'
export function humanizeTimestamp(timestampMs: number) {
	return DateTime.fromMillis(timestampMs).toLocal().toISO()
}
