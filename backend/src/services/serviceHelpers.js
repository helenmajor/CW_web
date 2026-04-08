import { findUserById } from '../repositories/userRepository.js';
import { AppError } from '../utils/AppError.js';

export const requireUser = (userId) => {
  const user = findUserById(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return user;
};

export const requirePositiveInteger = (value, fieldName) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new AppError(`${fieldName} must be a positive integer.`, 400);
  }

  return parsed;
};
