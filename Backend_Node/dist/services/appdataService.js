"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppDataSummary = getAppDataSummary;
const kysely_setup_1 = require("../config/kysely-setup");
async function getAppDataSummary() {
    try {
        const db = (0, kysely_setup_1.getKysely)();
        // Simple DB health check using a lightweight query
        await db.selectFrom('users').select('id').limit(1).execute();
        return { status: 'ok', db: true };
    }
    catch (err) {
        return { status: 'ok', db: false };
    }
}
exports.default = { getAppDataSummary };
