import express from 'express';
import { healthCheck } from '../controllers/healthController.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/', asyncHandler(healthCheck));

export default router;
