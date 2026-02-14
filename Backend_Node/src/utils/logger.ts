import chalk from 'chalk';
chalk.level = 3;
const chalkInstance = new chalk.Instance({ level: 3 });

type LogLevel = 'INFO' | 'DEBUG' | 'ERROR';

function getTimestamp(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function formatMessage(level: LogLevel, message: string): string {
  const timestamp = getTimestamp();
  const prefix = `[Backend][${level}][${timestamp}]`;
  
  switch (level) {
    case 'INFO':
      return chalk.blue(prefix) + ' ' + message;
    case 'DEBUG':
      return chalk.green(prefix) + ' ' + message;
    case 'ERROR':
      return chalk.red(prefix) + ' ' + message;
    default:
      return `${prefix} ${message}`;
  }
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

// Legacy compatibility - deprecated
export function log(...args: any[]) {
  logInfo(String(args[0] || ''), ...args.slice(1));
}

