<template>
  <GameLevelScaffold
    title="行动点星盘 / Action Point Astrolabe"
    subtitle="10 点行动点代表你现实中的时间、精力与注意力。重点不是面面俱到，而是优先级判断。/ These 10 action points represent real time, energy, and attention."
    :guide="guide"
    tone="sky"
    :tags="['资源分配 / Resource allocation', '优先级判断 / Prioritization']"
    status-label="剩余行动点 / Remaining AP"
    :status-text="`${remainingPoints} / ${maxPoints}`"
  >
    <section v-if="validationMessage" class="validation-box">
      <i class="fas fa-triangle-exclamation"></i>
      <span>{{ validationMessage }}</span>
    </section>

    <section class="energy-card">
      <div class="energy-icon">⭐</div>
      <div>
        <strong>行动点 / Action Points</strong>
        <p>它们不是魔法值，而是你一个阶段真正能投入的现实资源。/ They stand for finite real-life effort.</p>
      </div>
      <div class="energy-count">{{ remainingPoints }}</div>
    </section>

    <section class="task-grid">
      <article
        v-for="task in tasks"
        :key="task.id"
        class="task-card"
        :class="{ active: allocations[task.id] > 0 }"
      >
        <div class="task-icon">{{ task.icon }}</div>
        <strong>{{ task.nameZh }}</strong>
        <span>{{ task.name }}</span>
        <p>{{ task.descZh }}</p>
        <div class="controls">
          <button type="button" @click="adjust(task.id, -1)">-</button>
          <span>{{ allocations[task.id] }}</span>
          <button type="button" @click="adjust(task.id, 1)">+</button>
        </div>
      </article>
    </section>

    <section class="actions">
      <button class="secondary" @click="resetPlan">重置分配 / Reset</button>
      <button class="primary" @click="evaluatePlan">生成分析 / Evaluate Plan</button>
    </section>

    <section v-if="analysis" class="analysis-panel">
      <div class="analysis-head">
        <h2>行动分析 / Personalized Action Guide</h2>
        <span>Top 3 priorities</span>
      </div>

      <div class="top-list">
        <article v-for="entry in topThree" :key="entry.id" class="top-item">
          <div class="task-icon">{{ entry.icon }}</div>
          <strong>{{ entry.nameZh }}</strong>
          <span>{{ entry.value }} 点</span>
        </article>
      </div>

      <div class="analysis-text">{{ analysis }}</div>

      <div class="actions">
        <button class="secondary" @click="resetPlan">重新分配 / Reallocate</button>
        <button class="primary" @click="completeLevel">锁定计划 / Commit Plan</button>
      </div>
    </section>
  </GameLevelScaffold>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import GameLevelScaffold from '@/components/GameLevelScaffold.vue'
import { useLevelGuide } from '@/composables/useLevelGuide'

const emit = defineEmits(['complete'])
const { guide, rewardCoins } = useLevelGuide('y2', 5)

const maxPoints = 10
const tasks = [
  { id: 'gpa', icon: '📜', nameZh: '刷课业', name: 'Boost GPA', descZh: '先守住学术底盘' },
  { id: 'lang', icon: '🗣️', nameZh: '语言备考', name: 'Language Prep', descZh: '处理语言门槛' },
  { id: 'proj', icon: '⚙️', nameZh: '项目打造', name: 'Projects', descZh: '做更能证明能力的项目' },
  { id: 'res', icon: '🔬', nameZh: '科研协作', name: 'Research', descZh: '积累学术型证据' },
  { id: 'int', icon: '💼', nameZh: '实习积累', name: 'Internship', descZh: '建立实践与职业证据' },
  { id: 'comp', icon: '🏆', nameZh: '竞赛训练', name: 'Competition', descZh: '补充强对抗型亮点' },
  { id: 'info', icon: '🔮', nameZh: '项目调研', name: 'Program Research', descZh: '做院校与项目信息搜集' },
  { id: 'net', icon: '🦉', nameZh: '联系沟通', name: 'Networking', descZh: '和老师/项目做沟通准备' },
]

const allocations = reactive(
  tasks.reduce((accumulator, task) => {
    accumulator[task.id] = 0
    return accumulator
  }, {}),
)

const validationMessage = ref('')
const analysis = ref('')

const spentPoints = computed(() => Object.values(allocations).reduce((sum, value) => sum + value, 0))
const remainingPoints = computed(() => maxPoints - spentPoints.value)
const topThree = computed(() => (
  tasks
    .map((task) => ({
      ...task,
      value: allocations[task.id],
    }))
    .sort((left, right) => right.value - left.value)
    .slice(0, 3)
))

