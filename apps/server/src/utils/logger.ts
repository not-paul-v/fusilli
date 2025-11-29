export class Logger {
	private context: string;

	constructor(context: string) {
		this.context = context;
	}

	debug(...args: unknown[]): void {
		console.debug(`[${this.context}]`, ...args);
	}

	info(...args: unknown[]): void {
		console.info(`[${this.context}]`, ...args);
	}

	warn(...args: unknown[]): void {
		console.warn(`[${this.context}]`, ...args);
	}

	error(...args: unknown[]): void {
		console.error(`[${this.context}]`, ...args);
	}
}
