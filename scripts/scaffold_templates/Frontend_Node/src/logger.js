function ts() {
  const d = new Date()
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  return `${h}:${m}:${s}`
}

function prefix(level) {
  return `[Frontend][${level}][${ts()}]`
}

export function logInfo(message, ...args) {
  console.log(prefix('INFO') + ' ' + message, ...args)
}

export function logDebug(message, ...args) {
  console.log(prefix('DEBUG') + ' ' + message, ...args)
}

export function logError(message, ...args) {
  console.error(prefix('ERROR') + ' ' + message, ...args)
}
