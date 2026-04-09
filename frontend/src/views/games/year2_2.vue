<template>
  <GameLevelScaffold
    title="地区罗盘 / Region Compass"
    subtitle="先比较主要留学路径，再决定你下一阶段真正要优先研究的地区。/ Compare the main study-abroad routes before you start collecting programs blindly."
    :guide="guide"
    tone="sky"
    :tags="['香港/新加坡/英国/美国/欧洲 / Route coverage', '路线优先级 / Route priority']"
    status-label="进度 / Progress"
    :status-text="finished ? '路线建议已生成 / Route recommendation ready' : `问题 ${questionIndex + 1} / ${questions.length}`"
  >
    <section class="route-grid">
      <article
        v-for="route in rankedRoutes"
        :key="route.id"
        class="route-card"
        :class="{ active: preferredRoute?.id === route.id }"
      >
        <div class="route-icon">{{ route.icon }}</div>
        <strong>{{ route.labelZh }} / {{ route.label }}</strong>
        <p>{{ route.summaryZh }}</p>
        <div class="score">共鸣值 / Resonance {{ route.score }}</div>
      </article>
    </section>

    <section v-if="!finished" class="panel">
      <div class="profile-note">
        <strong>当前申请画像 / Current applicant cue</strong>
        <span>{{ profileCue }}</span>
      </div>

      <div class="question-card">
        <p class="step">问题 / Question {{ questionIndex + 1 }}</p>
        <h2>{{ currentQuestion.promptZh }}</h2>
        <p>{{ currentQuestion.prompt }}</p>
        <div class="choice-list">
          <button
            v-for="choice in currentQuestion.choices"
            :key="choice.id"
            type="button"
            class="choice-btn"
            @click="answerQuestion(choice)"
          >
            <strong>{{ choice.titleZh }} / {{ choice.title }}</strong>
            <span>{{ choice.descZh }}</span>
          </button>
        </div>
      </div>
    </section>

    <section v-else class="panel result-panel">
      <div class="result-head">
        <div>
          <p class="step">结果 / Route Recommendation</p>
          <h2>{{ preferredRoute.labelZh }} / {{ preferredRoute.label }}</h2>
          <p>{{ preferredRoute.resultZh }}</p>
        </div>
        <div class="route-chip">{{ preferredRoute.shortZh }} / {{ preferredRoute.short }}</div>
      </div>

      <div class="result-grid">
        <article class="result-card">
          <strong>为什么匹配 / Why it fits</strong>
          <p>{{ preferredRoute.fitZh }}</p>
        </article>
        <article class="result-card">
          <strong>真实申请含义 / Real-world meaning</strong>
          <p>{{ preferredRoute.meaningZh }}</p>
        </article>
        <article class="result-card">
          <strong>下一步建议 / Next step</strong>
          <p>{{ preferredRoute.nextStepZh }}</p>
        </article>
      </div>

      <div class="ranking-box">
        <strong>路线排序 / Route ranking</strong>
        <ol>
          <li v-for="route in rankedRoutes" :key="route.id">
            {{ route.labelZh }} / {{ route.label }}: {{ route.score }} 分
          </li>
        </ol>
      </div>

      <div class="actions">
        <button class="secondary" @click="resetQuiz">重新比较 / Compare Again</button>
        <button class="primary" @click="completeLevel">锁定路线 / Save Route Priority</button>
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

const { guide, rewardCoins } = useLevelGuide('y2', 2)

