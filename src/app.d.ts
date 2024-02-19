// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		interface PageState {
			// contains JSON.stringify(currently selected TIMER_PRESET)
			timerPreset?: string
		}
		// interface Platform {}
	}
}

export {};
