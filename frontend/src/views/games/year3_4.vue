<template>
  <GameLevelScaffold
    title="记忆星图 / Memory Constellation"
    subtitle="点击星点不是为了连线好看，而是在训练 PS 的叙事顺序：过去经历如何推出现在动机，再指向未来方向。/ Connect the stars in a narrative order that matches real PS logic."
    :guide="guide"
    tone="violet"
    :tags="['PS 结构 / PS structure', '叙事逻辑 / Narrative logic']"
    status-label="已连接节点 / Connected Stars"
    :status-text="`${selectedOrder.length} / ${nodes.length}`"
  >
    <section class="sky-card">
      <svg class="line-layer" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline class="magic-line" :class="result?.tone" :points="linePoints" />
      </svg>

      <button
        v-for="node in nodes"
        :key="node.id"
        type="button"
        class="star-node"
        :class="{ active: selectedOrder.includes(node.id) }"
        :style="{ left: `${node.x}%`, top: `${node.y}%` }"
        @click="clickStar(node.id)"
      >
        <span class="star-core">
          {{ node.icon }}
          <span v-if="selectedOrder.includes(node.id)" class="order">{{ selectedOrder.indexOf(node.id) + 1 }}</span>
        </span>
        <span class="star-label">
          <strong>{{ node.titleZh }}</strong>
          <small>{{ node.descZh }}</small>
        </span>
      </button>
    </section>

    <section class="helper-card">
      <strong>复杂节点提示 / Helper</strong>
      <p>推荐顺序应该能解释“为什么会想学这个方向 → 发生了什么转折 → 你做了哪些准备 → 为什么匹配这个项目 → 未来想解决什么问题”。</p>
    </section>

    <section v-if="result" class="result-card" :class="result.tone">
      <h2>{{ result.title }}</h2>
      <p>{{ result.desc }}</p>
      <div class="actions">
        <button class="secondary" @click="resetStars">重画星图 / Redraw</button>
        <button v-if="result.success" class="primary" @click="completeLevel">保存文书骨架 / Save PS Structure</button>
      </div>
    </section>
  </GameLevelScaffold>
</template>

<script setup>
import { computed, ref } from 'vue'
import GameLevelScaffold from '@/components/GameLevelScaffold.vue'
import { useLevelGuide } from '@/composables/useLevelGuide'

const emit = defineEmits(['complete'])
const { guide, rewardCoins } = useLevelGuide('y3', 4)

const nodes = [
  { id: 'motive', x: 20, y: 20, icon: '🌱', titleZh: '最初兴趣', descZh: '为什么这个方向第一次吸引你？' },
  { id: 'incident', x: 10, y: 55, icon: '⚡', titleZh: '关键转折', descZh: '什么事件让你意识到还需要更深入学习？' },
  { id: 'action', x: 50, y: 80, icon: '🔨', titleZh: '实际准备', descZh: '你已经做了哪些课程、项目或研究？' },
  { id: 'match', x: 90, y: 55, icon: '🏫', titleZh: '项目匹配', descZh: '为什么这个项目正好回应你的需要？' },
  { id: 'goal', x: 80, y: 20, icon: '🚩', titleZh: '未来方向', descZh: '你未来希望解决什么更大的问题？' },
]

const selectedOrder = ref([])
const result = ref(null)

const linePoints = computed(() => (
  selectedOrder.value
    .map((id) => {
      const node = nodes.find((entry) => entry.id === id)
      return node ? `${node.x},${node.y}` : ''
    })
    .filter(Boolean)
    .join(' ')
))

function clickStar(id) {
  if (result.value?.success) return

  if (selectedOrder.value.includes(id)) {
    const index = selectedOrder.value.indexOf(id)
    selectedOrder.value = selectedOrder.value.slice(0, index + 1)
    result.value = null
    return
  }

  if (selectedOrder.value.length >= nodes.length) return
  selectedOrder.value = [...selectedOrder.value, id]

  if (selectedOrder.value.length === nodes.length) {
    validateConstellation()
  }
}

