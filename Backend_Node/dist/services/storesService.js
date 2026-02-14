"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listStores = listStores;
exports.createStore = createStore;
exports.getStoreById = getStoreById;
exports.getStoreImagePath = getStoreImagePath;
const kysely_setup_1 = require("../config/kysely-setup");
const dbHelpers_1 = require("../utils/dbHelpers");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const memory = [];
let nextId = 1;
async function listStores() {
    try {
        const db = (0, kysely_setup_1.getKysely)();
        const rows = await db.selectFrom('stores').select(['id', 'name']).limit(100).execute();
        return (Array.isArray(rows) ? rows : []);
    }
    catch (err) {
        return memory.slice();
    }
}
async function createStore(name, imagePath) {
    try {
        const db = (0, kysely_setup_1.getKysely)();
        const res = await db.insertInto('stores').values({ name }).execute();
        const insertId = (0, dbHelpers_1.extractInsertId)(res) || nextId++;
        return { id: insertId, name, image: imagePath };
    }
    catch (err) {
        const s = { id: nextId++, name, image: imagePath };
        memory.push(s);
        return s;
    }
}
async function getStoreById(id) {
    try {
        const db = (0, kysely_setup_1.getKysely)();
        const row = await db.selectFrom('stores').selectAll().where('id', '=', Number(id)).executeTakeFirst();
        if (!row)
            return null;
        return row;
    }
    catch (err) {
        const found = memory.find(s => String(s.id) === String(id));
        return found || null;
    }
}
async function getStoreImagePath(filename) {
    // Resolve to Backend_Node/uploads reliably
    const cwd = process.cwd();
    const baseDir = cwd.endsWith('Backend_Node') || cwd.includes(path_1.default.sep + 'Backend_Node' + path_1.default.sep) ? cwd : path_1.default.join(cwd, 'Backend_Node');
    const uploads = path_1.default.join(baseDir, 'uploads');
    const p = path_1.default.join(uploads, filename);
    if (fs_1.default.existsSync(p))
        return p;
    return null;
}
exports.default = { listStores, createStore, getStoreImagePath };