const routeCatalog = {
  hk: {
    id: 'hk',
    icon: '🏙️',
    label: 'Hong Kong',
    labelZh: '中国香港',
    short: 'HK',
    shortZh: '港校',
    summaryZh: '学制短、节奏快、离国内更近，适合想兼顾效率与区域就业的人。',
    resultZh: '你更适合先把香港路线放在优先研究位。它通常重视效率、项目匹配度和现实可执行性。',
    fitZh: '你的答案更偏向“学制效率、离家距离、预算可控和亚洲就业联动”。',
    meaningZh: '现实里这意味着你接下来应该重点看香港一年制或短学制项目、语言要求和滚动录取节奏。',
    nextStepZh: '先整理香港院校清单，再比对录取门槛、申请轮次和就业去向。',
  },
  sg: {
    id: 'sg',
    icon: '🦁',
    label: 'Singapore',
    labelZh: '新加坡',
    short: 'SG',
    shortZh: '新国立/南洋',
    summaryZh: '项目精炼、学校数量少但集中度高，偏适合目标明确、希望亚洲高质量项目的人。',
    resultZh: '你的路线偏好更接近新加坡。它适合目标清晰、希望项目精炼且注重区域资源的人。',
    fitZh: '你更看重项目质量集中、城市安全和亚洲科研/就业衔接。',
    meaningZh: '现实中意味着你需要更早锁定少数重点项目，并且认真判断自己是否够得上较高竞争强度。',
    nextStepZh: '下一步优先核对 NUS/NTU 等项目的背景要求、先修课和竞争门槛。',
  },
  uk: {
    id: 'uk',
    icon: '🎓',
    label: 'United Kingdom',
    labelZh: '英国',
    short: 'UK',
    shortZh: '英联邦',
    summaryZh: '学制高效、项目丰富、选校空间大，适合希望快速完成硕士并做分层申请的人。',
    resultZh: '英国路线目前和你的答案最共振。它通常适合想快速完成硕士并做清晰选校分层的学生。',
    fitZh: '你更在意项目数量、学制效率和可操作的选校梯度。',
    meaningZh: '现实里要尽快做 reach / target / safety 分层，因为英国项目丰富但定位差异很大。',
    nextStepZh: '下一步把学校按分层整理，重点看 GPA 对应门槛和专业匹配要求。',
  },
  us: {
    id: 'us',
    icon: '🗽',
    label: 'United States',
    labelZh: '美国',
    short: 'US',
    shortZh: '美国',
    summaryZh: '项目类型多、培养弹性强、长期发展空间大，但申请准备通常更重、周期更长。',
    resultZh: '美国路线得分最高，说明你更愿意为更高的长期资源和更复杂的申请准备买单。',
    fitZh: '你的选择更偏向研究资源、长期职业发展、项目多样性和更高的自定义空间。',
    meaningZh: '现实中这意味着你需要提前准备科研/项目/实习、语言与材料节奏，并接受申请流程更长更细。',
    nextStepZh: '下一步先厘清你更偏研究型还是就业型，再倒推背景打造和时间线。',
  },
  eu: {
    id: 'eu',
    icon: '🌍',
    label: 'Europe / EU Mainland',
    labelZh: '欧洲大陆',
    short: 'EU',
    shortZh: '欧陆',
    summaryZh: '项目风格多元、费用结构有吸引力，适合愿意做信息搜集并接受体系差异的人。',
    resultZh: '你的答案和欧陆路线较匹配，说明你愿意为了成本、项目特色和国际体验做更多信息研究。',
    fitZh: '你对学费结构、城市多样性和项目特色更敏感，也能接受信息差更大的路线。',
    meaningZh: '现实中要特别重视项目官网、语言/签证要求和各国系统差异，不能只看综合排名。',
    nextStepZh: '下一步按国家或语言体系分组研究项目，重点核对学费、奖学金和课程设置。',
  },
}

const questions = [
  {
    id: 'goal',
    prompt: 'Which outcome matters most for your first route filter?',
    promptZh: '你做第一轮路线筛选时，最看重哪种结果？',
    choices: [
      { id: 'fast', title: 'Fast degree cycle', titleZh: '学制效率高', descZh: '希望尽快完成硕士并进入下一阶段。', weights: { hk: 3, uk: 3, sg: 2 } },
      { id: 'resource', title: 'Research depth and long runway', titleZh: '科研深度与长期发展', descZh: '愿意接受更长准备期来换更大平台。', weights: { us: 4, sg: 2, eu: 1 } },
      { id: 'value', title: 'Cost-effectiveness and mobility', titleZh: '成本与路径灵活性', descZh: '在预算和体验之间找平衡。', weights: { eu: 4, hk: 2, uk: 1 } },
    ],
  },
  {
    id: 'style',
    prompt: 'What application style feels most realistic for you now?',
    promptZh: '现阶段哪种申请风格对你来说最现实？',
    choices: [
      { id: 'focused', title: 'A small number of very focused targets', titleZh: '少量但重点很强的项目', descZh: '更愿意集中火力打少数高匹配项目。', weights: { sg: 4, us: 2 } },
      { id: 'layered', title: 'A wide list with clear tiering', titleZh: '项目数量多且适合做分层', descZh: '希望有更多院校区间可供分层申请。', weights: { uk: 4, hk: 2 } },
      { id: 'research-heavy', title: 'Information research across systems', titleZh: '愿意跨体系做大量调研', descZh: '能接受自己查很多制度与项目差异。', weights: { eu: 4, us: 1, hk: 1 } },
    ],
  },
  {
    id: 'distance',
    prompt: 'Which life factor matters more to you?',
    promptZh: '以下哪种生活因素对你更重要？',
    choices: [
      { id: 'near', title: 'Closer to home and Asia-based opportunity', titleZh: '更靠近国内与亚洲机会', descZh: '希望区域文化和就业联动更自然。', weights: { hk: 4, sg: 3 } },
      { id: 'global', title: 'Broader long-term global exposure', titleZh: '更看重全球长期发展空间', descZh: '愿意为更广的长期路径投入更多准备。', weights: { us: 4, eu: 2, uk: 1 } },
      { id: 'balanced', title: 'Somewhere in between', titleZh: '在两者之间找平衡', descZh: '兼顾国际体验和现实可执行性。', weights: { uk: 3, eu: 2, hk: 1 } },
    ],
  },
  {
    id: 'pressure',
    prompt: 'What kind of pressure are you more willing to manage?',
    promptZh: '你更愿意承担哪类申请压力？',
    choices: [
      { id: 'competition', title: 'Higher competition but stronger upside', titleZh: '竞争更强但上限更高', descZh: '能接受高强度准备与筛选。', weights: { us: 4, sg: 2 } },
      { id: 'timing', title: 'Tighter rhythm but clearer execution', titleZh: '节奏更紧但执行路径清晰', descZh: '更能接受时间压缩但任务明确。', weights: { hk: 3, uk: 3 } },
      { id: 'systems', title: 'Different rules across countries', titleZh: '各国规则差异更大', descZh: '愿意接受体系差异和信息搜集成本。', weights: { eu: 4, uk: 1 } },
    ],
  },
]

