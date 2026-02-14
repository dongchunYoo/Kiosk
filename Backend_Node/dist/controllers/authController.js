"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHandler = registerHandler;
exports.loginHandler = loginHandler;
const authService_1 = require("../services/authService");
async function registerHandler(req, res) {
    try {
        const payload = req.body;
        const result = await (0, authService_1.registerUser)(payload);
        res.status(201).json(result);
    }
    catch (err) {
        res.status(err.status || 500).json({ error: err.message || 'Internal error' });
    }
}
async function loginHandler(req, res) {
    try {
        const payload = req.body;
        const result = await (0, authService_1.loginUser)(payload);
        res.json(result);
    }
    catch (err) {
        res.status(err.status || 500).json({ error: err.message || 'Internal error' });
    }
}
