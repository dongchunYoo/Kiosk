"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = getStats;
const kysely_setup_1 = require("../config/kysely-setup");
async function getStats() {
    try {
        const db = (0, kysely_setup_1.getKysely)();
        const usersRes = await db.selectFrom('users').select(db.fn.count('id').as('cnt')).execute();
        const licensesRes = await db.selectFrom('licenses').select(db.fn.count('id').as('cnt')).execute();
        const storesRes = await db.selectFrom('stores').select(db.fn.count('id').as('cnt')).execute();
        const paymentsRes = await db.selectFrom('PaymentReceipt').select(db.fn.count('id').as('cnt')).execute();
        const usersCount = Number((usersRes && usersRes[0] && usersRes[0].cnt) || 0);
        const licensesCount = Number((licensesRes && licensesRes[0] && licensesRes[0].cnt) || 0);
        const storesCount = Number((storesRes && storesRes[0] && storesRes[0].cnt) || 0);
        const paymentsCount = Number((paymentsRes && paymentsRes[0] && paymentsRes[0].cnt) || 0);
        return {
            status: 'ok',
            db: true,
            counts: { users: usersCount, licenses: licensesCount, stores: storesCount, payments: paymentsCount },
        };
    }
    catch (err) {
        return {
            status: 'ok',
            db: false,
            counts: { users: null, licenses: null, stores: null, payments: null },
        };
    }
}
exports.default = { getStats };
