import express from 'express';
import * as categoriesController from '../controllers/categoriesController';
import { verifyJwt } from '../middleware/verifyJwt';

const router = express.Router();

router.get('/', verifyJwt, categoriesController.listCategories);
router.get('/:id', verifyJwt, categoriesController.getCategoriesForStore);
router.post('/', verifyJwt, categoriesController.createCategory);
router.put('/update', verifyJwt, categoriesController.updateCategory);
router.put('/:id', verifyJwt, categoriesController.updateCategory);
router.post('/delete', verifyJwt, categoriesController.deleteCategory);
router.delete('/:id', verifyJwt, categoriesController.deleteCategory);

export default router;
