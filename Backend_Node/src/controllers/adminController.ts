import { Request, Response } from 'express';
import { getStats } from '../services/adminService';
import os from 'os';
import { getRedisClient } from '../config/redis';

export async function statsHandler(_req: Request, res: Response) {
  const stats = await getStats();
  res.json(stats);
}

// Append additional admin metric handlers so frontend endpoints do not 404.
export async function systemMetricsHandler(_req: Request, res: Response) {
  try {
    const cpus = os.cpus();
    const cpuCount = cpus ? cpus.length : 1;
    const load1 = os.loadavg()[0] || 0;
    const cpuPercent = Math.round((load1 / cpuCount) * 100);
    const total = os.totalmem() || 0;
    const free = os.freemem() || 0;
    const memPercent = total > 0 ? Math.round(((total - free) / total) * 100) : 0;
    res.json({ cpu: cpuPercent, memory: memPercent });
  } catch (err) {
    res.json(null);
  }
}

export async function redisMetricsHandler(_req: Request, res: Response) {
  try {
    const client = getRedisClient('admin');
    if (!client) return res.json(null);
    const info = await client.info();
    // parse basic INFO output
    const lines = info.split(/\r?\n/);
    const map: Record<string, string> = {};
    let dbKeys = 0;
    for (const l of lines) {
      if (!l || l.startsWith('#')) continue;
      const idx = l.indexOf(':');
      if (idx === -1) continue;
      const k = l.slice(0, idx);
      const v = l.slice(idx + 1);
      map[k] = v;
      if (k.startsWith('db')) {
        // db0:keys=1,expires=0,avg_ttl=0
        const m = v.match(/keys=(\d+)/);
        if (m) dbKeys += Number(m[1]);
      }
    }
    const usedBytes = Number(map.used_memory || 0);
    const usedMemoryMB = Math.round(usedBytes / 1024 / 1024);
    res.json({ used_memory_bytes: usedBytes, used_memory_mb: usedMemoryMB, keys: dbKeys });
  } catch (err) {
    res.json(null);
  }
}

export async function kafkaMetricsHandler(_req: Request, res: Response) {
  // Kafka not guaranteed in dev environment; return null
  res.json(null);
}

export async function topLatencyHandler(_req: Request, res: Response) {
  // Provide empty list default to avoid frontend errors
  res.json({ items: [] });
}

export async function topCountHandler(_req: Request, res: Response) {
  res.json({ items: [] });
}

export async function rateLimitStatusHandler(_req: Request, res: Response) {
  // Minimal stub for rate limit UI
  res.json({ totalRequests: 0, max: 100, blockedRequests: 0, redisErrors: null, windowSeconds: 60, remainingSeconds: null });
}

export async function receiptsPerMinuteHandler(_req: Request, res: Response) {
  // RPM shape used by frontend: { count, max }
  res.json({ count: 0, max: 100 });
}

export async function receiptsHandler(req: Request, res: Response) {
  try {
    const db = await import('../config/kysely-setup').then(m => m.getKysely());
    const { from, to, storeId } = req.query as any;
    const q = db.selectFrom('PaymentReceipt').selectAll();
    if (from) q.where('payment_time', '>=', String(from));
    if (to) q.where('payment_time', '<=', String(to));
    if (storeId) q.where('storeId', '=', Number(storeId));
    q.orderBy('payment_time', 'desc').limit(1000);
    const rows = await q.execute();
    res.json(rows || []);
  } catch (err) {
    const { logError } = await import('../utils/logger');
    logError('[admin.receipts] error', err);
    res.status(500).json([]);
  }
}

export default { statsHandler };
