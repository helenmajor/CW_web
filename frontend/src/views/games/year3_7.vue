<template>
  <GameLevelScaffold
    title="DIY 避坑沼泽 / DIY Risk Bog"
    subtitle="这里的每个陷阱都是真实 DIY 申请里常见的错误。你要判断它到底是致命、严重，还是影响印象。/ Classify each DIY mistake by real severity."
    :guide="guide"
    tone="emerald"
    :tags="['DIY 风险 / DIY risks', '错误分级 / Severity judgment']"
    status-label="净化进度 / Purification Progress"
    :status-text="completed ? '避坑完成 / Bog cleared' : `${currentIndex} / ${traps.length} | Shield ${hearts}`"
  >
    <section class="legend-box">
      <strong>判定标准 / Severity Guide</strong>
      <p><b>致命 / Fatal</b> = 可能直接出局；<b>严重 / Severe</b> = 容易导致延误或审核问题；<b>轻度 / Minor</b> = 不一定淘汰，但明显伤害专业印象。</p>
    </section>

    <section v-if="!completed" class="bog-card">
      <div class="mine-orb">
        <div class="warning">⚠️</div>
        <div class="mine-text">{{ currentTrap.textZh }}</div>
      </div>

      <div class="spell-grid">
        <button class="spell-btn fatal" @click="judge('fatal')">
          <strong>致命 / Fatal</strong>
          <span>可能直接被系统或门槛淘汰</span>
        </button>
        <button class="spell-btn severe" @click="judge('severe')">
          <strong>严重 / Severe</strong>
          <span>会造成延误、退回或大问题</span>
        </button>
        <button class="spell-btn minor" @click="judge('minor')">
          <strong>轻度 / Minor</strong>
          <span>主要伤害专业印象与细节体验</span>
        </button>
      </div>
    </section>

    <section v-else class="clear-card">
      <h2>避坑图鉴已更新 / DIY risk guide updated</h2>
      <p>你已经把常见 DIY 雷区按严重度分清了。真正的收获是：看到错误时，能马上判断它是“会不会直接出局”“会不会造成严重延误”“还是主要影响专业印象”。</p>
      <div class="actions">
        <button class="secondary" @click="restart">重新排雷 / Retry</button>
        <button class="primary" @click="completeLevel">保存避坑总结 / Save Risk Takeaway</button>
      </div>
    </section>

    <LevelResultDialog
      v-model="showDialog"
      :tone="dialogTone"
      :icon="dialogIcon"
      :title="dialogTitle"
      :description="dialogMessage"
      :primary-text="dialogPrimary"
      @primary="handleDialogPrimary"
    />
  </GameLevelScaffold>
</template>

<script setup>
import { computed, ref } from 'vue'
import GameLevelScaffold from '@/components/GameLevelScaffold.vue'
import LevelResultDialog from '@/components/LevelResultDialog.vue'
import { useLevelGuide } from '@/composables/useLevelGuide'

const emit = defineEmits(['complete'])
const { guide, rewardCoins } = useLevelGuide('y3', 7)

const traps = [
  {
    textZh: '错过正式申请 deadline',
    type: 'fatal',
    explanation: '大多数学校系统会在截止时间后直接关闭。现实中这是最典型的“直接出局”错误。',
  },
  {
    textZh: '推荐信缺少抬头纸和签名',
    type: 'severe',
    explanation: '这往往不会像错过 deadline 那样立即出局，但很可能导致材料被退回、审核延误，甚至错过更早轮次。',
  },
  {
    textZh: 'IELTS 单项分数比要求低 0.5',
    type: 'fatal',
    explanation: '对不少英国和香港项目来说，语言是硬门槛。单项没达标常常会触发自动筛选，属于致命问题。',
  },
  {
    textZh: '把所有文件都命名成 1.pdf',
    type: 'minor',
    explanation: '它不一定让你立刻出局，但会显著拉低专业感，也容易让招生官在处理材料时产生负面印象。',
  },
]

