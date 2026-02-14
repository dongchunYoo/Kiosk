"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storesController_1 = require("../controllers/storesController");
const storesController_2 = require("../controllers/storesController");
const router = (0, express_1.Router)();
// upload dir: ensure target is Backend_Node/uploads regardless of cwd
const cwd = process.cwd();
const baseDir = cwd.endsWith('Backend_Node') || cwd.includes(path_1.default.sep + 'Backend_Node' + path_1.default.sep) ? cwd : path_1.default.join(cwd, 'Backend_Node');
const uploadDir = path_1.default.join(baseDir, 'uploads');
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});
const upload = (0, multer_1.default)({ storage });
router.get('/', storesController_1.listHandler);
router.get('/:id', storesController_2.getHandler);
router.post('/', upload.single('image'), storesController_1.createHandler);
exports.default = router;
