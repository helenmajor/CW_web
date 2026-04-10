<template>
  <div class="alchemy-game">
    <button class="close-btn" type="button" @click="$emit('close')">Back to Map</button>

    <section class="alchemy-stage">
      <div class="stage-copy">
        <p class="eyebrow">Y3-1 Crucible of Truth</p>
        <h1>Application Alchemy</h1>
        <p class="intro">
          Click two ingredients, fuse them, and discover the real Year 3 material sequence:
          CV, language score, PS, recommendation letter, complete package, offer.
        </p>
      </div>

      <div class="progress-book">
        <h2>Recipe Book</h2>
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
        <h2>Inventory</h2>
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
        <h2>The Crucible</h2>
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
              <small>Click to remove</small>
            </template>
            <template v-else>
              <span class="empty-mark">+</span>
              <strong>Empty Slot</strong>
              <small>Add one material</small>
            </template>
          </button>
        </div>

        <button class="mix-btn" type="button" :disabled="!canMix" @click="mixSlots">
          Fuse Selected Ingredients
        </button>

        <div class="toast" :class="toast.type">
          <strong>{{ toast.title }}</strong>
          <p>{{ toast.message }}</p>
        </div>
      </section>
    </main>

    <div class="success-layer" :class="{ show: inventory.includes('offer') }">
      <section class="success-card">
        <p class="eyebrow">Grand Slam Achieved</p>
        <h2>{{ itemDB.offer.icon }} {{ itemDB.offer.name }}</h2>
        <p>
          You fused evidence, target requirements, English preparation, PS logic and mentor support
          into one complete application package.
        </p>
        <button class="mix-btn" type="button" @click="$emit('complete', { game: 'application-alchemy' })">
          Save Artifact & Return
        </button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

defineEmits(['complete', 'close'])

const itemDB = {
  exp: { name: 'Rambling Memories', icon: 'EXP', tier: 'tier-1' },
  school: { name: 'Academy Requirements', icon: 'REQ', tier: 'tier-1' },
  hair: { name: 'Sacrificed Sanity', icon: 'HP', tier: 'tier-1' },
  prof: { name: "Mentor's Goodwill", icon: 'PROF', tier: 'tier-1' },
  eng: { name: 'Basic English Lore', icon: 'ENG', tier: 'tier-1' },
  cv: { name: 'Draft CV', icon: 'CV', tier: 'tier-2' },
  ielts: { name: 'Language Score Scroll', icon: '7.0', tier: 'tier-2' },
  ps: { name: 'Flawless PS', icon: 'PS', tier: 'tier-3' },
  rl: { name: 'Strong RL', icon: 'RL', tier: 'tier-3' },
  package: { name: 'Application Package', icon: 'PKG', tier: 'tier-4' },
  offer: { name: 'Grand Slam Offer', icon: 'OFFER', tier: 'tier-4' }
}

const recipes = [
  { ing: ['exp', 'school'], result: 'cv', msg: 'You aligned memories with target requirements and forged a Draft CV.' },
  { ing: ['eng', 'hair'], result: 'ielts', msg: 'You traded sanity for timed practice and obtained a Language Score Scroll.' },
  { ing: ['cv', 'hair'], result: 'ps', msg: 'You used the CV skeleton, then dug deeper until a real PS began to glow.' },
  { ing: ['cv', 'prof'], result: 'rl', msg: "You sent a concise CV and awakened the mentor's memory. Strong RL obtained." },
  { ing: ['ps', 'rl'], result: 'package', msg: 'The PS and recommendation letter resonate. Your package now has a story and evidence.' },
  { ing: ['package', 'ielts'], result: 'offer', msg: 'All hard thresholds and materials align. A Grand Slam Offer appears.' }
]

const failMsgs = [
  { check: ['exp', 'hair'], text: 'Rambling plus all-nighters only produces dark circles. Anchor memories to target requirements first.' },
  { check: ['ps', 'prof'], text: 'Do not throw a massive PS at the mentor. Send a concise CV and highlight summary.' },
  { check: ['package', 'hair'], text: 'The package is ready. More panic cannot improve it. Check and submit.' },
  { check: ['school', 'prof'], text: 'A professor needs evidence of your work, not a ranking list of your dream schools.' }
]

const inventory = reactive(['exp', 'school', 'hair', 'prof', 'eng'])
const slots = ref([null, null])
const toast = reactive({
  type: 'info',
  title: 'Start the chain',
  message: 'Hint: combine messy experience with official target requirements.'
})

const canMix = computed(() => Boolean(slots.value[0] && slots.value[1]))

function addToSlot(itemId) {
  const emptyIndex = slots.value.findIndex((slot) => slot === null)
  if (emptyIndex === -1) {
    setToast('error', 'Crucible full', 'Clear a slot or fuse the current pair first.')
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
    setToast('error', 'No resonance', fail?.text || 'These ingredients do not make a useful application artifact.')
    slots.value = [null, null]
    return
  }

  if (!inventory.includes(recipe.result)) {
    inventory.push(recipe.result)
  }
  setToast('success', itemDB[recipe.result].name, recipe.msg)
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