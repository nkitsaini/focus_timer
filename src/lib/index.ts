// place files you want to import through the `$lib` alias in this folder.


export function assert(value: any, message: string = "assertion error"): asserts value {
	if (!Boolean(value)) {
		throw new Error(message)
	}
}

