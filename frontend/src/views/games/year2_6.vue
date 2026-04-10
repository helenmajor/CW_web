<template>
  <div class="contract-game">
    <section class="hero-strip">
      <button class="close-btn" type="button" @click="$emit('close')">{{ t('pages.y2_6.back') }}</button>
      <div>
        <p class="eyebrow">{{ t('pages.y2_6.eyebrow') }}</p>
        <h1>{{ t('pages.y2_6.title') }}</h1>
        <p class="intro">{{ t('pages.y2_6.intro') }}</p>
      </div>
      <div class="progress-pill">
        {{ t('pages.y2_6.progress', { current: protectedCount, total: clauses.length }) }}
      </div>
    </section>

    <main class="workspace">
      <section class="shield-pool" :aria-label="t('pages.y2_6.shieldsTitle')">
        <h2>{{ t('pages.y2_6.shieldsTitle') }}</h2>
        <p class="hint">{{ t('pages.y2_6.shieldsHint') }}</p>

        <div class="shield-grid">
          <button
            v-for="shield in shields"
            :key="shield.id"
            class="shield-card"
            :class="{ selected: selectedShieldId === shield.id, used: protectedIds.has(shield.id) }"
            type="button"
            draggable="true"
            @click="selectShield(shield.id)"
            @dragstart="startDrag($event, shield.id)"
            @dragend="draggedShieldId = ''"
          >
            <span class="shield-icon">{{ shield.icon }}</span>
            <strong>{{ shield.name }}</strong>
            <small>{{ shield.short }}</small>
          </button>
        </div>
      </section>

      <section class="contract-scroll" :aria-label="t('pages.y2_6.contractTitle')">
        <div class="contract-header">
          <div>
            <p class="eyebrow dark">{{ t('pages.y2_6.contractEyebrow') }}</p>
            <h2>{{ t('pages.y2_6.contractTitle') }}</h2>
          </div>
          <span class="seal" :class="{ ready: protectedCount === clauses.length }">
            {{ protectedCount === clauses.length ? t('pages.y2_6.sealReady') : t('pages.y2_6.sealPending') }}
          </span>
        </div>

        <article
          v-for="clause in clauses"
          :key="clause.id"
          class="clause"
          :class="{
            protected: protectedIds.has(clause.id),
            armed: selectedShieldId === clause.id,
            draggingTarget: draggedShieldId === clause.id
          }"
          @click="applySelectedTo(clause.id)"
          @dragover.prevent
          @drop="dropShield($event, clause.id)"
        >
          <div class="clause-topline">
            <h3>{{ clause.title }}</h3>
            <span>{{ protectedIds.has(clause.id) ? t('pages.y2_6.protected') : t('pages.y2_6.risky') }}</span>
          </div>
          <p class="draft-text">"{{ clause.draft }}"</p>
          <div class="drop-zone">
            <template v-if="protectedIds.has(clause.id)">
              <b>{{ shieldMap[clause.id]?.name }}</b>
              <small>{{ clause.explanation }}</small>
            </template>
            <template v-else-if="selectedShieldId === clause.id">
              {{ t('pages.y2_6.correctClause') }}
            </template>
            <template v-else>
              {{ t('pages.y2_6.dropHere') }}
            </template>
          </div>
        </article>

        <button class="complete-btn" type="button" :disabled="protectedCount !== clauses.length" @click="finish">
          {{ t('pages.y2_6.complete') }}
        </button>
      </section>
    </main>

    <div class="feedback-bar" aria-live="polite">
      {{ feedback }}
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'

const emit = defineEmits(['complete', 'close'])
const { t, tm } = useAppI18n()

const shieldMeta = [
  { id: 'guarantee', icon: '!' },
  { id: 'email', icon: '@' },
  { id: 'template', icon: 'PS' },
  { id: 'consultant', icon: 'ID' },
  { id: 'research', icon: 'R' },
  { id: 'timing', icon: '2-8' },
  { id: 'payment', icon: '$' },
  { id: 'refund', icon: '%' },
  { id: 'fees', icon: '+' },
]

const shields = computed(() => {
  const localizedShields = tm('pages.y2_6.shields') || []
  return shieldMeta.map((shield, index) => ({
    ...shield,
    ...(localizedShields[index] || {}),
  }))
})

