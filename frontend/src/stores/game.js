// src/stores/game.js
import { defineStore } from 'pinia'
import { createInitialLevels } from '@/config/levels'

export const useGameStore = defineStore('game', {
  state: () => ({
    year: 'y2',   // 当前显示的年份
    y2: {
      coins: 60,
      levels: createInitialLevels('y2')
    },
    y3: {
      coins: 80,
      levels: createInitialLevels('y3')
    }
  }),
  getters: {
    currentLevels: (state) => state[state.year].levels,
    currentCoins: (state) => state[state.year].coins,
    nodeClass: (state) => (level) => {
      if (level.completed) return 'completed'
      if (level.skipped) return 'skipped'
      if (!level.unlocked) return 'locked'
      return ''
    }
  },
  actions: {
    completeLevel(levelId, rewardCoins = 20) {
      const levels = this.currentLevels
      const level = levels.find(l => l.id === levelId)
      if (!level || level.completed) return
      level.completed = true
      this[this.year].coins += rewardCoins
      const nextLevel = levels.find(l => l.id === levelId + 1)
      if (nextLevel && !nextLevel.unlocked) nextLevel.unlocked = true
    },
    skipLevel(levelId) {
      const levels = this.currentLevels
      const level = levels.find(l => l.id === levelId)
      if (!level || level.completed) return
      level.skipped = true
      const nextLevel = levels.find(l => l.id === levelId + 1)
      if (nextLevel && !nextLevel.unlocked) nextLevel.unlocked = true
    },
    switchYear(year) {
      this.year = year
    }
  }
})
