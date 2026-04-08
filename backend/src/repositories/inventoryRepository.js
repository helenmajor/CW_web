import { getDb } from '../db/connection.js';

export const findUserInventory = (userId) => {
  const db = getDb();
  return db.prepare(`
    SELECT
      ui.id,
      ui.user_id,
      ui.item_id,
      ui.quantity,
      ui.created_at,
      ui.updated_at,
      si.slug,
      si.name,
      si.description,
      si.cost,
      si.icon,
      si.category
    FROM user_items ui
    INNER JOIN shop_items si ON si.id = ui.item_id
    WHERE ui.user_id = ?
    ORDER BY ui.created_at DESC, ui.id DESC
  `).all(userId);
};

export const findUserItem = (userId, itemId) => {
  const db = getDb();
  return db.prepare(`
    SELECT id, user_id, item_id, quantity, created_at, updated_at
    FROM user_items
    WHERE user_id = ? AND item_id = ?
  `).get(userId, itemId) ?? null;
};

export const createUserItem = (userId, itemId, quantity = 1) => {
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO user_items (user_id, item_id, quantity, updated_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
  `).run(userId, itemId, quantity);

  return db.prepare(`
    SELECT id, user_id, item_id, quantity, created_at, updated_at
    FROM user_items
    WHERE id = ?
  `).get(result.lastInsertRowid);
};
