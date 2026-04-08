import {
  getLevelDefinition,
  getNextLevelDefinition,
  getYears,
} from '../config/levels.js';
import { runInTransaction } from '../db/connection.js';
import {
  findProgressByLevel,
  findProgressByUserId,
  updateProgressStatus,
} from '../repositories/progressRepository.js';
import { findUserById, updateUserCoins } from '../repositories/userRepository.js';
import { AppError } from '../utils/AppError.js';
import { serializeProgressRows, serializeUser } from '../utils/serializers.js';
import { requirePositiveInteger, requireUser } from './serviceHelpers.js';

const requireLevelRecord = (userId, year, levelId) => {
  const level = getLevelDefinition(year, levelId);
  if (!level) {
    throw new AppError('Level not found for the requested year.', 404);
  }

  const progress = findProgressByLevel(userId, year, levelId);
  if (!progress) {
    throw new AppError('Progress record not found for the requested level.', 404);
  }

  return { level, progress };
};

export const getProgressForUser = (userId) => {
  const user = requireUser(userId);
  const rows = findProgressByUserId(userId);

  return {
    user: serializeUser(user),
    years: serializeProgressRows(rows),
  };
};

export const completeLevelForUser = (userId, { year, levelId, rewardCoins }) => {
  if (!getYears().includes(year)) {
    throw new AppError('Invalid year supplied.', 400);
  }

  const normalizedLevelId = requirePositiveInteger(levelId, 'levelId');
  const levelDefinition = getLevelDefinition(year, normalizedLevelId);
  if (!levelDefinition) {
    throw new AppError('Level not found for the requested year.', 404);
  }

  const finalRewardCoins = Number.isFinite(Number(rewardCoins)) && Number(rewardCoins) > 0
    ? Number.parseInt(rewardCoins, 10)
    : levelDefinition.rewardCoins;

  let payload = null;

  runInTransaction(() => {
    const user = requireUser(userId);
    const { progress } = requireLevelRecord(userId, year, normalizedLevelId);

    if (progress.status === 'locked') {
      throw new AppError('This level is still locked.', 400);
    }

    let awardedCoins = 0;
    if (progress.status !== 'completed') {
      updateProgressStatus(userId, year, normalizedLevelId, 'completed');
      updateUserCoins(userId, user.coins + finalRewardCoins);
      awardedCoins = finalRewardCoins;
    }

    const nextLevel = getNextLevelDefinition(year, normalizedLevelId);
    if (nextLevel) {
      const nextProgress = findProgressByLevel(userId, year, nextLevel.id);
      if (nextProgress?.status === 'locked') {
        updateProgressStatus(userId, year, nextLevel.id, 'unlocked');
      }
    }

    payload = {
      ...getProgressForUser(userId),
      update: {
        year,
        levelId: normalizedLevelId,
        status: 'completed',
        coinsAwarded: awardedCoins,
      },
    };
  });

  return payload;
};

export const skipLevelForUser = (userId, { year, levelId }) => {
  if (!getYears().includes(year)) {
    throw new AppError('Invalid year supplied.', 400);
  }

  const normalizedLevelId = requirePositiveInteger(levelId, 'levelId');
  let payload = null;

  runInTransaction(() => {
    requireUser(userId);
    const { progress } = requireLevelRecord(userId, year, normalizedLevelId);

    if (progress.status === 'locked') {
      throw new AppError('This level is still locked.', 400);
    }

    if (progress.status === 'completed') {
      throw new AppError('Completed levels cannot be skipped.', 400);
    }

    if (progress.status !== 'skipped') {
      updateProgressStatus(userId, year, normalizedLevelId, 'skipped');
    }

    const nextLevel = getNextLevelDefinition(year, normalizedLevelId);
    if (nextLevel) {
      const nextProgress = findProgressByLevel(userId, year, nextLevel.id);
      if (nextProgress?.status === 'locked') {
        updateProgressStatus(userId, year, nextLevel.id, 'unlocked');
      }
    }

    payload = {
      ...getProgressForUser(userId),
      update: {
        year,
        levelId: normalizedLevelId,
        status: 'skipped',
        coinsAwarded: 0,
      },
    };
  });

  return payload;
};

export const getLegacyUserSnapshot = (userId) => {
  const payload = getProgressForUser(userId);

  const toLegacyYearShape = (year) => {
    const levels = payload.years[year].levels;
    const nodes = Object.fromEntries(levels.map((level) => [level.id, level.status]));
    const firstAvailable = levels.find((level) => level.status !== 'locked');

    return {
      coins: payload.user.coins,
      currentNode: firstAvailable?.id ?? null,
      nodes,
    };
  };

  return {
    id: payload.user.id,
    username: payload.user.username,
    displayName: payload.user.displayName,
    coins: payload.user.coins,
    y2: toLegacyYearShape('y2'),
    y3: toLegacyYearShape('y3'),
  };
};

export const getProgressByUserId = (userId) => {
  const numericUserId = requirePositiveInteger(userId, 'userId');
  if (!findUserById(numericUserId)) {
    throw new AppError('User not found.', 404);
  }

  return getProgressForUser(numericUserId);
};
