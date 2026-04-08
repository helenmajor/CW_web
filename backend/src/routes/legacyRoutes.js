import express from 'express';
import {
  getUserData,
  syncGameState,
  updateUserProgress,
} from '../controllers/legacyController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/user/:userId', asyncHandler(getUserData));
router.post('/user/:userId/progress', asyncHandler(updateUserProgress));
router.post('/user/:userId/sync', asyncHandler(syncGameState));

export default router;
