<template>
  <GameLevelScaffold
    title="选校天平 / School Tiering"
    subtitle="把学校放进 Reach、Match、Safety，不是在机械排序，而是在练真实申请名单的风险控制。/ Reach-target-safety tiering is risk management, not ranking worship."
    :guide="guide"
    tone="violet"
    :tags="['风险分布 / Risk distribution', '选校分层 / Tier planning']"
    status-label="完成度 / Completion"
    :status-text="`${assignedCount} / ${schools.length} 所学校已分层 / schools placed`"
  >
    <section class="profile-box">
      <strong>当前路线提示 / Current route cue</strong>
      <span>{{ profileCue }}</span>
    </section>

    <section v-if="validationMessage" class="validation-box">
      <i class="fas fa-triangle-exclamation"></i>
      <span>{{ validationMessage }}</span>
    </section>

    <section class="school-grid">
      <article v-for="school in schools" :key="school.id" class="school-card">
        <div class="school-head">
          <div class="icon">{{ school.icon }}</div>
          <div>
            <h2>{{ school.name }}</h2>
            <p>{{ school.tag }}</p>
          </div>
        </div>
        <div class="tier-actions">
          <button
            v-for="tier in tiers"
            :key="tier.id"
            type="button"
            class="tier-btn"
            :class="[tier.id, { active: assignments[school.id] === tier.id }]"
            @click="assignments[school.id] = tier.id"
          >
            {{ tier.labelZh }} / {{ tier.label }}
          </button>
        </div>
      </article>
    </section>

    <section class="panel">
      <div class="legend">
        <div><strong>Reach / 冲刺</strong><span>高风险但值得冲一冲</span></div>
        <div><strong>Match / 主申</strong><span>更接近现实主申区间</span></div>
        <div><strong>Safety / 保底</strong><span>用于兜底，不等于“随便选”</span></div>
      </div>
      <div class="actions">
        <button class="secondary" @click="resetAssignments">重新分层 / Reset</button>
        <button class="primary" @click="evaluatePlan">提交分层 / Evaluate Tier Plan</button>
      </div>
    </section>

    <section v-if="feedbackItems.length" class="feedback-panel">
      <div class="feedback-head">
        <h2>分层反馈 / Tier Feedback</h2>
        <span>+{{ rewardPreview }} 金币 / learning reward</span>
      </div>

      <article
        v-for="item in feedbackItems"
        :key="item.title"
        class="feedback-item"
        :class="item.tone"
      >
        <strong>{{ item.title }}</strong>
        <p>{{ item.body }}</p>
      </article>

      <div class="actions">
        <button class="secondary" @click="resetAssignments">重新练习 / Rework Plan</button>
        <button class="primary" @click="completeLevel">锁定分层 / Save Tier Plan</button>
      </div>
    </section>
  </GameLevelScaffold>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import GameLevelScaffold from '@/components/GameLevelScaffold.vue'
import { useGameStore } from '@/stores/game'
import { useLevelGuide } from '@/composables/useLevelGuide'

const emit = defineEmits(['complete'])
const store = useGameStore()
store.hydrate()

const { guide, rewardCoins } = useLevelGuide('y2', 3)

const schools = [
  { id: 'ic', name: 'Imperial College', tag: 'QS Top 10', icon: '👑' },
  { id: 'ucl', name: 'UCL', tag: 'QS Top 10', icon: '🏛️' },
  { id: 'kcl', name: "King's College", tag: 'QS Top 40', icon: '🦁' },
  { id: 'soton', name: 'Southampton', tag: 'QS Top 80', icon: '⚓' },
  { id: 'cardiff', name: 'Cardiff', tag: 'QS 150+', icon: '🐉' },
]

const tiers = [
  { id: 'reach', label: 'Reach', labelZh: '冲刺' },
  { id: 'match', label: 'Match', labelZh: '主申' },
  { id: 'safety', label: 'Safety', labelZh: '保底' },
]

