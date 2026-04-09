<template>
  <div class="ps-game">
    <button class="close-btn" type="button" @click="$emit('close')">Back to Map</button>

    <section class="ps-header">
      <p class="eyebrow">Y3-4 Constellation of Memories</p>
      <h1>PS Story Weaving</h1>
      <p class="intro">
        Click five stars to weave a personal statement trajectory. Strong PS logic moves from your
        evidence-backed past, to school fit, to future direction.
      </p>
    </section>

    <main class="sky-panel">
      <svg class="star-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <polyline :points="linePoints" />
      </svg>

      <button
        v-for="star in stars"
        :key="star.id"
        class="star-node"
        :class="{ selected: selectedOrder.includes(star.id) }"
        :style="{ left: star.x + '%', top: star.y + '%' }"
        type="button"
        @click="toggleStar(star.id)"
      >
        <span class="star-core">
          {{ selectedOrder.indexOf(star.id) === -1 ? star.mark : selectedOrder.indexOf(star.id) + 1 }}
        </span>
        <span class="star-label">
          <b>{{ star.title }}</b>
          <small>{{ star.desc }}</small>
        </span>
      </button>
    </main>

    <div class="action-row">
      <button class="secondary-btn" type="button" @click="resetStars">Redraw Trajectory</button>
      <button class="primary-btn" type="button" :disabled="selectedOrder.length !== stars.length" @click="validateConstellation">
        Validate Constellation
      </button>
    </div>

    <div class="result-layer" :class="{ show: result.show }">
      <section class="result-card" :class="result.type">
        <h2>{{ result.title }}</h2>
        <p>{{ result.desc }}</p>
        <div class="action-row compact">
          <button class="secondary-btn" type="button" @click="result.show = false">Keep Editing</button>
          <button
            v-if="result.type === 'success'"
            class="primary-btn"
            type="button"
            @click="$emit('complete', { game: 'ps-story-weaving', order: selectedOrder })"
          >
            Save PS Skeleton
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

defineEmits(['complete', 'close'])

const stars = [
  { id: 'motive', x: 20, y: 20, mark: 'M', title: 'Awakening', desc: 'Why did this field first matter to you?' },
  { id: 'incident', x: 12, y: 62, mark: '!', title: 'The Crucible', desc: 'What setback, question or bottleneck raised the stakes?' },
  { id: 'action', x: 50, y: 82, mark: 'A', title: 'Forging', desc: 'What academic work, project or research proves your preparation?' },
  { id: 'match', x: 88, y: 62, mark: 'FIT', title: 'Convergence', desc: 'Why this exact program, lab, module or ecosystem?' },
  { id: 'goal', x: 80, y: 20, mark: 'G', title: 'The Zenith', desc: 'What future problem will your next training help you tackle?' }
]

const selectedOrder = ref([])
const result = reactive({
  show: false,
  type: 'error',
  title: '',
  desc: ''
})

const linePoints = computed(() => selectedOrder.value
  .map((id) => stars.find((star) => star.id === id))
  .filter(Boolean)
  .map((star) => `${star.x},${star.y}`)
  .join(' '))

function toggleStar(id) {
  result.show = false
  const index = selectedOrder.value.indexOf(id)

  if (index !== -1) {
    selectedOrder.value = selectedOrder.value.slice(0, index + 1)
    return
  }

  if (selectedOrder.value.length < stars.length) {
    selectedOrder.value = [...selectedOrder.value, id]
  }
}

function resetStars() {
  selectedOrder.value = []
  result.show = false
}

function validateConstellation() {
  const order = selectedOrder.value

  if (order[0] === 'match') {
    showResult('error', 'Template Warning', 'Opening with school flattery sounds mass-produced. A PS should begin from your own question, context or challenge.')
    return
  }

  if (order.indexOf('goal') < order.indexOf('action') || order.indexOf('match') < order.indexOf('action')) {
    showResult('error', 'Logical Collapse', 'Do not discuss school fit or grand vision before showing preparation. The goal needs an evidence foundation.')
    return
  }

  if (order.indexOf('motive') > order.indexOf('action')) {
    showResult('error', 'Narrative Risk', 'You placed preparation before origin. Most academic PS drafts read clearer when motive and question lead into action.')
    return
  }

  const orthodox = ['motive', 'incident', 'action', 'match', 'goal']
  const hook = ['incident', 'motive', 'action', 'match', 'goal']
  const isOrthodox = orthodox.every((id, index) => order[index] === id)
  const isHook = hook.every((id, index) => order[index] === id)

  if (isOrthodox || isHook) {
    showResult(
      'success',
      isHook ? 'Advanced Suspense Hook' : "The Hero's Journey",
      isHook
        ? 'A challenge-first opening can work when it immediately returns to origin, preparation, school fit and future direction.'
        : 'A clean arc: origin, catalyst, academic preparation, program fit, future direction. Now fill it with specific evidence.'
    )
    return
  }

  showResult('error', 'The Starlight Flickers', 'The order is close but not yet persuasive. Try: motive or catalyst, preparation, school fit, future goal.')
}

