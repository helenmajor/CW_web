import env from './env.js';

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (env.clientOrigins.includes('*')) return true;
  return env.clientOrigins.includes(origin);
};

export const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS.`));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
