import express from 'express';
import { loginHandler } from '../controllers/licenseAuthController';

const router = express.Router();

router.post('/login', loginHandler);

export default router;