function showResult(type, title, desc) {
  result.type = type
  result.title = title
  result.desc = desc
  result.show = true
}
</script>

<style scoped>
.ps-game {
  min-height: 100%;
  padding: clamp(18px, 4vw, 64px);
  color: #eef2ff;
  background:
    radial-gradient(circle at 50% 20%, rgba(59, 130, 246, 0.28), transparent 34%),
    linear-gradient(145deg, #111827, #171225 55%, #031927);
}

.close-btn,
.star-node,
.secondary-btn,
.primary-btn {
  border-radius: 8px;
  font: inherit;
}

.close-btn {
  padding: 10px 14px;
  color: #bfdbfe;
  background: rgba(2, 6, 23, 0.86);
  border: 1px solid rgba(147, 197, 253, 0.5);
  cursor: pointer;
}

.ps-header,
.sky-panel,
.action-row {
  width: min(1260px, 100%);
  margin: 0 auto;
}

.ps-header {
  margin-top: 22px;
}

h1,
h2,
p {
  margin: 0;
}

h1 {
  margin-top: 8px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2.4rem, 8vw, 8rem);
  line-height: 0.86;
  color: #dbeafe;
}

.eyebrow {
  color: #93c5fd;
  font-weight: 1000;
  text-transform: uppercase;
  letter-spacing: 0;
}

.intro {
  max-width: 820px;
  margin-top: 18px;
  color: #cbd5e1;
  line-height: 1.65;
}

.sky-panel {
  position: relative;
  height: clamp(560px, 62vw, 780px);
  margin-top: 28px;
  border-radius: 8px;
  overflow: hidden;
  background:
    radial-gradient(circle, rgba(255, 255, 255, 0.85) 1px, transparent 2px) 0 0 / 72px 72px,
    linear-gradient(180deg, rgba(30, 41, 59, 0.72), rgba(2, 6, 23, 0.9));
  border: 1px solid rgba(147, 197, 253, 0.3);
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.38);
}

.star-lines {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.star-lines polyline {
  fill: none;
  stroke: #facc15;
  stroke-width: 0.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 6px #facc15);
}

.star-node {
  position: absolute;
  width: clamp(170px, 22vw, 300px);
  min-height: 160px;
  transform: translate(-50%, -50%);
  padding: 14px;
  border: 1px solid rgba(191, 219, 254, 0.45);
  color: #dbeafe;
  background: rgba(2, 6, 23, 0.72);
  cursor: pointer;
  text-align: left;
  display: grid;
  gap: 10px;
}

.star-node:hover,
.star-node.selected {
  border-color: #facc15;
  background: rgba(30, 41, 59, 0.92);
}

.star-core {
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #111827;
  background: #bfdbfe;
  font-weight: 1000;
}

.selected .star-core {
  background: #facc15;
}

.star-label b,
.star-label small {
  display: block;
}

.star-label small {
  margin-top: 6px;
  color: #cbd5e1;
  line-height: 1.35;
}

.action-row {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 22px;
}

.action-row.compact {
  width: 100%;
  margin-top: 24px;
}

.secondary-btn,
.primary-btn {
  min-width: min(100%, 260px);
  padding: 15px 18px;
  font-weight: 1000;
  cursor: pointer;
}

.secondary-btn {
  color: #dbeafe;
  background: rgba(2, 6, 23, 0.82);
  border: 1px solid rgba(147, 197, 253, 0.5);
}

.primary-btn {
  color: #111827;
  background: #facc15;
  border: 0;
}

.primary-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.result-layer {
  position: fixed;
  inset: 0;
  z-index: 9;
  display: none;
  place-items: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.8);
}

.result-layer.show {
  display: grid;
}

.result-card {
  width: min(640px, 100%);
  padding: clamp(22px, 5vw, 60px);
  border-radius: 8px;
  color: #e5e7eb;
  text-align: center;
  background: #111827;
  border: 2px solid #f87171;
}

.result-card.success {
  border-color: #86efac;
}

.result-card h2 {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2rem, 6vw, 5rem);
  line-height: 0.9;
}

.result-card p {
  margin-top: 18px;
  color: #cbd5e1;
  line-height: 1.65;
}

@media (max-width: 720px) {
  .sky-panel {
    height: auto;
    display: grid;
    gap: 12px;
    padding: 16px;
  }

  .star-lines {
    display: none;
  }

  .star-node {
    position: static;
    width: 100%;
    min-height: auto;
    transform: none;
  }

  .action-row {
    flex-direction: column;
  }
}
</style>
