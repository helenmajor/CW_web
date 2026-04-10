<template>
  <div class="alchemy-game">
    <button class="close-btn" type="button" @click="$emit('close')">{{ t('pages.y3_1.back') }}</button>

    <section class="alchemy-stage">
      <div class="stage-copy">
        <p class="eyebrow">{{ t('pages.y3_1.eyebrow') }}</p>
        <h1>{{ t('pages.y3_1.title') }}</h1>
        <p class="intro">{{ t('pages.y3_1.intro') }}</p>
      </div>

      <div class="progress-book">
        <h2>{{ t('pages.y3_1.recipeBook') }}</h2>
        <ol>
          <li v-for="recipe in recipes" :key="recipe.result" :class="{ done: inventory.includes(recipe.result) }">
            {{ itemDB[recipe.ing[0]].name }} + {{ itemDB[recipe.ing[1]].name }}
            <b>{{ itemDB[recipe.result].name }}</b>
          </li>
        </ol>
      </div>
    </section>

    <main class="lab-grid">
      <section class="inventory-panel">
        <h2>{{ t('pages.y3_1.inventory') }}</h2>
        <div class="item-grid">
          <button
            v-for="itemId in inventory"
            :key="itemId"
            class="item-card"
            :class="itemDB[itemId].tier"
            type="button"
            @click="addToSlot(itemId)"
          >
            <span class="item-icon">{{ itemDB[itemId].icon }}</span>
            <strong>{{ itemDB[itemId].name }}</strong>
          </button>
        </div>
      </section>

      <section class="cauldron-panel">
        <h2>{{ t('pages.y3_1.crucible') }}</h2>
        <div class="slot-row">
          <button
            v-for="(slot, index) in slots"
            :key="index"
            class="alchemy-slot"
            type="button"
            @click="clearSlot(index)"
          >
            <template v-if="slot">
              <span class="item-icon">{{ itemDB[slot].icon }}</span>
              <strong>{{ itemDB[slot].name }}</strong>
              <small>{{ t('pages.y3_1.clickToRemove') }}</small>
            </template>
            <template v-else>
              <span class="empty-mark">+</span>
              <strong>{{ t('pages.y3_1.emptySlot') }}</strong>
              <small>{{ t('pages.y3_1.addMaterial') }}</small>
            </template>
          </button>
        </div>

        <button class="mix-btn" type="button" :disabled="!canMix" @click="mixSlots">
          {{ t('pages.y3_1.fuse') }}
        </button>

        <div class="toast" :class="toast.type">
          <strong>{{ toast.title }}</strong>
          <p>{{ toast.message }}</p>
        </div>
      </section>
    </main>

    <div class="success-layer" :class="{ show: inventory.includes('offer') }">
      <section class="success-card">
        <p class="eyebrow">{{ t('pages.y3_1.successEyebrow') }}</p>
        <h2>{{ itemDB.offer.icon }} {{ itemDB.offer.name }}</h2>
        <p>{{ t('pages.y3_1.successDesc') }}</p>
        <button class="mix-btn" type="button" @click="$emit('complete', { game: 'application-alchemy' })">
          {{ t('pages.y3_1.saveAndReturn') }}
        </button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'

defineEmits(['complete', 'close'])
const { t } = useAppI18n()

const itemDefs = {
  exp: { icon: 'EXP', tier: 'tier-1' },
  school: { icon: 'REQ', tier: 'tier-1' },
  hair: { icon: 'HP', tier: 'tier-1' },
  prof: { icon: 'PROF', tier: 'tier-1' },
  eng: { icon: 'ENG', tier: 'tier-1' },
  cv: { icon: 'CV', tier: 'tier-2' },
  ielts: { icon: '7.0', tier: 'tier-2' },
  ps: { icon: 'PS', tier: 'tier-3' },
  rl: { icon: 'RL', tier: 'tier-3' },
  package: { icon: 'PKG', tier: 'tier-4' },
  offer: { icon: 'OFFER', tier: 'tier-4' },
}

const itemDB = computed(() => Object.fromEntries(
  Object.entries(itemDefs).map(([id, item]) => [
    id,
    {
      ...item,
      name: t(`pages.y3_1.items.${id}`),
    },
  ]),
))

const recipes = [
  { ing: ['exp', 'school'], result: 'cv', messageKey: 'pages.y3_1.recipes.cv' },
  { ing: ['eng', 'hair'], result: 'ielts', messageKey: 'pages.y3_1.recipes.ielts' },
  { ing: ['cv', 'hair'], result: 'ps', messageKey: 'pages.y3_1.recipes.ps' },
  { ing: ['cv', 'prof'], result: 'rl', messageKey: 'pages.y3_1.recipes.rl' },
  { ing: ['ps', 'rl'], result: 'package', messageKey: 'pages.y3_1.recipes.package' },
  { ing: ['package', 'ielts'], result: 'offer', messageKey: 'pages.y3_1.recipes.offer' },
]

const failMsgs = [
  { check: ['exp', 'hair'], textKey: 'pages.y3_1.failMessages.expHair' },
  { check: ['ps', 'prof'], textKey: 'pages.y3_1.failMessages.psProf' },
  { check: ['package', 'hair'], textKey: 'pages.y3_1.failMessages.packageHair' },
  { check: ['school', 'prof'], textKey: 'pages.y3_1.failMessages.schoolProf' },
]

const inventory = reactive(['exp', 'school', 'hair', 'prof', 'eng'])
const slots = ref([null, null])
const toast = reactive({
  type: 'info',
  title: t('pages.y3_1.toastStartTitle'),
  message: t('pages.y3_1.toastStartMessage'),
})

const canMix = computed(() => Boolean(slots.value[0] && slots.value[1]))

