<template>
  <div class="bog-game" :class="{ hit: damageFlash }">
    <button class="close-btn" type="button" @click="$emit('close')">{{ t('pages.y3_7.back') }}</button>

    <section class="bog-header">
      <p class="eyebrow">{{ t('pages.y3_7.eyebrow') }}</p>
      <h1>{{ t('pages.y3_7.title') }}</h1>
      <p class="intro">{{ t('pages.y3_7.intro') }}</p>
      <div class="status-row">
        <span>{{ t('pages.y3_7.mineCounter', { current: Math.min(currentIndex + 1, mines.length), total: mines.length }) }}</span>
        <span>{{ t('pages.y3_7.shieldCounter', { current: hp, total: maxHp }) }}</span>
      </div>
    </section>

    <main class="mine-arena">
      <article v-if="currentMine" class="mine-orb" :class="{ solved: feedback.show && feedback.correct }">
        <span class="mine-number">{{ currentIndex + 1 }}</span>
        <p>{{ currentMine.text }}</p>
      </article>

      <div class="spell-panel">
        <button class="spell-btn fatal" type="button" @click="castSpell('fatal')">
          <b>{{ t('pages.y3_7.spells.fatal.name') }}</b>
          <small>{{ t('pages.y3_7.spells.fatal.desc') }}</small>
        </button>
        <button class="spell-btn severe" type="button" @click="castSpell('severe')">
          <b>{{ t('pages.y3_7.spells.severe.name') }}</b>
          <small>{{ t('pages.y3_7.spells.severe.desc') }}</small>
        </button>
        <button class="spell-btn minor" type="button" @click="castSpell('minor')">
          <b>{{ t('pages.y3_7.spells.minor.name') }}</b>
          <small>{{ t('pages.y3_7.spells.minor.desc') }}</small>
        </button>
      </div>

      <p class="hint-line" aria-live="polite">{{ hint }}</p>
    </main>

    <div class="feedback-layer" :class="{ show: feedback.show }">
      <section class="feedback-card" :class="{ correct: feedback.correct }">
        <h2>{{ feedback.title }}</h2>
        <p>{{ feedback.desc }}</p>
        <button class="next-btn" type="button" @click="nextAfterFeedback">
          {{ feedback.nextText }}
        </button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'

const emit = defineEmits(['complete', 'close'])
const { t, tm } = useAppI18n()

const maxHp = 6
const mineTypes = [
  'fatal',
  'severe',
  'fatal',
  'fatal',
  'fatal',
  'severe',
  'severe',
  'severe',
  'severe',
  'severe',
  'severe',
  'severe',
  'minor',
  'minor',
  'minor',
  'minor',
]
const mines = computed(() => {
  const localizedMines = tm('pages.y3_7.mines') || []
  return localizedMines.map((mine, index) => ({
    ...mine,
    type: mineTypes[index],
  }))
})

const currentIndex = ref(0)
const hp = ref(maxHp)
const damageFlash = ref(false)
const hint = ref(t('pages.y3_7.hintInitial'))
const feedback = reactive({
  show: false,
  correct: true,
  title: '',
  desc: '',
  nextText: t('pages.y3_7.continuePurging')
})

const currentMine = computed(() => mines[currentIndex.value])
const spellName = (type) => t(`pages.y3_7.spells.${type}.name`)

function castSpell(spellType) {
  if (!currentMine.value || feedback.show) return

  if (spellType === currentMine.value.type) {
    feedback.correct = true
    feedback.title = currentMine.value.title
    feedback.desc = currentMine.value.desc
    feedback.nextText = currentIndex.value === mines.value.length - 1
      ? t('pages.y3_7.proceedToCoronation')
      : t('pages.y3_7.continuePurging')
    feedback.show = true
    return
  }

  hp.value -= 1
  hint.value = t('pages.y3_7.wrongSpell', { spell: spellName(spellType), hp: hp.value })
  damageFlash.value = true
  window.setTimeout(() => {
    damageFlash.value = false
  }, 260)

  if (hp.value <= 0) {
    feedback.correct = false
    feedback.title = t('pages.y3_7.shieldBrokenTitle')
    feedback.desc = t('pages.y3_7.shieldBrokenDesc')
    feedback.nextText = t('pages.y3_7.retryTrial')
    feedback.show = true
  }
}

function nextAfterFeedback() {
  if (!feedback.correct) {
    hp.value = maxHp
    currentIndex.value = 0
    hint.value = t('pages.y3_7.hintRestored')
    feedback.show = false
    return
  }

  feedback.show = false
  currentIndex.value += 1

  if (currentIndex.value >= mines.value.length) {
    emit('complete', { game: 'bog-sweeper', hpLeft: hp.value })
  } else {
    hint.value = t('pages.y3_7.hintContinue')
  }
}
</script>

