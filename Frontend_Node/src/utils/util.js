// Common utilities used across the frontend
export function decodeToken() {
    try {
        const token = localStorage.getItem('jwt_token');
        if (!token) return null;
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (err) {
        // fallback: return null if token malformed or unavailable
        // console.error('decodeToken error', err);
        return null;
    }
}

// Safe date formatter. If input falsy, returns '-'. By default returns locale date string.
export function formatDate(value, opts = {}) {
    if (!value) return '-';
    try {
        const d = (value instanceof Date) ? value : new Date(value);
        if (Number.isNaN(d.getTime())) return '-';
        // if opts.iso true, return YYYY-MM-DD
        if (opts.iso) {
            return d.toISOString().slice(0, 10);
        }
        return d.toLocaleDateString();
    } catch (err) {
        return '-';
    }
}

export default { decodeToken, formatDate };