function validateConstellation() {
  const order = selectedOrder.value

  if (order[0] === 'match') {
    result.value = {
      tone: 'error',
      success: false,
      title: '模板感过强 / Template opening detected',
      desc: '如果一上来就在夸学校，很容易显得像群发模板。PS 更应该先从“你为什么会走到这里”开始。',
    }
    return
  }

  if (order.indexOf('goal') < order.indexOf('action') || order.indexOf('match') < order.indexOf('action')) {
    result.value = {
      tone: 'error',
      success: false,
      title: '逻辑悬空 / The logic lacks foundation',
      desc: '你在讲未来目标和项目匹配之前，还没有先交代自己已经做了哪些准备，这会让目标显得很空。',
    }
    return
  }

  if (order.indexOf('motive') > order.indexOf('action')) {
    result.value = {
      tone: 'warning',
      success: false,
      title: '叙事顺序不够自然 / The story order feels off',
      desc: '多数情况下，先交代兴趣来源，再讲行动和准备，会更符合读者的理解顺序。',
    }
    return
  }

  if (
    order[0] === 'motive' &&
    order[1] === 'incident' &&
    order[2] === 'action' &&
    order[3] === 'match' &&
    order[4] === 'goal'
  ) {
    result.value = {
      tone: 'success',
      success: true,
      title: '标准英雄旅程 / Hero-journey structure confirmed',
      desc: '这个顺序能自然解释：你为什么开始、发生了什么转折、做了什么准备、为什么匹配项目、未来想去哪里。',
    }
    return
  }

  if (
    order[0] === 'incident' &&
    order[1] === 'motive' &&
    order[2] === 'action' &&
    order[3] === 'match' &&
    order[4] === 'goal'
  ) {
    result.value = {
      tone: 'success',
      success: true,
      title: '悬念式开场 / Strong hook structure confirmed',
      desc: '先用关键事件吸引读者，再补回兴趣来源，也是高级但合理的 PS 结构。',
    }
    return
  }

  result.value = {
    tone: 'warning',
    success: false,
    title: '星图还能更顺 / The constellation can be smoother',
    desc: '记住核心轴线：过去经历推出现在动机，现在准备支撑项目匹配，最后再引向未来方向。',
  }
}

function resetStars() {
  selectedOrder.value = []
  result.value = null
}

function completeLevel() {
  emit('complete', {
    rewardCoins,
    preferences: {
      latestTakeaway: 'PS 的骨架不是堆素材，而是用清晰顺序把过去、现在和未来串起来。/ A PS works when it connects past, present, and future in a clean logic chain.',
    },
  })
}
</script>

<style scoped>
.sky-card,
.helper-card,
.result-card {
  border-radius: 24px;
  background: rgba(20, 10, 35, 0.72);
  border: 1px solid rgba(107, 33, 168, 0.22);
  color: #e2e8f0;
}

.sky-card {
  position: relative;
  height: 470px;
  overflow: hidden;
}

.line-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.magic-line {
  fill: none;
  stroke: #d8b4fe;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 8px #a855f7);
}

.magic-line.success {
  stroke: #fde047;
  filter: drop-shadow(0 0 15px #fde047);
}

.magic-line.error,
.magic-line.warning {
  stroke: #ef4444;
  stroke-dasharray: 8 6;
}

.star-node {
  position: absolute;
  transform: translate(-50%, -50%);
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.star-core {
  position: relative;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 1.6rem;
  background: radial-gradient(circle, #f3e8ff, #7e22ce);
  box-shadow: 0 0 20px rgba(126, 34, 206, 0.6);
}

.star-node.active .star-core {
  background: radial-gradient(circle, #fff, #ca8a04);
}

.order {
  position: absolute;
  top: -8px;
  right: -8px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #0f172a;
  color: #fde047;
  font-size: 0.8rem;
  display: grid;
  place-items: center;
  border: 2px solid #fde047;
}

.star-label {
  margin-top: 10px;
  min-width: 146px;
  display: grid;
  gap: 4px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.88);
  border: 1px solid rgba(76, 29, 149, 0.48);
}

.star-label strong {
  color: #e9d5ff;
}

.star-label small {
  color: #94a3b8;
  line-height: 1.4;
}

.helper-card,
.result-card {
  padding: 18px;
}

.helper-card strong,
.result-card h2 {
  color: #f8fafc;
}

.helper-card p,
.result-card p {
  margin: 8px 0 0;
  line-height: 1.7;
}

.result-card.success {
  border-left: 4px solid #fde047;
}

.result-card.warning {
  border-left: 4px solid #f59e0b;
}

.result-card.error {
  border-left: 4px solid #ef4444;
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
  background: linear-gradient(135deg, #ca8a04, #a16207);
  color: #fff;
}

.secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #f8fafc;
}

@media (max-width: 700px) {
  .sky-card {
    height: 560px;
  }
}
</style>
