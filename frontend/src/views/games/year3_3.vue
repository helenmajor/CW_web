<template>
  <div class="clinic-game">
    <button class="close-btn" type="button" @click="$emit('close')">Back to Map</button>

    <section class="clinic-header">
      <p class="eyebrow">Y3-3 Clinic of Truth</p>
      <h1>CV Surgery</h1>
      <p class="intro">
        Diagnose the six fatal CV problems. Click suspicious text on the resume; green checks appear
        only when you have found a core bug.
      </p>
      <div class="progress-pill">Core bugs {{ foundCoreCount }} / {{ coreBugIds.length }}</div>
    </section>

    <main class="clinic-workspace">
      <article class="cv-paper">
        <button class="bug-line name-line" :class="{ fixed: isFound('font') }" type="button" @click="findBug('font')">
          Zhang San
        </button>
        <button class="bug-line filename-line" :class="{ fixed: isFound('filename') }" type="button" @click="findBug('filename')">
          final_final_REALLY_final_cv_3.pdf
        </button>
        <button class="bug-line contact-line" :class="{ fixed: isFound('email') }" type="button" @click="findBug('email')">
          dark_dragon_99@randommail.com
        </button>

        <hr>

        <h2>Education</h2>
        <p>
          Miskatonic University - Computer Science
          <button class="bug-chip" :class="{ fixed: isFound('gpa') }" type="button" @click="findBug('gpa')">
            GPA: excellent, top student
          </button>
        </p>

        <h2>Experience</h2>
        <p>
          <b>Software Engineering Intern</b>
          <button class="bug-chip hidden-tip" type="button" @click="findBug('passive')">
            learned how to use Spring Boot
          </button>
        </p>
        <p>
          <button class="bug-chip" :class="{ fixed: isFound('vague') }" type="button" @click="findBug('vague')">
            worked very hard on an impressive project and helped the team a lot
          </button>
        </p>

        <h2>Skills & Interests</h2>
        <p>Python / Java / SQL / Git</p>
        <p>
          <button class="bug-chip hidden-tip" type="button" @click="findBug('score')">
            Machine Learning: self-rated 5 stars
          </button>
        </p>
        <p>
          <button class="bug-chip" :class="{ fixed: isFound('hobby') }" type="button" @click="findBug('hobby')">
            Gaming guild leader; platinum ranked night owl
          </button>
        </p>
      </article>

      <aside class="diagnosis-board">
        <h2>Diagnosis Checklist</h2>
        <ul>
          <li v-for="id in coreBugIds" :key="id" :class="{ done: isFound(id) }">
            {{ isFound(id) ? 'FIXED' : 'OPEN' }} - {{ bugDatabase[id].short }}
          </li>
        </ul>

        <div class="feedback-box" :class="{ visible: feedback.title }">
          <h3>{{ feedback.title || 'Click a suspicious CV part' }}</h3>
          <p>{{ feedback.desc || 'Precise filenames, clean contact info, quantified evidence and formal presentation matter.' }}</p>
        </div>

        <button
          class="complete-btn"
          type="button"
          :disabled="foundCoreCount !== coreBugIds.length"
          @click="$emit('complete', { game: 'cv-surgery', fixed: foundCoreCount })"
        >
          Submit Diagnosis
        </button>
      </aside>
    </main>
  </div>
</template>

<script setup>
import { computed, reactive } from 'vue'

defineEmits(['complete', 'close'])

const coreBugIds = ['filename', 'email', 'gpa', 'vague', 'hobby', 'font']

const bugDatabase = {
  filename: {
    short: 'Chaotic filename',
    title: 'Chaotic Filename',
    desc: 'Use a predictable file name such as Name_Program_CV.pdf. Mentors and reviewers handle too many attachments.'
  },
  email: {
    short: 'Unprofessional email',
    title: 'Edgy Email',
    desc: 'Register a clean name-based mailbox for applications. Contact details are part of the first impression.'
  },
  gpa: {
    short: 'Vague academic metric',
    title: 'Subjective GPA Claim',
    desc: 'State exact GPA and scale, such as 3.8/4.0. "Excellent" is not an academic metric.'
  },
  vague: {
    short: 'No STAR/result evidence',
    title: 'Empty Fluff',
    desc: 'Replace vague effort with action, technology, scope and result: implemented X, reduced Y by Z%.'
  },
  hobby: {
    short: 'Irrelevant hobby',
    title: 'Off-target Hobby',
    desc: 'CV space is scarce. Keep hobbies only when they connect to the target program or rare achievements.'
  },
  font: {
    short: 'Informal typography',
    title: 'Blasphemous Typography',
    desc: 'Use standard CV fonts and consistent spacing. A playful fantasy display font hurts credibility.'
  },
  passive: {
    title: 'Hidden Tip: Passive Verbs',
    desc: 'Prefer active verbs: implemented, optimized, evaluated, designed. "Learned how to" centers the process, not impact.'
  },
  score: {
    title: 'Hidden Tip: Subjective Rating',
    desc: 'Self-rated stars are hard to compare. Show skill through projects, technologies, outcomes or standard certifications.'
  }
}

