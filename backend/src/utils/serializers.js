import { getYears } from '../config/levels.js';

export const serializeUser = (user) => ({
  id: user.id,
  email: user.email,
  username: user.username,
  displayName: user.display_name,
  coins: user.coins,
  createdAt: user.created_at,
  updatedAt: user.updated_at,
});

export const serializeProgressRows = (rows) => {
  const years = Object.fromEntries(
    getYears().map((year) => [
      year,
      {
        levels: [],
        summary: {
          completed: 0,
          skipped: 0,
          unlocked: 0,
          locked: 0,
        },
      },
    ])
  );

  for (const row of rows) {
    const level = {
      id: row.level_id,
      name: row.level_name,
      status: row.status,
      rewardCoins: row.reward_coins,
      unlocked: row.status !== 'locked',
      completed: row.status === 'completed',
      skipped: row.status === 'skipped',
      updatedAt: row.updated_at,
    };

    years[row.year].levels.push(level);
    years[row.year].summary[row.status] += 1;
  }

  return years;
};
