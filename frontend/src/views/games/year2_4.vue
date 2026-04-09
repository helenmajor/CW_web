<template>
  <GameLevelScaffold
    title="专业配方坩埚 / Major Recipe Lab"
    subtitle="资源有限，所以你要学会为不同专业方向挑出最有说服力的 3 个核心证据。/ With limited resources, choose the three strongest ingredients for each major direction."
    :guide="guide"
    tone="amber"
    :tags="['背景匹配 / Profile fit', '专业方向 / Major alignment']"
    status-label="坩埚状态 / Cauldron"
    :status-text="`${selectedIngredients.length} / 3 个核心配方 / core ingredients chosen`"
  >
    <section class="major-tabs">
      <button
        v-for="major in majors"
        :key="major.id"
        type="button"
        class="major-btn"
        :class="{ active: currentMajor === major.id }"
        @click="switchMajor(major.id)"
      >
        {{ major.labelZh }} / {{ major.label }}
      </button>
    </section>

    <section class="workspace">
      <div class="ingredient-grid">
        <button
          v-for="ingredient in ingredients"
          :key="ingredient.id"
          type="button"
          class="ingredient-card"
          :class="{ active: selectedIngredients.includes(ingredient.id) }"
          @click="toggleIngredient(ingredient.id)"
        >
          <span class="icon">{{ ingredient.icon }}</span>
          <strong>{{ ingredient.nameZh }}</strong>
          <span>{{ ingredient.name }}</span>
        </button>
      </div>

      <div class="cauldron-card">
        <p class="label">当前投入 / Current brew</p>
        <div class="brew-list">
          <span v-for="ingredientId in selectedIngredients" :key="ingredientId" class="brew-pill">
            {{ ingredientName(ingredientId) }}
          </span>
          <span v-if="!selectedIngredients.length" class="empty">请选择 3 个最关键的背景证据 / Pick 3 core ingredients</span>
        </div>
        <p class="tip">玩法映射 / Game mechanic meaning: 每个“材料”都代表真实背景证据，重点不是堆满，而是挑出最能证明你适合该方向的组合。</p>
        <div class="actions">
          <button class="secondary" @click="selectedIngredients = []">重置配方 / Reset</button>
          <button class="primary" @click="evaluateRecipe">点燃坩埚 / Evaluate Recipe</button>
        </div>
      </div>
    </section>

    <section v-if="result" class="result-card" :class="result.tone">
      <h2>{{ result.title }}</h2>
      <p>{{ result.body }}</p>
      <div class="takeaway">{{ result.explanation }}</div>
      <div class="actions">
        <button class="secondary" @click="selectedIngredients = []">重新尝试 / Try Again</button>
        <button v-if="result.success" class="primary" @click="completeLevel">锁定方向 / Save Major Direction</button>
      </div>
    </section>
  </GameLevelScaffold>
</template>

<script setup>
import { ref } from 'vue'
import GameLevelScaffold from '@/components/GameLevelScaffold.vue'
import { useLevelGuide } from '@/composables/useLevelGuide'

const emit = defineEmits(['complete'])
const { guide, rewardCoins } = useLevelGuide('y2', 4)

const majors = [
  { id: 'cs', label: 'STEM / CS', labelZh: '理工 / 计算机' },
  { id: 'business', label: 'Business', labelZh: '商科 / 金融' },
  { id: 'arts', label: 'Arts & Design', labelZh: '艺术 / 设计' },
]

const ingredients = [
  { id: 'gpa', icon: '📜', name: 'High GPA', nameZh: '高 GPA' },
  { id: 'lang', icon: '🗣️', name: 'IELTS / TOEFL', nameZh: '语言成绩' },
  { id: 'gre', icon: '🐉', name: 'GRE / GMAT', nameZh: 'GRE / GMAT' },
  { id: 'research', icon: '🔬', name: 'Research', nameZh: '科研经历' },
  { id: 'intern', icon: '💼', name: 'Internship', nameZh: '实习经历' },
  { id: 'contest', icon: '🏅', name: 'Competition', nameZh: '竞赛成果' },
  { id: 'portfolio', icon: '🔮', name: 'Portfolio', nameZh: '作品集' },
  { id: 'exchange', icon: '🧭', name: 'Exchange', nameZh: '交换经历' },
]

