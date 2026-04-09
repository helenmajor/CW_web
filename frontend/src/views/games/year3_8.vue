<template>
  <GameLevelScaffold
    title="星穹加冕厅 / Astral Coronation Hall"
    subtitle="终章不是为了庆祝“游戏打通”，而是为了回顾：你如何把大二规划与大三执行连成完整的申请路径。/ The finale reflects on how Year 2 planning and Year 3 execution connect."
    :guide="guide"
    tone="amber"
    :tags="['全程复盘 / Full journey review', '申请画像 / Planning profile']"
    status-label="最终称号 / Final Title"
    :status-text="`${store.travelerStage.titleZh} / ${store.travelerStage.title}`"
  >
    <section class="hall">
      <div class="sparkles">
        <span v-for="sparkle in sparkles" :key="sparkle.id" class="sparkle" :style="sparkle.style">✦</span>
      </div>

      <article class="certificate">
        <div class="cert-header">GradQuest Scroll of Reflection</div>
        <div class="cert-body">
          兹证明旅者 <span class="name">{{ displayName }}</span><br>
          已完成从 Year 2 规划构建到 Year 3 申请执行的完整训练，并获得称号：<br>
          <strong>{{ store.travelerStage.titleZh }} / {{ store.travelerStage.title }}</strong>
        </div>
        <div class="seal">GRADQUEST</div>
      </article>

      <div class="summary-grid">
        <article class="summary-card">
          <strong>路线偏好 / Route Priority</strong>
          <p>{{ preferredRoute }}</p>
        </article>
        <article class="summary-card">
          <strong>当前阶段 / Current Stage</strong>
          <p>{{ store.travelerStage.badgeZh }} / {{ store.travelerStage.badge }}</p>
        </article>
        <article class="summary-card">
          <strong>最近学习收获 / Latest Takeaway</strong>
          <p>{{ latestTakeaway }}</p>
        </article>
        <article class="summary-card">
          <strong>Year Progress / 年度进度</strong>
          <p>Year 2: {{ y2Progress.completed }}/{{ y2Progress.total }} | Year 3: {{ y3Progress.completed }}/{{ y3Progress.total }}</p>
        </article>
      </div>

      <div class="rewards">
        <div class="reward">🎫 精英项目策略咨询 / Strategy Ticket</div>
        <div class="reward">💬 推荐信沟通模板 / RL Communication Template</div>
        <div class="reward">🧭 路线判断画像 / Route Priority Profile</div>
        <div class="reward">📦 申请季复盘清单 / Application Review Checklist</div>
      </div>

      <div class="actions">
        <button class="secondary" @click="$emit('close')">继续回看地图 / Back to Map</button>
        <button class="primary" @click="completeLevel">完成终章记录 / Save Final Reflection</button>
      </div>
    </section>
  </GameLevelScaffold>
</template>

<script setup>
import { computed } from 'vue'
import GameLevelScaffold from '@/components/GameLevelScaffold.vue'
import { useGameStore } from '@/stores/game'
import { useLevelGuide } from '@/composables/useLevelGuide'

const emit = defineEmits(['complete', 'close'])
const store = useGameStore()
store.hydrate()

const { guide, rewardCoins } = useLevelGuide('y3', 8)

const sparkles = [
  { id: 1, style: { left: '8%', top: '12%', animationDelay: '0s' } },
  { id: 2, style: { left: '88%', top: '10%', animationDelay: '0.6s' } },
  { id: 3, style: { left: '18%', top: '58%', animationDelay: '1.2s' } },
  { id: 4, style: { left: '78%', top: '62%', animationDelay: '1.8s' } },
  { id: 5, style: { left: '50%', top: '8%', animationDelay: '2.4s' } },
]

const displayName = computed(() => store.travelerProfile?.name || 'Brave Traveler / 勇敢旅者')
const preferredRoute = computed(() => {
  const route = store.applicationProfile.preferredRoute
  return route ? `${route.labelZh} / ${route.label}` : '尚未固定 / Not fixed yet'
})
const latestTakeaway = computed(() => (
  store.applicationProfile.latestTakeaway || '你已经把路线判断、选校逻辑、材料分工与申请执行串成了完整链路。'
))
const y2Progress = computed(() => store.yearProgress('y2'))
const y3Progress = computed(() => store.yearProgress('y3'))

function completeLevel() {
  emit('complete', {
    rewardCoins,
    preferences: {
      latestTakeaway: '真正的终章奖励，是你已经能把规划、材料、执行和复盘连成完整申请路径。/ The real finale reward is a connected understanding of planning, materials, execution, and reflection.',
    },
  })
}
</script>

<style scoped>
.hall {
  position: relative;
  overflow: hidden;
  border-radius: 26px;
  padding: 28px;
  background: radial-gradient(circle at center, rgba(44, 30, 74, 0.92) 0%, rgba(13, 9, 20, 0.98) 100%);
  border: 1px solid rgba(253, 224, 71, 0.18);
  color: #fff;
}

.sparkles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.sparkle {
  position: absolute;
  color: rgba(253, 224, 71, 0.85);
  animation: float 3.2s infinite ease-in-out;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
  50% { transform: translateY(-10px) scale(1.18); opacity: 1; }
}

.certificate {
  position: relative;
  padding: 44px 36px;
  border-radius: 12px;
  background: linear-gradient(135deg, #fffcf2, #f5ecd5);
  color: #2c1e16;
  border: 6px double #c8a165;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.36);
}

.cert-header {
  font-size: 2rem;
  color: #8b5a2b;
  border-bottom: 2px solid #8b5a2b;
  padding-bottom: 12px;
  margin-bottom: 24px;
  font-family: Georgia, serif;
  text-transform: uppercase;
}

.cert-body {
  font-size: 1.2rem;
  line-height: 1.9;
  text-align: center;
}

.name {
  font-size: 1.9rem;
  color: #b22222;
  font-weight: 900;
}

.seal {
  position: absolute;
  right: 34px;
  bottom: 28px;
  width: 82px;
  height: 82px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #b22222;
  color: #fff;
  font-size: 0.82rem;
  font-weight: 900;
  transform: rotate(-12deg);
}

.summary-grid,
.rewards {
  display: grid;
  gap: 16px;
}

.summary-grid {
  margin-top: 24px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.summary-card,
.reward {
  border-radius: 18px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(253, 224, 71, 0.14);
}

.summary-card strong {
  color: #fde68a;
}

.summary-card p {
  margin: 8px 0 0;
  line-height: 1.7;
}

.rewards {
  margin-top: 20px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.reward {
  color: #fde68a;
  font-weight: 900;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 24px;
}

.actions button {
  border: none;
  border-radius: 999px;
  padding: 12px 18px;
  font-weight: 900;
  cursor: pointer;
}

.primary {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #fff;
}

.secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
</style>
