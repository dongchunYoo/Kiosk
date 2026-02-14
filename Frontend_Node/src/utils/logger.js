/**
 * Frontend_Node Logger
 * 브라우저 환경에서 사용하는 중앙화된 로거
 * 외부 라이브러리 없이 기본 console 사용
 */

/**
 * 현재 시간을 HH:MM:SS 형식으로 반환
 * @returns {string} 포맷된 시간 문자열
 */
function getTimestamp() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * 로그 메시지 포맷팅
 * @param {string} level - 로그 레벨 (INFO, DEBUG, ERROR)
 * @param {string} message - 로그 메시지
 * @returns {string} 포맷된 로그 문자열
 */
function formatMessage(level, message) {
  const timestamp = getTimestamp();
  return `[Frontend][${level}][${timestamp}] ${message}`;
}

/**
 * INFO 레벨 로그
 * @param {string} message - 로그 메시지
 * @param {...any} args - 추가 인자
 */
export function logInfo(message, ...args) {
  // eslint-disable-next-line no-console
  console.log(formatMessage('INFO', message), ...args);
}

/**
 * DEBUG 레벨 로그
 * @param {string} message - 로그 메시지
 * @param {...any} args - 추가 인자
 */
export function logDebug(message, ...args) {
  // eslint-disable-next-line no-console
  console.log(formatMessage('DEBUG', message), ...args);
}

/**
 * ERROR 레벨 로그
 * @param {string} message - 로그 메시지
 * @param {...any} args - 추가 인자
 */
export function logError(message, ...args) {
  // eslint-disable-next-line no-console
  console.error(formatMessage('ERROR', message), ...args);
}

/**
 * WARN 레벨 로그
 * @param {string} message - 로그 메시지
 * @param {...any} args - 추가 인자
 */
export function logWarn(message, ...args) {
  // eslint-disable-next-line no-console
  console.warn(formatMessage('WARN', message), ...args);
}

// 레거시 호환성을 위한 기본 export
export default {
  info: logInfo,
  debug: logDebug,
  error: logError,
  warn: logWarn,
};
