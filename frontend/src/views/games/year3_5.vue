<template>
  <div class="mentor-game">
    <button class="close-btn" type="button" @click="$emit('close')">Back to Map</button>

    <section class="mentor-room">
      <div class="office-side">
        <p class="eyebrow">Y3-5 Tsundere Mentor</p>
        <h1>Recommendation Letter Visit</h1>
        <p class="intro">
          Ask early, introduce yourself, give target/deadline context and prepare a recommender
          package. The wildcat professor respects students who reduce uncertainty.
        </p>

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

const emit = defineEmits(['complete', 'close'])

const storyTree = {
  start: {
    text: 'Meow? Another application season, huh? What do you want? Speak quickly. I am extremely busy.',
    emoji: ':3',
    mood: 'normal',
    hearts: 'Approval: 2 / 5',
    choices: [
      { text: 'Professor! I want you to write me a recommendation letter! Right now!', nextId: 'bad_start' },
      { text: "Greetings, Prof. Wildcat. I am XXX from your Advanced Algorithms class. May I consult you about a recommendation letter?", nextId: 'good_start' }
    ]
  },
  bad_start: {
    text: 'Hiss! No introduction? I have taught hundreds of students. Which applicant are you?',
    emoji: ':<',
    mood: 'angry',
    hearts: 'Approval: 1 / 5',
    choices: [
      { text: 'Sorry. I was in your class last semester and worked on the scheduling-optimizer final project.', nextId: 'recover_start' },
      { text: "Do not worry about details. Just write a few casual sentences; that's enough.", nextId: 'game_over_rude' }
    ]
  },
  recover_start: {
    text: 'I faintly remember. Which program are you applying to, and when is the deadline?',
    emoji: ':|',
    mood: 'normal',
    hearts: 'Approval: 2 / 5',
    choices: [
      { text: 'I have not decided specific academies yet. Please write a generic backup letter.', nextId: 'game_over_vague' },
      { text: 'I plan to apply to the CS program at XX University. The deadline is at the end of next month.', nextId: 'good_timing' }
    ]
  },
  good_start: {
    text: 'Oh, the student who got an A on the final project. What program are you applying to, and when do you need the letter?',
    emoji: ':)',
    mood: 'happy',
    hearts: 'Approval: 3 / 5',
    choices: [
      { text: 'The portal closes tomorrow night. Please save me, Professor!', nextId: 'game_over_rush' },
      { text: 'The program is due at the end of next month. I came one month early to ask whether you would be comfortable recommending me.', nextId: 'good_timing' }
    ]
  },
  good_timing: {
    text: 'A month in advance. At least you know the rules. I am busy; do you have materials that help me recall your strongest evidence?',
    emoji: ':|',
    mood: 'normal',
    hearts: 'Approval: 3 / 5',
    choices: [
      { text: 'My transcript should be enough. For the rest, please freestyle based on your impression.', nextId: 'game_over_lazy' },
      { text: 'Yes. I prepared a package: latest CV, transcript, target program list, deadline table, project highlight summary and points you observed in class.', nextId: 'perfect_ending' }
    ]
  },
  game_over_rude: {
    text: 'Casual sentences? A recommendation letter carries my academic reputation. Reload and enter the office with etiquette.',
    emoji: '!!',
    mood: 'angry',
    hearts: 'Approval: 0 / 5',
    choices: [{ text: 'Reload: introduce yourself before asking.', nextId: 'start' }]
  },
  game_over_vague: {
    text: 'A generic letter cannot fit a specific program. Decide target/program context before requesting a tailored recommendation.',
    emoji: '??',
    mood: 'angry',
    hearts: 'Approval: 1 / 5',
    choices: [{ text: 'Reload: do the school/program homework first.', nextId: 'start' }]
  },
  game_over_rush: {
    text: 'Due tomorrow? I am not an emergency printer. Ask at least several weeks ahead, preferably around a month.',
    emoji: 'NO',
    mood: 'angry',
    hearts: 'Approval: 0 / 5',
    choices: [{ text: 'Reload: request earlier and give the deadline clearly.', nextId: 'start' }]
  },
  game_over_lazy: {
    text: 'Freestyle? Professors are not obligated to remember every detail. Prepare a concise info package and highlight summary.',
    emoji: '...',
    mood: 'angry',
    hearts: 'Approval: 0 / 5',
    choices: [{ text: 'Reload: prepare the recommender care package.', nextId: 'start' }]
  },
  perfect_ending: {
    text: 'Purr. This is organized: CV, transcript, targets, deadline and project highlights. I can write something concrete. Leave it with me.',
    emoji: ':D',
    mood: 'happy',
    hearts: 'Approval: 5 / 5',
    choices: [{ text: 'Claim the recommendation letter and return to map', nextId: 'exit' }]
  }
}

const currentNodeId = ref('start')
const currentNode = computed(() => storyTree[currentNodeId.value])

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