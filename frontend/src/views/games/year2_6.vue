<template>
  <GameLevelScaffold
    title="禁忌档案室 / Forbidden Archives"
    subtitle="读案例不是为了机械复制，而是为了判断：这个结果为什么会发生，它对你意味着什么。/ Read cases critically instead of copying them blindly."
    :guide="guide"
    tone="amber"
    :tags="['案例复盘 / Case review', '结果校准 / Expectation calibration']"
    status-label="档案进度 / Archive Progress"
    :status-text="`${revealedCount} / ${cases.length}`"
  >
    <section class="archives">
      <article
        v-for="caseFile in cases"
        :key="caseFile.id"
        class="case-card"
        :class="{ revealed: caseFile.revealed }"
      >
        <div class="avatar">{{ caseFile.avatar }}</div>
        <div class="profile">
          <div><strong>专业 / Track</strong><span>{{ caseFile.track }}</span></div>
          <div><strong>GPA</strong><span>{{ caseFile.gpa }}</span></div>
          <div><strong>核心背景 / Core evidence</strong><span>{{ caseFile.artifacts }}</span></div>
        </div>

        <div v-if="!caseFile.revealed" class="choices">
          <button type="button" class="choice" @click="revealCase(caseFile.id, 'a')">{{ caseFile.optionA }}</button>
          <button type="button" class="choice" @click="revealCase(caseFile.id, 'b')">{{ caseFile.optionB }}</button>
        </div>

        <div v-else class="truth">
          <strong>{{ caseFile.truthTitle }}</strong>
          <p>{{ caseFile.truthBody }}</p>
        </div>
      </article>
    </section>

    <section v-if="revealedCount === cases.length" class="summary-box">
      <h2>案例启示 / Case Takeaway</h2>
      <p>案例的价值不是让你照抄，而是帮助你判断：哪些背景真的能改写结果，哪些只是看起来漂亮。/ The value of cases is not imitation, but understanding what really changes outcomes.</p>
      <div class="actions">
        <button class="secondary" @click="resetCases">重新查看 / Review Again</button>
        <button class="primary" @click="completeLevel">吸收经验 / Save Takeaway</button>
      </div>
    </section>
  </GameLevelScaffold>
</template>

<script setup>
import { computed, reactive } from 'vue'
import GameLevelScaffold from '@/components/GameLevelScaffold.vue'
import { useLevelGuide } from '@/composables/useLevelGuide'

const emit = defineEmits(['complete'])
const { guide, rewardCoins } = useLevelGuide('y2', 6)

const cases = reactive([
  {
    id: 1,
    avatar: '🧑‍💻',
    track: 'ICS / 计算机',
    gpa: '80/100（偏危险）',
    artifacts: 'SAP 实习 + 强 GitHub 项目',
    optionA: 'A. 直接沉入拒信深渊 / Rejection',
    optionB: 'B. 奇迹上岸 Top 50 / Miracle Top 50',
    truthTitle: '真相 / Truth: 奇迹上岸 Top 50',
    truthBody: '这里真正改变结果的是高质量实习和硬核项目，它们在一定程度上抵消了 GPA 的弱势。现实含义是：低 GPA 不是自动出局，但你必须有能支撑故事的强替代证据。',
    revealed: false,
  },
  {
    id: 2,
    avatar: '👩‍🎓',
    track: 'Data Science / 数据科学',
    gpa: '91/100（很强）',
    artifacts: '无实习、无科研',
    optionA: 'A. 横扫 Top 30 / Crush the Top 30',
    optionB: 'B. 结果并不理想 / Severe defeat',
    truthTitle: '真相 / Truth: 结果并不理想',
    truthBody: '高 GPA 本身很重要，但如果完全没有实践或科研支撑，理工与商科申请都可能显得“空”。现实含义是：成绩是底盘，不是全部。',
    revealed: false,
  },
])

const revealedCount = computed(() => cases.filter((caseFile) => caseFile.revealed).length)

function revealCase(id) {
  const target = cases.find((caseFile) => caseFile.id === id)
  if (!target) return
  target.revealed = true
}

function resetCases() {
  cases.forEach((caseFile) => {
    caseFile.revealed = false
  })
}

function completeLevel() {
  emit('complete', {
    rewardCoins,
    preferences: {
      latestTakeaway: '案例的作用是帮你理解背景与结果之间的因果，而不是照搬别人的路径。/ Cases help you understand causality between profile and outcomes, not copy someone else’s route.',
    },
  })
}
</script>

<style scoped>
.archives {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.case-card,
.summary-box {
  border-radius: 22px;
  background: rgba(20, 22, 24, 0.84);
  border: 1px solid rgba(200, 161, 101, 0.18);
  color: #e5e7eb;
}

.case-card {
  padding: 20px;
}

.case-card.revealed {
  border-color: rgba(34, 197, 94, 0.4);
  background: rgba(16, 32, 24, 0.84);
}

.avatar {
  font-size: 3rem;
  margin-bottom: 12px;
}

.profile {
  display: grid;
  gap: 10px;
}

.profile div {
  display: grid;
  gap: 4px;
}

.profile strong {
  color: #fcd34d;
}

.choices {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.choice {
  border: none;
  border-radius: 14px;
  padding: 12px 14px;
  background: #c8a165;
  color: #1e2022;
  font-weight: 900;
  cursor: pointer;
}

.truth {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid rgba(34, 197, 94, 0.28);
  line-height: 1.7;
}

.truth strong {
  color: #86efac;
}

.summary-box {
  padding: 20px;
}

.summary-box h2 {
  margin: 0 0 10px;
  color: #f8fafc;
  font-family: Georgia, serif;
}

.summary-box p {
  margin: 0;
  line-height: 1.7;
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
  background: linear-gradient(135deg, #22c55e, #15803d);
  color: #fff;
}

.secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #f8fafc;
}
</style>
