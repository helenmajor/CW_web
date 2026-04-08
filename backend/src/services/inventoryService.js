import { findUserInventory } from '../repositories/inventoryRepository.js';
import { serializeUser } from '../utils/serializers.js';
import { requireUser } from './serviceHelpers.js';

export const getInventoryForUser = (userId) => {
  const user = requireUser(userId);
  const items = findUserInventory(userId).map((item) => ({
    id: item.id,
    itemId: item.item_id,
    slug: item.slug,
    name: item.name,
    description: item.description,
    category: item.category,
    icon: item.icon,
    cost: item.cost,
    quantity: item.quantity,
    acquiredAt: item.created_at,
  }));

  return {
    user: serializeUser(user),
    items,
  };
};
