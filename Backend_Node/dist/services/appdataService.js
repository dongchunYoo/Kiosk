"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppDataSummary = getAppDataSummary;
const redis_1 = require("../config/redis");
const logger_1 = require("../utils/logger");
const kysely_setup_1 = require("../config/kysely-setup");
async function getAppDataSummary(license_key) {
    try {
        // Redis 캐시 확인
        const redis = (0, redis_1.getRedisClient)();
        const cacheKey = license_key ? `appdata:license:${license_key}` : 'appdata:default';
        if (redis) {
            try {
                const cached = await redis.get(cacheKey);
                if (cached) {
                    (0, logger_1.logDebug)(`[AppData] Cache hit for ${cacheKey}`);
                    return JSON.parse(cached);
                }
            }
            catch (redisErr) {
                (0, logger_1.logError)('[AppData] Redis get error', redisErr);
            }
        }
        const db = (0, kysely_setup_1.getKysely)();
        // Find license if provided
        let license = null;
        if (license_key) {
            const lrows = await db.selectFrom('license').select(['id', 'license_key', 'store_id', 'device_id']).where('license_key', '=', String(license_key)).limit(1).execute();
            if (Array.isArray(lrows) && lrows.length > 0)
                license = lrows[0];
        }
        // Determine store id: prefer license.store_id, otherwise fall back to first store
        let storeId = null;
        if (license && license.store_id)
            storeId = Number(license.store_id);
        if (!storeId) {
            const srows = await db.selectFrom('stores').selectAll().limit(1).execute();
            if (Array.isArray(srows) && srows.length > 0)
                storeId = Number(srows[0].id) || null;
        }
        // Fetch store
        const store = storeId ? (await db.selectFrom('stores').selectAll().where('id', '=', storeId).limit(1).execute())[0] : null;
        // Fetch categories
        const categories = storeId ? await db.selectFrom('categories').selectAll().where('store_id', '=', storeId).orderBy('display_order').execute() : [];
        // Fetch products for store
        const productsRaw = storeId ? await db.selectFrom('products').selectAll().where('store_id', '=', storeId).execute() : [];
        const productIds = Array.isArray(productsRaw) ? productsRaw.map((p) => Number(p.id)) : [];
        // Fetch product options
        let productOptions = [];
        if (productIds.length > 0) {
            productOptions = await db.selectFrom('product_options').selectAll().where('product_id', 'in', productIds).execute();
        }
        // Attach options to products
        const products = (Array.isArray(productsRaw) ? productsRaw : []).map((p) => {
            const opts = Array.isArray(productOptions) ? productOptions.filter((o) => Number(o.product_id) === Number(p.id)) : [];
            return { ...p, product_options: opts };
        });
        const result = {
            id: storeId || 0,
            device_id: license && license.device_id ? license.device_id : null,
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
                (0, logger_1.logDebug)(`[AppData] Cache set for ${cacheKey}`);
            }
            catch (redisErr) {
                (0, logger_1.logError)('[AppData] Redis set error', redisErr);
            }
        }
        return result;
    }
    catch (err) {
        // On error, return minimal summary
        return { status: 'ok', db: false };
    }
}
exports.default = { getAppDataSummary };
