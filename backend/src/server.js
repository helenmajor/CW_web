import env from './config/env.js';
import { initializeDatabase } from './db/index.js';
import { createApp } from './app.js';

export const startServer = () => {
  initializeDatabase();

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`Server running on port ${env.port}`);
    console.log(`SQLite database ready at ${env.dbPath}`);
  });

  return server;
};
