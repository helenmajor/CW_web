<template>
  <div class="final-trial">
    <button class="close-btn" type="button" @click="$emit('close')">Back to Map</button>

    <section class="trial-room">
      <p class="eyebrow">Y2-7 Ultimate Trial</p>
      <h1>Golden Ticket Gacha</h1>

      <div v-if="!quizPassed" class="quiz-panel">
        <p class="question">
          After reading senior cases, comparing target tiers and planning artifacts, what mindset
          should guide the next application stage?
        </p>

        <button class="answer-btn" type="button" @click="checkAnswer(false)">
          A. Join every trend, panic-scroll rankings and copy someone else's route.
        </button>
        <button class="answer-btn featured" type="button" @click="checkAnswer(true)">
          B. Define a target tier early, then build evidence, language score and story around it.
        </button>
        <button class="answer-btn" type="button" @click="checkAnswer(false)">
          C. Wait for Year 4 deadlines; applications become clearer when time is almost gone.
        </button>

        <p v-if="error" class="error-text" :class="{ shake: errorShake }">
          {{ error }}
        </p>
      </div>

      <div v-else class="gacha-panel">
        <h2>Trial Passed</h2>
        <p>Spin the relic machine and carry your Year 2 strategy into application season.</p>

        <button
          class="gacha-machine"
          :class="{ spinning: isSpinning }"
          type="button"
          :disabled="isSpinning || ticketOpen"
          @click="playGacha"
        >
          <span class="machine-top">GQ</span>
          <span class="machine-orb"></span>
          <span class="machine-base">SPIN</span>
        </button>
      </div>
    </section>

    <div class="ticket-layer" :class="{ active: ticketOpen }" @click.self="ticketOpen = false">
      <section class="golden-ticket" :class="{ active: ticketOpen }" aria-label="Golden ticket reward">
        <p class="ticket-kicker">Golden Ticket</p>
        <h2>Year 2 Perfect Clear Voucher</h2>
        <div class="reward-box">
          1-on-1 Prophecy Consultation with an Elite Application Archmage
        </div>
        <p class="ticket-copy">
          Pack your evidence, school tiers, timeline and contract-defense notes. Year 3 begins
          with a sharper plan.
        </p>
        <button class="claim-btn" type="button" @click="claimTicket">
          Claim Ticket & Advance
        </button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['complete', 'close'])

const quizPassed = ref(false)
const error = ref('')
const errorShake = ref(false)
const isSpinning = ref(false)
const ticketOpen = ref(false)

let spinTimer = 0

function checkAnswer(isCorrect) {
  if (isCorrect) {
    quizPassed.value = true
    error.value = ''
    return
  }

  error.value = 'Blind anxiety and procrastination are traps. Build a target-based artifact plan.'
  errorShake.value = false
  window.requestAnimationFrame(() => {
    errorShake.value = true
  })
}

function playGacha() {
  if (isSpinning.value || ticketOpen.value) return

  isSpinning.value = true
  window.clearTimeout(spinTimer)
  spinTimer = window.setTimeout(() => {
    isSpinning.value = false
    ticketOpen.value = true
  }, 1500)
}

function claimTicket() {
  ticketOpen.value = false
  emit('complete', { game: 'golden-ticket', reward: 'prophecy-consultation' })
}
</script>

<style scoped>
.final-trial {
  position: relative;
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: clamp(18px, 4vw, 70px);
  overflow: hidden;
  color: #fff7ed;
  background:
    radial-gradient(circle at 50% 0%, rgba(250, 204, 21, 0.28), transparent 38%),
    radial-gradient(circle at 90% 90%, rgba(22, 163, 74, 0.18), transparent 30%),
    linear-gradient(145deg, #18181b, #3f1f46 52%, #0f172a);
}

.close-btn,
.answer-btn,
.gacha-machine,
.claim-btn {
  border-radius: 8px;
  font: inherit;
}

.close-btn {
  position: absolute;
  top: 18px;
  left: 18px;
  z-index: 3;
  padding: 10px 14px;
  color: #fef3c7;
  background: rgba(15, 23, 42, 0.86);
  border: 1px solid rgba(250, 204, 21, 0.48);
  cursor: pointer;
}

.trial-room {
  width: min(760px, 100%);
  padding: clamp(22px, 5vw, 64px);
  border-radius: 8px;
  text-align: center;
  background: rgba(2, 6, 23, 0.78);
  border: 2px dashed rgba(250, 204, 21, 0.68);
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.42);
}

h1,
h2,
p {
  margin: 0;
}

h1 {
  margin-top: 8px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2.5rem, 8vw, 7rem);
  line-height: 0.9;
  color: #facc15;
}

