const levelDefinitions = {
  y2: [
    { id: 1, mapNode: 1, name: 'Identity Forge', title: 'Y2-1: Identity Forge', file: 'year2_1.vue', sharedFile: 'year2_1.html', engine: 'vue' },
    { id: 2, mapNode: 2, name: 'Region Choice', title: 'Y2-2: Region Choice', file: 'year2_2.vue', sharedFile: 'year2_2.html', engine: 'vue' },
    { id: 3, mapNode: 3, name: 'Tier Mapping', title: 'Y2-3: Tier Mapping', file: 'year2_3.vue', sharedFile: 'year2_3.html', engine: 'vue' },
    { id: 4, mapNode: 4, name: 'Senior Cases', title: 'Y2-4: Senior Case Archives', file: 'year2_4.vue', sharedFile: 'year2_4.html', engine: 'vue' },
    { id: 5, mapNode: 5, name: 'Action Plan', title: 'Y2-5: Action Plan', file: 'year2_5.vue', sharedFile: 'year2_5.html', engine: 'vue' },
    { id: 6, mapNode: 6, name: 'Contract Guardian', title: 'Y2-6: Contract Guardian', file: 'year2_6.vue', sharedFile: 'year2_6.html', engine: 'vue' },
    { id: 7, mapNode: 7, name: 'Final Trial', title: 'Y2-7: Final Trial', file: 'year2_7.vue', sharedFile: 'year2_7.html', engine: 'vue' },
  ],
  y3: [
    { id: 1, mapNode: 1, name: 'Timeline', title: 'Y3-1: Crucible of Truth', file: 'year3_1.vue', sharedFile: 'year3_1.html', engine: 'vue' },
    { id: 2, mapNode: 2, name: 'Material Types', title: 'Y3-2: Bureau of Magic', file: 'year3_2.vue', sharedFile: 'year3_2.html', engine: 'vue' },
    { id: 3, mapNode: 3, name: 'CV Surgery', title: 'Y3-3: Clinic of Truth', file: 'year3_3.vue', sharedFile: 'year3_3.html', engine: 'vue' },
    { id: 4, mapNode: 4, name: 'PS Weaving', title: 'Y3-4: Constellation of Memories', file: 'year3_4.vue', sharedFile: 'year3_4.html', engine: 'vue' },
    { id: 5, mapNode: 5, name: 'Recommendation', title: 'Y3-5: Tsundere Mentor', file: 'year3_5.vue', sharedFile: 'year3_5.html', engine: 'vue' },
    { id: 6, mapNode: 6, name: 'Exam Combat', title: 'Y3-6: The Dark Citadel', file: 'year3_6.vue', sharedFile: 'year3_6.html', engine: 'vue' },
    { id: 7, mapNode: 7, name: 'Evade Traps', title: 'Y3-7: DIY Bog Sweeper', file: 'year3_7.vue', sharedFile: 'year3_7.html', engine: 'vue' },
    { id: 8, mapNode: 8, name: 'Coronation', title: 'Y3-8: The Astral Coronation Hall', file: 'year3_8.vue', sharedFile: 'year3_8.html', engine: 'vue' },
  ],
}

export const LEVEL_DEFINITIONS = levelDefinitions

export const createInitialLevels = (year) => (
  (levelDefinitions[year] || []).map((level, index) => ({
    ...level,
    unlocked: index === 0,
    completed: false,
    skipped: false,
  }))
)

export const getLevelDefinition = (year, levelId) => (
  levelDefinitions[year]?.find((level) => level.id === levelId) ?? null
)