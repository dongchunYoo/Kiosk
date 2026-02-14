"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppDataHandler = getAppDataHandler;
const appdataService_1 = require("../services/appdataService");
async function getAppDataHandler(_req, res) {
    const summary = await (0, appdataService_1.getAppDataSummary)();
    res.json(summary);
}
exports.default = { getAppDataHandler };
