import express from 'express';
import {
  completeLevel,
  getProgress,
  skipLevel,
} from '../controllers/progressController.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.use(requireAuth);
router.get('/', asyncHandler(getProgress));
router.post('/complete', asyncHandler(completeLevel));
router.post('/skip', asyncHandler(skipLevel));

export default router;
