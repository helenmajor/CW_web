import express from 'express';
import { getUserData, updateUserProgress, syncGameState } from '../controllers/userController.js';

const router = express.Router();

// 获取用户数据（进度、金币、节点状态）
router.get('/user/:userId', getUserData);

// 更新用户进度（完成/跳过节点）
router.post('/user/:userId/progress', updateUserProgress);

// 同步游戏状态（兑换、沙盘等）
router.post('/user/:userId/sync', syncGameState);

export default router;