"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoriesByStoreId = exports.clearInMemoryCategories = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = void 0;
const kysely_setup_1 = require("../config/kysely-setup");
const dbHelpers_1 = require("../utils/dbHelpers");
const redis_1 = require("../config/redis");
const logger_1 = require("../utils/logger");
let inMemoryCategories = [];
const getCategories = async () => {
    const redis = (0, redis_1.getRedisClient)();
    const cacheKey = 'categories:all';
    if (redis) {
        try {
            const cached = await redis.get(cacheKey);
            if (cached) {
                (0, logger_1.logDebug)('[Categories] Cache hit for all categories');
                return JSON.parse(cached);
            }
        }
        catch (redisErr) {
            (0, logger_1.logError)('[Categories] Redis get error', redisErr);
        }
    }
    try {
        const db = (0, kysely_setup_1.getKysely)();
        const rows = await db.selectFrom('categories').selectAll().limit(1000).execute();
        if (redis) {
            try {
                await redis.setex(cacheKey, 300, JSON.stringify(rows));
                (0, logger_1.logDebug)('[Categories] Cache set for all categories');
            }
            catch (redisErr) {
                (0, logger_1.logError)('[Categories] Redis set error', redisErr);
            }
        }
        return rows;
    }
    catch (err) {
        return inMemoryCategories;
    }
};
exports.getCategories = getCategories;
const createCategory = async (c) => {
    try {
        const db = (0, kysely_setup_1.getKysely)();
        const storeId = (c.store_id || c.parentId) || null;
        const payload = { store_id: Number(storeId || 0), name: c.name || '', description: c.description || null, display_order: c.display_order || 0 };
        const res = await db.insertInto('categories').values(payload).execute();
        const insertId = (0, dbHelpers_1.extractInsertId)(res) || 0;
        return { ...c, id: insertId };
    }
    catch (err) {
        const nextId = inMemoryCategories.length ? (Number(inMemoryCategories[inMemoryCategories.length - 1].id) || 0) + 1 : 1;
        const cat = { ...c, id: nextId };
        inMemoryCategories.push(cat);
        return cat;
    }
};
exports.createCategory = createCategory;
const updateCategory = async (id, patch) => {
    try {
        const db = (0, kysely_setup_1.getKysely)();
        const dbPatch = { ...patch };
        if (patch.parentId && !patch.store_id)
            dbPatch.store_id = patch.parentId;
        await db.updateTable('categories').set(dbPatch).where('id', '=', Number(id)).execute();
        return { id, ...patch };
    }
    catch (err) {
        const idx = inMemoryCategories.findIndex(cat => String(cat.id) === String(id));
        if (idx >= 0) {
            inMemoryCategories[idx] = { ...inMemoryCategories[idx], ...patch };
            return inMemoryCategories[idx];
        }
        return null;
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (id) => {
    try {
        const db = (0, kysely_setup_1.getKysely)();
        await db.deleteFrom('categories').where('id', '=', Number(id)).execute();
        return true;
    }
    catch (err) {
        const before = inMemoryCategories.length;
        inMemoryCategories = inMemoryCategories.filter(cat => String(cat.id) !== String(id));
        return inMemoryCategories.length < before;
    }
};
exports.deleteCategory = deleteCategory;
const clearInMemoryCategories = () => {
    inMemoryCategories = [];
};
exports.clearInMemoryCategories = clearInMemoryCategories;
const getCategoriesByStoreId = async (storeId) => {
    const redis = (0, redis_1.getRedisClient)();
    const cacheKey = `categories:store:${storeId}`;
    if (redis) {
        try {
            const cached = await redis.get(cacheKey);
            if (cached) {
                (0, logger_1.logDebug)(`[Categories] Cache hit for store ${storeId}`);
                return JSON.parse(cached);
            }
        }
        catch (redisErr) {
            (0, logger_1.logError)('[Categories] Redis get error', redisErr);
        }
    }
    try {
        const db = (0, kysely_setup_1.getKysely)();
        const rows = await db.selectFrom('categories').selectAll().where('store_id', '=', Number(storeId)).orderBy('display_order').execute();
        if (redis) {
            try {
                await redis.setex(cacheKey, 300, JSON.stringify(rows));
                (0, logger_1.logDebug)(`[Categories] Cache set for store ${storeId}`);
            }
            catch (redisErr) {
                (0, logger_1.logError)('[Categories] Redis set error', redisErr);
            }
        }
        return rows;
    }
    catch (err) {
        return inMemoryCategories.filter(c => String(c.store_id) === String(storeId));
    }
};
exports.getCategoriesByStoreId = getCategoriesByStoreId;
