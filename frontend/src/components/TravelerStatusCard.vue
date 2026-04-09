<template>
  <section class="status-card">
    <div class="status-top">
      <div class="avatar-wrap" :style="avatarStyle">
        <div class="avatar-glow"></div>
        <div class="avatar">
          <div class="hair"></div>
          <div class="face"></div>
          <div class="robe"></div>
        </div>
      </div>

      <div class="identity-copy">
        <p class="eyebrow">旅者状态 / Traveler Status</p>
        <h2>{{ displayName }}</h2>
        <p class="stage-title">{{ stage.titleZh }} / {{ stage.title }}</p>
        <div class="badge-row">
          <span class="badge">{{ stage.badgeZh }} / {{ stage.badge }}</span>
          <span v-if="applicationProfile.preferredRoute" class="badge accent">
            {{ applicationProfile.preferredRoute.labelZh }} / {{ applicationProfile.preferredRoute.label }}
          </span>
        </div>
      </div>
    </div>

    <div class="detail-grid">
      <article class="detail-item">
        <p class="item-label">当前画像 / Current profile</p>
        <p>{{ travelerProfile?.archetype || '待定义 / Unassigned' }}</p>
      </article>
      <article class="detail-item">
        <p class="item-label">代表工具 / Familiar tool</p>
        <p>{{ travelerProfile?.familiar || '待定义 / Unassigned' }}</p>
      </article>
      <article class="detail-item">
        <p class="item-label">路线偏好 / Route preference</p>
        <p>{{ routeSummary }}</p>
      </article>
      <article class="detail-item">
        <p class="item-label">最近收获 / Latest takeaway</p>
        <p>{{ applicationProfile.latestTakeaway || '继续完成节点，系统会逐步记录你的申请判断。/ Complete more nodes to build your planning memory.' }}</p>
      </article>
    </div>

    <div class="progress-stack">
      <div v-for="item in progress" :key="item.year" class="progress-item">
        <div class="progress-head">
          <strong>{{ item.label }}</strong>
          <span>{{ item.cleared }} / {{ item.total }}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: `${Math.round(item.ratio * 100)}%` }"></div>
        </div>
      </div>
    </div>

    <p class="footnote">
      已完成或跳过的节点可以重新打开复习。/ Cleared or skipped nodes can be reopened for review.
    </p>
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  travelerProfile: {
    type: Object,
    default: null,
  },
  applicationProfile: {
    type: Object,
    default: () => ({}),
  },
  stage: {
    type: Object,
    required: true,
  },
  progress: {
    type: Array,
    default: () => [],
  },
})

const displayName = computed(() => props.travelerProfile?.name || '未命名旅者 / Unnamed traveler')

const routeSummary = computed(() => {
  if (props.applicationProfile.preferredRoute) {
    const route = props.applicationProfile.preferredRoute
    return `${route.labelZh} / ${route.label}`
  }

  return '尚未确认 / Not decided yet'
})

const avatarStyle = computed(() => ({
  '--hair': props.travelerProfile?.avatar?.hairColor || '#3a2a25',
  '--outfit': props.travelerProfile?.avatar?.outfitColor || '#ffd46d',
}))
</script>

<style scoped>
.status-card {
  border-radius: 28px;
  padding: 22px;
  background: linear-gradient(145deg, rgba(12, 20, 38, 0.94), rgba(23, 31, 49, 0.92));
  border: 1px solid rgba(243, 207, 154, 0.2);
  box-shadow: 0 18px 34px rgba(0, 0, 0, 0.28);
  color: #eff6ff;
}

.status-top {
  display: flex;
  gap: 18px;
  align-items: center;
}

.avatar-wrap {
  position: relative;
  width: 118px;
  height: 118px;
  border-radius: 24px;
  background: radial-gradient(circle at top, rgba(255, 255, 255, 0.12), rgba(15, 23, 42, 0.85));
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.avatar-glow {
  position: absolute;
  inset: 12px;
  border-radius: 18px;
  background: radial-gradient(circle, rgba(255, 214, 102, 0.18), transparent 72%);
}

.avatar {
  position: relative;
  width: 72px;
  height: 88px;
}

.hair,
.face,
.robe {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  border: 3px solid #273640;
}

.hair {
  top: 6px;
  width: 52px;
  height: 24px;
  background: var(--hair);
  border-bottom: none;
  border-radius: 20px 20px 10px 10px;
  z-index: 3;
}

.face {
  top: 12px;
  width: 46px;
  height: 42px;
  background: #ffe8c7;
  border-radius: 50% 50% 44% 44%;
  z-index: 2;
}

.robe {
  bottom: 8px;
  width: 44px;
  height: 36px;
  background: var(--outfit);
  border-radius: 16px 16px 10px 10px;
}

.eyebrow,
.item-label {
  margin: 0 0 6px;
  color: #f8d48d;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.identity-copy h2 {
  margin: 0;
  font-size: 1.35rem;
  color: #fff7ed;
}

.stage-title {
  margin: 8px 0 0;
  color: #dbeafe;
  font-weight: 700;
}

.badge-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.badge {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 0.8rem;
  font-weight: 800;
}

.badge.accent {
  background: rgba(56, 189, 248, 0.14);
  border-color: rgba(56, 189, 248, 0.22);
}

.detail-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.detail-item {
  padding: 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.detail-item p:last-child {
  margin: 0;
  line-height: 1.55;
  color: #dbe7ff;
}

.progress-stack {
  margin-top: 18px;
  display: grid;
  gap: 12px;
}

.progress-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
  font-size: 0.92rem;
  color: #e2e8f0;
}

.progress-track {
  width: 100%;
  height: 10px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.2);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #f59e0b, #fde68a);
}

.footnote {
  margin: 16px 0 0;
  color: #cbd5e1;
  font-size: 0.88rem;
}

@media (max-width: 720px) {
  .status-top,
  .detail-grid {
    grid-template-columns: 1fr;
    display: grid;
  }

  .status-top {
    justify-items: start;
  }
}
</style>
