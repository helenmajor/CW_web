import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '../..');

const parseInteger = (value, fallback) => {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const resolveDbPath = (inputPath) => {
  if (!inputPath) {
    return path.join(backendRoot, 'data', 'gradquest.sqlite');
  }

  return path.isAbsolute(inputPath)
    ? inputPath
    : path.resolve(backendRoot, inputPath);
};

const parseOrigins = (value) => {
  return (value || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInteger(process.env.PORT, 3000),
  clientOrigins: parseOrigins(process.env.CLIENT_ORIGIN),
  jwtSecret: process.env.JWT_SECRET || 'gradquest-dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptSaltRounds: parseInteger(process.env.BCRYPT_SALT_ROUNDS, 10),
  dbPath: resolveDbPath(process.env.DB_PATH),
  initialCoins: parseInteger(process.env.INITIAL_COINS, 140),
};

export default env;
