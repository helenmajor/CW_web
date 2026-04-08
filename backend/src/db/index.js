import { getDb } from './connection.js';
import { runMigrations, seedShopItems } from './migrations.js';

export const initializeDatabase = () => {
  getDb();
  runMigrations();
  seedShopItems();
};
