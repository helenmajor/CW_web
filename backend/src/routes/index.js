import express from 'express';
import authRoutes from './authRoutes.js';
import healthRoutes from './healthRoutes.js';
import inventoryRoutes from './inventoryRoutes.js';
import legacyRoutes from './legacyRoutes.js';
import progressRoutes from './progressRoutes.js';
import shopRoutes from './shopRoutes.js';

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/progress', progressRoutes);
router.use('/shop', shopRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/', legacyRoutes);

export default router;
