import { Kysely, MysqlDialect } from 'kysely';
import DbTypes from '../types/db';
import { getCallbackPool } from '../config/db';
import { getRedisClient } from '../config/redis';
import { logInfo, logDebug, logError } from '../utils/logger';

import { getKysely } from '../config/kysely-setup';

export async function getAppDataSummary(license_key?: string) {
  try {
    // Redis 캐시 확인
    const redis = getRedisClient();
    const cacheKey = license_key ? `appdata:license:${license_key}` : 'appdata:default';
    
    if (redis) {
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          logDebug(`[AppData] Cache hit for ${cacheKey}`);
          return JSON.parse(cached);
        }
      } catch (redisErr) {
        logError('[AppData] Redis get error', redisErr);
      }
    }

    const db = getKysely();

    // Find license if provided
    let license: any = null;
    if (license_key) {
      const lrows = await db.selectFrom('license').select(['id', 'license_key', 'store_id', 'device_id']).where('license_key', '=', String(license_key)).limit(1).execute();
      if (Array.isArray(lrows) && lrows.length > 0) license = lrows[0];
    }

    // Determine store id: prefer license.store_id, otherwise fall back to first store
    let storeId: number | null = null;
    if (license && (license as any).store_id) storeId = Number((license as any).store_id);
    if (!storeId) {
      const srows = await db.selectFrom('stores').selectAll().limit(1).execute();
      if (Array.isArray(srows) && srows.length > 0) storeId = Number((srows[0] as any).id) || null;
    }

    // Fetch store
    const store = storeId ? (await db.selectFrom('stores').selectAll().where('id', '=', storeId).limit(1).execute())[0] : null;

    // Fetch categories
    const categories = storeId ? await db.selectFrom('categories').selectAll().where('store_id', '=', storeId).orderBy('display_order').execute() : [];

    // Fetch products for store
    const productsRaw = storeId ? await db.selectFrom('products').selectAll().where('store_id', '=', storeId).execute() : [];
    const productIds = Array.isArray(productsRaw) ? productsRaw.map((p: any) => Number(p.id)) : [];

    // Fetch product options
    let productOptions: any[] = [];
    if (productIds.length > 0) {
      productOptions = await db.selectFrom('product_options').selectAll().where('product_id', 'in', productIds).execute();
    }

    // Attach options to products
    const products = (Array.isArray(productsRaw) ? productsRaw : []).map((p: any) => {
      const opts = Array.isArray(productOptions) ? productOptions.filter((o: any) => Number(o.product_id) === Number(p.id)) : [];
      return { ...p, product_options: opts };
    });

    const result = {
      id: storeId || 0,
      device_id: license && (license as any).device_id ? (license as any).device_id : null,
      store: store || null,
      categories: Array.isArray(categories) ? categories : [],
      products: Array.isArray(products) ? products : [],
      status: 'ok',
      db: true,
    };

    // Redis에 캐시 저장 (TTL: 5분)
    if (redis) {
      try {
        await redis.setex(cacheKey, 300, JSON.stringify(result));
        logDebug(`[AppData] Cache set for ${cacheKey}`);
      } catch (redisErr) {
        logError('[AppData] Redis set error', redisErr);
      }
    }

    return result;
  } catch (err) {
    // On error, return minimal summary
    return { status: 'ok', db: false };
  }
}

export default { getAppDataSummary };