.eyebrow,
.ticket-kicker {
  color: #a7f3d0;
  font-weight: 1000;
  text-transform: uppercase;
  letter-spacing: 0;
}

.quiz-panel,
.gacha-panel {
  margin-top: clamp(24px, 5vw, 58px);
}

.question,
.gacha-panel p,
.ticket-copy {
  color: #e5e7eb;
  line-height: 1.65;
  font-size: 1.05rem;
}

.answer-btn {
  width: 100%;
  margin-top: 14px;
  padding: 16px 18px;
  color: #fef3c7;
  background: transparent;
  border: 1px solid rgba(250, 204, 21, 0.7);
  text-align: left;
  cursor: pointer;
  line-height: 1.45;
  transition: transform 0.16s ease, color 0.16s ease, background 0.16s ease;
}

.answer-btn:hover,
.answer-btn.featured:hover {
  transform: translateX(5px);
  color: #111827;
  background: #facc15;
}

.answer-btn.featured {
  border-color: #86efac;
  color: #dcfce7;
}

.error-text {
  margin-top: 16px;
  color: #fca5a5;
  font-weight: 800;
  line-height: 1.45;
}

.shake {
  animation: shake-error 0.32s ease;
}

@keyframes shake-error {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-8px);
  }
  75% {
    transform: translateX(8px);
  }
}

.gacha-panel h2,
.golden-ticket h2 {
  color: #facc15;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2rem, 5vw, 4.5rem);
  line-height: 0.95;
}

.gacha-panel p {
  margin: 16px auto 0;
  max-width: 560px;
}

.gacha-machine {
  width: clamp(190px, 42vw, 330px);
  aspect-ratio: 0.78;
  margin-top: 32px;
  padding: 18px;
  border: 0;
  cursor: pointer;
  color: #111827;
  background: linear-gradient(180deg, #fef3c7, #facc15 56%, #ca8a04);
  box-shadow: 0 28px 48px rgba(0, 0, 0, 0.35), inset 0 0 0 8px rgba(255, 255, 255, 0.24);
  display: grid;
  grid-template-rows: auto 1fr auto;
  justify-items: center;
  align-items: center;
}

.gacha-machine:disabled {
  cursor: wait;
}

.machine-top,
.machine-base {
  font-weight: 1000;
}

.machine-orb {
  width: 70%;
  aspect-ratio: 1;
  border-radius: 50%;
  background:
    radial-gradient(circle at 35% 28%, #fff, rgba(255, 255, 255, 0.25) 22%, transparent 34%),
    radial-gradient(circle, #ef4444, #7f1d1d);
  border: 10px solid #111827;
}

.spinning {
  animation: machine-shake 0.22s linear infinite;
}

@keyframes machine-shake {
  0%,
  100% {
    transform: rotate(0) scale(1.03);
  }
  25% {
    transform: rotate(4deg) scale(1.03);
  }
  75% {
    transform: rotate(-4deg) scale(1.03);
  }
}

.ticket-layer {
  position: fixed;
  inset: 0;
  z-index: 10;
  display: grid;
  place-items: center;
  padding: 20px;
  pointer-events: none;
  opacity: 0;
  background: rgba(0, 0, 0, 0.78);
  backdrop-filter: blur(8px);
  transition: opacity 0.22s ease;
}

.ticket-layer.active {
  pointer-events: auto;
  opacity: 1;
}

.golden-ticket {
  width: min(600px, 100%);
  padding: clamp(24px, 5vw, 60px);
  border-radius: 8px;
  color: #4a3000;
  text-align: center;
  background: linear-gradient(135deg, #fff7ad, #facc15 50%, #b7791f);
  border: 4px dashed #fff;
  box-shadow: 0 30px 80px rgba(250, 204, 21, 0.4);
  transform: scale(0.78) translateY(28px);
  transition: transform 0.32s cubic-bezier(.2, .88, .2, 1.25);
}

.golden-ticket.active {
  transform: scale(1) translateY(0);
}

.golden-ticket h2 {
  color: #4a3000;
}

.reward-box {
  margin: 24px 0;
  padding: 18px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.34);
  border: 1px solid rgba(255, 255, 255, 0.68);
  font-size: clamp(1.1rem, 3vw, 1.65rem);
  line-height: 1.35;
  font-weight: 1000;
}

.ticket-copy {
  color: #5c3a00;
  font-weight: 700;
}

.claim-btn {
  width: 100%;
  margin-top: 24px;
  padding: 16px 20px;
  color: #facc15;
  background: #4a3000;
  border: 0;
  cursor: pointer;
  font-weight: 1000;
}
</style>