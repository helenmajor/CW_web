import { runInTransaction } from '../db/connection.js';
import { createUserItem, findUserItem } from '../repositories/inventoryRepository.js';
import { findShopItemById, getActiveShopItems } from '../repositories/shopRepository.js';
import { updateUserCoins } from '../repositories/userRepository.js';
import { AppError } from '../utils/AppError.js';
import { requirePositiveInteger, requireUser } from './serviceHelpers.js';

export const getShopItemsForUser = (userId) => {
  requireUser(userId);
  const items = getActiveShopItems();

  return items.map((item) => {
    const ownedItem = findUserItem(userId, item.id);

    return {
      ...item,
      owned: Boolean(ownedItem),
      quantity: ownedItem?.quantity ?? 0,
    };
  });
};

export const purchaseItemForUser = (userId, { itemId }) => {
  const normalizedItemId = requirePositiveInteger(itemId, 'itemId');
  let responsePayload = null;

  runInTransaction(() => {
    const user = requireUser(userId);
    const item = findShopItemById(normalizedItemId);

    if (!item || item.is_active !== 1) {
      throw new AppError('Shop item not found.', 404);
    }

    if (findUserItem(userId, item.id)) {
      throw new AppError('This item has already been purchased.', 409);
    }

    if (user.coins < item.cost) {
      throw new AppError('Not enough coins to purchase this item.', 400);
    }

    const updatedUser = updateUserCoins(userId, user.coins - item.cost);
    const purchasedItem = createUserItem(userId, item.id);

    responsePayload = {
      purchasedItem: {
        ...item,
        quantity: purchasedItem.quantity,
      },
      coinsRemaining: updatedUser.coins,
    };
  });

  return responsePayload;
};
