<template>
  <div class="citadel-game">
    <section class="citadel-hud">
      <button class="close-btn" type="button" @click="$emit('close')">Back to Map</button>
      <div class="hud-stat">Cleared {{ clearedCount }} / 3</div>
      <div class="hud-stat">Artifacts {{ gems }}</div>
      <div class="hud-stat">Lv.{{ level }}</div>
      <div class="hud-stat">Coffee {{ potions }}</div>
    </section>

    <section v-if="mode === 'map'" class="citadel-map">
      <p class="eyebrow">Y3-6 The Dark Citadel</p>
      <h1>Battle of the Ordeals</h1>
      <p class="intro">
        Clear September language pressure, October essay pressure and November deadline pressure.
        Each first clear levels you up and opens the next gate.
      </p>

      <div class="door-grid">
        <button
          v-for="stage in stages"
          :key="stage.id"
          class="stage-door"
          :class="{ cleared: cleared[stage.id], locked: isLocked(stage.id) }"
          type="button"
          @click="openStage(stage.id)"
        >
          <span class="door-status">{{ doorStatus(stage.id) }}</span>
          <b>{{ stage.month }}</b>
          <strong>{{ stage.enemy.name }}</strong>
          <small>{{ stage.subtitle }}</small>
        </button>

        <button class="stage-door final-door" :class="{ locked: clearedCount !== 3 }" type="button" @click="openFinal">
          <span class="door-status">{{ clearedCount === 3 ? 'Unlocked' : 'Sealed' }}</span>
          <b>Sanctuary</b>
          <strong>Rain of Offers</strong>
          <small>Open after all three bosses are defeated.</small>
        </button>
      </div>
    </section>

    <section v-else class="battle-modal">
      <button class="close-btn modal-close" type="button" @click="returnToMap">Return to Citadel</button>

      <template v-if="mode === 'intro' && currentStage">
        <div class="modal-scroll">
          <p class="eyebrow">{{ currentStage.month }} Gate</p>
          <h2>{{ currentStage.title }}</h2>
          <p class="intro">{{ currentStage.subtitle }}</p>
          <div class="intel-list">
            <p v-for="tip in currentStage.tips" :key="tip">{{ tip }}</p>
          </div>
          <button class="primary-btn" type="button" @click="startBattle">Draw Sword & Engage</button>
        </div>
      </template>

      <template v-else-if="mode === 'battle'">
        <div class="battle-screen">
          <div class="combatants">
            <article class="fighter enemy">
              <span class="sprite">{{ enemy.icon }}</span>
              <h2>{{ enemy.name }}</h2>
              <HealthBar :value="enemy.hp" :max="enemy.maxHp" tone="enemy" />
            </article>

            <article class="fighter hero">
              <span class="sprite">APP</span>
              <h2>Applicant</h2>
              <HealthBar :value="hero.hp" :max="hero.maxHp" />
              <small v-if="hero.shield" class="shield-tag">Cold Email Shield active</small>
            </article>
          </div>

          <div class="command-deck">
            <div class="message-box" aria-live="polite">{{ battleLog }}</div>
            <div class="skill-grid">
              <button
                v-for="skill in skills"
                :key="skill.id"
                class="skill-btn"
                type="button"
                :disabled="skill.pp <= 0 || hero.hp <= 0 || enemy.hp <= 0"
                @click="useSkill(skill)"
              >
                <b>{{ skill.name }}</b>
                <small>{{ skill.label }} | PP {{ skill.pp }} / {{ skill.maxPp }}</small>
              </button>
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="mode === 'victory'">
        <div class="modal-scroll center">
          <p class="eyebrow">Month Conquered</p>
          <h2>{{ currentStage.enemy.name }} defeated</h2>
          <p class="intro">{{ settlementText }}</p>
          <button class="primary-btn" type="button" @click="returnToMap">Return to Citadel</button>
          <button v-if="clearedCount === 3" class="danger-btn" type="button" @click="mode = 'final'">
            Open The Sanctuary
          </button>
        </div>
      </template>

      <template v-else-if="mode === 'defeat'">
        <div class="modal-scroll center">
          <p class="eyebrow">Application Foiled</p>
          <h2>You were crushed by pressure</h2>
          <p class="intro">
            Retry with burst damage, coffee heals and Cold Email Shield before a heavy boss turn.
          </p>
          <button class="primary-btn" type="button" @click="startBattle">Resurrect & Retaliate</button>
        </div>
      </template>

      <template v-else-if="mode === 'final'">
        <div class="modal-scroll center">
          <p class="eyebrow">Sanctuary Opened</p>
          <h2>The Offer Rain Begins</h2>
          <p class="intro">
            Dragon, zombie and DDL reaper are defeated. You collected {{ gems }} artifacts and
            survived the autumn application season.
          </p>
          <button class="primary-btn" type="button" @click="$emit('complete', { game: 'dark-citadel', artifacts: gems })">
            Return in Glory
          </button>
        </div>
      </template>
    </section>
  </div>