<style scoped>
.bog-game {
  min-height: 100%;
  padding: clamp(18px, 4vw, 64px);
  color: #ecfeff;
  background:
    radial-gradient(circle at 50% 20%, rgba(20, 184, 166, 0.22), transparent 36%),
    linear-gradient(180deg, #042f2e, #052e16 55%, #020617);
  transition: filter 0.2s ease;
}

.bog-game.hit {
  filter: saturate(1.6) brightness(1.15);
}

.close-btn,
.spell-btn,
.next-btn {
  border-radius: 8px;
  font: inherit;
}

.close-btn {
  padding: 10px 14px;
  color: #ccfbf1;
  background: rgba(2, 6, 23, 0.86);
  border: 1px solid rgba(94, 234, 212, 0.5);
  cursor: pointer;
}

.bog-header,
.mine-arena {
  width: min(1180px, 100%);
  margin: 0 auto;
}

.bog-header {
  margin-top: 22px;
  text-align: center;
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
  color: #ccfbf1;
}

.eyebrow {
  color: #5eead4;
  font-weight: 1000;
  text-transform: uppercase;
  letter-spacing: 0;
}

.intro {
  max-width: 820px;
  margin: 18px auto 0;
  color: #cbd5e1;
  line-height: 1.65;
}

.status-row {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 20px;
}

.status-row span {
  padding: 10px 14px;
  border-radius: 8px;
  color: #111827;
  background: #5eead4;
  font-weight: 1000;
}

.mine-arena {
  display: grid;
  gap: 24px;
  margin-top: 30px;
}

.mine-orb {
  min-height: clamp(320px, 46vw, 620px);
  display: grid;
  place-content: center;
  gap: 24px;
  padding: clamp(22px, 6vw, 90px);
  text-align: center;
  border-radius: 50%;
  color: #022c22;
  background:
    radial-gradient(circle at 35% 28%, #fff 0 8%, transparent 16%),
    radial-gradient(circle, #99f6e4, #14b8a6 62%, #115e59);
  box-shadow: 0 36px 90px rgba(0, 0, 0, 0.42);
}

.mine-orb.solved {
  background:
    radial-gradient(circle at 35% 28%, #fff 0 8%, transparent 16%),
    radial-gradient(circle, #dcfce7, #22c55e 62%, #166534);
}

.mine-number {
  justify-self: center;
  width: 72px;
  height: 72px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #ccfbf1;
  background: #022c22;
  font-weight: 1000;
}

.mine-orb p {
  max-width: 760px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.4rem, 4.5vw, 5rem);
  line-height: 1.04;
}

.spell-panel {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.spell-btn {
  min-height: 150px;
  padding: 18px;
  color: #e5e7eb;
  background: rgba(2, 6, 23, 0.86);
  border: 1px solid rgba(94, 234, 212, 0.38);
  cursor: pointer;
  text-align: left;
}

.spell-btn:hover {
  transform: translateY(-5px);
}

.spell-btn b,
.spell-btn small {
  display: block;
}

.spell-btn small {
  margin-top: 12px;
  color: #cbd5e1;
  line-height: 1.4;
}

.spell-btn.fatal {
  border-color: #fb7185;
}

.spell-btn.severe {
  border-color: #facc15;
}

.hint-line {
  min-height: 56px;
  padding: 14px;
  border-radius: 8px;
  color: #ccfbf1;
  background: rgba(2, 6, 23, 0.82);
  text-align: center;
}

.feedback-layer {
  position: fixed;
  inset: 0;
  z-index: 9;
  display: none;
  place-items: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.8);
}

.feedback-layer.show {
  display: grid;
}

.feedback-card {
  width: min(640px, 100%);
  padding: clamp(22px, 5vw, 60px);
  border-radius: 8px;
  text-align: center;
  color: #e5e7eb;
  background: #111827;
  border: 2px solid #fb7185;
}

.feedback-card.correct {
  border-color: #5eead4;
}

.feedback-card h2 {
  color: #fff;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2rem, 6vw, 5rem);
  line-height: 0.9;
}

.feedback-card p {
  margin-top: 18px;
  color: #cbd5e1;
  line-height: 1.65;
}

.next-btn {
  width: 100%;
  margin-top: 24px;
  padding: 15px 18px;
  border: 0;
  color: #022c22;
  background: #5eead4;
  font-weight: 1000;
  cursor: pointer;
}

@media (max-width: 800px) {
  .spell-panel {
    grid-template-columns: 1fr;
  }

  .spell-btn {
    min-height: auto;
  }

  .mine-orb {
    border-radius: 8px;
  }
}
</style>
