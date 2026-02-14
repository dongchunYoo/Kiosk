"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDb = initDb;
exports.getPool = getPool;
exports.getCallbackPool = getCallbackPool;
const mysql2_1 = __importDefault(require("mysql2"));
// We'll keep a single underlying mysql2 callback-style pool and expose a promise wrapper
let callbackPool = null;
let promisePool = null;
async function initDb() {
    if (promisePool && callbackPool)
        return promisePool;
    // Support both DB_* and MYSQL_* environment variable names (some .env use MYSQL_ keys)
    const host = process.env.DB_HOST || process.env.MYSQL_HOST || '127.0.0.1';
    const port = Number(process.env.DB_PORT || process.env.MYSQL_PORT || 3306);
    const user = process.env.DB_USER || process.env.MYSQL_USER || 'ai_app';
    const password = process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '';
    const database = process.env.DB_NAME || process.env.MYSQL_DATABASE || 'aiKiosk';
    callbackPool = mysql2_1.default.createPool({ host, port, user, password, database, connectionLimit: 10 });
    // promise wrapper for existing code that uses promise API
    promisePool = callbackPool.promise();
    // Simple test
    if (!promisePool)
        throw new Error('promisePool not initialized');
    await promisePool.query('SELECT 1');
    return promisePool;
}
function getPool() {
    if (!promisePool)
        throw new Error('DB pool not initialized');
    return promisePool;
}
// Expose callback-style pool for Kysely's MysqlDialect
function getCallbackPool() {
    if (!callbackPool)
        throw new Error('DB pool not initialized');
    return callbackPool;
}