</template>

<script>
import { computed, defineComponent, h, reactive, ref } from 'vue'

const HealthBar = defineComponent({
  props: {
    value: { type: Number, required: true },
    max: { type: Number, required: true },
    tone: { type: String, default: 'hero' }
  },
  setup(props) {
    const percent = computed(() => Math.max(0, Math.min(100, (props.value / props.max) * 100)))
    return () => h('div', { class: ['health-bar', `tone-${props.tone}`] }, [
      h('i', { style: { width: `${percent.value}%` } }),
      h('span', `${props.value} / ${props.max}`)
    ])
  }
})

export default {
  components: { HealthBar },
  emits: ['complete', 'close'],
  setup() {
    const stages = [
      {
        id: 0,
        month: 'September',
        title: 'September Vanguard: The Language War',
        subtitle: 'Without language scores, applications cannot advance a single step.',
        tips: [
          'Check official program pages for total score, sub-score, accepted tests, waiver and enrollment validity.',
          'IELTS/TOEFL are usually valid for 2 years. Leave September-October for retakes instead of first attempts.',
          'Use OG, Cambridge IELTS papers and TOEFL TPO-style practice before buying random shortcuts.'
        ],
        enemy: { name: 'IELTS Dragon', icon: 'DRG', hp: 150, atk: 20 }
      },
      {
        id: 1,
        month: 'October',
        title: 'October Purgatory: The Essay War',
        subtitle: 'Writer\'s block attacks while essays, CV and RL requests collide.',
        tips: [
          'Treat the CV as an evidence inventory and the PS as a story of motive, preparation, school fit and future direction.',
          'Use a proofreader for logic and language, but keep the final审核权: the statement must sound like you.'
        ],
        enemy: { name: "Writer's Block Zombie", icon: 'ZMB', hp: 200, atk: 30 }
      },
      {
        id: 2,
        month: 'November',
        title: 'November Abyss: The Application War',
        subtitle: 'DDLs approach. Forms, payments and uploads leave no room for careless errors.',
        tips: [
          'Create a school-by-school checklist for portals, recommendation status, application fee, uploads and submission confirmation.',
          'Keep login access and final review power. Screenshot confirmation pages and receipt emails after submission.'
        ],
        enemy: { name: 'The Reaper of DDLs', icon: 'DDL', hp: 280, atk: 45 }
      }
    ]

    const mode = ref('map')
    const currentStage = ref(null)
    const cleared = reactive([false, false, false])
    const gems = ref(0)
    const level = ref(1)
    const potions = ref(4)
    const hero = reactive({ hp: 120, maxHp: 120, shield: false })
    const enemy = reactive({ name: '', icon: '', hp: 1, maxHp: 1, atk: 1 })
    const skills = reactive([])
    const battleLog = ref('Awaiting your command.')
    const settlementText = ref('')

    const clearedCount = computed(() => cleared.filter(Boolean).length)

    function isLocked(stageId) {
      return stageId > 0 && !cleared[stageId - 1]
    }

    function doorStatus(stageId) {
      if (cleared[stageId]) return 'Slain'
      if (isLocked(stageId)) return 'Sealed'
      return stages[stageId].month
    }

    function openStage(stageId) {
      if (isLocked(stageId)) {
        battleLog.value = 'Clear the previous month first.'
        return
      }

      currentStage.value = stages[stageId]
      mode.value = 'intro'
    }

    function openFinal() {
      mode.value = clearedCount.value === 3 ? 'final' : 'map'
      if (clearedCount.value !== 3) {
        battleLog.value = 'The Sanctuary is still sealed.'
      }
    }

    function returnToMap() {
      mode.value = 'map'
      currentStage.value = null
    }

    function startBattle() {
      const stage = currentStage.value
      const levelBonus = (level.value - 1) * 30
      hero.maxHp = 120 + levelBonus
      hero.hp = hero.maxHp
      hero.shield = false
      Object.assign(enemy, {
        ...stage.enemy,
        hp: stage.enemy.hp,
        maxHp: stage.enemy.hp
      })

      skills.splice(
        0,
        skills.length,
        { id: 'mock', name: 'Mock Exam Thrust', label: 'steady damage', pp: 15, maxPp: 15, power: 34, kind: 'attack' },
        { id: 'proof', name: "Proofreader's Slash", label: 'burst edit', pp: 3, maxPp: 3, power: 86, kind: 'attack' },
        { id: 'shield', name: 'Cold Email Shield', label: 'reduce next hit', pp: 5, maxPp: 5, power: 0, kind: 'shield' },
        { id: 'coffee', name: 'Iced Americano', label: 'heal', pp: potions.value, maxPp: potions.value, power: 95, kind: 'heal' }
      )

      battleLog.value = `${enemy.name} appears. Choose a command; no typewriter lock is used in this version.`
      mode.value = 'battle'
    }

    function useSkill(skill) {
      if (skill.pp <= 0 || hero.hp <= 0 || enemy.hp <= 0) return

      skill.pp -= 1

      if (skill.kind === 'attack') {
        const damage = skill.power + 6 + (level.value - 1) * 12
        enemy.hp = Math.max(0, enemy.hp - damage)
        battleLog.value = `${skill.name} hits ${enemy.name} for ${damage}.`
      } else if (skill.kind === 'shield') {
        hero.shield = true
        battleLog.value = 'Cold Email Shield is active. Next boss hit is reduced by 70%.'
      } else if (skill.kind === 'heal') {
        potions.value = Math.max(0, potions.value - 1)
        hero.hp = Math.min(hero.maxHp, hero.hp + skill.power)
        battleLog.value = `Iced Americano restored ${skill.power} HP.`
      }

      if (enemy.hp <= 0) {
        winStage()
        return
      }

      enemyCounter()
    }

    function enemyCounter() {
      let damage = enemy.atk + 10
      if (hero.shield) {
        damage = Math.ceil(damage * 0.3)
        hero.shield = false
      }
      hero.hp = Math.max(0, hero.hp - damage)
      battleLog.value += ` ${enemy.name} counters for ${damage}.`

      if (hero.hp <= 0) {
        mode.value = 'defeat'
      }
    }

    function winStage() {
      const stage = currentStage.value
      if (!cleared[stage.id]) {
        cleared[stage.id] = true
        gems.value += 1
        level.value += 1
        potions.value += 1
        settlementText.value = `First clear: +1 Artifact, level up to ${level.value}, and +1 Iced Americano.`
      } else {
        settlementText.value = 'Boss already slain. Replays do not grant additional rewards.'
      }

      mode.value = 'victory'
    }

    return {
      mode,
      stages,
      currentStage,
      cleared,
      gems,
      level,
      potions,
      hero,
      enemy,
      skills,
      battleLog,
      settlementText,
      clearedCount,
      isLocked,
      doorStatus,
      openStage,
      openFinal,
      returnToMap,
      startBattle,
      useSkill
    }
  }
}
</script>

