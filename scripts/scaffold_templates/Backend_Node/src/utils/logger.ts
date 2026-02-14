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

function formatMessage(level: LogLevel, message: string): string {
	const prefix = `[Backend][${level}][${getTimestamp()}]`;
	if (level === 'INFO') return chalk.blue(prefix) + ' ' + message;
	if (level === 'DEBUG') return chalk.green(prefix) + ' ' + message;
	return chalk.red(prefix) + ' ' + message;
}

export function logInfo(message: string, ...args: any[]) {
	// eslint-disable-next-line no-console
	console.log(formatMessage('INFO', message), ...args);
}

export function logDebug(message: string, ...args: any[]) {
	// eslint-disable-next-line no-console
	console.log(formatMessage('DEBUG', message), ...args);
}

export function logError(message: string, ...args: any[]) {
	// eslint-disable-next-line no-console
	console.error(formatMessage('ERROR', message), ...args);
}
