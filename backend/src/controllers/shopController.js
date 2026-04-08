import { getShopItemsForUser, purchaseItemForUser } from '../services/shopService.js';
import { sendSuccess } from '../utils/responses.js';

export const getShopItems = async (req, res) => {
  sendSuccess(res, {
    items: getShopItemsForUser(req.user.id),
  });
};

export const purchaseItem = async (req, res) => {
  sendSuccess(res, purchaseItemForUser(req.user.id, req.body));
};
