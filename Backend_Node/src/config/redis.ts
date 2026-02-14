import Redis from 'ioredis';
import { logError } from '../utils/logger';

const clients: Record<string, Redis | null> = {};

function envFor(name: string, key: 'URL' | 'HOST' | 'PORT' | 'PREFIX') {
  if (!name || name === 'default') {
    if (key === 'URL') return process.env.REDIS_URL;
    if (key === 'HOST') return process.env.REDIS_HOST;
    if (key === 'PORT') return process.env.REDIS_PORT;
    return process.env.REDIS_PREFIX;
  }
  const up = name.toUpperCase();
  if (key === 'URL') return process.env[`REDIS_${up}_URL`];
  if (key === 'HOST') return process.env[`REDIS_${up}_HOST`];
  if (key === 'PORT') return process.env[`REDIS_${up}_PORT`];
  return process.env[`REDIS_${up}_PREFIX`];
}

export function getRedisClient(name = 'default') {
  if (clients[name]) return clients[name];
  const url = envFor(name, 'URL') || `redis://${envFor(name, 'HOST') || '127.0.0.1'}:${envFor(name, 'PORT') || '6379'}`;
  const rawPrefix = envFor(name, 'PREFIX') || (name === 'default' ? 'kiosk' : `kiosk:${name}`);
  const keyPrefix = rawPrefix.endsWith(':') ? rawPrefix : `${rawPrefix}:`;
  try {
    const c = new Redis(url, { keyPrefix });
    c.on('error', (err) => {
      logError(`[Redis:${name}] connection error`, err && err.message ? err.message : err);
    });
    clients[name] = c;
  } catch (e) {
    logError(`[Redis:${name}] failed to create client`, e);
    clients[name] = null;
  }
  return clients[name];
}
