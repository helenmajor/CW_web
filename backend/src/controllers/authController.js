import { getCurrentUserProfile, loginUser, registerUser } from '../services/authService.js';
import { sendSuccess } from '../utils/responses.js';

export const register = async (req, res) => {
  const payload = await registerUser(req.body);
  sendSuccess(res, payload, 201);
};

export const login = async (req, res) => {
  const payload = await loginUser(req.body);
  sendSuccess(res, payload);
};

export const me = async (req, res) => {
  const payload = getCurrentUserProfile(req.user.id);
  sendSuccess(res, payload);
};
