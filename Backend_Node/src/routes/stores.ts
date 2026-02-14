import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { listHandler, createHandler } from '../controllers/storesController';
import { getHandler } from '../controllers/storesController';

const router = Router();

// upload dir: ensure target is Backend_Node/uploads regardless of cwd
const cwd = process.cwd();
const baseDir = cwd.endsWith('Backend_Node') || cwd.includes(path.sep + 'Backend_Node' + path.sep) ? cwd : path.join(cwd, 'Backend_Node');
const uploadDir = path.join(baseDir, 'uploads');
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
});
const upload = multer({ storage });

router.get('/', listHandler);
router.get('/:id', getHandler);
router.post('/', upload.single('image'), createHandler);

export default router;