const foundIds = reactive(new Set())
const feedback = reactive({ title: '', desc: '' })

const foundCoreCount = computed(() => coreBugIds.filter((id) => foundIds.has(id)).length)

function isFound(id) {
  return foundIds.has(id)
}

function findBug(id) {
  const bug = bugDatabase[id]
  feedback.title = bug.title
  feedback.desc = bug.desc

  if (coreBugIds.includes(id)) {
    foundIds.add(id)
  }
}
</script>

<style scoped>
.clinic-game {
  min-height: 100%;
  padding: clamp(18px, 4vw, 64px);
  color: #e5e7eb;
  background:
    radial-gradient(circle at 82% 12%, rgba(250, 204, 21, 0.18), transparent 34%),
    linear-gradient(135deg, #1f2937, #111827 52%, #2f1d1d);
}

.close-btn,
.bug-line,
.bug-chip,
.complete-btn {
  border-radius: 8px;
  font: inherit;
}

.close-btn {
  padding: 10px 14px;
  color: #fde68a;
  background: rgba(2, 6, 23, 0.86);
  border: 1px solid rgba(250, 204, 21, 0.5);
  cursor: pointer;
}

.clinic-header,
.clinic-workspace {
  width: min(1280px, 100%);
  margin: 0 auto;
}

.clinic-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: end;
  margin-top: 22px;
}

h1,
h2,
h3,
p {
  margin: 0;
}

h1 {
  margin-top: 8px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2.8rem, 9vw, 9rem);
  line-height: 0.84;
  color: #fde68a;
}

.eyebrow {
  color: #facc15;
  font-weight: 1000;
  text-transform: uppercase;
  letter-spacing: 0;
}

.intro {
  max-width: 760px;
  margin-top: 18px;
  color: #cbd5e1;
  line-height: 1.6;
}

.progress-pill {
  padding: 14px 18px;
  border-radius: 8px;
  color: #111827;
  background: #facc15;
  font-weight: 1000;
}

.clinic-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(340px, 0.8fr);
  gap: 24px;
  margin-top: 28px;
  align-items: start;
}

.cv-paper,
.diagnosis-board {
  padding: clamp(18px, 3vw, 42px);
  border-radius: 8px;
  box-shadow: 0 24px 56px rgba(0, 0, 0, 0.34);
}

.cv-paper {
  color: #1f2937;
  background: #fff;
  border-left: 16px solid #facc15;
  line-height: 1.7;
}

.cv-paper h2 {
  margin-top: 22px;
  padding-bottom: 5px;
  color: #111827;
  border-bottom: 2px solid #e5e7eb;
}

.bug-line,
.bug-chip {
  color: #7f1d1d;
  background: #fee2e2;
  border: 1px solid #fca5a5;
  cursor: pointer;
}

.bug-line {
  display: block;
  width: 100%;
  padding: 10px;
  margin: 8px 0;
  text-align: center;
}

.name-line {
  font-family: Papyrus, fantasy;
  font-size: clamp(2rem, 6vw, 5rem);
  line-height: 1;
}

.filename-line,
.contact-line {
  font-size: 0.95rem;
}

.bug-chip {
  display: inline-block;
  padding: 5px 8px;
  margin: 4px;
  line-height: 1.4;
}

.bug-line.fixed,
.bug-chip.fixed {
  color: #14532d;
  background: #dcfce7;
  border-color: #22c55e;
}

.hidden-tip {
  color: #92400e;
  background: #fef3c7;
  border-color: #f59e0b;
}

.diagnosis-board {
  position: sticky;
  top: 20px;
  background: rgba(2, 6, 23, 0.82);
  border: 1px solid rgba(250, 204, 21, 0.28);
}

.diagnosis-board h2 {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.6rem, 3vw, 3.6rem);
  line-height: 1;
  color: #fde68a;
}

.diagnosis-board ul {
  display: grid;
  gap: 9px;
  margin: 20px 0 0;
  padding-left: 0;
  list-style: none;
}

.diagnosis-board li {
  padding: 10px;
  border-radius: 8px;
  color: #fee2e2;
  background: rgba(127, 29, 29, 0.5);
}

.diagnosis-board li.done {
  color: #dcfce7;
  background: rgba(20, 83, 45, 0.75);
}

.feedback-box {
  min-height: 170px;
  margin-top: 20px;
  padding: 16px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.95);
  border-left: 5px solid #facc15;
}

.feedback-box p {
  margin-top: 10px;
  color: #cbd5e1;
  line-height: 1.55;
}

.complete-btn {
  width: 100%;
  margin-top: 18px;
  padding: 15px 18px;
  color: #111827;
  background: #facc15;
  border: 0;
  font-weight: 1000;
  cursor: pointer;
}

.complete-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .clinic-header,
  .clinic-workspace {
    grid-template-columns: 1fr;
  }

  .diagnosis-board {
    position: static;
  }
}
</style>
