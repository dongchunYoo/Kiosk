import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as productsController from '../controllers/productsController';
import { verifyJwt } from '../middleware/verifyJwt';

const router = express.Router();

// multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const storeId = req.headers['x-store-id'] || req.query.storeId || req.params.storeId || 'unknown';
    // Determine base upload dir: prefer UPLOAD_DIR env, otherwise Backend_Node/uploads
    const baseUpload = process.env.UPLOAD_DIR ? path.resolve(String(process.env.UPLOAD_DIR)) : (() => {
      const cwd = process.cwd();
      return cwd.endsWith('Backend_Node') || cwd.includes(path.sep + 'Backend_Node' + path.sep) ? path.join(cwd, 'uploads') : path.join(cwd, 'Backend_Node', 'uploads');
    })();
    const dir = path.join(baseUpload, 'products', String(storeId));
    try {
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    } catch (e) {
      // multer callback signature requires (error, destination)
      cb(e as any, dir);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    const storeId = req.headers['x-store-id'] || req.query.storeId || req.params.storeId || 'unknown';
    const name = `${storeId}_${Date.now()}${ext}`;
    cb(null, name);
  }
});

const upload = multer({ storage });

router.get('/', verifyJwt, productsController.listProducts);
router.post('/', verifyJwt, productsController.createProduct);
router.put('/update', verifyJwt, productsController.updateProduct);
router.put('/:id', verifyJwt, productsController.updateProduct);
router.post('/delete', verifyJwt, productsController.removeProduct);
router.delete('/:id', verifyJwt, productsController.removeProduct);

// upload endpoints
router.post('/upload/product/:storeId', verifyJwt, (req, res, next) => {
  if (!req.headers['x-store-id']) req.headers['x-store-id'] = String(req.params.storeId);
  next();
}, upload.single('image'), productsController.uploadProductImage);

router.post('/upload/product', verifyJwt, upload.single('image'), productsController.uploadProductImage);
router.post('/delete-image', verifyJwt, productsController.deleteProductImage);

export default router;