const assignments = reactive(
  schools.reduce((accumulator, school) => {
    accumulator[school.id] = ''
    return accumulator
  }, {}),
)

const validationMessage = ref('')
const feedbackItems = ref([])
const rewardPreview = ref(rewardCoins)

const assignedCount = computed(() => Object.values(assignments).filter(Boolean).length)

const profileCue = computed(() => {
  const route = store.applicationProfile.preferredRoute
  if (!route) {
    return '默认示例画像：GPA 82/100，STEM/CS 方向，1 段普通实习。先学习分层逻辑，再把它迁移到你自己的背景。/ Default sample profile: GPA 82/100, STEM/CS direction, one ordinary internship.'
  }

  return `你上一关偏向 ${route.labelZh} / ${route.label} 路线，但无论去哪个地区，都需要 reach / match / safety 结构来分散风险。`
})

function resetAssignments() {
  validationMessage.value = ''
  feedbackItems.value = []
  schools.forEach((school) => {
    assignments[school.id] = ''
  })
}

function evaluatePlan() {
  if (assignedCount.value < schools.length) {
    validationMessage.value = '你还没有完成院校分层 / You have not finished the school tiering yet。请先给每所学校一个 Reach、Match 或 Safety 位置。'
    feedbackItems.value = []
    return
  }

  validationMessage.value = ''
  const reaches = schools.filter((school) => assignments[school.id] === 'reach').map((school) => school.id)
  const matches = schools.filter((school) => assignments[school.id] === 'match').map((school) => school.id)
  const safeties = schools.filter((school) => assignments[school.id] === 'safety').map((school) => school.id)
  const items = []
  let points = rewardCoins
  let allPerfect = true

  if (matches.includes('ic') || safeties.includes('ic')) {
    items.push({
      tone: 'error',
      title: 'Imperial 不应被当成主申或保底 / Imperial is not a target or safety here',
      body: '对这个示例背景来说，Imperial 更接近高风险冲刺。把它放低会制造虚假的安全感，现实里容易导致名单整体风险判断失真。',
    })
    points -= 10
    allPerfect = false
  }

  if (matches.includes('ucl') || safeties.includes('ucl')) {
    items.push({
      tone: 'error',
      title: 'UCL 也更接近 Reach / UCL is closer to Reach',
      body: '对 GPA 82 的工科/计算机背景来说，UCL 往往不是稳定主申。若把它当作主申或保底，你会高估自己的稳妥选项。',
    })
    points -= 10
    allPerfect = false
  } else if (reaches.includes('ucl')) {
    items.push({
      tone: 'success',
      title: 'UCL 放在 Reach 更合理 / UCL as Reach makes sense',
      body: '这说明你理解了高竞争项目应被放在冲刺层，主申和保底要留给更现实的学校。',
    })
  }

  if (reaches.includes('kcl') || reaches.includes('soton')) {
    items.push({
      tone: 'warning',
      title: '主申被抬得太高 / You lifted some target schools too high',
      body: 'KCL 或 Southampton 放进 Reach 说明你过度保守，现实里会压缩你真正向上探索的空间。',
    })
    points -= 10
    allPerfect = false
  } else if (safeties.includes('kcl')) {
    items.push({
      tone: 'error',
      title: 'KCL 不是真保底 / KCL is not a true safety',
      body: '把 KCL 当保底会让名单过于脆弱。若竞争强度波动，你的“保底”可能根本不稳。',
    })
    allPerfect = false
  }

  if (reaches.includes('cardiff') || matches.includes('cardiff')) {
    items.push({
      tone: 'warning',
      title: 'Cardiff 更适合保底 / Cardiff should stabilize the list',
      body: '保底学校的真实作用是兜底，而不是继续承担风险。把 Cardiff 放太高会削弱名单的缓冲能力。',
    })
    points -= 10
    allPerfect = false
  } else if (safeties.includes('cardiff')) {
    items.push({
      tone: 'success',
      title: '保底层有效 / Safety layer is doing its job',
      body: '这类学校让名单拥有真实落点，避免所有希望都压在高风险项目上。',
    })
  }

  if (items.length === 0) {
    items.push({
      tone: 'warning',
      title: '结构还需要更清晰 / The structure still needs sharpening',
      body: '继续问自己：哪些是高风险冲刺、哪些是主申、哪些是真正兜底。分层的重点是概率和风险，而不是单纯看排名。',
    })
  }

  if (allPerfect) {
    items.push({
      tone: 'success',
      title: '整体策略健康 / Balanced list',
      body: '你的名单已经更接近真实可用的申请结构：有上探空间，也有主申密度和保底缓冲。',
    })
  }

  feedbackItems.value = items
  rewardPreview.value = Math.max(10, points)
}

