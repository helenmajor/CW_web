// src/stores/game.js
import { defineStore } from 'pinia'
import api from '@/utils/api'

export const useGameStore = defineStore('game', {
  state: () => ({
    year: 'y2',   // 当前显示的年份
    y2: {
      coins: 60,
      levels: [
        { id: 1, name: '建号生成', unlocked: true, completed: false, skipped: false },
        { id: 2, name: '地区探路', unlocked: false, completed: false, skipped: false },
        { id: 3, name: '分数利用', unlocked: false, completed: false, skipped: false },
        { id: 4, name: '专业配方', unlocked: false, completed: false, skipped: false },
        { id: 5, name: '行动点', unlocked: false, completed: false, skipped: false },
        { id: 6, name: '案例侦探', unlocked: false, completed: false, skipped: false },
        { id: 7, name: '终极考验', unlocked: false, completed: false, skipped: false }
      ]
    },
    y3: {
      coins: 80,
      levels: [
        { id: 1, name: '目标校准', unlocked: true, completed: false, skipped: false },
        { id: 2, name: 'GPA / 语言', unlocked: false, completed: false, skipped: false },
        { id: 3, name: '项目补强', unlocked: false, completed: false, skipped: false },
        { id: 4, name: '选校分层', unlocked: false, completed: false, skipped: false },
        { id: 5, name: '文书主线', unlocked: false, completed: false, skipped: false },
        { id: 6, name: '推荐信协同', unlocked: false, completed: false, skipped: false },
        { id: 7, name: '网申递交', unlocked: false, completed: false, skipped: false },
        { id: 8, name: '面试 / Offer', unlocked: false, completed: false, skipped: false }
      ]
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