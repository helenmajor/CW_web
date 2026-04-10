<template>
  <div class="archive-game">
    <section class="room">
      <div class="header">
        <h2><i class="fas fa-scroll"></i> {{ t('pages.y2_4.title') }}</h2>
        <p>{{ t('pages.y2_4.intro') }}</p>
      </div>

      <div class="archives">
        <article v-for="item in cases" :key="item.id" class="case-file" :class="{ revealed: revealedIds.has(item.id) }">
          <div class="portrait">{{ item.icon }}</div>
          <div class="profile-data">
            <div><b>{{ item.label }}:</b> {{ item.track }}</div>
            <div><b>{{ t('pages.y2_4.labels.gpa') }}:</b> <span :class="item.gpaClass">{{ item.gpa }}</span></div>
            <div><b>{{ t('pages.y2_4.labels.evidence') }}:</b> <span class="evidence">{{ item.evidence }}</span></div>
          </div>

          <div v-if="!revealedIds.has(item.id)" class="guess">
            <button v-for="choice in item.choices" :key="choice" type="button" class="btn-guess" @click="reveal(item.id)">
              {{ choice }}
            </button>
          </div>

          <div v-else class="truth">
            <b :class="item.truthClass">{{ item.truthTitle }}</b><br>
            {{ item.truth }}
          </div>
        </article>
      </div>

      <button v-if="revealedIds.size === cases.length" type="button" class="btn-complete" @click="emit('complete')">
        <i class="fas fa-gem"></i> {{ t('pages.y2_4.complete') }}
      </button>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAppI18n } from '@/composables/useAppI18n'

const emit = defineEmits(['complete', 'close'])
const { tm, t } = useAppI18n()

const caseMeta = [
  { id: 1, icon: '🧑‍💻', gpaClass: 'danger', truthClass: 'success' },
  { id: 2, icon: '👩‍🎓', gpaClass: 'gold', truthClass: 'danger' },
]

const cases = computed(() => {
  const localizedCases = tm('pages.y2_4.cases') || []
  return caseMeta.map((meta, index) => ({
    ...meta,
    ...(localizedCases[index] || {}),
  }))
})

const revealedIds = ref(new Set())

function reveal(id) {
  revealedIds.value = new Set([...revealedIds.value, id])
}
</script>

<style scoped>
.archive-game {
  min-height: 100%;
  padding: 26px;
  color: #e8e6e3;
  background: radial-gradient(circle at center, #1e2022 0%, #000 100%);
  display: grid;
  place-items: center;
}

.room {
  width: min(940px, 100%);
  padding: 40px;
  text-align: center;
  background: rgba(20, 22, 24, 0.86);
  border: 2px solid #c8a165;
  border-radius: 22px;
  box-shadow: 0 24px 42px rgba(0, 0, 0, 0.5);
}

.header h2 {
  margin: 0 0 10px;
  color: #f9d976;
  font-size: 2.1rem;
  font-family: Georgia, serif;
}

.header p {
  margin: 0 0 30px;
  color: #a6b1c3;
  line-height: 1.6;
  font-family: Georgia, serif;
  font-style: italic;
}

.archives {
  display: flex;
  flex-wrap: wrap;
  gap: 25px;
  justify-content: center;
}

.case-file {
  width: 350px;
  max-width: 100%;
  padding: 25px 20px;
  background: linear-gradient(135deg, #2a2d34, #1b1c20);
  border: 1px solid #4a4d55;
  border-radius: 14px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.5);
  transition: 0.25s ease;
}

.case-file.revealed {
  border-color: #2ecc71;
  background: linear-gradient(135deg, #1b2a22, #101a15);
}

.portrait {
  margin-bottom: 10px;
  font-size: 3.5rem;
}

.profile-data {
  margin: 15px 0;
  padding-top: 15px;
  border-top: 1px dashed #4a4d55;
  text-align: left;
  line-height: 1.7;
}

.gold,
.evidence {
  color: #f9d976;
  font-weight: 900;
}

.danger { color: #e74c3c; font-weight: 900; }
.success { color: #2ecc71; font-weight: 900; }

.btn-guess {
  width: 100%;
  margin-bottom: 10px;
  padding: 11px;
  border: 0;
  border-radius: 9px;
  background: #c8a165;
  color: #1e2022;
  font-weight: 900;
  cursor: pointer;
}

.btn-guess:hover,
.btn-complete:hover {
  transform: translateY(-2px);
  filter: brightness(1.06);
}

.truth {
  padding-top: 15px;
  border-top: 1px solid #2ecc71;
  color: #a8e6cf;
  text-align: left;
  line-height: 1.58;
  font-family: Georgia, serif;
}

.btn-complete {
  margin-top: 35px;
  padding: 15px 35px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: #000;
  font-weight: 900;
  font-size: 1.05rem;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(46, 204, 113, 0.4);
}

@media (max-width: 760px) {
  .archive-game { padding: 14px; }
  .room { padding: 28px 18px; }
}
</style>