function addToSlot(itemId) {
  const emptyIndex = slots.value.findIndex((slot) => slot === null)
  if (emptyIndex === -1) {
    setToast('error', t('pages.y3_1.toastFullTitle'), t('pages.y3_1.toastFullMessage'))
    return
  }
  slots.value[emptyIndex] = itemId
}

function clearSlot(index) {
  slots.value[index] = null
}

function mixSlots() {
  const pair = [...slots.value]
  const recipe = recipes.find(({ ing }) => ing.every((item) => pair.includes(item)))

  if (!recipe) {
    const fail = failMsgs.find(({ check }) => check.every((item) => pair.includes(item)))
    setToast('error', t('pages.y3_1.toastNoResonanceTitle'), fail ? t(fail.textKey) : t('pages.y3_1.toastNoResonanceMessage'))
    slots.value = [null, null]
    return
  }

  if (!inventory.includes(recipe.result)) {
    inventory.push(recipe.result)
  }
  setToast('success', itemDB.value[recipe.result].name, t(recipe.messageKey))
  slots.value = [null, null]
}

function setToast(type, title, message) {
  toast.type = type
  toast.title = title
  toast.message = message
}
</script>

<style scoped>
.alchemy-game {
  position: relative;
  min-height: 100%;
  padding: clamp(18px, 4vw, 64px);
  color: #ecfeff;
  background:
    radial-gradient(circle at 20% 10%, rgba(34, 211, 238, 0.22), transparent 32%),
    linear-gradient(135deg, #052e2b, #101827 55%, #111827);
}

.close-btn,
.item-card,
.alchemy-slot,
.mix-btn {
  border-radius: 8px;
  font: inherit;
}

.close-btn {
  position: absolute;
  top: 18px;
  left: 18px;
  padding: 10px 14px;
  color: #cffafe;
  background: rgba(2, 6, 23, 0.84);
  border: 1px solid rgba(103, 232, 249, 0.5);
  cursor: pointer;
}

.alchemy-stage,
.lab-grid {
  width: min(1260px, 100%);
  margin: 0 auto;
}

.alchemy-stage,
.lab-grid,
.slot-row {
  display: grid;
  gap: 22px;
}

.alchemy-stage {
  grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.9fr);
  align-items: end;
  padding-top: 32px;
}

h1,
h2,
p {
  margin: 0;
}

h1 {
  margin-top: 8px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2.5rem, 8vw, 8rem);
  line-height: 0.86;
}

h2 {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.5rem, 3vw, 3.6rem);
  line-height: 1;
}

.eyebrow {
  color: #67e8f9;
  font-weight: 1000;
  text-transform: uppercase;
  letter-spacing: 0;
}

.intro {
  max-width: 760px;
  margin-top: 18px;
  color: #cbd5e1;
  line-height: 1.65;
}

.progress-book,
.inventory-panel,
.cauldron-panel,
.success-card {
  padding: clamp(18px, 3vw, 40px);
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.78);
  border: 1px solid rgba(103, 232, 249, 0.28);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.34);
}

.progress-book ol {
  display: grid;
  gap: 9px;
  margin: 18px 0 0;
  padding-left: 22px;
  color: #cbd5e1;
}

.progress-book li {
  line-height: 1.4;
}

.progress-book li.done {
  color: #86efac;
}

.progress-book b {
  display: block;
  color: inherit;
}

.lab-grid {
  grid-template-columns: minmax(0, 1fr) minmax(360px, 0.9fr);
  margin-top: 24px;
  align-items: start;
}

.item-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.item-card,
.alchemy-slot {
  min-height: 150px;
  padding: 14px;
  color: #e5e7eb;
  border: 1px solid rgba(148, 163, 184, 0.38);
  background: #0f172a;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  text-align: left;
}

.item-card:hover,
.alchemy-slot:hover {
  transform: translateY(-4px);
  border-color: #67e8f9;
}

.item-icon,
.empty-mark {
  min-width: 60px;
  min-height: 60px;
  width: fit-content;
  display: grid;
  place-items: center;
  padding: 0 10px;
  border-radius: 8px;
  color: #022c22;
  background: #67e8f9;
  font-weight: 1000;
}

.tier-2 .item-icon {
  background: #86efac;
}

.tier-3 .item-icon {
  background: #facc15;
}

.tier-4 .item-icon {
  color: #450a0a;
  background: #fca5a5;
}

.slot-row {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 22px;
}

.alchemy-slot small {
  color: #94a3b8;
}

.mix-btn {
  width: 100%;
  margin-top: 18px;
  padding: 16px 18px;
  border: 0;
  color: #022c22;
  background: #67e8f9;
  font-weight: 1000;
  cursor: pointer;
}

.mix-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.toast {
  min-height: 128px;
  margin-top: 18px;
  padding: 16px;
  border-radius: 8px;
  border-left: 5px solid #67e8f9;
  background: rgba(15, 23, 42, 0.95);
  color: #e5e7eb;
}

.toast.success {
  border-left-color: #86efac;
}

.toast.error {
  border-left-color: #f87171;
}

.toast p,
.success-card p {
  margin-top: 10px;
  color: #cbd5e1;
  line-height: 1.55;
}

.success-layer {
  position: fixed;
  inset: 0;
  display: none;
  place-items: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.78);
  z-index: 10;
}

.success-layer.show {
  display: grid;
}

.success-card {
  width: min(640px, 100%);
  text-align: center;
}

@media (max-width: 900px) {
  .alchemy-stage,
  .lab-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .item-grid,
  .slot-row {
    grid-template-columns: 1fr;
  }

  .item-card,
  .alchemy-slot {
    min-height: auto;
  }
}
</style>
