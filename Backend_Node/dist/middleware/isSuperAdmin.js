"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSuperAdmin = isSuperAdmin;
function isSuperAdmin(req, res, next) {
    const user = req.user;
    // Accept role 'A' as admin (legacy), or explicit 'superadmin'/'admin'
    const role = user && user.role;
    if (role === 'A' || role === 'admin' || role === 'superadmin')
        return next();
    return res.status(403).json({ error: 'forbidden' });
}
exports.default = isSuperAdmin;
