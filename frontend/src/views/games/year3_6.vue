<template>
  <GameLevelScaffold
    title="申请季暗堡 / The Dark Citadel"
    subtitle="每一扇门都对应申请季中的真实任务。你不是在打怪，而是在练习压力下的策略选择。/ Each gate represents a real application-season task."
    :guide="guide"
    tone="sky"
    :tags="['申请季策略 / Application-season strategy', '任务优先级 / Pressure decisions']"
    status-label="城堡进度 / Citadel Progress"
    :status-text="`${clearedCount} / ${stages.length} gates cleared`"
  >
    <section class="hud-grid">
      <article class="hud-card"><strong>Cleared / 已完成</strong><span>{{ clearedCount }} / {{ stages.length }}</span></article>
      <article class="hud-card"><strong>Artifacts / 宝石</strong><span>{{ session.gems }}</span></article>
      <article class="hud-card"><strong>Level / 等级</strong><span>{{ session.level }}</span></article>
      <article class="hud-card"><strong>Iced Americanos / 冰美式</strong><span>{{ session.potions }}</span></article>
    </section>

    <section class="mapping-box">
      <strong>技能映射 / Skill Mapping</strong>
      <p><b>外教精修斩</b> = 高强度文书精修；<b>套磁护盾</b> = 主动联系与风险缓冲；<b>冰美式</b> = 恢复与续航；<b>清单冲刺</b> = 快速推进明确任务。</p>
    </section>

    <section class="gate-grid">
      <article
        v-for="stage in stages"
        :key="stage.id"
        class="gate-card"
        :class="{ locked: !isUnlocked(stage.id), cleared: session.cleared[stage.id] }"
      >
        <div class="gate-head">
          <h2>{{ stage.titleZh }}</h2>
          <span>{{ stage.month }}</span>
        </div>
        <p>{{ stage.subtitleZh }}</p>
        <div class="gate-meta">
          <span>Enemy / 挑战：{{ stage.enemyName }}</span>
          <span>Reward / 奖励：{{ stage.reward }}</span>
        </div>
        <div class="actions">
          <button
            class="primary"
            :disabled="!isUnlocked(stage.id)"
            @click="openStage(stage.id)"
          >
            {{ session.cleared[stage.id] ? '重打复习 / Replay' : '开始执行 / Engage' }}
          </button>
        </div>
        <small v-if="!isUnlocked(stage.id)">先完成前一扇门 / Finish the previous gate first</small>
      </article>
    </section>

    <section v-if="currentStage" class="battle-card">
      <div class="battle-head">
        <div>
          <h2>{{ currentStage.titleZh }} / {{ currentStage.title }}</h2>
          <p>{{ currentStage.challengeZh }}</p>
        </div>
        <button class="secondary" @click="closeStage">回城复盘 / Retreat</button>
      </div>

      <div v-if="battle.phase === 'battle'" class="battle-grid">
        <article class="stat-panel">
          <h3>Traveler / 旅者</h3>
          <p>HP {{ battle.heroHp }} / {{ battle.heroMax }}</p>
          <p v-if="battle.shield">🛡️ 套磁护盾已开启 / Shield active</p>
        </article>
        <article class="stat-panel enemy">
          <h3>{{ currentStage.enemyName }}</h3>
          <p>HP {{ battle.enemyHp }} / {{ battle.enemyMax }}</p>
          <p>{{ currentStage.realMeaningZh }}</p>
        </article>
      </div>

      <div v-if="battle.phase === 'battle'" class="skill-grid">
        <button class="skill-btn" :disabled="battle.skillUses.slash <= 0 || battle.pending" @click="useSkill('slash')">
          <strong>外教精修斩 / Proofreader's Slash</strong>
          <span>重击文书问题，适合关键回合。PP {{ battle.skillUses.slash }}</span>
        </button>
        <button class="skill-btn" :disabled="battle.skillUses.shield <= 0 || battle.pending" @click="useSkill('shield')">
          <strong>套磁护盾 / Cold Email Shield</strong>
          <span>吸收下一个高压回合的大部分伤害。PP {{ battle.skillUses.shield }}</span>
        </button>
        <button class="skill-btn" :disabled="session.potions <= 0 || battle.pending" @click="useSkill('americano')">
          <strong>冰美式 / Iced Americano</strong>
          <span>恢复执行力，不是偷懒而是续航。库存 {{ session.potions }}</span>
        </button>
        <button class="skill-btn" :disabled="battle.skillUses.sprint <= 0 || battle.pending" @click="useSkill('sprint')">
          <strong>清单冲刺 / Checklist Sprint</strong>
          <span>推进明确任务，适合收尾。PP {{ battle.skillUses.sprint }}</span>
        </button>
      </div>

      <div class="log-panel">
        <strong>战斗日志 / Strategy Log</strong>
        <ul>
          <li v-for="entry in battle.log" :key="entry">{{ entry }}</li>
        </ul>
      </div>

      <div v-if="battle.phase === 'won'" class="settlement success">
        <h3>月度关卡完成 / Stage Cleared</h3>
        <p>{{ battle.summary }}</p>
        <div class="actions">
          <button class="secondary" @click="closeStage">返回城堡 / Return to Citadel</button>
          <button v-if="allCleared" class="primary" @click="showSanctuary = true">开启 Offer 圣殿 / Open Sanctuary</button>
        </div>
      </div>

      <div v-if="battle.phase === 'lost'" class="settlement error">
        <h3>本轮策略失败 / Strategy Review Needed</h3>
        <p>{{ battle.summary }}</p>
        <div class="actions">
          <button class="secondary" @click="openStage(currentStage.id)">重试本关 / Retry</button>
          <button class="primary" @click="closeStage">先回城复盘 / Return to Citadel</button>
        </div>
      </div>
    </section>

    <section v-if="showSanctuary && allCleared" class="sanctuary-card">
      <h2>Offer 圣殿已开启 / Sanctuary Opened</h2>
      <p>你已经练完申请季最核心的三类动作：处理语言门槛、在压力下打磨文书，以及在最后阶段稳住提交执行。</p>
      <div class="summary-list">
        <div>宝石 / Artifacts: {{ session.gems }}</div>
        <div>等级 / Level: {{ session.level }}</div>
        <div>称号 / Title: 时间调度师 / Master of Timing</div>
      </div>
      <div class="actions">
        <button class="secondary" @click="showSanctuary = false">继续复盘 / Keep Reviewing</button>
        <button class="primary" @click="completeLevel">保存申请季总结 / Save Battle Takeaway</button>
      </div>
    </section>
  </GameLevelScaffold>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import GameLevelScaffold from '@/components/GameLevelScaffold.vue'
