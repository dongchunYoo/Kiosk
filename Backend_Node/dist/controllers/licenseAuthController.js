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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginHandler = loginHandler;
const licensesService = __importStar(require("../services/licensesService"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("../utils/logger");
async function loginHandler(req, res) {
    try {
        const { license_key } = req.body || {};
        if (!license_key)
            return res.status(400).json({ error: 'license_key required' });
        const found = await licensesService.findByKey(String(license_key));
        if (!found)
            return res.status(401).json({ success: false, error: 'invalid_license' });
        const secret = process.env.JWT_SECRET || 'change_me_jwt_secret';
        const token = jsonwebtoken_1.default.sign({ license_id: found.id, license_key: found.license_key }, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        (0, logger_1.logInfo)(`[licenseAuth] issued token for license ${found.license_key}`);
        return res.json({ success: true, token, license_key: found.license_key });
    }
    catch (err) {
        (0, logger_1.logError)('[licenseAuth] loginHandler error', err);
        return res.status(500).json({ error: 'internal_error' });
    }
}
exports.default = { loginHandler };
