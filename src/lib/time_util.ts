export function humanizeTimestamp(timestampMs: number) {
		let date = new Date(timestampMs);
		return date.toLocaleString();
	}