function completeLevel() {
  emit('complete', {
    rewardCoins: rewardPreview.value,
    preferences: {
      schoolStrategy: '使用 reach / match / safety 结构做选校分层。/ Use reach-match-safety logic to distribute school risk.',
      latestTakeaway: '选校不是把学校按排名排队，而是在做风险分布。/ School tiering is risk distribution, not just ranking worship.',
    },
  })
}
</script>

<style scoped>
.profile-box,
.panel,
.feedback-panel,
.validation-box,
.school-card,
.feedback-item {
  border-radius: 22px;
  background: rgba(15, 23, 42, 0.74);
  border: 1px solid rgba(148, 163, 184, 0.16);
  color: #e2e8f0;
}

.profile-box,
.panel,
.feedback-panel,
.validation-box {
  padding: 16px 18px;
}

.profile-box {
  display: grid;
  gap: 6px;
}

.validation-box {
  display: flex;
  gap: 10px;
  color: #fee2e2;
  border-color: rgba(248, 113, 113, 0.28);
  background: rgba(127, 29, 29, 0.24);
}

.school-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 14px;
}

.school-card {
  padding: 18px;
  display: grid;
  gap: 16px;
}

.school-head {
  display: flex;
  gap: 12px;
  align-items: center;
}

.school-head .icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  font-size: 1.5rem;
  background: rgba(255, 255, 255, 0.08);
}

.school-head h2 {
  margin: 0;
  font-size: 1rem;
  color: #f8fafc;
}

.school-head p {
  margin: 4px 0 0;
  color: #94a3b8;
}

.tier-actions {
  display: grid;
  gap: 10px;
}

.tier-btn {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 10px 12px;
  background: rgba(15, 23, 42, 0.72);
  color: #e2e8f0;
  font-weight: 800;
  cursor: pointer;
}

.tier-btn.active.reach {
  background: rgba(239, 68, 68, 0.18);
  border-color: rgba(239, 68, 68, 0.4);
}

.tier-btn.active.match {
  background: rgba(59, 130, 246, 0.18);
  border-color: rgba(59, 130, 246, 0.4);
}

.tier-btn.active.safety {
  background: rgba(16, 185, 129, 0.18);
  border-color: rgba(16, 185, 129, 0.4);
}

.legend {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.legend div {
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  display: grid;
  gap: 4px;
}

.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.actions button {
  border: none;
  border-radius: 999px;
  padding: 12px 18px;
  font-weight: 900;
  cursor: pointer;
}

.primary {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: #fff;
}

.secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
}

.feedback-panel {
  display: grid;
  gap: 14px;
}

.feedback-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #f8fafc;
}

.feedback-item {
  padding: 16px;
}

.feedback-item.success {
  border-left: 4px solid #22c55e;
}

.feedback-item.warning {
  border-left: 4px solid #f59e0b;
}

.feedback-item.error {
  border-left: 4px solid #ef4444;
}

.feedback-item strong {
  display: block;
  margin-bottom: 6px;
  color: #f8fafc;
}
</style>
