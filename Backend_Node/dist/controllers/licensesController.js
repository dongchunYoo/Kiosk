"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.listHandler = listHandler;
exports.createHandler = createHandler;
exports.checkKeyHandler = checkKeyHandler;
const licensesService = __importStar(require("../services/licensesService"));
const logger_1 = require("../utils/logger");
async function listHandler(_req, res) {
    try {
        const q = (_req && _req.query) ? _req.query : {};
        (0, logger_1.logDebug)('[licensesController] listHandler called with query:', q);
        const list = await licensesService.listLicenses(q);
        (0, logger_1.logDebug)(`[licensesController] listHandler returning rows: ${Array.isArray(list) ? list.length : 0}`);
        res.json({ data: list });
    }
    catch (err) {
        (0, logger_1.logError)('[licensesController] listHandler error', err);
        res.status(500).json({ error: 'internal_error' });
    }
}
async function createHandler(req, res) {
    const { license_key, meta } = req.body;
    if (!license_key)
        return res.status(400).json({ error: 'license_key required' });
    const created = await licensesService.createLicense(license_key, meta);
    res.status(201).json(created);
}
async function checkKeyHandler(req, res) {
    const { key } = req.body;
    if (!key)
        return res.status(400).json({ error: 'key required' });
    const found = await licensesService.findByKey(key);
    res.json({ valid: !!found, license: found || null });
}
exports.default = { listHandler, createHandler, checkKeyHandler };
