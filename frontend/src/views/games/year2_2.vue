<template>
  <div class="crossroads-game">
    <div class="header">
      <h2><i class="fas fa-compass"></i> {{ t('pages.y2_2.title') }}</h2>
      <p>{{ t('pages.y2_2.subtitle') }}</p>
    </div>

    <div class="portals">
      <div class="portal portal-uk" :class="portalClass('uk')">
        <div class="portal-icon">🏰</div>
        <div class="portal-name">{{ t('pages.y2_2.routes.uk') }}</div>
      </div>

      <div class="portal portal-hk" :class="portalClass('hk')">
        <div class="portal-icon">🌆</div>
        <div class="portal-name">{{ t('pages.y2_2.routes.hk') }}</div>
      </div>
    </div>

    <section v-if="question" class="scroll-board">
      <div class="owl-guide">🦉</div>
      <div class="question-text">"{{ question.q }}"</div>
      <div class="choices">
        <button
          v-for="choice in question.choices"
          :key="choice.text"
          type="button"
          class="btn-choice"
          @click="answerQuestion(choice.type)"
        >
          <i class="fas fa-feather-alt"></i>
          <span>{{ choice.text }}</span>
        </button>
      </div>
    </section>

    <div v-if="showResult" class="result-overlay">
      <div class="tarot-card" :class="`tarot-${winner}`">
        <div class="tarot-title">{{ result.title }}</div>
        <div class="tarot-icon">{{ result.icon }}</div>
        <div class="tarot-desc" v-html="result.desc"></div>
        <button type="button" class="btn-claim" @click="emit('complete')">{{ t('pages.y2_2.claim') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'

const emit = defineEmits(['complete', 'close'])
const { t, tm } = useAppI18n()

const questions = computed(() => {
  const localizedQuestions = tm('pages.y2_2.questions') || []
  return localizedQuestions.map((item) => ({
    q: item.q,
    choices: [
      { text: item.choices[0], type: 'uk' },
      { text: item.choices[1], type: 'hk' },
    ],
  }))
})

const currentQ = ref(0)
const scores = reactive({ uk: 0, hk: 0 })
const showResult = ref(false)
const winner = ref('uk')

const question = computed(() => questions.value[currentQ.value] || null)
const result = computed(() => {
  const localizedResult = tm(`pages.y2_2.results.${winner.value}`)
  return {
    title: localizedResult?.title || '',
    icon: winner.value === 'uk' ? '🏰' : '🌆',
    desc: localizedResult?.desc || '',
  }
})

function portalClass(type) {
  const strength = Math.min(scores[type], 3)
  return strength ? `active-${strength}` : ''
}

function answerQuestion(type) {
  scores[type] += 1
  currentQ.value += 1

  if (currentQ.value >= questions.value.length) {
    winner.value = scores.uk > scores.hk ? 'uk' : 'hk'
    showResult.value = true
  }
}
</script>

<style scoped>
.crossroads-game {
  min-height: 100%;
  padding: 38px 20px 56px;
  color: #e0e6ed;
  background: radial-gradient(circle at center, #1a2a3a 0%, #0a0f14 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: auto;
}

.header {
  text-align: center;
  margin-bottom: 28px;
}

.header h2 {
  margin: 0;
  font-size: 2.1rem;
  color: #f9d976;
  text-shadow: 0 0 15px rgba(249, 217, 118, 0.45);
  font-family: Georgia, serif;
}

.header p {
  color: #9aa8bd;
  line-height: 1.55;
}

.portals {
  width: min(760px, 100%);
  display: flex;
  justify-content: space-around;
  gap: 24px;
  flex-wrap: wrap;
}

.portal {
  width: min(220px, 42vw);
  aspect-ratio: 0.63;
  min-width: 170px;
  border-radius: 110px 110px 0 0;
  background: #0b131a;
  border: 4px solid #2c3e50;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0.62;
  filter: grayscale(0.8);
  transition: 0.45s ease;
}

.portal-icon {
  font-size: 4rem;
  opacity: 0.58;
  transition: 0.45s ease;
}

.portal-name {
  margin-top: 18px;
  text-align: center;
  line-height: 1.4;
  font-weight: 900;
  opacity: 0.65;
}

.portal-uk .portal-name { color: #82b1ff; }
.portal-hk .portal-name { color: #ffd700; }

.portal.active-1,
.portal.active-2,
.portal.active-3 {
  opacity: 1;
  filter: grayscale(0);
}

.portal-uk.active-1,
.portal-uk.active-2,
.portal-uk.active-3 {
  border-color: #82b1ff;
  background: radial-gradient(circle at bottom, #1a3673, #0b131a);
  box-shadow: 0 0 55px rgba(65, 105, 225, 0.62), inset 0 0 45px rgba(65, 105, 225, 0.45);
}

.portal-hk.active-1,
.portal-hk.active-2,
.portal-hk.active-3 {
  border-color: #ffe066;
  background: radial-gradient(circle at bottom, #5c4716, #0b131a);
  box-shadow: 0 0 55px rgba(218, 165, 32, 0.62), inset 0 0 45px rgba(218, 165, 32, 0.45);
}

.portal[class*="active-"] .portal-icon {
  transform: scale(1.1);
  opacity: 1;
}

.scroll-board {
  width: min(570px, 100%);
  margin-top: 38px;
  padding: 34px;
  border: 3px solid #c8a165;
  border-radius: 12px;
  background: linear-gradient(135deg, #fdf5e6, #f3e5ab);
  color: #3e2723;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.55);
  text-align: center;
}

.owl-guide { font-size: 3.3rem; }
.question-text {
  margin: 10px 0 24px;
  font-size: 1.12rem;
  line-height: 1.5;
  font-family: Georgia, serif;
  font-weight: 900;
}

.choices {
  display: grid;
  gap: 14px;
}

.btn-choice {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 15px 18px;
  border: 2px solid #c8a165;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.64);
  color: #5d4037;
  font-weight: 900;
  text-align: left;
  line-height: 1.42;
  cursor: pointer;
}

.btn-choice:hover {
  background: #fff;
  transform: scale(1.015);
}

.result-overlay {
  position: fixed;
  inset: 0;
  z-index: 20;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  padding: 18px;
}

.tarot-card {
  width: min(380px, 94vw);
  min-height: 520px;
  padding: 38px 25px;
  border-radius: 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: card-reveal 0.45s ease;
}

.tarot-uk { background: linear-gradient(135deg, #1a3673, #0b131a); border: 4px solid #82b1ff; color: #e0ebff; }
.tarot-hk { background: linear-gradient(135deg, #5c4716, #0b131a); border: 4px solid #ffe066; color: #fff3cc; }

.tarot-title {
  width: 100%;
  padding-bottom: 12px;
  border-bottom: 2px dashed currentColor;
  font-size: 1.35rem;
  font-weight: 900;
  font-family: Georgia, serif;
}

.tarot-icon { margin: 24px 0; font-size: 5rem; }
.tarot-desc {
  padding: 20px;
  background: rgba(0, 0, 0, 0.28);
  border-radius: 10px;
  text-align: left;
  line-height: 1.6;
  font-family: Georgia, serif;
}

.btn-claim {
  margin-top: 28px;
  padding: 12px 34px;
  border: 0;
  border-radius: 999px;
  background: #fff;
  color: #000;
  font-weight: 900;
  cursor: pointer;
}

@keyframes card-reveal {
  from { opacity: 0; transform: scale(0.86) rotateY(30deg); }
  to { opacity: 1; transform: scale(1) rotateY(0); }
}
</style>
