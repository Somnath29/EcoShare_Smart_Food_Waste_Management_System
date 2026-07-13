import { Router } from 'express';
import authRoutes from './authRoutes.js';
import foodRoutes from './foodRoutes.js';

const router = Router();

// Mount modules
router.use('/auth', authRoutes);
router.use('/foods', foodRoutes);

export default router;
