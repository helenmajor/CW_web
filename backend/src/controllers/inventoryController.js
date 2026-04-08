import { getInventoryForUser } from '../services/inventoryService.js';
import { sendSuccess } from '../utils/responses.js';

export const getInventory = async (req, res) => {
  sendSuccess(res, getInventoryForUser(req.user.id));
};
