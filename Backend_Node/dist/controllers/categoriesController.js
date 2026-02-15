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
exports.getCategoriesForStore = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.listCategories = void 0;
const categoriesService = __importStar(require("../services/categoriesService"));
const listCategories = async (req, res) => {
    try {
        const rows = await categoriesService.getCategories();
        res.json({ ok: true, data: rows });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: 'failed' });
    }
};
exports.listCategories = listCategories;
const createCategory = async (req, res) => {
    const body = req.body || {};
    if (!body.name)
        return res.status(400).json({ ok: false, error: 'missing_name' });
    try {
        const cat = await categoriesService.createCategory(body);
        res.status(201).json({ ok: true, data: cat });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: 'create_failed' });
    }
};
exports.createCategory = createCategory;
const updateCategory = async (req, res) => {
    const id = req.params.id ?? req.body.id;
    const patch = req.body || {};
    if (id === undefined || id === null)
        return res.status(400).json({ ok: false, error: 'missing_id' });
    try {
        const updated = await categoriesService.updateCategory(id, patch);
        res.json({ ok: true, data: updated });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: 'update_failed' });
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    const id = req.params.id ?? req.body.id;
    if (id === undefined || id === null)
        return res.status(400).json({ ok: false, error: 'missing_id' });
    try {
        const ok = await categoriesService.deleteCategory(id);
        res.json({ ok: true, data: ok });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: 'delete_failed' });
    }
};
exports.deleteCategory = deleteCategory;
const getCategoriesForStore = async (req, res) => {
    try {
        const storeId = req.params.id;
        if (!storeId)
            return res.status(400).json({ ok: false, error: 'missing_id' });
        const rows = await (await Promise.resolve().then(() => __importStar(require('../services/categoriesService')))).getCategoriesByStoreId(storeId);
        // return raw array for frontend convenience
        res.json(rows);
    }
    catch (err) {
        res.status(500).json({ ok: false, error: 'failed' });
    }
};
exports.getCategoriesForStore = getCategoriesForStore;