const currentMajor = ref('cs')
const selectedIngredients = ref([])
const result = ref(null)

function ingredientName(id) {
  const found = ingredients.find((item) => item.id === id)
  return found ? `${found.nameZh} / ${found.name}` : id
}

function switchMajor(majorId) {
  currentMajor.value = majorId
  selectedIngredients.value = []
  result.value = null
}

function toggleIngredient(ingredientId) {
  if (selectedIngredients.value.includes(ingredientId)) {
    selectedIngredients.value = selectedIngredients.value.filter((id) => id !== ingredientId)
    return
  }

  if (selectedIngredients.value.length >= 3) return
  selectedIngredients.value = [...selectedIngredients.value, ingredientId]
}

function evaluateRecipe() {
  if (selectedIngredients.value.length !== 3) {
    result.value = {
      tone: 'warning',
      title: '还差核心证据 / You need exactly 3 ingredients',
      body: '这个关卡训练的是“有限资源下挑核心证据”的能力，所以必须精确挑 3 个，而不是越多越好。',
      explanation: '真实申请里，最有说服力的不是堆满经历，而是让最关键的几条证据清楚服务于目标方向。',
      success: false,
    }
    return
  }

  const has = (ingredientId) => selectedIngredients.value.includes(ingredientId)

  if (has('portfolio') && currentMajor.value !== 'arts') {
    result.value = {
      tone: 'error',
      title: '作品集放错方向 / Portfolio is misplaced',
      body: '把作品集放进非艺术方向，会让核心叙事失焦。理工和商科更看重学术、项目、实习或量化证据。',
      explanation: '这并不是说作品集完全没价值，而是它不应该抢占最核心的 3 个证据位。',
      success: false,
    }
    return
  }

  if (currentMajor.value === 'cs') {
    if (has('gpa') && (has('research') || has('intern') || has('contest'))) {
      result.value = {
        tone: 'success',
        title: '理工方向配方成立 / STEM recipe confirmed',
        body: '高 GPA 是基础，再叠加科研、实习或竞赛中的至少一项硬证据，这更像真实可讲的理工申请组合。',
        explanation: '现实里，理工项目通常更在意你是否有学术基础和可验证的技术执行能力。',
        success: true,
      }
      return
    }

    result.value = {
      tone: has('gpa') ? 'warning' : 'error',
      title: has('gpa') ? '方向对了，但硬证据不足 / The direction is right, but the evidence is thin' : '缺少 GPA 基础 / The academic baseline is missing',
      body: has('gpa')
        ? '如果只有 GPA 而没有科研、实习或竞赛，理工叙事会显得“有成绩但没有执行证据”。'
        : '对多数理工项目来说，课程基础往往是第一层筛选线。没有 GPA 作为底盘，其他亮点会更难站稳。',
      explanation: '可以考虑补上科研、项目型实习或竞赛，让“学术基础 + 实操能力”同时成立。',
      success: false,
    }
    return
  }

  if (currentMajor.value === 'business') {
    if (has('intern') && has('gpa') && (has('gre') || has('lang') || has('exchange'))) {
      result.value = {
        tone: 'success',
        title: '商科方向配方成立 / Business recipe confirmed',
        body: '实习是商科方向最关键的说服材料之一，再加上 GPA 与语言/GRE/国际化经历，能更完整地证明职业潜力。',
        explanation: '现实里，商科项目往往很在意实践经验和职业动机，而不是只看成绩。',
        success: true,
      }
      return
    }

    result.value = {
      tone: has('intern') ? 'warning' : 'error',
      title: has('intern') ? '需要补足门槛与表达能力 / Add threshold credentials' : '缺少商科核心实践 / Missing the internship moat',
      body: has('intern')
        ? '你已经有实践证据，但语言、GMAT/GRE 或交换等国际化因素还不够，整体纯度不高。'
        : '对商科来说，没有实习或职业相关经历，很难证明你理解商业环境与岗位场景。',
      explanation: '更好的方向是用“实习 + 成绩 + 语言/考试/交换”组合起来，而不是只依赖单一指标。',
      success: false,
    }
    return
  }

  if (has('portfolio') && has('gpa')) {
    result.value = {
      tone: 'success',
      title: '艺术设计方向配方成立 / Arts recipe confirmed',
      body: '艺术设计类项目里，作品集几乎就是核心战力。只要 GPA 和语言达到底线，优秀作品集可以显著提升说服力。',
      explanation: '真实申请中，作品集承担了“你实际能做出什么”的证明任务，这和理工/商科的核心证据结构不同。',
      success: true,
    }
    return
  }

  result.value = {
    tone: 'error',
    title: '作品集是艺术方向的核心 / Portfolio is the core proof',
    body: '如果没有作品集，艺术设计方向的申请故事很难成立。再高的 GPA 也无法替代作品集的展示功能。',
    explanation: '这关想让你明白：不同专业方向的“核心证据”完全不同，不能用同一模板套所有专业。',
    success: false,
  }
}

