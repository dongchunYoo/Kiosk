import { getKysely } from '../config/kysely-setup';
import { StoresRow, Id } from '../types/db';
import { extractInsertId } from '../utils/dbHelpers';
import { getRedisClient } from '../config/redis';
import { logDebug, logError } from '../utils/logger';
import fs from 'fs';
import path from 'path';

type Store = Partial<Pick<StoresRow, 'name'>> & { id?: Id; image?: string };

const memory: Array<Store & { id: Id }> = [];
let nextId = 1;

export async function listStores(): Promise<Store[]> {
  const redis = getRedisClient();
  const cacheKey = 'stores:all';

  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        logDebug('[Stores] Cache hit for all stores');
        return JSON.parse(cached);
      }
    } catch (redisErr) {
      logError('[Stores] Redis get error', redisErr);
    }
  }

  try {
    const db = getKysely();
    const rows = await db.selectFrom('stores').select(['id', 'name']).limit(100).execute();
    const result = (Array.isArray(rows) ? rows : []) as any;
    
    if (redis) {
      try {
        await redis.setex(cacheKey, 300, JSON.stringify(result));
        logDebug('[Stores] Cache set for all stores');
      } catch (redisErr) {
        logError('[Stores] Redis set error', redisErr);
      }
    }
    
    return result;
  } catch (err) {
    return memory.slice();
  }
}

export async function createStore(name: string, imagePath?: string): Promise<Store> {
  try {
    const db = getKysely();
    const res = await db.insertInto('stores').values({ name }).execute();
    const insertId = extractInsertId(res) || nextId++;
    return { id: insertId, name, image: imagePath };
  } catch (err) {
    const s = { id: nextId++, name, image: imagePath } as Store & { id: Id };
    memory.push(s);
    return s;
  }
}

export async function getStoreById(id: number | string): Promise<Store | null> {
  const redis = getRedisClient();
  const cacheKey = `stores:id:${id}`;

  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        logDebug(`[Stores] Cache hit for store ${id}`);
        return JSON.parse(cached);
      }
    } catch (redisErr) {
      logError('[Stores] Redis get error', redisErr);
    }
  }

  try {
    const db = getKysely();
    const row = await db.selectFrom('stores').selectAll().where('id', '=', Number(id)).executeTakeFirst();
    if (!row) return null;
    
    const result = row as any;
    
    if (redis) {
      try {
        await redis.setex(cacheKey, 300, JSON.stringify(result));
        logDebug(`[Stores] Cache set for store ${id}`);
      } catch (redisErr) {
        logError('[Stores] Redis set error', redisErr);
      }
    }
    
    return result;
  } catch (err) {
    const found = memory.find(s => String(s.id) === String(id));
    return found || null;
  }
}

export async function getStoreImagePath(filename: string) {
  // Resolve to Backend_Node/uploads reliably
  const cwd = process.cwd();
  const baseDir = cwd.endsWith('Backend_Node') || cwd.includes(path.sep + 'Backend_Node' + path.sep) ? cwd : path.join(cwd, 'Backend_Node');
  const uploads = path.join(baseDir, 'uploads');
  const p = path.join(uploads, filename);
  if (fs.existsSync(p)) return p;
  return null;
}

export default { listStores, createStore, getStoreImagePath };
