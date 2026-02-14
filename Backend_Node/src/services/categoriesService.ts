import { getKysely } from '../config/kysely-setup';
import { CategoriesRow, Id } from '../types/db';
import { extractInsertId } from '../utils/dbHelpers';
import { getRedisClient } from '../config/redis';
import { logDebug, logError } from '../utils/logger';

type Category = Partial<Pick<CategoriesRow, 'id' | 'store_id' | 'name' | 'description' | 'display_order'>> & { parentId?: number | null };

let inMemoryCategories: Array<Category & { id: Id }> = [];

export const getCategories = async () => {
  const redis = getRedisClient();
  const cacheKey = 'categories:all';

  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        logDebug('[Categories] Cache hit for all categories');
        return JSON.parse(cached);
      }
    } catch (redisErr) {
      logError('[Categories] Redis get error', redisErr);
    }
  }

  try {
    const db = getKysely();
    const rows = await db.selectFrom('categories').selectAll().limit(1000).execute();
    
    if (redis) {
      try {
        await redis.setex(cacheKey, 300, JSON.stringify(rows));
        logDebug('[Categories] Cache set for all categories');
      } catch (redisErr) {
        logError('[Categories] Redis set error', redisErr);
      }
    }
    
    return rows;
  } catch (err) {
    return inMemoryCategories;
  }
};

export const createCategory = async (c: Category) => {
  try {
    const db = getKysely();
    const storeId = (c.store_id || c.parentId) || null;
    const payload = { store_id: Number(storeId || 0), name: c.name || '', description: c.description || null, display_order: c.display_order || 0 };
    const res = await db.insertInto('categories').values(payload).execute();
    const insertId = extractInsertId(res) || 0;
    return { ...c, id: insertId };
  } catch (err) {
    const nextId = inMemoryCategories.length ? (Number(inMemoryCategories[inMemoryCategories.length - 1].id) || 0) + 1 : 1;
    const cat = { ...c, id: nextId } as Category & { id: Id };
    inMemoryCategories.push(cat);
    return cat;
  }
};

export const updateCategory = async (id: number | string, patch: Partial<Category>) => {
  try {
    const db = getKysely();
    const dbPatch: any = { ...patch };
    if (patch.parentId && !patch.store_id) dbPatch.store_id = patch.parentId;
    await db.updateTable('categories').set(dbPatch).where('id', '=', Number(id)).execute();
    return { id, ...patch };
  } catch (err) {
    const idx = inMemoryCategories.findIndex(cat => String(cat.id) === String(id));
    if (idx >= 0) {
      inMemoryCategories[idx] = { ...inMemoryCategories[idx], ...patch };
      return inMemoryCategories[idx];
    }
    return null;
  }
};

export const deleteCategory = async (id: number | string) => {
  try {
    const db = getKysely();
    await db.deleteFrom('categories').where('id', '=', Number(id)).execute();
    return true;
  } catch (err) {
    const before = inMemoryCategories.length;
    inMemoryCategories = inMemoryCategories.filter(cat => String(cat.id) !== String(id));
    return inMemoryCategories.length < before;
  }
};

export const clearInMemoryCategories = () => {
  inMemoryCategories = [];
};

export const getCategoriesByStoreId = async (storeId: number | string) => {
  const redis = getRedisClient();
  const cacheKey = `categories:store:${storeId}`;

  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        logDebug(`[Categories] Cache hit for store ${storeId}`);
        return JSON.parse(cached);
      }
    } catch (redisErr) {
      logError('[Categories] Redis get error', redisErr);
    }
  }

  try {
    const db = getKysely();
    const rows = await db.selectFrom('categories').selectAll().where('store_id', '=', Number(storeId)).orderBy('display_order').execute();
    
    if (redis) {
      try {
        await redis.setex(cacheKey, 300, JSON.stringify(rows));
        logDebug(`[Categories] Cache set for store ${storeId}`);
      } catch (redisErr) {
        logError('[Categories] Redis set error', redisErr);
      }
    }
    
    return rows;
  } catch (err) {
    return inMemoryCategories.filter(c => String(c.store_id) === String(storeId));
  }
};
