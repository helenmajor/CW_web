const levelDefinitions = {
  y2: [
    { id: 2, name: '地区探路', rewardCoins: 30 },
    { id: 3, name: '分数利用', rewardCoins: 30 },
    { id: 4, name: '专业配方', rewardCoins: 30 },
    { id: 5, name: '行动点', rewardCoins: 30 },
    { id: 6, name: '案例侦探', rewardCoins: 30 },
    { id: 7, name: '终极考验', rewardCoins: 30 },
  ],
  y3: [
    { id: 1, name: '申请炼金', rewardCoins: 30 },
    { id: 2, name: '材料鉴定', rewardCoins: 30 },
    { id: 3, name: 'CV 急诊', rewardCoins: 30 },
    { id: 4, name: '文书连线', rewardCoins: 30 },
    { id: 5, name: '推荐信协同', rewardCoins: 30 },
    { id: 6, name: '冲刺修罗场', rewardCoins: 30 },
    { id: 7, name: 'DIY 排雷', rewardCoins: 30 },
  ],
};

export const getYears = () => Object.keys(levelDefinitions);

export const getLevelsByYear = (year) => levelDefinitions[year] || [];

export const getLevelDefinition = (year, levelId) => {
  return getLevelsByYear(year).find((level) => level.id === levelId) ?? null;
};

export const getNextLevelDefinition = (year, levelId) => {
  const levels = getLevelsByYear(year);
  const currentIndex = levels.findIndex((level) => level.id === levelId);
  if (currentIndex === -1) return null;
  return levels[currentIndex + 1] ?? null;
};

export const buildDefaultProgressRows = (userId) => {
  return getYears().flatMap((year) =>
    getLevelsByYear(year).map((level, index) => ({
      userId,
      year,
      levelId: level.id,
      levelName: level.name,
      rewardCoins: level.rewardCoins,
      status: index === 0 ? 'unlocked' : 'locked',
    }))
  );
};
