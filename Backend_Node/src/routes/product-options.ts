import express from 'express';
import * as productOptionsController from '../controllers/productOptionsController';
import { verifyJwt } from '../middleware/verifyJwt';

const router = express.Router();

router.get('/', verifyJwt, productOptionsController.listOptions);
router.post('/', verifyJwt, productOptionsController.createOption);
router.put('/update', verifyJwt, productOptionsController.updateOption);
router.put('/:id', verifyJwt, productOptionsController.updateOption);
router.post('/delete', verifyJwt, productOptionsController.deleteOption);
router.delete('/:id', verifyJwt, productOptionsController.deleteOption);

export default router;
