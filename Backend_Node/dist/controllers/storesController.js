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
exports.getHandler = getHandler;
const storesService = __importStar(require("../services/storesService"));
async function listHandler(_req, res) {
    const list = await storesService.listStores();
    res.json(list);
}
async function createHandler(req, res) {
    const { name } = req.body;
    if (!name)
        return res.status(400).json({ error: 'name required' });
    // multer places uploaded file at req.file
    const file = req.file;
    const imagePath = file ? `/uploads/${file.filename}` : undefined;
    const created = await storesService.createStore(name, imagePath);
    res.status(201).json(created);
}
async function getHandler(req, res) {
    const id = req.params.id;
    if (!id)
        return res.status(400).json({ error: 'missing id' });
    const store = await storesService.getStoreById(id);
    if (!store)
        return res.status(404).json({ error: 'not found' });
    // return raw store object (frontend expects storeRes.data.name)
    res.json(store);
}
exports.default = { listHandler, createHandler };
