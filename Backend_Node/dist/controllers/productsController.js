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
exports.deleteProductImage = exports.uploadProductImage = exports.removeProduct = exports.updateProduct = exports.createProduct = exports.listProducts = void 0;
const productsService = __importStar(require("../services/productsService"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const listProducts = async (req, res) => {
    const storeId = req.query.storeId || req.headers['x-store-id'] || undefined;
    try {
        const rows = await productsService.getProducts(storeId);
        res.json({ ok: true, data: rows });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: 'failed' });
    }
};
exports.listProducts = listProducts;
const createProduct = async (req, res) => {
    const body = req.body || {};
    try {
        const product = await productsService.createProduct(body);
        res.status(201).json({ ok: true, data: product });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: 'create_failed' });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    const id = req.params.id || (req.body && req.body.id);
    const patch = req.body || {};
    if (!id)
        return res.status(400).json({ ok: false, error: 'missing_id' });
    try {
        const updated = await productsService.updateProduct(id, patch);
        res.json({ ok: true, data: updated });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: 'update_failed' });
    }
};
exports.updateProduct = updateProduct;
const removeProduct = async (req, res) => {
    const id = req.params.id || (req.body && req.body.id);
    if (!id)
        return res.status(400).json({ ok: false, error: 'missing_id' });
    try {
        const ok = await productsService.deleteProduct(id);
        res.json({ ok: true, data: ok });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: 'delete_failed' });
    }
};
exports.removeProduct = removeProduct;
const uploadProductImage = async (req, res) => {
    // multer has stored file to disk
    if (!req.file)
        return res.status(400).json({ ok: false, error: 'no_file' });
    const storeId = req.headers['x-store-id'] || req.query.storeId || req.params.storeId || 'unknown';
    // Determine base upload dir same as routes/products.ts
    const baseUpload = process.env.UPLOAD_DIR ? path_1.default.resolve(String(process.env.UPLOAD_DIR)) : (() => {
        const cwd = process.cwd();
        return cwd.endsWith('Backend_Node') || cwd.includes(path_1.default.sep + 'Backend_Node' + path_1.default.sep) ? path_1.default.join(cwd, 'uploads') : path_1.default.join(cwd, 'Backend_Node', 'uploads');
    })();
    // Construct a URL path WITHOUT the leading `uploads` segment so frontend will prefix `/image`.
    const relNoRoot = path_1.default.join('products', String(storeId), req.file.filename);
    const url = `/${relNoRoot}`; // e.g. /products/1/1_12345.png
    res.json({ ok: true, url, data: { path: url } });
};
exports.uploadProductImage = uploadProductImage;
const deleteProductImage = async (req, res) => {
    const body = req.body || {};
    // Accept either { path: '/products/..' } or { imageUrl: '/image/products/..' } or { path: '/uploads/products/..' }
    const p = body.path || body.imageUrl;
    if (!p)
        return res.status(400).json({ ok: false, error: 'missing_path' });
    // Determine uploads root same as upload logic
    const uploadsRoot = process.env.UPLOAD_DIR ? path_1.default.resolve(String(process.env.UPLOAD_DIR)) : (() => {
        const cwd = process.cwd();
        return cwd.endsWith('Backend_Node') || cwd.includes(path_1.default.sep + 'Backend_Node' + path_1.default.sep) ? path_1.default.join(cwd, 'uploads') : path_1.default.join(cwd, 'Backend_Node', 'uploads');
    })();
    // Normalize incoming path: strip possible /image or /uploads prefix
    let normalized = String(p);
    if (normalized.startsWith('/image/'))
        normalized = normalized.replace(/^\/image/, '');
    if (normalized.startsWith('/uploads/'))
        normalized = normalized.replace(/^\/uploads/, '');
    // Ensure no leading slash when joining to uploadsRoot
    const target = path_1.default.join(uploadsRoot, normalized.replace(/^\//, ''));
    try {
        if (fs_1.default.existsSync(target)) {
            fs_1.default.unlinkSync(target);
            return res.json({ ok: true });
        }
        res.status(404).json({ ok: false, error: 'not_found' });
    }
    catch (err) {
        res.status(500).json({ ok: false, error: 'delete_error' });
    }
};
exports.deleteProductImage = deleteProductImage;
