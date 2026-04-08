import express from 'express';
import { getShopItems, purchaseItem } from '../controllers/shopController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.use(requireAuth);
router.get('/items', asyncHandler(getShopItems));
router.post('/purchase', asyncHandler(purchaseItem));

export default router;
