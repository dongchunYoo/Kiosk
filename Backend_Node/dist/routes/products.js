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
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const productsController = __importStar(require("../controllers/productsController"));
const verifyJwt_1 = require("../middleware/verifyJwt");
const router = express_1.default.Router();
// multer storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const storeId = req.headers['x-store-id'] || req.query.storeId || req.params.storeId || 'unknown';
        // Determine base upload dir: prefer UPLOAD_DIR env, otherwise Backend_Node/uploads
        const baseUpload = process.env.UPLOAD_DIR ? path_1.default.resolve(String(process.env.UPLOAD_DIR)) : (() => {
            const cwd = process.cwd();
            return cwd.endsWith('Backend_Node') || cwd.includes(path_1.default.sep + 'Backend_Node' + path_1.default.sep) ? path_1.default.join(cwd, 'uploads') : path_1.default.join(cwd, 'Backend_Node', 'uploads');
        })();
        const dir = path_1.default.join(baseUpload, 'products', String(storeId));
        try {
            fs_1.default.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        }
        catch (e) {
            // multer callback signature requires (error, destination)
            cb(e, dir);
        }
    },
    filename: (req, file, cb) => {
        const ext = path_1.default.extname(file.originalname) || '.png';
        const storeId = req.headers['x-store-id'] || req.query.storeId || req.params.storeId || 'unknown';
        const name = `${storeId}_${Date.now()}${ext}`;
        cb(null, name);
    }
});
const upload = (0, multer_1.default)({ storage });
router.get('/', verifyJwt_1.verifyJwt, productsController.listProducts);
router.post('/', verifyJwt_1.verifyJwt, productsController.createProduct);
router.put('/update', verifyJwt_1.verifyJwt, productsController.updateProduct);
router.put('/:id', verifyJwt_1.verifyJwt, productsController.updateProduct);
router.post('/delete', verifyJwt_1.verifyJwt, productsController.removeProduct);
router.delete('/:id', verifyJwt_1.verifyJwt, productsController.removeProduct);
// upload endpoints
router.post('/upload/product/:storeId', verifyJwt_1.verifyJwt, (req, res, next) => {
    if (!req.headers['x-store-id'])
        req.headers['x-store-id'] = String(req.params.storeId);
    next();
}, upload.single('image'), productsController.uploadProductImage);
router.post('/upload/product', verifyJwt_1.verifyJwt, upload.single('image'), productsController.uploadProductImage);
router.post('/delete-image', verifyJwt_1.verifyJwt, productsController.deleteProductImage);
exports.default = router;
