// src/stores/game.js
import { defineStore } from 'pinia'
import api from '@/utils/api'

export const useGameStore = defineStore('game', {
  state: () => ({
    coins: 60,
    levels: [
      { id: 1, name: '建号生成', unlocked: true, completed: false, skipped: false, score: 0 },
      { id: 2, name: '地区探路', unlocked: false, completed: false, skipped: false, score: 0 },
      { id: 3, name: '分数利用', unlocked: false, completed: false, skipped: false, score: 0 },
      { id: 4, name: '专业配方', unlocked: false, completed: false, skipped: false, score: 0 },
      { id: 5, name: '行动点', unlocked: false, completed: false, skipped: false, score: 0 },
      { id: 6, name: '案例侦探', unlocked: false, completed: false, skipped: false, score: 0 },
      { id: 7, name: '终极考验', unlocked: false, completed: false, skipped: false, score: 0 },
    ],
  }),
  actions: {
    // 完成关卡
    completeLevel(levelId, rewardCoins = 20) {
      const level = this.levels.find(l => l.id === levelId)
      if (!level || level.completed) return

      level.completed = true
      level.score = rewardCoins
      this.coins += rewardCoins

      // 解锁下一关
      const nextLevel = this.levels.find(l => l.id === levelId + 1)
      if (nextLevel && !nextLevel.unlocked) {
        nextLevel.unlocked = true
      }
    },

    // 跳过关卡（无金币奖励）
    skipLevel(levelId) {
      const level = this.levels.find(l => l.id === levelId)
      if (!level || level.completed) return

      level.skipped = true

      const nextLevel = this.levels.find(l => l.id === levelId + 1)
      if (nextLevel && !nextLevel.unlocked) {
        nextLevel.unlocked = true
      }
    },
  },
  getters: {
    // 根据状态返回节点样式类
    nodeClass: (state) => (level) => {
      if (level.completed) return 'completed'
      if (level.skipped) return 'skipped'
      if (!level.unlocked) return 'locked'
      return ''
    },
  },
})