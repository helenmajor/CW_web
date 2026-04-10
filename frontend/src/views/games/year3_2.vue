<template>
  <div class="bureau-game">
    <button class="close-btn" type="button" @click="$emit('close')">{{ t('pages.y3_2.back') }}</button>

    <section class="bureau-room">
      <p class="eyebrow">{{ t('pages.y3_2.eyebrow') }}</p>
      <h1>{{ t('pages.y3_2.title') }}</h1>
      <p class="intro">{{ t('pages.y3_2.intro') }}</p>

      <div class="progress-line">
        <span>{{ t('pages.y3_2.fragmentCounter', { current: currentIndex + 1, total: fragments.length }) }}</span>
        <div class="meter"><i :style="{ width: progressPercent + '%' }"></i></div>
      </div>

      <article v-if="currentFragment" class="parchment">
        <p class="fragment-text">"{{ currentFragment.text }}"</p>
      </article>

      <div class="stamp-grid">
        <button class="stamp-btn cv" type="button" @click="stamp('cv')">
          <b>CV</b>
          <small>{{ t('pages.y3_2.cvHint') }}</small>
        </button>
        <button class="stamp-btn ps" type="button" @click="stamp('ps')">
          <b>PS</b>
          <small>{{ t('pages.y3_2.psHint') }}</small>
        </button>
        <button class="stamp-btn rl" type="button" @click="stamp('rl')">
          <b>RL</b>
          <small>{{ t('pages.y3_2.rlHint') }}</small>
        </button>
      </div>
    </section>

    <div class="modal-layer" :class="{ show: modal.show }">
      <section class="modal-card" :class="modal.type">
        <h2>{{ modal.title }}</h2>
        <p>{{ modal.message }}</p>
        <button class="modal-btn" type="button" @click="continueAfterModal">
          {{ modal.type === 'success' ? t('pages.y3_2.next') : t('pages.y3_2.retry') }}
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

const targetByIndex = ['cv', 'ps', 'rl', 'cv', 'ps', 'rl']
const fragments = computed(() => {
  const localized = tm('pages.y3_2.fragments') || []
  return localized.map((fragment, index) => ({
    ...fragment,
    target: targetByIndex[index],
  }))
})

const currentIndex = ref(0)
const advanceAfterClose = ref(false)
const modal = reactive({
  show: false,
  type: 'success',
  title: '',
  message: '',
})

const currentFragment = computed(() => fragments.value[currentIndex.value])
const progressPercent = computed(() => Math.round((currentIndex.value / fragments.value.length) * 100))

function stamp(target) {
  const fragment = currentFragment.value
  if (!fragment) return

  if (target !== fragment.target) {
    openModal(
      'error',
      t('pages.y3_2.wrongTitle', { target: fragment.target.toUpperCase() }),
      fragment.note,
    )
    return
  }

  advanceAfterClose.value = true
  openModal('success', t('pages.y3_2.correctTitle'), fragment.note)
}

function openModal(type, title, message) {
  modal.type = type
  modal.title = title
  modal.message = message
  modal.show = true
}

function continueAfterModal() {
  modal.show = false

  if (!advanceAfterClose.value) return

  advanceAfterClose.value = false
  currentIndex.value += 1

  if (currentIndex.value >= fragments.value.length) {
    emit('complete', { game: 'artifact-appraisal' })
  }
}
</script>

<style scoped>
.bureau-game {
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: clamp(18px, 4vw, 70px);
  color: #f8fafc;
  background:
    radial-gradient(circle at 75% 15%, rgba(248, 113, 113, 0.22), transparent 34%),
    linear-gradient(145deg, #111827, #3b1f2f 52%, #0f172a);
}

.close-btn,
.stamp-btn,
.modal-btn {
  border-radius: 8px;
  font: inherit;
}

.close-btn {
  position: fixed;
  top: 18px;
  left: 18px;
  z-index: 4;
  padding: 10px 14px;
  color: #fee2e2;
  background: rgba(2, 6, 23, 0.84);
  border: 1px solid rgba(248, 113, 113, 0.5);
  cursor: pointer;
}

.bureau-room {
  width: min(1050px, 100%);
  text-align: center;
}

h1,
h2,
p {
  margin: 0;
}

h1 {
  margin-top: 8px;
  color: #fecaca;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2.5rem, 8vw, 8rem);
  line-height: 0.86;
}

.eyebrow {
  color: #fca5a5;
  font-weight: 1000;
  text-transform: uppercase;
  letter-spacing: 0;
}

.intro {
  max-width: 780px;
  margin: 20px auto 0;
  color: #dbeafe;
  line-height: 1.65;
}

.progress-line {
  margin: 26px auto 0;
  max-width: 720px;
  display: grid;
  gap: 8px;
  text-align: left;
  color: #e5e7eb;
  font-weight: 900;
}

.meter {
  height: 12px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.14);
}

.meter i {
  display: block;
  height: 100%;
  background: #fca5a5;
  transition: width 0.25s ease;
}

.parchment {
  min-height: 250px;
  display: grid;
  place-items: center;
  margin: 28px auto 0;
  padding: clamp(22px, 5vw, 70px);
  border-radius: 8px;
  color: #351b0b;
  background:
    linear-gradient(90deg, rgba(120, 53, 15, 0.12) 1px, transparent 1px) 0 0 / 34px 100%,
    linear-gradient(180deg, #fff7ed, #fed7aa);
  border: 2px solid #b45309;
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.36);
}

.fragment-text {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.35rem, 4vw, 3.5rem);
  line-height: 1.12;
}

.stamp-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 24px;
}

.stamp-btn {
  min-height: 150px;
  padding: 18px;
  border: 2px solid rgba(254, 202, 202, 0.56);
  color: #fee2e2;
  background: rgba(2, 6, 23, 0.72);
  cursor: pointer;
  text-align: left;
  transition: transform 0.16s ease, background 0.16s ease;
}

.stamp-btn:hover {
  transform: translateY(-5px);
  background: rgba(127, 29, 29, 0.72);
}

.stamp-btn b {
  display: block;
  font-size: clamp(2rem, 6vw, 5rem);
  line-height: 0.85;
}

.stamp-btn small {
  display: block;
  margin-top: 18px;
  color: #e5e7eb;
  line-height: 1.4;
}

.modal-layer {
  position: fixed;
  inset: 0;
  z-index: 9;
  display: none;
  place-items: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.78);
}

.modal-layer.show {
  display: grid;
}

.modal-card {
  width: min(560px, 100%);
  padding: clamp(22px, 5vw, 56px);
  border-radius: 8px;
  text-align: center;
  color: #e5e7eb;
  background: #111827;
  border: 2px solid #fca5a5;
}

.modal-card.success {
  border-color: #86efac;
}

.modal-card h2 {
  color: #fff;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2rem, 6vw, 5rem);
  line-height: 0.9;
}

.modal-card p {
  margin-top: 18px;
  line-height: 1.65;
}

.modal-btn {
  width: 100%;
  margin-top: 24px;
  padding: 15px 18px;
  color: #111827;
  background: #fca5a5;
  border: 0;
  font-weight: 1000;
  cursor: pointer;
}

.modal-card.success .modal-btn {
  background: #86efac;
}

@media (max-width: 720px) {
  .stamp-grid {
    grid-template-columns: 1fr;
  }

  .stamp-btn {
    min-height: auto;
  }
}
</style>
