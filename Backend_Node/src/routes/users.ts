import { Router } from 'express';
import { listHandler, createHandler, findHandler, updateHandler, deleteHandler } from '../controllers/usersController';
import { verifyJwt } from '../middleware/verifyJwt';
import { isSuperAdmin } from '../middleware/isSuperAdmin';

const router = Router();

router.get('/', listHandler);
router.post('/', createHandler);
router.get('/:user_Id', findHandler);

// Admin-only endpoints
router.put('/update', verifyJwt, isSuperAdmin, updateHandler);
router.put('/:id', verifyJwt, isSuperAdmin, updateHandler);
router.post('/delete', verifyJwt, isSuperAdmin, deleteHandler);
router.delete('/:id', verifyJwt, isSuperAdmin, deleteHandler);

export default router;
