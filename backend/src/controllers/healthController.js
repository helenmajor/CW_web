import { sendSuccess } from '../utils/responses.js';

export const healthCheck = async (req, res) => {
  sendSuccess(res, {
    message: 'Backend is running',
  });
};
