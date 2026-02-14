"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listStoreGroups = listStoreGroups;
exports.createStoreGroup = createStoreGroup;
const kysely_setup_1 = require("../config/kysely-setup");
const dbHelpers_1 = require("../utils/dbHelpers");
const memory = [];
let nextId = 1;
async function listStoreGroups() {
    try {
        const db = (0, kysely_setup_1.getKysely)();
        const rows = await db.selectFrom('store_groups').select(['id', 'name']).orderBy('id').execute();
        return (Array.isArray(rows) ? rows : []);
    }
    catch (err) {
        return memory.slice();
    }
}
async function createStoreGroup(name) {
    try {
        const db = (0, kysely_setup_1.getKysely)();
        const res = await db.insertInto('store_groups').values({ name }).execute();
        const insertId = (0, dbHelpers_1.extractInsertId)(res) || nextId++;
        return { id: insertId, name };
    }
    catch (err) {
        const g = { id: nextId++, name };
        memory.push(g);
        return g;
    }
}
exports.default = { listStoreGroups, createStoreGroup };
