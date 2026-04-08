import env from '../config/env.js';
import { getDb } from '../db/connection.js';

const baseUserSelect = `
  SELECT id, email, username, display_name, password_hash, coins, created_at, updated_at
  FROM users
`;

export const findUserById = (userId) => {
  const db = getDb();
  return db.prepare(`${baseUserSelect} WHERE id = ?`).get(userId) ?? null;
};

export const findUserByEmail = (email) => {
  const db = getDb();
  return db.prepare(`${baseUserSelect} WHERE email = ?`).get(email) ?? null;
};

export const findUserByUsername = (username) => {
  const db = getDb();
  return db.prepare(`${baseUserSelect} WHERE username = ?`).get(username) ?? null;
};

export const createUser = ({ email, username, displayName, passwordHash }) => {
  const db = getDb();
  const insertStatement = db.prepare(`
    INSERT INTO users (email, username, display_name, password_hash, coins, updated_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  const result = insertStatement.run(
    email,
    username,
    displayName,
    passwordHash,
    env.initialCoins
  );

  return findUserById(result.lastInsertRowid);
};

export const updateUserCoins = (userId, nextCoins) => {
  const db = getDb();
  db.prepare(`
    UPDATE users
    SET coins = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(nextCoins, userId);

  return findUserById(userId);
};
