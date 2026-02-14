import chalk from 'chalk';

chalk.level = 3;

type LogLevel = 'INFO' | 'DEBUG' | 'ERROR';

function getTimestamp(): string {
	const now = new Date();
	const hours = String(now.getHours()).padStart(2, '0');
	const minutes = String(now.getMinutes()).padStart(2, '0');
	const seconds = String(now.getSeconds()).padStart(2, '0');
	return `${hours}:${minutes}:${seconds}`;
}

function formatPrefix(level: LogLevel): string {
	return `[App][${level}][${getTimestamp()}]`;
}

function safeArgs(args: any[]): any[] {
	return args.map((a) => {
		if (a === null || a === undefined) return a;
		const t = typeof a;
		if (t === 'string' || t === 'number' || t === 'boolean') return a;
		if (t === 'function') return '[Function]';
		try {
			return JSON.parse(JSON.stringify(a, (_k, v) => (typeof v === 'function' ? '[Function]' : v)));
		} catch (_e) {
			try {
				return String(a);
			} catch (_e2) {
				return '[Unserializable]';
			}
		}
	});
}

export function logInfo(message: string, ...args: any[]): void {
	console.log(chalk.blue(formatPrefix('INFO') + ' ' + message), ...safeArgs(args));
}

export function logDebug(message: string, ...args: any[]): void {
	console.log(chalk.green(formatPrefix('DEBUG') + ' ' + message), ...safeArgs(args));
}

export function logError(message: string, ...args: any[]): void {
	console.error(chalk.red(formatPrefix('ERROR') + ' ' + message), ...safeArgs(args));
}
