"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listLicenses = listLicenses;
exports.createLicense = createLicense;
exports.findByKey = findByKey;
const kysely_setup_1 = require("../config/kysely-setup");
const dbHelpers_1 = require("../utils/dbHelpers");
const logger_1 = require("../utils/logger");
// In-memory fallback store (used when DB table missing)
const memoryStore = [];
let nextId = 1;
async function listLicenses(_opts) {
    try {
        const db = (0, kysely_setup_1.getKysely)();
        // Allow optional filtering by store_id if provided
        const q = db.selectFrom('licenses').select(['id', 'license_key', 'expiry_dt', 'device_id', 'uuid', 'store_id', 'active', 'meta']).limit(100);
        if (_opts && _opts.store_id) {
            q.where('store_id', '=', Number(_opts.store_id));
        }
        const rows = await q.execute();
        (0, logger_1.logDebug)(`[licensesService] listLicenses rows fetched: ${Array.isArray(rows) ? rows.length : 0}`);
        if (Array.isArray(rows) && rows.length > 0)
            (0, logger_1.logDebug)('[licensesService] sample row:', rows[0]);
        return rows.map((r) => ({ id: r.id, license_key: r.license_key, expiry_dt: r.expiry_dt || null, device_id: r.device_id || r.deviceId || null, uuid: r.uuid || null, store_id: r.store_id || null, active: r.active || null, meta: r.meta || null }));
    }
    catch (err) {
        (0, logger_1.logError)('[licensesService] listLicenses error, falling back to memory store', err);
        return memoryStore.slice();
    }
}
async function createLicense(license_key, meta) {
    try {
        const db = (0, kysely_setup_1.getKysely)();
        const res = await db.insertInto('licenses').values({ license_key }).execute();
        const insertId = (0, dbHelpers_1.extractInsertId)(res) || nextId++;
        return { id: insertId, license_key };
    }
    catch (err) {
        const l = { id: nextId++, license_key, meta };
        memoryStore.push(l);
        return l;
    }
}
async function findByKey(key) {
    try {
        const db = (0, kysely_setup_1.getKysely)();
        const rows = await db.selectFrom('licenses').select(['id', 'license_key']).where('license_key', '=', key).limit(1).execute();
        if (rows && rows.length)
            return { id: Number(rows[0].id) || nextId++, license_key: rows[0].license_key };
        return null;
    }
    catch (err) {
        return memoryStore.find((m) => m.license_key === key) || null;
    }
}
exports.default = { listLicenses, createLicense, findByKey };
