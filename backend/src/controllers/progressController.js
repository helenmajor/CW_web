import {
  completeLevelForUser,
  getProgressForUser,
  skipLevelForUser,
} from '../services/progressService.js';
import { sendSuccess } from '../utils/responses.js';

export const getProgress = async (req, res) => {
  sendSuccess(res, getProgressForUser(req.user.id));
};

export const completeLevel = async (req, res) => {
  const payload = completeLevelForUser(req.user.id, req.body);
  sendSuccess(res, payload);
};

export const skipLevel = async (req, res) => {
  const payload = skipLevelForUser(req.user.id, req.body);
  sendSuccess(res, payload);
};
