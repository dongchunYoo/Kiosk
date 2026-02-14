"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logInfo = logInfo;
exports.logDebug = logDebug;
exports.logError = logError;
exports.log = log;
const chalk_1 = __importDefault(require("chalk"));
chalk_1.default.level = 3;
const chalkInstance = new chalk_1.default.Instance({ level: 3 });
function getTimestamp() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}
function formatMessage(level, message) {
    const timestamp = getTimestamp();
    const prefix = `[Backend][${level}][${timestamp}]`;
    switch (level) {
        case 'INFO':
            return chalk_1.default.blue(prefix) + ' ' + message;
        case 'DEBUG':
            return chalk_1.default.green(prefix) + ' ' + message;
        case 'ERROR':
            return chalk_1.default.red(prefix) + ' ' + message;
        default:
            return `${prefix} ${message}`;
    }
}
function logInfo(message, ...args) {
    // eslint-disable-next-line no-console
    console.log(formatMessage('INFO', message), ...args);
}
function logDebug(message, ...args) {
    // eslint-disable-next-line no-console
    console.log(formatMessage('DEBUG', message), ...args);
}
function logError(message, ...args) {
    // eslint-disable-next-line no-console
    console.error(formatMessage('ERROR', message), ...args);
}
// Legacy compatibility - deprecated
function log(...args) {
    logInfo(String(args[0] || ''), ...args.slice(1));
}
