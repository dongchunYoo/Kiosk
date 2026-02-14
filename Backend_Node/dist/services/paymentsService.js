"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPayment = createPayment;
exports.getPayment = getPayment;
const kysely_setup_1 = require("../config/kysely-setup");
const dbHelpers_1 = require("../utils/dbHelpers");
const memory = [];
let nextId = 1;
async function createPayment(amount, currency = 'KRW') {
    try {
        const db = (0, kysely_setup_1.getKysely)();
        const res = await db.insertInto('PaymentReceipt').values({ total_amount: String(amount), status: 'processing' }).execute();
        const insertId = (0, dbHelpers_1.extractInsertId)(res) || nextId++;
        return { id: insertId, amount, currency, status: 'processing' };
    }
    catch (err) {
        const p = { id: nextId++, amount, currency, status: 'created' };
        memory.push(p);
        return p;
    }
}
async function getPayment(id) {
    try {
        const db = (0, kysely_setup_1.getKysely)();
        const rows = await db.selectFrom('PaymentReceipt').select(['id', 'total_amount', 'status']).where('id', '=', Number(id)).limit(1).execute();
        const r = rows && rows[0];
        if (r)
            return { id: r.id, amount: r.total_amount ? Number(r.total_amount) : 0, currency: 'KRW', status: r.status || 'unknown' };
        return null;
    }
    catch (err) {
        return memory.find((m) => m.id === id) || null;
    }
}
exports.default = { createPayment, getPayment };
