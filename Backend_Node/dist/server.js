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
exports.createServer = createServer;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const auth_1 = __importDefault(require("./routes/auth"));
const products_1 = __importDefault(require("./routes/products"));
const appdata_1 = __importDefault(require("./routes/appdata"));
const licenses_1 = __importDefault(require("./routes/licenses"));
const stores_1 = __importDefault(require("./routes/stores"));
const store_groups_1 = __importDefault(require("./routes/store-groups"));
const product_options_1 = __importDefault(require("./routes/product-options"));
const categories_1 = __importDefault(require("./routes/categories"));
const payments_1 = __importDefault(require("./routes/payments"));
const admin_1 = __importDefault(require("./routes/admin"));
const users_1 = __importDefault(require("./routes/users"));
const db_1 = require("./config/db");
async function createServer() {
    const app = (0, express_1.default)();
    // CORS 설정 (프로덕션 환경에서는 특정 도메인만 허용)
    const corsOptions = {
        origin: process.env.DEV_MODE === 'true'
            ? '*' // 개발 환경: 모든 도메인 허용
            : ['https://kioskfront.ydc1981.pe.kr', 'https://ydc1981.pe.kr'], // 프로덕션: 특정 도메인만
        credentials: true,
        optionsSuccessStatus: 200
    };
    app.use((0, cors_1.default)(corsOptions));
    app.use(body_parser_1.default.json());
    // init DB pool
    await (0, db_1.initDb)();
    // ensure uploads directory exists and serve it statically
    const fs = await Promise.resolve().then(() => __importStar(require('fs')));
    const path = await Promise.resolve().then(() => __importStar(require('path')));
    // Ensure uploads directory is Backend_Node/uploads regardless of cwd
    const cwd = process.cwd();
    const baseDir = cwd.endsWith('Backend_Node') || cwd.includes(path.sep + 'Backend_Node' + path.sep) ? cwd : path.join(cwd, 'Backend_Node');
    const uploadsDir = path.join(baseDir, 'uploads');
    if (!fs.existsSync(uploadsDir))
        fs.mkdirSync(uploadsDir, { recursive: true });
    // Serve uploaded assets under both `/uploads` and `/image` for frontend compatibility
    app.use('/uploads', (await Promise.resolve().then(() => __importStar(require('express')))).default.static(uploadsDir));
    app.use('/image', (await Promise.resolve().then(() => __importStar(require('express')))).default.static(uploadsDir));
    app.use('/api/auth', auth_1.default);
    // compatibility route used by legacy clients (Flutter / migrated RN)
    try {
        // load dynamically to avoid crashing when the file is missing during hot-reload
        // prefer ES dynamic import so ts-node-dev can resolve .ts files
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const licenseAuth = await Promise.resolve().then(() => __importStar(require('./routes/licenseAuth')));
        if (licenseAuth && licenseAuth.default)
            app.use('/license-auth', licenseAuth.default);
    }
    catch (err) {
        // route missing is non-fatal; log and continue
        // Use console here to avoid logger circularity during early startup
        // but prefer the project's logger when available
        try {
            const { logInfo } = await Promise.resolve().then(() => __importStar(require('./utils/logger')));
            logInfo('Optional route /license-auth not mounted (module not found)');
        }
        catch (_) {
            // fallback
            // eslint-disable-next-line no-console
            console.info('Optional route /license-auth not mounted (module not found)');
        }
    }
    app.use('/api/appdata', appdata_1.default);
    // backward-compatible aliases for legacy clients (no /api prefix)
    app.use('/appdata', appdata_1.default);
    app.use('/auth', auth_1.default);
    app.use('/licenses', licenses_1.default);
    app.use('/stores', stores_1.default);
    app.use('/store-groups', store_groups_1.default);
    app.use('/product-options', product_options_1.default);
    app.use('/products', products_1.default);
    app.use('/categories', categories_1.default);
    app.use('/payments', payments_1.default);
    app.use('/admin', admin_1.default);
    app.use('/users', users_1.default);
    app.use('/api/licenses', licenses_1.default);
    app.use('/api/stores', stores_1.default);
    app.use('/api/store-groups', store_groups_1.default);
    app.use('/api/product-options', product_options_1.default);
    app.use('/api/products', products_1.default);
    app.use('/api/categories', categories_1.default);
    app.use('/api/payments', payments_1.default);
    app.use('/api/admin', admin_1.default);
    app.use('/api/users', users_1.default);
    app.get('/health', (_req, res) => res.json({ status: 'ok' }));
    return app;
}