const currentIndex = ref(0)
const shield = ref(3)
const completed = ref(false)
const showDialog = ref(false)
const dialogTone = ref('success')
const dialogIcon = ref('✨')
const dialogTitle = ref('')
const dialogMessage = ref('')
const dialogPrimary = ref('继续 / Continue')
const pendingAction = ref('advance')

const currentTrap = computed(() => traps[currentIndex.value] || traps[traps.length - 1])
const hearts = computed(() => `${'❤️'.repeat(shield.value)}${'🖤'.repeat(3 - shield.value)}`)

function judge(type) {
  if (completed.value) return

  if (type === currentTrap.value.type) {
    dialogTone.value = 'success'
    dialogIcon.value = '🧭'
    dialogTitle.value = '判断正确 / Correct classification'
    dialogMessage.value = currentTrap.value.explanation
    dialogPrimary.value = currentIndex.value === traps.length - 1 ? '完成净化 / Finish Purge' : '继续排雷 / Continue'
    pendingAction.value = currentIndex.value === traps.length - 1 ? 'finish' : 'advance'
    showDialog.value = true
    return
  }

  shield.value = Math.max(0, shield.value - 1)
  dialogTone.value = 'error'
  dialogIcon.value = shield.value <= 0 ? '💀' : '⚠️'
  dialogTitle.value = shield.value <= 0 ? '护盾破碎 / Shield broken' : '分级错误 / Misjudged severity'
  dialogMessage.value = `更合理的判断是：${severityLabel(currentTrap.value.type)}。${currentTrap.value.explanation}`
  dialogPrimary.value = shield.value <= 0 ? '重新开始 / Retry Trial' : '再判断一次 / Try Again'
  pendingAction.value = shield.value <= 0 ? 'restart' : 'retry'
  showDialog.value = true
}

function severityLabel(type) {
  if (type === 'fatal') return '致命 / Fatal'
  if (type === 'severe') return '严重 / Severe'
  return '轻度 / Minor'
}

function handleDialogPrimary() {
  showDialog.value = false

  if (pendingAction.value === 'advance') {
    currentIndex.value += 1
    return
  }

  if (pendingAction.value === 'finish') {
    completed.value = true
    return
  }

  if (pendingAction.value === 'restart') {
    restart()
  }
}

function restart() {
  currentIndex.value = 0
  shield.value = 3
  completed.value = false
}

function completeLevel() {
  emit('complete', {
    rewardCoins,
    preferences: {
      latestTakeaway: 'DIY 申请里最重要的能力之一，是看到错误就能判断它到底会造成多大真实后果。/ One of the most useful DIY skills is judging the real severity of each mistake.',
    },
  })
}
</script>

<style scoped>
.legend-box,
.bog-card,
.clear-card {
  border-radius: 24px;
  background: rgba(15, 23, 42, 0.78);
  border: 1px solid rgba(52, 211, 153, 0.22);
  color: #f8fafc;
  padding: 20px;
}

.legend-box p,
.clear-card p {
  margin: 10px 0 0;
  line-height: 1.8;
}

.bog-card {
  display: grid;
  gap: 22px;
}

.mine-orb {
  min-height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 40%, #1e293b, #0f172a);
  border: 2px solid #475569;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 30px;
}

.warning {
  font-size: 2.5rem;
}

.mine-text {
  font-size: 1.25rem;
  font-weight: 900;
  line-height: 1.6;
}

.spell-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
}

.spell-btn {
  border: 2px solid transparent;
  border-radius: 18px;
  padding: 16px;
  background: #1e293b;
  color: #fff;
  cursor: pointer;
  text-align: left;
  display: grid;
  gap: 6px;
}

.spell-btn.fatal:hover { border-color: #ef4444; }
.spell-btn.severe:hover { border-color: #f59e0b; }
.spell-btn.minor:hover { border-color: #3b82f6; }

.clear-card h2 {
  margin: 0;
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
  background: linear-gradient(135deg, #34d399, #10b981);
  color: #022c22;
}

.secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
</style>
