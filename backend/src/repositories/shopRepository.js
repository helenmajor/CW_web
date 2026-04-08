import { getDb } from '../db/connection.js';

export const getActiveShopItems = () => {
  const db = getDb();
  return db.prepare(`
    SELECT id, slug, name, description, cost, icon, category, is_active
    FROM shop_items
    WHERE is_active = 1
    ORDER BY cost ASC, id ASC
  `).all();
};

export const findShopItemById = (itemId) => {
  const db = getDb();
  return db.prepare(`
    SELECT id, slug, name, description, cost, icon, category, is_active
    FROM shop_items
    WHERE id = ?
  `).get(itemId) ?? null;
};
