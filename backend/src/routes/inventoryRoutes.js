import express from 'express';
import { getInventory } from '../controllers/inventoryController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.use(requireAuth);
router.get('/', asyncHandler(getInventory));

export default router;