const clauses = computed(() => tm('pages.y2_6.clauses') || [])

const protectedIds = reactive(new Set())
const selectedShieldId = ref('')
const draggedShieldId = ref('')
const feedback = ref(t('pages.y2_6.feedback.initial'))

const shieldMap = computed(() => Object.fromEntries(shields.value.map((shield) => [shield.id, shield])))
const protectedCount = computed(() => protectedIds.size)

function selectShield(id) {
  if (protectedIds.has(id)) {
    feedback.value = t('pages.y2_6.feedback.alreadyUsed')
    return
  }

  selectedShieldId.value = selectedShieldId.value === id ? '' : id
  feedback.value = selectedShieldId.value
    ? t('pages.y2_6.feedback.selected', { name: shieldMap.value[id]?.name || '' })
    : t('pages.y2_6.feedback.cleared')
}

function startDrag(event, id) {
  if (protectedIds.has(id)) {
    event.preventDefault()
    return
  }

  draggedShieldId.value = id
  selectedShieldId.value = id
  event.dataTransfer.effectAllowed = 'copy'
  event.dataTransfer.setData('text/plain', id)
}

function dropShield(event, clauseId) {
  const shieldId = event.dataTransfer.getData('text/plain') || draggedShieldId.value
  draggedShieldId.value = ''
  tryApply(shieldId, clauseId)
}

function applySelectedTo(clauseId) {
  if (!selectedShieldId.value || protectedIds.has(clauseId)) return
  tryApply(selectedShieldId.value, clauseId)
}

function tryApply(shieldId, clauseId) {
  if (!shieldId) return

  if (protectedIds.has(clauseId)) {
    feedback.value = t('pages.y2_6.feedback.clauseProtected')
    return
  }

  if (shieldId !== clauseId) {
    feedback.value = t('pages.y2_6.feedback.mismatch', { name: shieldMap.value[shieldId]?.name || '' })
    return
  }

  protectedIds.add(clauseId)
  selectedShieldId.value = ''
  feedback.value = t('pages.y2_6.feedback.attached', {
    name: shieldMap.value[clauseId]?.name || '',
    explanation: clauses.value.find((clause) => clause.id === clauseId)?.explanation || '',
  })
}

function finish() {
  if (protectedCount.value !== clauses.value.length) {
    feedback.value = t('pages.y2_6.feedback.remaining', { count: clauses.value.length - protectedCount.value })
    return
  }

  emit('complete', { game: 'contract-guardian', protected: clauses.value.length })
}
</script>

<style scoped>
.contract-game {
  min-height: 100%;
  padding: clamp(18px, 3vw, 44px);
  color: #eef2ff;
  background:
    radial-gradient(circle at top right, rgba(250, 204, 21, 0.22), transparent 34%),
    linear-gradient(135deg, #0f172a, #111827 48%, #1f2937);
}

.hero-strip,
.workspace {
  width: min(1280px, 100%);
  margin: 0 auto;
}

.hero-strip {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  padding: 18px;
  border: 1px solid rgba(250, 204, 21, 0.32);
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.82);
}

h1,
h2,
h3,
p {
  margin: 0;
}

h1 {
  margin-top: 6px;
  font-size: clamp(2rem, 5vw, 5rem);
  line-height: 0.95;
  font-family: Georgia, 'Times New Roman', serif;
}

.intro {
  max-width: 780px;
  margin-top: 12px;
  color: #cbd5e1;
  line-height: 1.6;
}

.eyebrow {
  color: #facc15;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0;
  font-size: 0.78rem;
}

.eyebrow.dark {
  color: #92400e;
}

.close-btn,
.progress-pill,
.complete-btn,
.shield-card {
  border-radius: 8px;
  font: inherit;
}

.close-btn {
  align-self: start;
  padding: 10px 14px;
  color: #fde68a;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(250, 204, 21, 0.5);
  cursor: pointer;
}

.progress-pill {
  padding: 12px 16px;
  color: #111827;
  background: #facc15;
  font-weight: 900;
  white-space: nowrap;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(340px, 1fr) minmax(420px, 1.15fr);
  gap: 22px;
  margin-top: 22px;
  align-items: start;
}

