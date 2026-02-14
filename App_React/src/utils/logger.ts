/**
 * Centralized Logger for App_React
 * 
 * Format: [App][LEVEL][HH:MM:SS] message
 * 
 * Levels:
 * - INFO: Blue
 * - DEBUG: Green
 * - ERROR: Red
 * 
 * Usage:
 * import { logInfo, logDebug, logError } from '@/utils/logger';
 * 
 * logInfo('Application started');
 * logDebug('Debug information', { data });
 * logError('Error occurred', error);
 */

import chalk from 'chalk';
chalk.level = 3;
const chalkInstance = new chalk.Instance({ level: 3 });
/**
 * Get current time in HH:MM:SS format
 */
function getTimestamp(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Format log message with prefix
 */
function formatMessage(level: string, message: string): string {
  return `[${getTimestamp()}] ${message}`;
}

/**
 * Log info message (Blue)
 */
export function logInfo(message: string, ...args: any[]): void {
  console.log(chalk.blue(formatMessage('INFO', message)), ...safeArgs(args));
}

/**
 * Log debug message (Green)
 */
export function logDebug(message: string, ...args: any[]): void {
  console.log(chalk.green(formatMessage('DEBUG', message)), ...safeArgs(args));
}

/**
 * Log error message (Red)
 */
export function logError(message: string, ...args: any[]): void {
  console.error(chalk.red(formatMessage('ERROR', message)), ...safeArgs(args));
}

/**
 * Log warning message (Yellow)
 */
export function logWarn(message: string, ...args: any[]): void {
  console.warn(chalk.yellow(formatMessage('WARN', message)), ...safeArgs(args));
}

/**
 * Safely prepare args for console logging by stringifying objects
 * and replacing functions with a placeholder to avoid passing
 * non-cloneable values to test runners (Vitest worker RPC).
 */
function safeArgs(args: any[]): any[] {
  return args.map((a) => {
    if (a === null || a === undefined) return a;
    const t = typeof a;
    if (t === 'string' || t === 'number' || t === 'boolean') return a;
    if (t === 'function') return '[Function]';
    try {
      return JSON.parse(JSON.stringify(a, (_k, v) => (typeof v === 'function' ? '[Function]' : v)));
    } catch (e) {
      try {
        return String(a);
      } catch (_) {
        return '[Unserializable]';
      }
    }
  });
}