function adjust(taskId, delta) {
  const nextValue = allocations[taskId] + delta
  if (delta > 0 && remainingPoints.value <= 0) return
  if (nextValue < 0) return
  if (nextValue > 5) {
    validationMessage.value = '单个维度最多投入 5 点 / You can spend at most 5 points on one category，因为过度偏科会让整体背景失衡。'
    return
  }

  validationMessage.value = ''
  allocations[taskId] = nextValue
}

function resetPlan() {
  tasks.forEach((task) => {
    allocations[task.id] = 0
  })
  validationMessage.value = ''
  analysis.value = ''
}

function evaluatePlan() {
  if (remainingPoints.value > 0) {
    validationMessage.value = `你还有 ${remainingPoints.value} 点行动点未分配 / You still have ${remainingPoints.value} AP left。请先把剩余精力分配完。`
    analysis.value = ''
    return
  }

  validationMessage.value = ''

  const hardSkills = allocations.gpa + allocations.proj + allocations.res + allocations.int
  const softInfo = allocations.info + allocations.net

  if (softInfo >= 4) {
    analysis.value = '⚠️ 你在“项目调研 / 联系沟通”上投入过多。对大多数理工/信息类申请来说，这些更像辅助动作，而不是核心竞争力本体。更好的策略是把更多点数转回 GPA、项目、实习这些硬证据建设。'
    return
  }

  if (allocations.int >= 3 && allocations.proj >= 2 && allocations.gpa >= 2) {
    analysis.value = '✨ 这是非常高 ROI 的组合：项目 + 实习 + GPA。它意味着你把主要资源投入到了真实申请里最能形成竞争力的地方，而不是只让自己看起来很忙。'
    return
  }

  if (allocations.res >= 4 && allocations.lang === 0) {
    analysis.value = '🤔 你把很多精力投向科研，却没有给语言门槛留下空间。现实后果是：即使背景亮眼，也可能因为语言没达标而被自动筛掉。'
    return
  }

  if (hardSkills < 4) {
    analysis.value = '⚠️ 你的计划里“硬证据”占比偏低。真实申请里，GPA、项目、实习、科研这些能直接支撑材料说服力的部分，通常不能长期缺位。'
    return
  }

  analysis.value = '⚖️ 你的分配比较均衡，没有明显硬伤，但还缺一个真正能拉开差距的重点项。更现实的优化方向是：在保证基础稳定的前提下，集中火力做一个更强的项目或实习亮点。'
}

function completeLevel() {
  emit('complete', {
    rewardCoins,
    preferences: {
      latestTakeaway: '行动点代表真实时间和精力，所以优先级判断比平均用力更重要。/ Action points represent real effort, so prioritization matters more than equal effort.',
    },
  })
}
</script>

<style scoped>
.validation-box,
.energy-card,
.task-card,
.analysis-panel {
  border-radius: 22px;
  border: 1px solid rgba(56, 189, 248, 0.18);
  background: rgba(15, 23, 42, 0.76);
  color: #e2e8f0;
}

.validation-box,
.analysis-panel,
.energy-card {
  padding: 16px 18px;
}

.validation-box {
  display: flex;
  gap: 10px;
  background: rgba(127, 29, 29, 0.24);
  border-color: rgba(248, 113, 113, 0.28);
  color: #fee2e2;
}

.energy-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 16px;
  align-items: center;
}

.energy-icon {
  font-size: 2rem;
}

.energy-card strong,
.analysis-head h2 {
  color: #f8fafc;
}

.energy-card p {
  margin: 4px 0 0;
  color: #bae6fd;
}

.energy-count {
  font-size: 2.1rem;
  font-weight: 900;
  color: #fde047;
}

.task-grid,
.top-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 14px;
}

.task-card {
  padding: 16px;
  display: grid;
  gap: 6px;
}

.task-card.active {
  border-color: rgba(253, 224, 71, 0.34);
  box-shadow: 0 20px 30px rgba(14, 165, 233, 0.12);
}

.task-card strong {
  color: #f8fafc;
}

.task-card p {
  margin: 4px 0 0;
  color: #94a3b8;
  line-height: 1.5;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  padding: 6px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.24);
}

.controls button {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: #334155;
  color: #fff;
  cursor: pointer;
  font-weight: 900;
}

.controls span {
  color: #fde047;
  font-weight: 900;
}

.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.actions button {
  border: none;
  border-radius: 999px;
  padding: 12px 18px;
  font-weight: 900;
  cursor: pointer;
}

.primary {
  background: linear-gradient(135deg, #0ea5e9, #3b82f6);
  color: #fff;
}

.secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
}

.analysis-panel {
  display: grid;
  gap: 16px;
}

.analysis-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.top-item {
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.05);
  display: grid;
  gap: 4px;
}

.analysis-text {
  padding: 16px;
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.24);
  line-height: 1.8;
  color: #dbeafe;
}

@media (max-width: 760px) {
  .energy-card {
    grid-template-columns: 1fr;
    text-align: center;
  }
}
</style>
