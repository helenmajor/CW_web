import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import env from '../config/env.js';

let dbInstance = null;

const createDatabaseConnection = () => {
  fs.mkdirSync(path.dirname(env.dbPath), { recursive: true });

  const db = new Database(env.dbPath);
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');

  return db;
};

export const getDb = () => {
  if (!dbInstance) {
    dbInstance = createDatabaseConnection();
  }

  return dbInstance;
};

export const runInTransaction = (work) => {
  const db = getDb();
  const transaction = db.transaction(work);
  return transaction();
};
