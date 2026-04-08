import cors from 'cors';
import express from 'express';
import { corsOptions } from './config/cors.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import apiRouter from './routes/index.js';

export const createApp = () => {
  const app = express();

  app.use(cors(corsOptions));
  app.use(express.json({ limit: '1mb' }));
  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
