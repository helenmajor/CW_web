<template>
  <div class="mentor-game">
    <button class="close-btn" type="button" @click="$emit('close')">{{ t('pages.y3_5.back') }}</button>

    <section class="mentor-room">
      <div class="office-side">
        <p class="eyebrow">{{ t('pages.y3_5.eyebrow') }}</p>
        <h1>{{ t('pages.y3_5.title') }}</h1>
        <p class="intro">{{ t('pages.y3_5.intro') }}</p>

        <div class="cat-avatar" :class="currentNode.mood">
          <span>{{ currentNode.emoji }}</span>
          <small>{{ currentNode.hearts }}</small>
        </div>
      </div>

      <div class="dialogue-side">
        <article class="dialogue-box">
          <p>{{ currentNode.text }}</p>
        </article>

        <div class="choice-list">
          <button
            v-for="choice in currentNode.choices"
            :key="choice.text"
            class="choice-btn"
            type="button"
            @click="choose(choice.nextId)"
          >
            {{ choice.text }}
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'

const emit = defineEmits(['complete', 'close'])
const { tm, t } = useAppI18n()

const storyMeta = {
  start: { emoji: ':3', mood: 'normal', nextIds: ['bad_start', 'good_start'] },
  bad_start: { emoji: ':<', mood: 'angry', nextIds: ['recover_start', 'game_over_rude'] },
  recover_start: { emoji: ':|', mood: 'normal', nextIds: ['game_over_vague', 'good_timing'] },
  good_start: { emoji: ':)', mood: 'happy', nextIds: ['game_over_rush', 'good_timing'] },
  good_timing: { emoji: ':|', mood: 'normal', nextIds: ['game_over_lazy', 'perfect_ending'] },
  game_over_rude: { emoji: '!!', mood: 'angry', nextIds: ['start'] },
  game_over_vague: { emoji: '??', mood: 'angry', nextIds: ['start'] },
  game_over_rush: { emoji: 'NO', mood: 'angry', nextIds: ['start'] },
  game_over_lazy: { emoji: '...', mood: 'angry', nextIds: ['start'] },
  perfect_ending: { emoji: ':D', mood: 'happy', nextIds: ['exit'] },
}

const currentNodeId = ref('start')
const storyTree = computed(() => tm('pages.y3_5.tree') || {})
const currentNode = computed(() => {
  const copy = storyTree.value[currentNodeId.value] || { text: '', hearts: '', choices: [] }
  const meta = storyMeta[currentNodeId.value] || { emoji: ':|', mood: 'normal', nextIds: [] }
  return {
    ...copy,
    emoji: meta.emoji,
    mood: meta.mood,
    choices: (copy.choices || []).map((text, index) => ({
      text,
      nextId: meta.nextIds[index],
    })),
  }
})

function choose(nextId) {
  if (nextId === 'exit') {
    emit('complete', { game: 'recommendation-mentor' })
    return
  }

  currentNodeId.value = nextId
}
</script>

<style scoped>
.mentor-game {
  min-height: 100%;
  display: grid;
  place-items: center;
  padding: clamp(18px, 4vw, 70px);
  color: #f8fafc;
  background:
    radial-gradient(circle at 75% 22%, rgba(45, 212, 191, 0.2), transparent 32%),
    linear-gradient(145deg, #052e2b, #172033 52%, #111827);
}

.close-btn,
.choice-btn {
  border-radius: 8px;
  font: inherit;
}

.close-btn {
  position: fixed;
  top: 18px;
  left: 18px;
  z-index: 3;
  padding: 10px 14px;
  color: #ccfbf1;
  background: rgba(2, 6, 23, 0.86);
  border: 1px solid rgba(45, 212, 191, 0.5);
  cursor: pointer;
}

.mentor-room {
  width: min(1220px, 100%);
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  gap: 26px;
  align-items: center;
}

h1,
h2,
p {
  margin: 0;
}

h1 {
  margin-top: 8px;
  color: #ccfbf1;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2.4rem, 7.5vw, 7.6rem);
  line-height: 0.86;
}

.eyebrow {
  color: #5eead4;
  font-weight: 1000;
  text-transform: uppercase;
  letter-spacing: 0;
}

.intro {
  max-width: 680px;
  margin-top: 20px;
  color: #cbd5e1;
  line-height: 1.65;
}

.cat-avatar {
  width: min(420px, 100%);
  aspect-ratio: 1;
  margin-top: 30px;
  border-radius: 8px;
  display: grid;
  place-content: center;
  gap: 14px;
  text-align: center;
  color: #111827;
  background:
    radial-gradient(circle at 40% 36%, #fff 0 8%, transparent 12%),
    radial-gradient(circle at 60% 36%, #fff 0 8%, transparent 12%),
    linear-gradient(145deg, #5eead4, #0d9488);
  box-shadow: 0 28px 60px rgba(0, 0, 0, 0.34);
}

.cat-avatar.angry {
  background:
    radial-gradient(circle at 40% 36%, #fff 0 8%, transparent 12%),
    radial-gradient(circle at 60% 36%, #fff 0 8%, transparent 12%),
    linear-gradient(145deg, #fca5a5, #b91c1c);
}

.cat-avatar.happy {
  background:
    radial-gradient(circle at 40% 36%, #fff 0 8%, transparent 12%),
    radial-gradient(circle at 60% 36%, #fff 0 8%, transparent 12%),
    linear-gradient(145deg, #86efac, #16a34a);
}

.cat-avatar span {
  font-size: clamp(4rem, 13vw, 11rem);
  font-weight: 1000;
  line-height: 0.8;
}

.cat-avatar small {
  font-weight: 1000;
}

.dialogue-side {
  padding: clamp(18px, 3vw, 44px);
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.78);
  border: 1px solid rgba(45, 212, 191, 0.26);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.34);
}

.dialogue-box {
  min-height: 260px;
  padding: clamp(18px, 4vw, 50px);
  display: grid;
  place-items: center;
  border-radius: 8px;
  color: #134e4a;
  background: #ccfbf1;
}

.dialogue-box p {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.25rem, 3.4vw, 3.2rem);
  line-height: 1.16;
}

.choice-list {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

.choice-btn {
  padding: 16px 18px;
  color: #e5e7eb;
  background: rgba(15, 23, 42, 0.96);
  border: 1px solid rgba(45, 212, 191, 0.42);
  cursor: pointer;
  text-align: left;
  line-height: 1.45;
}

.choice-btn:hover {
  transform: translateX(5px);
  color: #111827;
  background: #5eead4;
}

@media (max-width: 900px) {
  .mentor-room {
    grid-template-columns: 1fr;
  }

  .cat-avatar {
    aspect-ratio: 1.25;
  }
}
</style>
