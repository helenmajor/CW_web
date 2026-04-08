import bcrypt from 'bcrypt';
import env from '../config/env.js';
import { buildDefaultProgressRows } from '../config/levels.js';
import { runInTransaction } from '../db/connection.js';
import { createLevelProgressRows } from '../repositories/progressRepository.js';
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByUsername,
} from '../repositories/userRepository.js';
import { AppError } from '../utils/AppError.js';
import { signToken } from '../utils/jwt.js';
import { serializeUser } from '../utils/serializers.js';

const validateRegistrationInput = ({ email, username, password }) => {
  if (!email || !username || !password) {
    throw new AppError('email, username, and password are required.', 400);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters long.', 400);
  }
};

export const registerUser = async ({ email, username, password, displayName }) => {
  validateRegistrationInput({ email, username, password });

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedUsername = username.trim();
  const normalizedDisplayName = (displayName || normalizedUsername).trim();

  if (findUserByEmail(normalizedEmail)) {
    throw new AppError('Email is already registered.', 409);
  }

  if (findUserByUsername(normalizedUsername)) {
    throw new AppError('Username is already taken.', 409);
  }

  const passwordHash = await bcrypt.hash(password, env.bcryptSaltRounds);
  let createdUser = null;

  runInTransaction(() => {
    createdUser = createUser({
      email: normalizedEmail,
      username: normalizedUsername,
      displayName: normalizedDisplayName,
      passwordHash,
    });

    createLevelProgressRows(buildDefaultProgressRows(createdUser.id));
  });

  const token = signToken(createdUser);

  return {
    token,
    user: serializeUser(createdUser),
  };
};

export const loginUser = async ({ email, password }) => {
  if (!email || !password) {
    throw new AppError('email and password are required.', 400);
  }

  const user = findUserByEmail(email.trim().toLowerCase());
  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw new AppError('Invalid email or password.', 401);
  }

  return {
    token: signToken(user),
    user: serializeUser(user),
  };
};

export const getCurrentUserProfile = (userId) => {
  const user = findUserById(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return serializeUser(user);
};
