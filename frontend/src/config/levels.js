const levelDefinitions = {
  y2: [
    { id: 2, mapNode: 1, name: '地区探路', file: 'year2_2.vue' },
    { id: 3, mapNode: 2, name: '分数利用', file: 'year2_3.vue' },
    { id: 4, mapNode: 3, name: '专业配方', file: 'year2_4.vue' },
    { id: 5, mapNode: 4, name: '行动点', file: 'year2_5.vue' },
    { id: 6, mapNode: 6, name: '案例侦探', file: 'year2_6.vue' },
    { id: 7, mapNode: 7, name: '终极考验', file: 'year2_7.vue' },
  ],
  y3: [
    { id: 1, mapNode: 1, name: '申请炼金', file: 'year3_1.vue' },
    { id: 2, mapNode: 2, name: '材料鉴定', file: 'year3_2.vue' },
    { id: 3, mapNode: 3, name: 'CV 急诊', file: 'year3_3.vue' },
    { id: 4, mapNode: 4, name: '文书连线', file: 'year3_4.vue' },
    { id: 5, mapNode: 5, name: '推荐信协同', file: 'year3_5.vue' },
    { id: 6, mapNode: 6, name: '冲刺修罗场', file: 'year3_6.vue' },
    { id: 7, mapNode: 7, name: 'DIY 排雷', file: 'year3_7.vue' },
  ],
}

export const LEVEL_DEFINITIONS = levelDefinitions

export const createInitialLevels = (year) => {
  return (levelDefinitions[year] || []).map((level, index) => ({
    ...level,
    unlocked: index === 0,
    completed: false,
    skipped: false,
  }))
}

export const getLevelDefinition = (year, levelId) => {
  return levelDefinitions[year]?.find((level) => level.id === levelId) ?? null
}
