"use strict";
//++ /Users/yudongchun/Dev/Development/futter_Kiosk/Backend_Node/src/config/kysely-setup.ts
// Minimal Kysely setup example using the local `DbTypes`.
// This file is a lightweight helper to create a typed Kysely instance.
// Run `npm install kysely` before using.
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKysely = createKysely;
exports.getKysely = getKysely;
const kysely_1 = require("kysely");
const db_1 = require("./db");
// Synchronous factory that returns a Kysely instance and the underlying pool.
// This was previously async but did not perform any async work; using a
// synchronous factory simplifies usage and avoids unnecessary `await`s.
function createKysely() {
    const pool = (0, db_1.getCallbackPool)();
    const db = new kysely_1.Kysely({ dialect: new kysely_1.MysqlDialect({ pool }) });
    return { db, pool };
}
exports.default = createKysely;
// Synchronous cached getter for services to reuse the same Kysely instance
let _cachedKysely = null;
function getKysely() {
    if (!_cachedKysely) {
        const pool = (0, db_1.getCallbackPool)();
        _cachedKysely = new kysely_1.Kysely({ dialect: new kysely_1.MysqlDialect({ pool }) });
    }
    return _cachedKysely;
}