import { useLevelGuide } from '@/composables/useLevelGuide'

const emit = defineEmits(['complete'])
const { guide, rewardCoins } = useLevelGuide('y3', 6)

const stages = [
  {
    id: 0,
    month: 'September / 9月',
    title: 'Language Gate',
    titleZh: '语言之门',
    subtitleZh: '语言门槛与考试节奏',
    challengeZh: '模拟你在语言成绩和时间压力之间做取舍。',
    enemyName: 'Threshold Wyrm / 门槛飞龙',
    realMeaningZh: '它代表硬性的语言门槛，拖延会直接让申请出局。',
    enemyHp: 96,
    enemyAtk: 18,
    reward: '+1 Artifact / 1 枚宝石',
  },
  {
    id: 1,
    month: 'October / 10月',
    title: 'Essay Gate',
    titleZh: '文书之门',
    subtitleZh: '高压下的文书精修',
    challengeZh: '模拟你在反复修改与截止压力之间做策略选择。',
    enemyName: 'Draft Chimera / 草稿奇美拉',
    realMeaningZh: '它代表文书质量波动、逻辑混乱与反复返工。',
    enemyHp: 112,
    enemyAtk: 20,
    reward: '+1 Artifact / 1 枚宝石',
  },
  {
    id: 2,
    month: 'November / 11月',
    title: 'Submission Gate',
    titleZh: '提交之门',
    subtitleZh: '提交清单与最终执行',
    challengeZh: '模拟你在 deadline 前核对材料并完成提交。',
    enemyName: 'DDL Titan / 截止巨像',
    realMeaningZh: '它代表网申最后阶段的混乱与执行失误。',
    enemyHp: 126,
    enemyAtk: 22,
    reward: '+1 Artifact / 1 枚宝石',
  },
]

