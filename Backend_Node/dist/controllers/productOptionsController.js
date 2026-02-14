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
exports.deleteOption = exports.updateOption = exports.createOption = exports.listOptions = void 0;
const optionsService = __importStar(require("../services/productOptionsService"));
const listOptions = async (req, res) => {
    const productId = req.query.productId || req.body.productId;
    try {
        const rows = await optionsService.getOptions(productId);
        res.json({ ok: true, data: rows });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: 'failed' });
    }
};
exports.listOptions = listOptions;
const createOption = async (req, res) => {
    const body = req.body || {};
    try {
        const o = await optionsService.createOption(body);
        res.status(201).json({ ok: true, data: o });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: 'create_failed' });
    }
};
exports.createOption = createOption;
const updateOption = async (req, res) => {
    const id = req.params.id || req.body.id;
    const patch = req.body || {};
    if (!id)
        return res.status(400).json({ ok: false, error: 'missing_id' });
    try {
        const u = await optionsService.updateOption(id, patch);
        res.json({ ok: true, data: u });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: 'update_failed' });
    }
};
exports.updateOption = updateOption;
const deleteOption = async (req, res) => {
    const id = req.params.id || req.body.id;
    if (!id)
        return res.status(400).json({ ok: false, error: 'missing_id' });
    try {
        const ok = await optionsService.deleteOption(id);
        res.json({ ok: true, data: ok });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: 'delete_failed' });
    }
};
exports.deleteOption = deleteOption;
