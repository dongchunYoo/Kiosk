"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearInMemoryProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProducts = void 0;
const kysely_setup_1 = require("../config/kysely-setup");
const dbHelpers_1 = require("../utils/dbHelpers");
const redis_1 = require("../config/redis");
const logger_1 = require("../utils/logger");
let inMemoryProducts = [];
const getProducts = async (storeId) => {
    const redis = (0, redis_1.getRedisClient)();
    const cacheKey = storeId ? `products:store:${storeId}` : 'products:all';
    if (redis) {
        try {
            const cached = await redis.get(cacheKey);
            if (cached) {
                (0, logger_1.logDebug)(`[Products] Cache hit for ${cacheKey}`);
                return JSON.parse(cached);
            }
        }
        catch (redisErr) {
            (0, logger_1.logError)('[Products] Redis get error', redisErr);
        }
    }
    try {
        const db = (0, kysely_setup_1.getKysely)();
        let rows;
        if (storeId) {
            rows = await db.selectFrom('products').selectAll().where('store_id', '=', Number(storeId)).limit(100).execute();
        }
        else {
            rows = await db.selectFrom('products').selectAll().limit(100).execute();
        }
        if (redis) {
            try {
                await redis.setex(cacheKey, 300, JSON.stringify(rows));
                (0, logger_1.logDebug)(`[Products] Cache set for ${cacheKey}`);
            }
            catch (redisErr) {
                (0, logger_1.logError)('[Products] Redis set error', redisErr);
            }
        }
        return rows;
    }
    catch (err) {
        if (storeId)
            return inMemoryProducts.filter(p => String(p.storeId) === String(storeId));
        return inMemoryProducts;
    }
};
exports.getProducts = getProducts;
const createProduct = async (product) => {
    try {
        const db = (0, kysely_setup_1.getKysely)();
        const priceVal = typeof product.price === 'number' ? product.price.toFixed(2) : product.price || '0.00';
        const res = await db.insertInto('products').values({
            category_id: Number(product.category_id || 0),
            store_id: Number(product.store_id || product.storeId || 0),
            name: product.name || '',
            price: priceVal,
            description: product.description || null,
            image_url: (product.image_url || product.image) || null,
        }).execute();
        // mysql2 returns insertId on execute result
        const insertId = (0, dbHelpers_1.extractInsertId)(res) || 0;
        return { ...product, id: insertId };
    }
    catch (err) {
        const nextId = inMemoryProducts.length ? (Number(inMemoryProducts[inMemoryProducts.length - 1].id) || 0) + 1 : 1;
        const p = { ...product, id: nextId };
        inMemoryProducts.push(p);
        return p;
    }
};
exports.createProduct = createProduct;
const updateProduct = async (id, patch) => {
    try {
        const db = (0, kysely_setup_1.getKysely)();
        const dbPatch = { ...patch };
        if (patch.storeId && !patch.store_id)
            dbPatch.store_id = Number(patch.storeId);
        if (patch.image && !patch.image_url)
            dbPatch.image_url = patch.image;
        if (dbPatch.price && typeof dbPatch.price === 'number')
            dbPatch.price = dbPatch.price.toFixed(2);
        await db.updateTable('products').set(dbPatch).where('id', '=', Number(id)).execute();
        return { id: Number(id), ...patch };
    }
    catch (err) {
        const idx = inMemoryProducts.findIndex(p => String(p.id) === String(id));
        if (idx >= 0) {
            inMemoryProducts[idx] = { ...inMemoryProducts[idx], ...patch };
            return inMemoryProducts[idx];
        }
        return null;
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (id) => {
    try {
        const db = (0, kysely_setup_1.getKysely)();
        await db.deleteFrom('products').where('id', '=', Number(id)).execute();
        return true;
    }
    catch (err) {
        const before = inMemoryProducts.length;
        inMemoryProducts = inMemoryProducts.filter(p => String(p.id) !== String(id));
        return inMemoryProducts.length < before;
    }
};
exports.deleteProduct = deleteProduct;
const clearInMemoryProducts = () => {
    inMemoryProducts = [];
};
exports.clearInMemoryProducts = clearInMemoryProducts;
