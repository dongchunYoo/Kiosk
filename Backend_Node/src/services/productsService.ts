import { getKysely } from '../config/kysely-setup';
import { ProductsRow, Id } from '../types/db';
import { extractInsertId } from '../utils/dbHelpers';
import { getRedisClient } from '../config/redis';
import { logDebug, logError } from '../utils/logger';

type Product = Partial<Pick<ProductsRow, 'id' | 'store_id' | 'category_id' | 'name' | 'price' | 'description' | 'image_url'>> & { storeId?: string | number; image?: string };

let inMemoryProducts: Array<Product & { id: Id }> = [];

export const getProducts = async (storeId?: string | number) => {
  const redis = getRedisClient();
  const cacheKey = storeId ? `products:store:${storeId}` : 'products:all';

  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        logDebug(`[Products] Cache hit for ${cacheKey}`);
        return JSON.parse(cached);
      }
    } catch (redisErr) {
      logError('[Products] Redis get error', redisErr);
    }
  }

  try {
    const db = getKysely();
    let rows;
    if (storeId) {
      rows = await db.selectFrom('products').selectAll().where('store_id', '=', Number(storeId)).limit(100).execute();
    } else {
      rows = await db.selectFrom('products').selectAll().limit(100).execute();
    }
    
    if (redis) {
      try {
        await redis.setex(cacheKey, 300, JSON.stringify(rows));
        logDebug(`[Products] Cache set for ${cacheKey}`);
      } catch (redisErr) {
        logError('[Products] Redis set error', redisErr);
      }
    }
    
    return rows;
  } catch (err) {
    if (storeId) return inMemoryProducts.filter(p => String(p.storeId) === String(storeId));
    return inMemoryProducts;
  }
};

export const createProduct = async (product: Product) => {
  try {
    const db = getKysely();
    const priceVal = typeof (product as any).price === 'number' ? (product as any).price.toFixed(2) : ((product as any).price as any) || '0.00';
    const res = await db.insertInto('products').values({
      category_id: Number((product as any).category_id || 0),
      store_id: Number(product.store_id || product.storeId || 0),
      name: product.name || '',
      price: priceVal,
      description: product.description || null,
      image_url: (product.image_url || product.image) || null,
    }).execute();
    // mysql2 returns insertId on execute result
    const insertId = extractInsertId(res) || 0;
    return { ...product, id: insertId };
  } catch (err) {
    const nextId = inMemoryProducts.length ? (Number(inMemoryProducts[inMemoryProducts.length - 1].id) || 0) + 1 : 1;
    const p = { ...product, id: nextId } as Product & { id: Id };
    inMemoryProducts.push(p);
    return p;
  }
};

export const updateProduct = async (id: number | string, patch: Partial<Product>) => {
  try {
    const db = getKysely();
    const dbPatch: any = { ...patch };
    if (patch.storeId && !patch.store_id) dbPatch.store_id = Number(patch.storeId);
    if (patch.image && !patch.image_url) dbPatch.image_url = patch.image;
    if (dbPatch.price && typeof dbPatch.price === 'number') dbPatch.price = dbPatch.price.toFixed(2);
    await db.updateTable('products').set(dbPatch).where('id', '=', Number(id)).execute();
    return { id: Number(id), ...(patch as any) };
  } catch (err) {
    const idx = inMemoryProducts.findIndex(p => String(p.id) === String(id));
    if (idx >= 0) {
      inMemoryProducts[idx] = { ...inMemoryProducts[idx], ...patch };
      return inMemoryProducts[idx];
    }
    return null;
  }
};

export const deleteProduct = async (id: number | string) => {
  try {
    const db = getKysely();
    await db.deleteFrom('products').where('id', '=', Number(id)).execute();
    return true;
  } catch (err) {
    const before = inMemoryProducts.length;
    inMemoryProducts = inMemoryProducts.filter(p => String(p.id) !== String(id));
    return inMemoryProducts.length < before;
  }
};

export const clearInMemoryProducts = () => {
  inMemoryProducts = [];
};
