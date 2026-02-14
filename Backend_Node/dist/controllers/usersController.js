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
exports.findHandler = findHandler;
exports.updateHandler = updateHandler;
exports.deleteHandler = deleteHandler;
const usersService = __importStar(require("../services/usersService"));
async function listHandler(_req, res) {
    const list = await usersService.listUsers();
    res.json(list);
}
async function createHandler(req, res) {
    const { user_Id, name, role } = req.body;
    if (!user_Id)
        return res.status(400).json({ error: 'user_Id required' });
    const created = await usersService.createUser(user_Id, name, role);
    res.status(201).json(created);
}
async function findHandler(req, res) {
    const { user_Id } = req.params;
    const u = await usersService.findByUserId(user_Id);
    if (!u)
        return res.status(404).json({ error: 'not found' });
    res.json(u);
}
exports.default = { listHandler, createHandler, findHandler };
async function updateHandler(req, res) {
    const id = req.body.id || req.params.id;
    const patch = req.body || {};
    if (!id)
        return res.status(400).json({ error: 'missing id' });
    const updated = await usersService.updateUser(id, patch);
    if (!updated)
        return res.status(404).json({ error: 'not found' });
    res.json({ ok: true, data: updated });
}
async function deleteHandler(req, res) {
    const id = req.body.id || req.params.id;
    if (!id)
        return res.status(400).json({ error: 'missing id' });
    const ok = await usersService.deleteUser(id);
    res.json({ ok, data: ok });
}
