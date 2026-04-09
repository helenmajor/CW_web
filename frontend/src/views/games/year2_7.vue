<template>
  <GameLevelScaffold
    title="年终试炼 / Final Trial"
    subtitle="这一关不是考你会不会“玩”，而是确认你是否理解了大二阶段最关键的申请思维。/ This trial checks whether your Year 2 planning logic is stable enough."
    :guide="guide"
    tone="amber"
    :tags="['阶段总结 / Year 2 recap', '规划思维 / Planning mindset']"
    status-label="试炼阶段 / Trial Phase"
    :status-text="stageLabel"
  >
    <section v-if="stage === 'question'" class="trial-card">
      <h2>关键问题 / Core question</h2>
      <p>看过前面的路线、选校、背景和行动点之后，你认为 Year 2 最关键的申请心态是什么？</p>
      <button
        v-for="choice in choices"
        :key="choice.id"
        type="button"
        class="answer-btn"
        @click="checkAnswer(choice.correct)"
      >
        {{ choice.label }}
      </button>
      <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
    </section>

    <section v-else-if="stage === 'machine'" class="trial-card center">
      <h2>🎰 命运抽奖机 / Destiny Gacha</h2>
      <p>通关 Year 2 后，你获得的是“更清楚的规划能力”，而不是盲目的好运。点击抽奖机领取象征性奖励。</p>
      <button class="machine" :class="{ spinning }" @click="playGacha">🎰</button>
    </section>

    <section v-else class="ticket-card">
      <div class="ticket-title">GOLDEN TICKET</div>
      <div class="ticket-subtitle">Year 2 Planning Clear Voucher</div>
      <div class="reward-box">🎁 1-on-1 Elite Academy Prophecy Ticket / 一对一申请策略咨询券</div>
      <p>真正的奖励不是“抽到好运”，而是你已经学会：先定方向、再做分层、再补关键证据与行动计划。</p>
      <div class="actions">
        <button class="secondary" @click="restartTrial">重新试炼 / Retry</button>
        <button class="primary" @click="completeLevel">领取通关证明 / Claim Ticket</button>
      </div>
    </section>
  </GameLevelScaffold>
</template>

<script setup>
import { computed, ref } from 'vue'
import GameLevelScaffold from '@/components/GameLevelScaffold.vue'
import { useLevelGuide } from '@/composables/useLevelGuide'

const emit = defineEmits(['complete'])
const { guide, rewardCoins } = useLevelGuide('y2', 7)

const stage = ref('question')
const spinning = ref(false)
const errorMessage = ref('')

const choices = [
  { id: 'a', label: 'A. 盲目焦虑，跟着别人一起卷 / Blind anxiety and crowd-following', correct: false },
  { id: 'b', label: 'B. 尽早确定目标层级，并有策略地打造核心背景 / Define target tiers early and build core evidence strategically', correct: true },
  { id: 'c', label: 'C. 把一切拖到 Year 4 再说 / Postpone everything until Year 4', correct: false },
]

const stageLabel = computed(() => {
  if (stage.value === 'question') return '回答问题 / Answer the trial'
  if (stage.value === 'machine') return '领取象征奖励 / Claim symbolic reward'
  return '年终证明已生成 / Year 2 clear ticket ready'
})

function checkAnswer(isCorrect) {
  if (isCorrect) {
    errorMessage.value = ''
    stage.value = 'machine'
    return
  }

  errorMessage.value = '错误方向 / Not quite: 盲目焦虑和拖延都是申请规划的大敌。Year 2 的重点是提早判断方向，并主动建设核心竞争力。'
}

function playGacha() {
  if (spinning.value) return
  spinning.value = true
  window.setTimeout(() => {
    spinning.value = false
    stage.value = 'ticket'
  }, 1400)
}

function restartTrial() {
  stage.value = 'question'
  errorMessage.value = ''
}

function completeLevel() {
  emit('complete', {
    rewardCoins,
    preferences: {
      latestTakeaway: 'Year 2 的关键不是盲目刷经历，而是提早判断方向并有策略地打造核心背景。/ The key lesson of Year 2 is not blind activity, but strategic direction and profile building.',
    },
  })
}
</script>

<style scoped>
.trial-card,
.ticket-card {
  border-radius: 24px;
  background: rgba(16, 12, 29, 0.82);
  border: 1px solid rgba(249, 217, 118, 0.18);
  color: #f8fafc;
  padding: 24px;
}

.trial-card h2,
.ticket-title {
  margin: 0 0 12px;
  color: #f9d976;
  font-family: Georgia, serif;
}

.answer-btn {
  width: 100%;
  margin-top: 14px;
  border: 1px solid rgba(249, 217, 118, 0.45);
  border-radius: 16px;
  padding: 16px;
  background: transparent;
  color: #f8fafc;
  text-align: left;
  font-weight: 800;
  cursor: pointer;
}

.answer-btn:hover {
  background: rgba(249, 217, 118, 0.16);
}

.error-text {
  margin-top: 14px;
  color: #fca5a5;
  font-weight: 800;
}

.center {
  text-align: center;
}

.machine {
  margin-top: 18px;
  font-size: 5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  filter: drop-shadow(0 0 20px rgba(249, 217, 118, 0.45));
}

.machine.spinning {
  animation: spin 0.45s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(-12deg) scale(1.05); }
  50% { transform: rotate(12deg) scale(1.1); }
  100% { transform: rotate(-12deg) scale(1.05); }
}

.ticket-card {
  text-align: center;
}

.ticket-title {
  font-size: 2rem;
  letter-spacing: 0.08em;
}

.ticket-subtitle {
  font-weight: 900;
  color: #5c3a00;
  background: linear-gradient(135deg, #ffd700 0%, #fdb931 50%, #996515 100%);
  padding: 10px 16px;
  border-radius: 999px;
  display: inline-block;
}

.reward-box {
  margin: 20px auto;
  max-width: 520px;
  padding: 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.08);
  color: #fde68a;
  font-weight: 900;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 20px;
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
</style>
