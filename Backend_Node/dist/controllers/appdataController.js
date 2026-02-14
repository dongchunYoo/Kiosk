"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAppDataHandler = getAppDataHandler;
const appdataService_1 = require("../services/appdataService");
async function getAppDataHandler(req, res) {
    const licenseKey = (req.query && req.query.license_key) || (req.query && req.query.licenseKey) || undefined;
    const summary = await (0, appdataService_1.getAppDataSummary)(licenseKey);
    res.json(summary);
}
exports.default = { getAppDataHandler };
