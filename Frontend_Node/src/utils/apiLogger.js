// Simple API and page logger controlled by VITE_API_LOG (default true)
const RAW_FLAG = typeof import.meta !== 'undefined' && import.meta.env && typeof import.meta.env.VITE_API_LOG !== 'undefined'
    ? String(import.meta.env.VITE_API_LOG).toLowerCase()
    : null;

function isTruthyString(v) {
    if (v == null) return null;
    return ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());
}

export function shouldLog() {
    if (RAW_FLAG !== null) {
        const r = isTruthyString(RAW_FLAG);
        return r === null ? true : r;
    }
    // fallback default true
    return true;
}

function safeStringify(obj) {
    try {
        if (obj === undefined) return null;
        return typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
    } catch (e) {
        try { return String(obj); } catch (_) { return '<unserializable>'; }
    }
}

export function logSend(method, url, body) {
    if (!shouldLog()) return;
    try {
        const c = (typeof window !== 'undefined' && window.console) ? window.console : { log: () => { }, info: () => { }, warn: () => { }, error: () => { } };
        const fn = c.info || c.log || (() => { });
        fn.call(c, `>[SEND] [${String(method).toUpperCase()}] ${url}`);
        fn.call(c, '>[body]', body === undefined ? null : body);
    } catch (e) { /* ignore */ }
}

export function logResponse(status, url, body) {
    if (!shouldLog()) return;
    try {
        const c = (typeof window !== 'undefined' && window.console) ? window.console : { log: () => { }, info: () => { }, warn: () => { }, error: () => { } };
        const fn = c.info || c.log || (() => { });
        fn.call(c, `<[RESPONSE] [${status}] ${url}`);
        fn.call(c, '<[body]', body === undefined ? null : body);
    } catch (e) { /* ignore */ }
}

export function pageLoad(name) {
    if (!shouldLog()) return;
    try {
        const c = (typeof window !== 'undefined' && window.console) ? window.console : { log: () => { }, info: () => { }, warn: () => { }, error: () => { } };
        const fn = c.info || c.log || (() => { });
        fn.call(c, `[    PAGE    ] ${name}`);
    } catch (e) { }
}

// Initialize SPA page-change logger: emit pageLoad on history navigation
export function initPageLogger() {
    try {
        if (typeof window === 'undefined') return;
        // single initialization guard
        if (window.__api_logger_initialized) return;
        window.__api_logger_initialized = true;

        const emit = () => {
            pageLoad(window.location.pathname + window.location.search);
        };

        // patch history methods to dispatch a custom event
        const _wr = (type) => {
            const orig = history[type];
            return function () {
                const rv = orig.apply(this, arguments);
                const ev = new Event('locationchange');
                window.dispatchEvent(ev);
                return rv;
            };
        };
        history.pushState = _wr('pushState');
        history.replaceState = _wr('replaceState');

        window.addEventListener('popstate', () => window.dispatchEvent(new Event('locationchange')));
        window.addEventListener('locationchange', emit);

        // emit initial page load as well
        emit();
    } catch (e) {
        // ignore
    }
}

export default {
    shouldLog,
    logSend,
    logResponse,
    pageLoad,
    initPageLogger
};
