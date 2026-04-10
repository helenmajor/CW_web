<template>
  <div class="coronation-game">
    <button class="close-btn" type="button" @click="$emit('close')">{{ t('pages.y3_8.back') }}</button>

    <div class="confetti-field" aria-hidden="true">
      <i v-for="piece in confettiPieces" :key="piece" :style="confettiStyle(piece)"></i>
    </div>

    <section class="ceremony-room">
      <p class="eyebrow">{{ t('pages.y3_8.eyebrow') }}</p>
      <h1>{{ t('pages.y3_8.title') }}</h1>

      <article class="certificate">
        <div class="cert-header">{{ t('pages.y3_8.certHeader') }}</div>
        <p>{{ t('pages.y3_8.certIntro') }}</p>
        <div class="cert-name">{{ playerName }}</div>
        <p>{{ t('pages.y3_8.certBody') }}</p>
        <strong class="title-grant">{{ t('pages.y3_8.titleGrant') }}</strong>
        <div class="wax-seal">GQ<br>OFFICIAL</div>
      </article>

      <div class="reward-grid">
        <div v-for="reward in rewards" :key="reward" class="reward-item">
          {{ reward }}
        </div>
      </div>

      <button class="complete-btn" type="button" @click="$emit('complete', { game: 'astral-coronation' })">
        {{ t('pages.y3_8.complete') }}
      </button>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'
import { useGameStore } from '@/stores/game'

defineEmits(['complete', 'close'])

const store = useGameStore()
const { t, tm } = useAppI18n()
const playerName = computed(() => store.travelerProfile?.name || t('pages.y3_8.defaultPlayerName'))
const confettiPieces = Array.from({ length: 60 }, (_, index) => index)
const rewards = computed(() => tm('pages.y3_8.rewards') || [])

function confettiStyle(index) {
  const colors = ['#fde047', '#38bdf8', '#86efac', '#fca5a5']
  return {
    left: `${(index * 37) % 100}%`,
    background: colors[index % colors.length],
    animationDelay: `${(index % 12) * -0.28}s`,
    animationDuration: `${4 + (index % 5) * 0.55}s`
  }
}
</script>

<style scoped>
.coronation-game {
  position: relative;
  min-height: 100%;
  padding: clamp(18px, 4vw, 70px);
  overflow: hidden;
  color: #fff7ed;
  background:
    radial-gradient(circle at 50% 20%, rgba(250, 204, 21, 0.24), transparent 34%),
    linear-gradient(145deg, #201327, #111827 52%, #020617);
}

.close-btn,
.complete-btn {
  border-radius: 8px;
  font: inherit;
}

.close-btn {
  position: relative;
  z-index: 4;
  padding: 10px 14px;
  color: #fde68a;
  background: rgba(2, 6, 23, 0.86);
  border: 1px solid rgba(250, 204, 21, 0.5);
  cursor: pointer;
}

.ceremony-room {
  position: relative;
  z-index: 2;
  width: min(1080px, 100%);
  margin: 30px auto 0;
  text-align: center;
}

h1,
p {
  margin: 0;
}

h1 {
  margin-top: 8px;
  color: #fde68a;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2.4rem, 8vw, 8rem);
  line-height: 0.86;
}

.eyebrow {
  color: #facc15;
  font-weight: 1000;
  text-transform: uppercase;
  letter-spacing: 0;
}

.certificate {
  position: relative;
  margin-top: clamp(26px, 5vw, 80px);
  padding: clamp(24px, 6vw, 90px);
  border-radius: 8px;
  color: #2c1e16;
  background:
    linear-gradient(90deg, rgba(120, 53, 15, 0.08) 1px, transparent 1px) 0 0 / 32px 100%,
    linear-gradient(135deg, #fffcf2, #f5ecd5);
  border: 8px double #b45309;
  box-shadow: 0 35px 80px rgba(0, 0, 0, 0.5);
  font-family: 'Times New Roman', Times, serif;
  font-size: clamp(1.05rem, 2.5vw, 1.7rem);
  line-height: 1.65;
}

.cert-header {
  padding-bottom: 15px;
  margin-bottom: 22px;
  color: #8b5a2b;
  border-bottom: 2px solid #8b5a2b;
  font-family: Georgia, 'Times New Roman', serif;
  font-weight: 1000;
  text-transform: uppercase;
}

.cert-name {
  display: inline-block;
  margin: 14px 0 20px;
  padding: 0 18px;
  color: #b91c1c;
  border-bottom: 2px dotted #b91c1c;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2rem, 7vw, 7rem);
  line-height: 0.95;
  font-weight: 1000;
}

.title-grant {
  display: block;
  margin-top: 26px;
}

.wax-seal {
  width: clamp(86px, 14vw, 145px);
  aspect-ratio: 1;
  position: absolute;
  right: clamp(18px, 5vw, 80px);
  bottom: clamp(18px, 5vw, 70px);
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  background: #b91c1c;
  border: 4px double #7f1d1d;
  transform: rotate(-14deg);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(0.65rem, 1.5vw, 1rem);
  line-height: 1.2;
  font-weight: 1000;
}

.reward-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 26px;
}

.reward-item {
  min-height: 110px;
  display: grid;
  place-items: center;
  padding: 18px;
  border-radius: 8px;
  color: #fde68a;
  background: rgba(2, 6, 23, 0.78);
  border: 1px solid rgba(250, 204, 21, 0.42);
  font-weight: 1000;
  line-height: 1.4;
}

.complete-btn {
  width: min(420px, 100%);
  margin-top: 26px;
  padding: 16px 20px;
  color: #111827;
  background: #facc15;
  border: 0;
  cursor: pointer;
  font-weight: 1000;
}

.confetti-field {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.confetti-field i {
  position: absolute;
  top: -20px;
  width: 10px;
  height: 18px;
  animation: confetti-fall linear infinite;
}

@keyframes confetti-fall {
  from {
    transform: translateY(-10vh) rotate(0deg);
  }
  to {
    transform: translateY(115vh) rotate(720deg);
  }
}

@media (max-width: 700px) {
  .reward-grid {
    grid-template-columns: 1fr;
  }

  .wax-seal {
    position: static;
    margin: 26px auto 0;
  }
}
</style>