<style scoped>
.citadel-game {
  min-height: 100%;
  padding: clamp(18px, 4vw, 64px);
  color: #f5f1e6;
  background:
    radial-gradient(circle at 50% 0%, rgba(220, 38, 38, 0.22), transparent 36%),
    linear-gradient(180deg, #0f172a 0%, #1c1917 56%, #020617 100%);
}

.citadel-hud {
  position: sticky;
  top: 10px;
  z-index: 5;
  width: min(1280px, 100%);
  margin: 0 auto;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.close-btn,
.hud-stat,
.stage-door,
.primary-btn,
.danger-btn,
.skill-btn {
  border-radius: 8px;
  font: inherit;
}

.close-btn,
.hud-stat {
  padding: 10px 14px;
  color: #fed7aa;
  background: rgba(2, 6, 23, 0.9);
  border: 1px solid rgba(251, 146, 60, 0.48);
}

.close-btn,
.stage-door,
.primary-btn,
.danger-btn,
.skill-btn {
  cursor: pointer;
}

.modal-close {
  position: absolute;
  top: 18px;
  left: 18px;
}

.citadel-map,
.battle-modal {
  width: min(1280px, 100%);
  margin: 40px auto 0;
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
  color: #fed7aa;
}

h2 {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(2rem, 6vw, 6rem);
  line-height: 0.9;
  color: #fed7aa;
}

.eyebrow {
  color: #fb923c;
  font-weight: 1000;
  text-transform: uppercase;
  letter-spacing: 0;
}

.intro {
  max-width: 820px;
  margin-top: 18px;
  color: #cbd5e1;
  line-height: 1.65;
}

.door-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-top: clamp(30px, 6vw, 90px);
}

.stage-door {
  min-height: 420px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  color: #f5f1e6;
  text-align: left;
  border: 4px solid rgba(215, 191, 133, 0.82);
  background:
    linear-gradient(to bottom, rgba(255, 255, 255, 0.1), transparent 22%),
    linear-gradient(180deg, #654321, #2b1b10);
}

.stage-door:hover:not(.locked) {
  transform: translateY(-8px);
  filter: brightness(1.1);
}

.stage-door.locked {
  cursor: not-allowed;
  filter: grayscale(1) brightness(0.65);
}

.stage-door.cleared {
  border-color: #86efac;
}

.final-door {
  background:
    linear-gradient(to bottom, rgba(250, 204, 21, 0.2), transparent 30%),
    linear-gradient(180deg, #7f1d1d, #1c1917);
}

.door-status {
  width: fit-content;
  padding: 5px 9px;
  border-radius: 999px;
  color: #111827;
  background: #fed7aa;
  font-size: 0.75rem;
  font-weight: 1000;
  text-transform: uppercase;
}

.stage-door b {
  color: #fb923c;
  text-transform: uppercase;
}

.stage-door strong {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(1.4rem, 3vw, 3.4rem);
  line-height: 0.95;
}

.stage-door small {
  color: #e5e7eb;
  line-height: 1.45;
}

.battle-modal {
  position: relative;
  min-height: calc(100vh - 150px);
  padding: clamp(62px, 8vw, 110px) clamp(16px, 4vw, 70px) 30px;
  border-radius: 8px;
  background: rgba(2, 6, 23, 0.88);
  border: 1px solid rgba(251, 146, 60, 0.35);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.48);
}

.modal-scroll {
  max-height: min(720px, calc(100vh - 220px));
  overflow: auto;
  padding: 4px 6px 12px;
}

.modal-scroll.center {
  text-align: center;
}

.intel-list {
  display: grid;
  gap: 12px;
  margin-top: 24px;
}

.intel-list p,
.message-box {
  padding: 14px;
  border-radius: 8px;
  color: #fef3c7;
  background: rgba(120, 53, 15, 0.5);
  line-height: 1.55;
}

.primary-btn,
.danger-btn {
  display: inline-block;
  margin: 24px 10px 0;
  padding: 15px 20px;
  color: #111827;
  background: #fb923c;
  border: 0;
  font-weight: 1000;
}

.danger-btn {
  color: #fff;
  background: #dc2626;
}

.battle-screen {
  display: grid;
  gap: 20px;
}

.combatants {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.fighter,
.command-deck {
  padding: clamp(16px, 3vw, 40px);
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(251, 146, 60, 0.28);
}

.fighter.enemy {
  text-align: right;
}

.sprite {
  display: block;
  margin-bottom: 16px;
  font-size: clamp(3rem, 10vw, 11rem);
  line-height: 0.8;
  font-weight: 1000;
  color: #fb923c;
}

.shield-tag {
  display: inline-block;
  margin-top: 10px;
  padding: 6px 10px;
  border-radius: 999px;
  color: #111827;
  background: #93c5fd;
  font-weight: 900;
}

:deep(.health-bar) {
  position: relative;
  height: 30px;
  margin-top: 14px;
  overflow: hidden;
  border-radius: 999px;
  background: #111827;
  border: 1px solid rgba(255, 255, 255, 0.18);
}

:deep(.health-bar i) {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #22c55e, #86efac);
  transition: width 0.25s ease;
}

:deep(.health-bar.tone-enemy i) {
  background: linear-gradient(90deg, #dc2626, #fb7185);
}

:deep(.health-bar span) {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 0.82rem;
  font-weight: 1000;
  text-shadow: 0 1px 2px #000;
}

.skill-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.skill-btn {
  min-height: 132px;
  padding: 14px;
  color: #f5f1e6;
  background: #1f2937;
  border: 1px solid rgba(251, 146, 60, 0.38);
  text-align: left;
}

.skill-btn:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.skill-btn small {
  display: block;
  margin-top: 10px;
  color: #cbd5e1;
  line-height: 1.35;
}

@media (max-width: 900px) {
  .door-grid,
  .combatants,
  .skill-grid {
    grid-template-columns: 1fr;
  }

  .stage-door {
    min-height: 260px;
  }

  .fighter.enemy {
    text-align: left;
  }
}
</style>