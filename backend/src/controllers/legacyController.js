import { getInventoryForUser } from '../services/inventoryService.js';
import {
  completeLevelForUser,
  getLegacyUserSnapshot,
  skipLevelForUser,
} from '../services/progressService.js';
import { purchaseItemForUser } from '../services/shopService.js';
import { requirePositiveInteger } from '../services/serviceHelpers.js';
import { sendSuccess } from '../utils/responses.js';

export const getUserData = async (req, res) => {
  const userId = requirePositiveInteger(req.params.userId, 'userId');
  const legacySnapshot = getLegacyUserSnapshot(userId);
  const inventory = getInventoryForUser(userId);

  sendSuccess(res, {
    ...legacySnapshot,
    redeemedPrizes: inventory.items,
    sandboxItems: [],
  });
};

export const updateUserProgress = async (req, res) => {
  const userId = requirePositiveInteger(req.params.userId, 'userId');
  const { year, nodeId, action, rewardCoins } = req.body;

  const payload = action === 'skip'
    ? skipLevelForUser(userId, { year, levelId: nodeId })
    : completeLevelForUser(userId, { year, levelId: nodeId, rewardCoins });

  sendSuccess(res, payload);
};

export const syncGameState = async (req, res) => {
  const userId = requirePositiveInteger(req.params.userId, 'userId');
  const { type, payload } = req.body;

  if (type === 'purchase') {
    sendSuccess(res, purchaseItemForUser(userId, payload));
    return;
  }

  if (type === 'inventory') {
    sendSuccess(res, getInventoryForUser(userId));
    return;
  }

  sendSuccess(res, {
    message: 'No sync action was performed.',
    received: { type, payload },
  });
};
