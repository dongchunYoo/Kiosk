import { Router } from 'express';
import { createPaymentHandler, getPaymentHandler } from '../controllers/paymentsController';

const router = Router();

router.post('/', createPaymentHandler);
router.get('/:id', getPaymentHandler);

export default router;