const session = reactive({
  level: 1,
  gems: 0,
  potions: 4,
  cleared: [false, false, false],
})

const battle = reactive({
  phase: 'idle',
  heroHp: 0,
  heroMax: 0,
  enemyHp: 0,
  enemyMax: 0,
  shield: false,
  pending: false,
  skillUses: {
    slash: 2,
    shield: 2,
    sprint: 3,
  },
  log: [],
  summary: '',
})

const activeStageId = ref(null)
const showSanctuary = ref(false)

const currentStage = computed(() => stages.find((stage) => stage.id === activeStageId.value) || null)
const clearedCount = computed(() => session.cleared.filter(Boolean).length)
const allCleared = computed(() => session.cleared.every(Boolean))

function isUnlocked(id) {
  return id === 0 || session.cleared[id - 1]
}

function openStage(id) {
  if (!isUnlocked(id)) return
  activeStageId.value = id
  showSanctuary.value = false

  const stage = stages[id]
  battle.phase = 'battle'
  battle.heroMax = 120 + (session.level - 1) * 18
  battle.heroHp = battle.heroMax
  battle.enemyMax = stage.enemyHp
  battle.enemyHp = stage.enemyHp
  battle.shield = false
  battle.pending = false
  battle.skillUses = { slash: 2, shield: 2, sprint: 3 }
  battle.log = [`${stage.titleZh} 开始：${stage.challengeZh}`]
  battle.summary = ''
}

function closeStage() {
  activeStageId.value = null
  battle.phase = 'idle'
}

function addLog(message) {
  battle.log = [message, ...battle.log].slice(0, 6)
}

function useSkill(skill) {
  if (battle.phase !== 'battle' || battle.pending || !currentStage.value) return
  battle.pending = true

  if (skill === 'slash' && battle.skillUses.slash > 0) {
    battle.skillUses.slash -= 1
    const damage = 34 + session.level * 8
    battle.enemyHp = Math.max(0, battle.enemyHp - damage)
    addLog(`外教精修斩命中，说明你在关键回合投入高强度文书打磨，造成 ${damage} 点推进。`)
  } else if (skill === 'shield' && battle.skillUses.shield > 0) {
    battle.skillUses.shield -= 1
    battle.shield = true
    addLog('套磁护盾展开：主动联系与沟通开始为你吸收后续风险。')
  } else if (skill === 'americano' && session.potions > 0) {
    session.potions -= 1
    const heal = 32 + session.level * 10
    battle.heroHp = Math.min(battle.heroMax, battle.heroHp + heal)
    addLog(`冰美式恢复 ${heal} 点执行力。现实里，恢复节奏也是策略的一部分。`)
  } else if (skill === 'sprint' && battle.skillUses.sprint > 0) {
    battle.skillUses.sprint -= 1
    const damage = 24 + session.level * 6
    battle.enemyHp = Math.max(0, battle.enemyHp - damage)
    addLog(`清单冲刺推进了明确任务，造成 ${damage} 点收尾效率。`)
  }

  if (battle.enemyHp <= 0) {
    settleWin()
    return
  }

  window.setTimeout(enemyTurn, 260)
}

function enemyTurn() {
  if (!currentStage.value) return

  let damage = currentStage.value.enemyAtk + session.level * 2
  if (battle.shield) {
    damage = Math.floor(damage * 0.3)
    battle.shield = false
    addLog('套磁护盾吸收了大部分压力冲击。')
  }

  battle.heroHp = Math.max(0, battle.heroHp - damage)
  addLog(`${currentStage.value.enemyName} 反扑，造成 ${damage} 点压力伤害。`)

  if (battle.heroHp <= 0) {
    settleLoss()
    return
  }

  battle.pending = false
}