const questionIndex = ref(0)
const finished = ref(false)
const answers = ref([])
const scores = reactive(
  Object.keys(routeCatalog).reduce((accumulator, key) => {
    accumulator[key] = 0
    return accumulator
  }, {}),
)

const currentQuestion = computed(() => questions[questionIndex.value])

const rankedRoutes = computed(() => (
  Object.values(routeCatalog)
    .map((route) => ({
      ...route,
      score: scores[route.id],
    }))
    .sort((left, right) => right.score - left.score)
))

const preferredRoute = computed(() => rankedRoutes.value[0])

const profileCue = computed(() => {
  const traveler = store.travelerProfile
  if (!traveler) {
    return '还没有明确旅者画像，所以本关会先用常见申请偏好来判断。/ You have not locked a traveler profile yet, so the route logic uses broad preference cues.'
  }

  return `${traveler.name} · ${traveler.archetype} · ${traveler.familiar}。先根据你的目标与节奏判断适合优先研究的地区。 / ${traveler.name} is entering route planning from the lens of ${traveler.archetype}.`
})

function answerQuestion(choice) {
  Object.entries(choice.weights).forEach(([routeId, value]) => {
    scores[routeId] += value
  })

  answers.value.push({
    questionId: currentQuestion.value.id,
    answerId: choice.id,
    title: choice.title,
    titleZh: choice.titleZh,
  })

  if (questionIndex.value === questions.length - 1) {
    finished.value = true
    return
  }

  questionIndex.value += 1
}

function resetQuiz() {
  questionIndex.value = 0
  finished.value = false
  answers.value = []
  Object.keys(scores).forEach((routeId) => {
    scores[routeId] = 0
  })
}

function completeLevel() {
  emit('complete', {
    rewardCoins,
    preferences: {
      preferredRoute: {
        id: preferredRoute.value.id,
        label: preferredRoute.value.label,
        labelZh: preferredRoute.value.labelZh,
        short: preferredRoute.value.short,
        shortZh: preferredRoute.value.shortZh,
      },
      routeChoices: answers.value,
      latestTakeaway: `${preferredRoute.value.labelZh} 路线适合你的当前目标，但真正的价值在于：先选路径，再做项目与院校研究。/ ${preferredRoute.value.label} fits your current answers, and the key lesson is to choose route families before collecting programs.`,
    },
  })
}
</script>

<style scoped>
.route-grid,
.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
}

.route-card,
.panel,
.result-card,
.ranking-box,
.question-card,
.profile-note {
  border-radius: 22px;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.16);
  color: #e2e8f0;
}

.route-card {
  padding: 16px;
  display: grid;
  gap: 10px;
}

.route-card.active {
  border-color: rgba(251, 191, 36, 0.45);
  box-shadow: 0 20px 30px rgba(14, 165, 233, 0.14);
}

.route-icon {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.08);
  font-size: 1.6rem;
}

.route-card strong,
.question-card h2,
.result-head h2 {
  color: #f8fafc;
  font-family: Georgia, serif;
}

.score {
  color: #fcd34d;
  font-weight: 900;
}

.panel {
  padding: 22px;
  display: grid;
  gap: 16px;
}

.profile-note {
  padding: 14px 16px;
  display: grid;
  gap: 6px;
}

.question-card {
  padding: 20px;
}

.step {
  margin: 0 0 8px;
  color: #7dd3fc;
  font-weight: 900;
}

.choice-list {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

.choice-btn {
  width: 100%;
  text-align: left;
  padding: 16px 18px;
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(145deg, rgba(22, 34, 57, 0.96), rgba(16, 24, 39, 0.96));
  color: #e2e8f0;
  cursor: pointer;
}

.choice-btn strong {
  display: block;
  margin-bottom: 6px;
  color: #fde68a;
}

.choice-btn:hover {
  transform: translateY(-2px);
}

.result-panel {
  gap: 18px;
}

.result-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
}

.route-chip {
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(56, 189, 248, 0.14);
  color: #d9f5ff;
  font-weight: 900;
}

.result-card,
.ranking-box {
  padding: 16px;
}

.result-card strong,
.ranking-box strong {
  color: #fde68a;
}

.ranking-box ol {
  margin: 12px 0 0;
  padding-left: 18px;
  line-height: 1.8;
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
  background: linear-gradient(135deg, #f59e0b, #ef4444);
  color: #fff;
}

.secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
}

@media (max-width: 760px) {
  .result-head {
    flex-direction: column;
  }
}
</style>
