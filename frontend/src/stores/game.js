import { defineStore } from 'pinia'
import { createInitialLevels } from '@/config/levels'

const STORAGE_KEY = 'gradquest-vue-map-store'
const COIN_ECONOMY_VERSION = 2
const DEFAULT_LEVEL_REWARD = 30

const createYearState = (year, coins) => ({
  coins,
  currentNode: 1,
  levels: createInitialLevels(year),
})

const createDefaultState = () => ({
  year: 'y2',
  hydrated: false,
  travelerProfile: null,
  y2: createYearState('y2', 0),
  y3: createYearState('y3', 0),
})

function mergeLevels(defaultLevels, savedLevels) {
  if (!Array.isArray(savedLevels)) return defaultLevels

  return defaultLevels.map((level, index) => {
    const savedLevel = savedLevels.find((item) => item.id === level.id)
    if (!savedLevel) {
      return {
        ...level,
        unlocked: index === 0,
      }
    }

    return {
      ...level,
      unlocked: Boolean(savedLevel.unlocked || index === 0),
      completed: Boolean(savedLevel.completed),
      skipped: Boolean(savedLevel.skipped),
    }
  })
}

export const useGameStore = defineStore('game', {
  state: () => createDefaultState(),
  getters: {
    currentState: (state) => state[state.year],
    currentLevels() {
      return this.currentState.levels
    },
    currentCoins() {
      return this.y2.coins
    },
    travelerAvatar(state) {
      return state.travelerProfile?.avatar || {
        hairColor: '#3a2a25',
        outfitColor: '#ffd46d',
      }
    },
  },
  actions: {
    hydrate() {
      if (this.hydrated) return

      const defaults = createDefaultState()

      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
        if (!saved) {
          this.hydrated = true
          return
        }

        if (saved.year === 'y2' || saved.year === 'y3') {
          this.year = saved.year
        }

        this.travelerProfile = saved.travelerProfile || null

        const sharedCoins = saved.coinEconomyVersion === COIN_ECONOMY_VERSION && Number.isFinite(saved.coins)
          ? saved.coins
          : defaults.y2.coins

        ;['y2', 'y3'].forEach((year) => {
          const target = this[year]
          const fallback = defaults[year]
          const source = saved[year] || {}

          target.coins = sharedCoins
          target.currentNode = Number.isFinite(source.currentNode) ? source.currentNode : fallback.currentNode
          target.levels = mergeLevels(fallback.levels, source.levels)
        })
      } catch (error) {
        console.warn('Failed to hydrate GradQuest Vue store.', error)
      } finally {
        this.hydrated = true
      }
    },

    persist() {
      if (!this.hydrated) return

      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            year: this.year,
            coinEconomyVersion: COIN_ECONOMY_VERSION,
            coins: this.currentCoins,
            travelerProfile: this.travelerProfile,
            y2: this.y2,
            y3: this.y3,
          }),
        )
      } catch (error) {
        console.warn('Failed to persist GradQuest Vue store.', error)
      }
    },

    getLevel(year, levelId) {
      return this[year]?.levels.find((level) => level.id === levelId) ?? null
    },

    isNodeAccessible(year, levelId) {
      const level = this.getLevel(year, levelId)
      return Boolean(level?.unlocked || level?.completed || level?.skipped)
    },

    switchYear(year) {
      if (year !== 'y2' && year !== 'y3') return
      this.year = year
      this.persist()
    },

    setCurrentNode(year, levelId) {
      if (!this.getLevel(year, levelId)) return
      this[year].currentNode = levelId
      this.persist()
    },

    setTravelerProfile(profile) {
      this.travelerProfile = profile || null
      this.persist()
    },

    completeNode(year, levelId, options = {}) {
      const level = this.getLevel(year, levelId)
      if (!level) return

      const wasCompleted = level.completed
      const providedRewardCoins = Number(options.rewardCoins)
      const rewardCoins = Number.isFinite(providedRewardCoins) && providedRewardCoins > 0
        ? providedRewardCoins
        : DEFAULT_LEVEL_REWARD
      level.unlocked = true
      level.completed = true
      level.skipped = false
      this[year].currentNode = levelId

      if (!wasCompleted) {
        this.y2.coins += rewardCoins
      }
      this.y3.coins = this.y2.coins

      if (year === 'y2' && levelId === 1 && options.profile) {
        this.travelerProfile = options.profile
      }

      const nextLevel = this.getLevel(year, levelId + 1)
      if (nextLevel) {
        nextLevel.unlocked = true
      }

      this.persist()
    },

    completeLevel(levelId, rewardCoins = 50) {
      this.completeNode(this.year, levelId, { rewardCoins })
    },

    skipLevel(levelId) {
      const level = this.getLevel(this.year, levelId)
      if (!level || level.completed) return

      level.unlocked = true
      level.skipped = true
      this[this.year].currentNode = levelId

      const nextLevel = this.getLevel(this.year, levelId + 1)
      if (nextLevel) {
        nextLevel.unlocked = true
      }

      this.persist()
    },

    redeemCurrentCurrency(cost) {
      if (!Number.isFinite(cost) || cost <= 0) return false
      if (this.currentCoins < cost) return false

      this.y2.coins -= cost
      this.y3.coins = this.y2.coins
      this.persist()
      return true
    },

    resetStore() {
      const defaults = createDefaultState()

      this.year = defaults.year
      this.travelerProfile = defaults.travelerProfile
      this.y2 = defaults.y2
      this.y3 = defaults.y3
      this.hydrated = true

      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (error) {
        console.warn('Failed to clear GradQuest Vue store.', error)
      }
    },
  },
})