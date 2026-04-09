import { defineStore } from 'pinia'
import { createInitialLevels } from '@/config/levels'

const STORAGE_KEY = 'gradquest-vue-map-store'
const LEGACY_SHARED_COIN_ECONOMY_VERSION = 2
const DEFAULT_LEVEL_REWARD = 30

const createDefaultApplicationProfile = () => ({
  preferredRoute: null,
  routeChoices: [],
  schoolStrategy: '',
  latestTakeaway: '',
})

const createYearState = (year, coins) => ({
  coins,
  currentNode: 1,
  levels: createInitialLevels(year),
})

const createDefaultState = () => ({
  year: 'y2',
  hydrated: false,
  travelerProfile: null,
  applicationProfile: createDefaultApplicationProfile(),
  y2: createYearState('y2', 120),
  y3: createYearState('y3', 80),
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

function mergeApplicationProfile(defaultProfile, savedProfile) {
  if (!savedProfile || typeof savedProfile !== 'object') {
    return defaultProfile
  }

  const preferredRoute = savedProfile.preferredRoute && typeof savedProfile.preferredRoute === 'object'
    ? { ...savedProfile.preferredRoute }
    : null

  return {
    ...defaultProfile,
    ...savedProfile,
    preferredRoute,
    routeChoices: Array.isArray(savedProfile.routeChoices)
      ? savedProfile.routeChoices
        .filter((entry) => entry && typeof entry === 'object')
        .map((entry) => ({ ...entry }))
      : defaultProfile.routeChoices,
  }
}

export const useGameStore = defineStore('game', {
  state: () => createDefaultState(),
  getters: {
    currentState: (state) => state[state.year],
    currentLevels() {
      return this.currentState.levels
    },
    currentCoins() {
      return this.currentState.coins
    },
    currentCurrencyLabel(state) {
      return state.year === 'y2' ? 'Coins / 金币' : 'Gems / 宝石'
    },
    travelerAvatar(state) {
      return state.travelerProfile?.avatar || {
        hairColor: '#3a2a25',
        outfitColor: '#ffd46d',
      }
    },
    yearProgress: (state) => (year) => {
      const levels = state[year]?.levels || []
      const completed = levels.filter((level) => level.completed).length
      const cleared = levels.filter((level) => level.completed || level.skipped).length

      return {
        completed,
        cleared,
        total: levels.length,
        ratio: levels.length ? cleared / levels.length : 0,
      }
    },
    travelerStage(state) {
      const totalCleared = ['y2', 'y3']
        .flatMap((year) => state[year].levels)
        .filter((level) => level.completed || level.skipped)
        .length

      if (totalCleared >= 13) {
        return {
          title: 'Offer Archmage',
          titleZh: 'Offer 大法师',
          badge: 'Grand Finale',
          badgeZh: '终章完成者',
        }
      }

      if (totalCleared >= 9) {
        return {
          title: 'Application Strategist',
          titleZh: '申请战略师',
          badge: 'Execution Mode',
          badgeZh: '执行冲刺态',
        }
      }

      if (totalCleared >= 5) {
        return {
          title: 'Route Alchemist',
          titleZh: '路径炼金师',
          badge: 'Planning Stable',
          badgeZh: '规划已成型',
        }
      }

      if (totalCleared >= 2) {
        return {
          title: 'Pathfinder',
          titleZh: '路径探索者',
          badge: 'Direction Building',
          badgeZh: '方向构建中',
        }
      }

      return {
        title: 'Novice Traveler',
        titleZh: '新手旅者',
        badge: 'Starting Point',
        badgeZh: '起点阶段',
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
        this.applicationProfile = mergeApplicationProfile(
          defaults.applicationProfile,
          saved.applicationProfile,
        )

        const hasLegacySharedCoins = saved.coinEconomyVersion === LEGACY_SHARED_COIN_ECONOMY_VERSION
          && Number.isFinite(saved.coins)

        ;['y2', 'y3'].forEach((year) => {
          const target = this[year]
          const fallback = defaults[year]
          const source = saved[year] || {}

          target.coins = Number.isFinite(source.coins)
            ? source.coins
            : hasLegacySharedCoins
              ? saved.coins
              : fallback.coins
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
            travelerProfile: this.travelerProfile,
            applicationProfile: this.applicationProfile,
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

    setApplicationProfile(partialProfile) {
      if (!partialProfile || typeof partialProfile !== 'object') return

      this.applicationProfile = mergeApplicationProfile(
        {
          ...createDefaultApplicationProfile(),
          ...this.applicationProfile,
        },
        {
          ...this.applicationProfile,
          ...partialProfile,
        },
      )
      this.persist()
    },

    completeNode(year, levelId, options = {}) {
      const level = this.getLevel(year, levelId)
      if (!level) return

      const providedRewardCoins = Number(options.rewardCoins)
      const rewardCoins = Number.isFinite(providedRewardCoins) && providedRewardCoins > 0
        ? providedRewardCoins
        : DEFAULT_LEVEL_REWARD
      const wasCompleted = Boolean(level.completed || level.skipped)

      level.unlocked = true
      level.completed = true
      level.skipped = false
      this[year].currentNode = levelId

      if (!wasCompleted && rewardCoins > 0) {
        this[year].coins += rewardCoins
      }

      if (year === 'y2' && levelId === 1 && options.profile) {
        this.travelerProfile = options.profile
      }

      if (options.preferences) {
        this.applicationProfile = mergeApplicationProfile(
          {
            ...createDefaultApplicationProfile(),
            ...this.applicationProfile,
          },
          {
            ...this.applicationProfile,
            ...options.preferences,
          },
        )
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

      this[this.year].coins -= cost
      this.persist()
      return true
    },

    resetStore() {
      const defaults = createDefaultState()

      this.year = defaults.year
      this.travelerProfile = defaults.travelerProfile
      this.applicationProfile = defaults.applicationProfile
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
