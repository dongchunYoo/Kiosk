import { Router } from 'express';
import { getAppDataHandler } from '../controllers/appdataController';

const router = Router();

router.get('/', getAppDataHandler);

export default router;
