"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearInMemoryOptions = exports.deleteOption = exports.updateOption = exports.createOption = exports.getOptions = void 0;
const kysely_setup_1 = require("../config/kysely-setup");
const dbHelpers_1 = require("../utils/dbHelpers");
let inMemoryOptions = [];
const getOptions = async (productId) => {
    try {
        const db = (0, kysely_setup_1.getKysely)();
        if (productId) {
            const rows = await db.selectFrom('product_options').selectAll().where('product_id', '=', Number(productId)).limit(100).execute();
            return rows;
        }
        const rows = await db.selectFrom('product_options').selectAll().limit(500).execute();
        return rows;
    }
    catch (err) {
        if (productId)
            return inMemoryOptions.filter(o => String(o.productId) === String(productId));
        return inMemoryOptions;
    }
};
exports.getOptions = getOptions;
const createOption = async (opt) => {
    try {
        const db = (0, kysely_setup_1.getKysely)();
        const payload = { product_id: Number(opt.product_id || opt.productId || 0), name: opt.name || '', price: String(opt.price || opt.priceDelta || 0) };
        const res = await db.insertInto('product_options').values(payload).execute();
        const insertId = (0, dbHelpers_1.extractInsertId)(res) || 0;
        return { ...opt, id: insertId };
    }
    catch (err) {
        const nextId = inMemoryOptions.length ? (Number(inMemoryOptions[inMemoryOptions.length - 1].id) || 0) + 1 : 1;
        const o = { ...opt, id: nextId };
        inMemoryOptions.push(o);
        return o;
    }
};
exports.createOption = createOption;
const updateOption = async (id, patch) => {
    try {
        const db = (0, kysely_setup_1.getKysely)();
        const dbPatch = { ...patch };
        if (patch.productId && !patch.product_id)
            dbPatch.product_id = patch.productId;
        if (patch.priceDelta && !patch.price)
            dbPatch.price = patch.priceDelta;
        await db.updateTable('product_options').set(dbPatch).where('id', '=', Number(id)).execute();
        return { id, ...patch };
    }
    catch (err) {
        const idx = inMemoryOptions.findIndex(o => String(o.id) === String(id));
        if (idx >= 0) {
            inMemoryOptions[idx] = { ...inMemoryOptions[idx], ...patch };
            return inMemoryOptions[idx];
        }
        return null;
    }
};
exports.updateOption = updateOption;
const deleteOption = async (id) => {
    try {
        const db = (0, kysely_setup_1.getKysely)();
        await db.deleteFrom('product_options').where('id', '=', Number(id)).execute();
        return true;
    }
    catch (err) {
        const before = inMemoryOptions.length;
        inMemoryOptions = inMemoryOptions.filter(o => String(o.id) !== String(id));
        return inMemoryOptions.length < before;
    }
};
exports.deleteOption = deleteOption;
const clearInMemoryOptions = () => {
    inMemoryOptions = [];
};
exports.clearInMemoryOptions = clearInMemoryOptions;
