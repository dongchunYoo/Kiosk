"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJwt = verifyJwt;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function verifyJwt(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth)
        return res.status(401).json({ error: 'Missing Authorization' });
    const parts = auth.split(' ');
    if (parts.length !== 2)
        return res.status(401).json({ error: 'Invalid Authorization' });
    const token = parts[1];
    try {
        const secret = process.env.JWT_SECRET || 'change_me_jwt_secret';
        const payload = jsonwebtoken_1.default.verify(token, secret);
        req.user = payload;
        return next();
    }
    catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
}