.shield-pool,
.contract-scroll {
  border-radius: 8px;
  padding: clamp(16px, 2.4vw, 30px);
  box-shadow: 0 22px 46px rgba(0, 0, 0, 0.32);
}

.shield-pool {
  background: rgba(2, 6, 23, 0.74);
  border: 1px solid rgba(148, 163, 184, 0.3);
}

.shield-pool h2,
.contract-header h2 {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.5rem, 3vw, 3rem);
  line-height: 1;
}

.hint {
  margin-top: 10px;
  color: #cbd5e1;
}

.shield-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.shield-card {
  min-height: 156px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
  padding: 14px;
  color: #e5e7eb;
  text-align: left;
  cursor: pointer;
  border: 1px solid rgba(148, 163, 184, 0.36);
  background: linear-gradient(145deg, #1f2937, #0f172a);
  transition: transform 0.16s ease, border-color 0.16s ease, background 0.16s ease;
}

.shield-card:hover,
.shield-card.selected {
  transform: translateY(-4px);
  border-color: #facc15;
  background: linear-gradient(145deg, #374151, #172033);
}

.shield-card.used {
  opacity: 0.45;
  cursor: default;
  transform: none;
}

.shield-icon {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  color: #111827;
  background: #facc15;
  font-weight: 1000;
  font-size: 1.15rem;
}

.shield-card small,
.drop-zone small {
  display: block;
  color: #cbd5e1;
  line-height: 1.35;
}

.contract-scroll {
  color: #2b2114;
  background: linear-gradient(180deg, #fff8e7, #f3e8c7);
}

.contract-header {
  display: flex;
  gap: 14px;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 18px;
  border-bottom: 2px solid #b45309;
}

.seal {
  padding: 10px 12px;
  border: 2px solid #92400e;
  color: #92400e;
  font-weight: 1000;
  transform: rotate(-7deg);
  opacity: 0.45;
}

.seal.ready {
  opacity: 1;
  color: #166534;
  border-color: #166534;
}

.clause {
  margin-top: 16px;
  padding: 16px;
  border-radius: 8px;
  border: 2px dashed rgba(146, 64, 14, 0.42);
  background: rgba(255, 255, 255, 0.52);
  transition: transform 0.16s ease, border-color 0.16s ease, background 0.16s ease;
}

.clause.armed,
.clause.draggingTarget {
  transform: translateX(-4px);
  border-color: #eab308;
  background: #fef3c7;
}

.clause.protected {
  border-style: solid;
  border-color: #15803d;
  background: #dcfce7;
}

.clause-topline {
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: center;
}

.clause-topline span {
  padding: 4px 8px;
  border-radius: 999px;
  color: #fff;
  background: #991b1b;
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
}

.clause.protected .clause-topline span {
  background: #166534;
}

.draft-text {
  margin-top: 10px;
  color: #4b5563;
  line-height: 1.55;
}

.drop-zone {
  min-height: 68px;
  margin-top: 12px;
  padding: 12px;
  border-radius: 8px;
  color: #78350f;
  background: rgba(251, 191, 36, 0.22);
  border: 1px solid rgba(146, 64, 14, 0.32);
  line-height: 1.4;
}

.clause.protected .drop-zone {
  color: #14532d;
  background: rgba(22, 163, 74, 0.13);
}

.clause.protected .drop-zone small {
  margin-top: 5px;
  color: #166534;
}

.complete-btn {
  width: 100%;
  margin-top: 18px;
  padding: 16px 18px;
  border: 0;
  color: #111827;
  background: #facc15;
  font-weight: 1000;
  cursor: pointer;
}

.complete-btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.feedback-bar {
  width: min(1280px, 100%);
  margin: 18px auto 0;
  padding: 14px 16px;
  color: #fde68a;
  background: rgba(2, 6, 23, 0.86);
  border-left: 5px solid #facc15;
  border-radius: 8px;
  line-height: 1.45;
}

@media (max-width: 900px) {
  .hero-strip,
  .workspace {
    grid-template-columns: 1fr;
  }

  .progress-pill {
    width: fit-content;
  }

  .shield-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .shield-grid {
    grid-template-columns: 1fr;
  }

  .shield-card {
    min-height: auto;
  }
}
</style>
