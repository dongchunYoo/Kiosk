import { Router } from 'express';
import { listHandler, createHandler, checkKeyHandler } from '../controllers/licensesController';

const router = Router();

router.get('/', listHandler);
router.post('/', createHandler);
router.post('/check-key', checkKeyHandler);

export default router;