function settleWin() {
  if (!currentStage.value) return

  const firstClear = !session.cleared[currentStage.value.id]
  if (firstClear) {
    session.cleared[currentStage.value.id] = true
    session.gems += 1
    session.level += 1
    session.potions += 1
  }

  battle.phase = 'won'
  battle.pending = false
  battle.summary = firstClear
    ? '你第一次清掉了这扇门，对应的是你学会了处理一种真实申请压力，并获得 1 枚宝石、1 级成长和 1 杯新的冰美式。'
    : '这次是复盘战，不会重复发奖励，但你仍然可以用它回顾策略分配。'
}

function settleLoss() {
  battle.phase = 'lost'
  battle.pending = false
  battle.summary = '你被 deadline 和压力击穿了，但这更像一次策略复盘：关键回合优先用精修或防御，不要把所有资源都留到最后。'
}

function completeLevel() {
  emit('complete', {
    rewardCoins,
    preferences: {
      latestTakeaway: '申请季战斗的本质，是在语言、文书、提交和恢复之间做策略分配。/ The real lesson of application season is strategic trade-off between language, essays, submission, and recovery.',
    },
  })
}
</script>

<style scoped>
.hud-grid,
.gate-grid,
.skill-grid,
.summary-list {
  display: grid;
  gap: 14px;
}

.hud-grid {
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
}

.hud-card,
.mapping-box,
.gate-card,
.battle-card,
.log-panel,
.sanctuary-card {
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(8, 12, 24, 0.86);
  color: #f8fafc;
  padding: 18px;
}

.hud-card strong,
.mapping-box strong,
.battle-head h2,
.sanctuary-card h2 {
  color: #fcd34d;
}

.hud-card span {
  display: block;
  margin-top: 6px;
  font-size: 1.5rem;
  font-weight: 900;
}

.mapping-box p,
.gate-card p,
.settlement p,
.sanctuary-card p {
  margin: 10px 0 0;
  line-height: 1.8;
}

.gate-grid {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.gate-card.locked {
  opacity: 0.65;
}

.gate-card.cleared {
  border-color: rgba(34, 197, 94, 0.36);
}

.gate-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.gate-head h2 {
  margin: 0;
  font-size: 1.15rem;
  font-family: Georgia, serif;
}

.gate-meta {
  margin-top: 14px;
  display: grid;
  gap: 6px;
  color: #cbd5e1;
}

.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.actions button,
.skill-btn {
  border: none;
  border-radius: 999px;
  padding: 12px 18px;
  font-weight: 900;
  cursor: pointer;
}

.primary {
  background: linear-gradient(135deg, #e8d29b, #ba944e);
  color: #2c2110;
}

.primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #f8fafc;
}

.battle-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
}

.battle-grid,
.skill-grid {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.battle-grid {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.stat-panel {
  padding: 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
}

.stat-panel.enemy {
  border: 1px solid rgba(239, 68, 68, 0.26);
}

.stat-panel h3 {
  margin: 0 0 10px;
}

.stat-panel p {
  margin: 6px 0 0;
  line-height: 1.6;
}

.skill-grid {
  display: grid;
  margin-top: 18px;
}

.skill-btn {
  text-align: left;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.06);
  color: #f8fafc;
  display: grid;
  gap: 6px;
}

.skill-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.log-panel {
  margin-top: 18px;
}

.log-panel ul {
  margin: 12px 0 0;
  padding-left: 18px;
  line-height: 1.7;
}

.settlement {
  margin-top: 18px;
  padding: 18px;
  border-radius: 22px;
}

.settlement.success {
  background: rgba(17, 55, 38, 0.72);
  border: 1px solid rgba(34, 197, 94, 0.28);
}

.settlement.error {
  background: rgba(62, 22, 25, 0.72);
  border: 1px solid rgba(239, 68, 68, 0.28);
}

.settlement h3 {
  margin: 0;
}

.sanctuary-card {
  background: linear-gradient(160deg, rgba(34, 26, 12, 0.92) 0%, rgba(10, 14, 24, 0.96) 100%);
}

.summary-list {
  margin-top: 16px;
}

.summary-list div {
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
}
</style>
