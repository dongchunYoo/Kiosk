import express from 'express';
import { listHandler, createHandler } from '../controllers/storeGroupsController';

const router = express.Router();

router.get('/', listHandler);
router.post('/', createHandler);

export default router;
