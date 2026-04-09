<template>
  <GameLevelScaffold
    title="材料鉴定局 / Bureau of Material Roles"
    subtitle="CV、PS、RL 各有分工。你需要判断一句话该落在哪份材料里，而不是让三份材料互相重复。/ Classify each statement into CV, PS, or RL based on its real role."
    :guide="guide"
    tone="violet"
    :tags="['CV / PS / RL 分工 / Material roles', '内容归类 / Content classification']"
    status-label="当前进度 / Progress"
    :status-text="completed ? '分类完成 / Classification complete' : `${currentIndex} / ${database.length}`"
  >
    <section class="progress-card">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${(currentIndex / database.length) * 100}%` }"></div>
      </div>
      <p>玩法映射 / Game mechanic meaning: 印章代表你在决定“这段内容该放进哪份材料里”。CV 放客观事实，PS 放动机叙事，RL 放第三方评价。</p>
    </section>

    <section v-if="!completed" class="desk-card">
      <article class="parchment">
        <p>{{ currentEntry.textZh }}</p>
      </article>

      <div class="stamp-row">
        <button type="button" class="stamp cv" @click="stamp('cv')">
          <strong>CV</strong>
          <span>客观经历 / Objective facts</span>
        </button>
        <button type="button" class="stamp ps" @click="stamp('ps')">
          <strong>PS</strong>
          <span>动机叙事 / Motivation story</span>
        </button>
        <button type="button" class="stamp rl" @click="stamp('rl')">
          <strong>RL</strong>
          <span>第三方评价 / 3rd-party endorsement</span>
        </button>
      </div>
    </section>

    <section v-else class="summary-card">
      <h2>材料分工已掌握 / Material split mastered</h2>
      <p>你已经完成了这一步最关键的学习目标：同样是“亮点”，也要放在最合适的材料里。真实申请里，CV、PS、RL 重复堆砌同一内容，反而会削弱整体说服力。</p>
      <div class="actions">
        <button class="secondary" @click="restart">重新练习 / Restamp</button>
        <button class="primary" @click="completeLevel">保存分工理解 / Save Takeaway</button>
      </div>
    </section>

    <LevelResultDialog
      v-model="showError"
      tone="error"
      icon="🚫"
      title="放置错误 / Misplaced Material"
      :description="errorMessage"
      primary-text="重新盖章 / Restamp"
      @primary="showError = false"
    />
  </GameLevelScaffold>
</template>

<script setup>
import { computed, ref } from 'vue'
import GameLevelScaffold from '@/components/GameLevelScaffold.vue'
import LevelResultDialog from '@/components/LevelResultDialog.vue'
import { useLevelGuide } from '@/composables/useLevelGuide'

const emit = defineEmits(['complete'])
const { guide, rewardCoins } = useLevelGuide('y3', 2)

const database = [
  {
    textZh: '在 SAP 实习中，我重构了后端模块，使系统响应速度提升 25%。',
    target: 'cv',
    error: '这属于 CV，因为它是客观经历 + 量化结果。真实申请里，这种内容最适合放在简历中快速证明硬实力。',
  },
  {
    textZh: '一次大型技术实习中的挫败，让我意识到自己在分布式系统方面的知识瓶颈，并产生了继续深造的动机。',
    target: 'ps',
    error: '这更适合 PS，因为它讲的是转折、反思和深造动机，而不是一条客观履历。',
  },
  {
    textZh: '该学生在算法课程项目中展现出很强的领导力，总能在团队卡住时指出关键 bug。',
    target: 'rl',
    error: '这是一种典型推荐信语气。领导力和团队评价更适合由老师或导师以第三方身份来背书。',
  },
  {
    textZh: '熟练使用 Python、Java、C++，并具备 MySQL 数据库管理能力。',
    target: 'cv',
    error: '这是一份技能清单，最适合放在 CV。PS 需要叙事逻辑，不适合塞入纯技能罗列。',
  },
  {
    textZh: '我的长期目标是成长为能够独立领导企业级云计算架构的工程师。',
    target: 'ps',
    error: '这是未来方向与职业愿景，更适合放进 PS 解释“你为什么想去这个方向”。',
  },
  {
    textZh: '面对极端 deadline 时，她始终保持稳定情绪并高效产出，这一点给我留下了很深印象。',
    target: 'rl',
    error: '软技能评价最好来自第三方观察。你不能在 CV 里直接写“我抗压能力强”并指望它自然成立。',
  },
]

const currentIndex = ref(0)
const completed = ref(false)
const showError = ref(false)
const errorMessage = ref('')

const currentEntry = computed(() => database[currentIndex.value] || database[database.length - 1])

function stamp(type) {
  if (completed.value) return

  if (type === currentEntry.value.target) {
    if (currentIndex.value === database.length - 1) {
      completed.value = true
      return
    }

    currentIndex.value += 1
    return
  }

  errorMessage.value = currentEntry.value.error
  showError.value = true
}

function restart() {
  currentIndex.value = 0
  completed.value = false
}

function completeLevel() {
  emit('complete', {
    rewardCoins,
    preferences: {
      latestTakeaway: 'CV、PS、RL 的价值在于分工不同，而不是互相重复。/ CV, PS, and RL work best when they play different roles.',
    },
  })
}
</script>

<style scoped>
.progress-card,
.desk-card,
.summary-card {
  border-radius: 24px;
  background: rgba(17, 24, 39, 0.78);
  border: 1px solid rgba(216, 180, 254, 0.18);
  color: #e2e8f0;
  padding: 20px;
}

.progress-bar {
  height: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #fde047, #f59e0b);
}

.progress-card p,
.summary-card p {
  margin: 14px 0 0;
  line-height: 1.7;
}

.desk-card {
  display: grid;
  gap: 20px;
}

.parchment {
  background: #fdf6e3;
  color: #2c1a0e;
  padding: 40px 30px;
  border-radius: 8px;
  min-height: 260px;
  display: grid;
  place-items: center;
  font-size: 1.12rem;
  line-height: 1.8;
  font-family: Georgia, serif;
}

.stamp-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.stamp {
  min-height: 120px;
  border-radius: 22px;
  border: 2px solid transparent;
  background: linear-gradient(145deg, #1e1b4b, #0f0c20);
  color: #fff;
  cursor: pointer;
  display: grid;
  place-items: center;
  gap: 6px;
  padding: 12px;
  text-align: center;
}

.stamp.cv { border-color: rgba(56, 189, 248, 0.48); }
.stamp.ps { border-color: rgba(253, 224, 71, 0.48); }
.stamp.rl { border-color: rgba(216, 180, 254, 0.48); }

.stamp strong {
  font-size: 1.4rem;
}

.summary-card h2 {
  margin: 0;
  color: #f8fafc;
  font-family: Georgia, serif;
}

.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 18px;
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
  color: #f8fafc;
}

@media (max-width: 760px) {
  .stamp-row {
    grid-template-columns: 1fr;
  }
}
</style>
