"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.statsHandler = statsHandler;
exports.systemMetricsHandler = systemMetricsHandler;
exports.redisMetricsHandler = redisMetricsHandler;
exports.kafkaMetricsHandler = kafkaMetricsHandler;
exports.topLatencyHandler = topLatencyHandler;
exports.topCountHandler = topCountHandler;
exports.rateLimitStatusHandler = rateLimitStatusHandler;
exports.receiptsPerMinuteHandler = receiptsPerMinuteHandler;
exports.receiptsHandler = receiptsHandler;
const adminService_1 = require("../services/adminService");
const os_1 = __importDefault(require("os"));
const redis_1 = require("../config/redis");
async function statsHandler(_req, res) {
    const stats = await (0, adminService_1.getStats)();
    res.json(stats);
}
// Append additional admin metric handlers so frontend endpoints do not 404.
async function systemMetricsHandler(_req, res) {
    try {
        const cpus = os_1.default.cpus();
        const cpuCount = cpus ? cpus.length : 1;
        const load1 = os_1.default.loadavg()[0] || 0;
        const cpuPercent = Math.round((load1 / cpuCount) * 100);
        const total = os_1.default.totalmem() || 0;
        const free = os_1.default.freemem() || 0;
        const memPercent = total > 0 ? Math.round(((total - free) / total) * 100) : 0;
        res.json({ cpu: cpuPercent, memory: memPercent });
    }
    catch (err) {
        res.json(null);
    }
}
async function redisMetricsHandler(_req, res) {
    try {
        const client = (0, redis_1.getRedisClient)('admin');
        if (!client)
            return res.json(null);
        const info = await client.info();
        // parse basic INFO output
        const lines = info.split(/\r?\n/);
        const map = {};
        let dbKeys = 0;
        for (const l of lines) {
            if (!l || l.startsWith('#'))
                continue;
            const idx = l.indexOf(':');
            if (idx === -1)
                continue;
            const k = l.slice(0, idx);
            const v = l.slice(idx + 1);
            map[k] = v;
            if (k.startsWith('db')) {
                // db0:keys=1,expires=0,avg_ttl=0
                const m = v.match(/keys=(\d+)/);
                if (m)
                    dbKeys += Number(m[1]);
            }
        }
        const usedBytes = Number(map.used_memory || 0);
        const usedMemoryMB = Math.round(usedBytes / 1024 / 1024);
        res.json({ used_memory_bytes: usedBytes, used_memory_mb: usedMemoryMB, keys: dbKeys });
    }
    catch (err) {
        res.json(null);
    }
}
async function kafkaMetricsHandler(_req, res) {
    // Kafka not guaranteed in dev environment; return null
    res.json(null);
}
async function topLatencyHandler(_req, res) {
    // Provide empty list default to avoid frontend errors
    res.json({ items: [] });
}
async function topCountHandler(_req, res) {
    res.json({ items: [] });
}
async function rateLimitStatusHandler(_req, res) {
    // Minimal stub for rate limit UI
    res.json({ totalRequests: 0, max: 100, blockedRequests: 0, redisErrors: null, windowSeconds: 60, remainingSeconds: null });
}
async function receiptsPerMinuteHandler(_req, res) {
    // RPM shape used by frontend: { count, max }
    res.json({ count: 0, max: 100 });
}
async function receiptsHandler(req, res) {
    try {
        const db = await Promise.resolve().then(() => __importStar(require('../config/kysely-setup'))).then(m => m.getKysely());
        const { from, to, storeId } = req.query;
        const q = db.selectFrom('PaymentReceipt').selectAll();
        if (from)
            q.where('payment_time', '>=', String(from));
        if (to)
            q.where('payment_time', '<=', String(to));
        if (storeId)
            q.where('storeId', '=', Number(storeId));
        q.orderBy('payment_time', 'desc').limit(1000);
        const rows = await q.execute();
        res.json(rows || []);
    }
    catch (err) {
        const { logError } = await Promise.resolve().then(() => __importStar(require('../utils/logger')));
        logError('[admin.receipts] error', err);
        res.status(500).json([]);
    }
}
exports.default = { statsHandler };