function completeLevel() {
  const chosenMajor = majors.find((major) => major.id === currentMajor.value)
  emit('complete', {
    rewardCoins,
    preferences: {
      latestTakeaway: `${chosenMajor.labelZh} 方向最关键的不是把所有经历都塞进去，而是挑出最能证明匹配度的核心证据。/ ${chosenMajor.label} planning depends on choosing the most credible evidence, not listing everything.`,
    },
  })
}
</script>

<style scoped>
.major-tabs,
.workspace {
  display: grid;
  gap: 16px;
}

.major-tabs {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.major-btn,
.ingredient-card,
.actions button {
  border: none;
  cursor: pointer;
}

.major-btn {
  padding: 12px 16px;
  border-radius: 999px;
  background: rgba(42, 27, 61, 0.88);
  color: #d1bced;
  font-weight: 900;
}

.major-btn.active {
  background: linear-gradient(135deg, #8c5aae, #e5c3ff);
  color: #1f1630;
}

.workspace {
  grid-template-columns: 1.6fr 1fr;
}

.ingredient-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.ingredient-card,
.cauldron-card,
.result-card {
  border-radius: 22px;
  background: rgba(30, 20, 45, 0.84);
  border: 1px solid rgba(229, 195, 255, 0.14);
  color: #e8def8;
}

.ingredient-card {
  padding: 16px 12px;
  display: grid;
  gap: 6px;
  text-align: center;
}

.ingredient-card.active {
  border-color: rgba(249, 217, 118, 0.42);
  box-shadow: 0 16px 28px rgba(249, 217, 118, 0.12);
}

.ingredient-card .icon {
  font-size: 1.8rem;
}

.cauldron-card,
.result-card {
  padding: 20px;
}

.label {
  margin: 0 0 12px;
  color: #f9d976;
  font-weight: 900;
}

.brew-list {
  min-height: 120px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-content: flex-start;
}

.brew-pill,
.empty {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
}

.tip,
.takeaway {
  margin-top: 14px;
  line-height: 1.7;
  color: #d8c8ef;
}

.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 18px;
}

.primary {
  border-radius: 999px;
  padding: 12px 18px;
  background: linear-gradient(135deg, #f9d976, #e2954a);
  color: #2b1b3d;
  font-weight: 900;
}

.secondary {
  border-radius: 999px;
  padding: 12px 18px;
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
}

.result-card.success {
  border-left: 4px solid #22c55e;
}

.result-card.warning {
  border-left: 4px solid #f59e0b;
}

.result-card.error {
  border-left: 4px solid #ef4444;
}

.result-card h2 {
  margin: 0 0 10px;
  color: #f8fafc;
  font-family: Georgia, serif;
}

@media (max-width: 880px) {
  .workspace {
    grid-template-columns: 1fr;
  }
}
</style>
