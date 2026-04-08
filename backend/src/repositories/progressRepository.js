import { getDb } from '../db/connection.js';

export const createLevelProgressRows = (rows) => {
  const db = getDb();
  const statement = db.prepare(`
    INSERT INTO level_progress (user_id, year, level_id, level_name, status, reward_coins, updated_at)
    VALUES (@userId, @year, @levelId, @levelName, @status, @rewardCoins, CURRENT_TIMESTAMP)
  `);

  for (const row of rows) {
    statement.run(row);
  }
};

export const findProgressByUserId = (userId) => {
  const db = getDb();
  return db.prepare(`
    SELECT id, user_id, year, level_id, level_name, status, reward_coins, created_at, updated_at
    FROM level_progress
    WHERE user_id = ?
    ORDER BY CASE year WHEN 'y2' THEN 1 WHEN 'y3' THEN 2 ELSE 3 END, level_id
  `).all(userId);
};

export const findProgressByLevel = (userId, year, levelId) => {
  const db = getDb();
  return db.prepare(`
    SELECT id, user_id, year, level_id, level_name, status, reward_coins, created_at, updated_at
    FROM level_progress
    WHERE user_id = ? AND year = ? AND level_id = ?
  `).get(userId, year, levelId) ?? null;
};

export const updateProgressStatus = (userId, year, levelId, status) => {
  const db = getDb();
  db.prepare(`
    UPDATE level_progress
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ? AND year = ? AND level_id = ?
  `).run(status, userId, year, levelId);

  return findProgressByLevel(userId, year, levelId);
};
