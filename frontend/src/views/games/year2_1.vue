<template>
  <div class="forge">
    <div class="topbar">
      <div>
        <h1><i class="fas fa-id-card"></i> Identity Forge</h1>
        <p>Forge a brand-new student identity for Y2-1. This replaces the repeated portal game and sends your traveler back to the map.</p>
      </div>
      <div class="charge">Forge Charge {{ chargedChoices }} / 4</div>
    </div>

    <div class="main">
      <section class="preview">
        <p class="label">Live Preview</p>
        <div class="stage">
          <div class="avatar" :style="avatarStyle">
            <div class="halo"></div>
            <div class="sigil"><i class="fas" :class="selectedRoleIcon"></i></div>
            <div class="hair"></div>
            <div class="face"></div>
            <div class="outfit"></div>
            <div class="shadow"></div>
          </div>
        </div>

        <div class="card">
          <div class="cardhead">
            <h2>Arcane Student Card</h2>
            <div class="badge"><i class="fas" :class="selectedRoleIcon"></i></div>
          </div>
          <div class="row"><span class="key">Codename</span><span class="value">{{ displayName }}</span></div>
          <div class="row"><span class="key">Archetype</span><span class="value">{{ selectedRole?.name || 'Awaiting choice' }}</span></div>
          <div class="row"><span class="key">Hair Rune</span><span class="value">{{ selectedHair?.name || 'Awaiting choice' }}</span></div>
          <div class="row"><span class="key">Uniform Aura</span><span class="value">{{ selectedOutfit?.name || 'Awaiting choice' }}</span></div>
          <div class="row"><span class="key">Familiar Tool</span><span class="value">{{ selectedTool?.name || 'Awaiting choice' }}</span></div>
        </div>
      </section>

      <section class="panel">
        <p class="label">Forging Console</p>

        <div class="box">
          <label for="codename">1. Choose your codename</label>
          <input id="codename" v-model.trim="state.name" maxlength="18" placeholder="Example: Nova / Atlas / Iris">
        </div>

        <div class="groups">
          <div class="group">
            <h3>2. Select your study archetype</h3>
            <p>This determines the sigil shown on your card.</p>
            <div class="grid3">
              <button
                v-for="role in roles"
                :key="role.id"
                type="button"
                class="opt"
                :class="{ sel: state.roleId === role.id }"
                @click="state.roleId = role.id"
              >
                <i class="fas" :class="role.icon"></i>
                <strong>{{ role.name }}</strong>
                <span>{{ role.copy }}</span>
              </button>
            </div>
          </div>

          <div class="group">
            <h3>3. Infuse a hair rune</h3>
            <p>A small visual signature for the traveler on the map.</p>
            <div class="grid3">
              <button
                v-for="hair in hairs"
                :key="hair.id"
                type="button"
                class="swatch"
                :class="{ sel: state.hairId === hair.id }"
                @click="state.hairId = hair.id"
              >
                <span class="dot" :style="{ background: hair.color }"></span>
                <strong>{{ hair.name }}</strong>
              </button>
            </div>
          </div>

          <div class="group">
            <h3>4. Choose a uniform aura</h3>
            <p>This becomes the main outfit color for your traveler.</p>
            <div class="grid3">
              <button
                v-for="outfit in outfits"
                :key="outfit.id"
                type="button"
                class="swatch"
                :class="{ sel: state.outfitId === outfit.id }"
                @click="state.outfitId = outfit.id"
              >
                <span class="dot" :style="{ background: outfit.color }"></span>
                <strong>{{ outfit.name }}</strong>
              </button>
            </div>
          </div>

          <div class="group">
            <h3>5. Carry one familiar tool</h3>
            <p>Every explorer needs one item that represents how they solve problems.</p>
            <div class="grid3">
              <button
                v-for="tool in tools"
                :key="tool.id"
                type="button"
                class="opt"
                :class="{ sel: state.toolId === tool.id }"
                @click="state.toolId = tool.id"
              >
                <i class="fas" :class="tool.icon"></i>
                <strong>{{ tool.name }}</strong>
                <span>{{ tool.copy }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="progress">
          <strong>{{ chargedChoices }} / 4 sigils charged</strong>
          <div class="progressbar">
            <div class="fill" :style="{ width: `${chargedChoices * 25}%` }"></div>
          </div>
          <p>{{ progressCopy }}</p>
        </div>

        <div class="foot">
          <span>This native Vue version sends appearance data straight into the Pinia store.</span>
          <button class="primary" :disabled="!sealReady" @click="showSummary = true">Seal Identity</button>
        </div>
      </section>
    </div>

    <div v-if="showSummary" class="modal" @click.self="showSummary = false">
      <div class="modalcard">
        <h2><i class="fas fa-wand-sparkles"></i> Identity Sealed</h2>
        <p>Your traveler is ready. Returning will unlock Y2-2 and apply this appearance to the little character on the main map.</p>
        <div class="pill"><i class="fas fa-user"></i> {{ forgedProfile.name }}</div>
        <div class="pill"><i class="fas" :class="selectedRoleIcon"></i> {{ forgedProfile.archetype }}</div>
        <div class="pill"><i class="fas fa-wand-sparkles"></i> {{ forgedProfile.familiar }}</div>
        <div class="actions">
          <button class="secondary" @click="showSummary = false">Refine Again</button>
          <button class="primary2" @click="returnToMap">Return To Map</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

const emit = defineEmits(['complete', 'close'])

const roles = [
  { id: 'analyst', name: 'Quiet Analyst', icon: 'fa-chart-line', copy: 'Plans with structure and evidence.' },
  { id: 'storyweaver', name: 'Story Weaver', icon: 'fa-feather-pointed', copy: 'Turns ideas into memorable stories.' },
  { id: 'trailblazer', name: 'Trailblazer', icon: 'fa-compass', copy: 'Explores first and learns fast.' },
]

const hairs = [
  { id: 'walnut', name: 'Walnut', color: '#3a2a25' },
  { id: 'midnight', name: 'Midnight', color: '#1f2937' },
  { id: 'ember', name: 'Ember', color: '#8a3f1f' },
]

const outfits = [
  { id: 'amber', name: 'Amber', color: '#ffd46d' },
  { id: 'azure', name: 'Azure', color: '#7dc6ff' },
  { id: 'rose', name: 'Rose', color: '#ff9f9f' },
]

const tools = [
  { id: 'quill', name: 'Quill of Clarity', icon: 'fa-pen-nib', copy: 'Shapes messy thoughts into crisp language.' },
  { id: 'prism', name: 'Prism Lens', icon: 'fa-gem', copy: 'Breaks one problem into clean angles.' },
  { id: 'satchel', name: 'Compass Satchel', icon: 'fa-bag-shopping', copy: 'Keeps essentials ready when plans shift.' },
]

const state = reactive({
  name: '',
  roleId: '',
  hairId: '',
  outfitId: '',
  toolId: '',
})

const showSummary = ref(false)

const selectedRole = computed(() => roles.find((item) => item.id === state.roleId) ?? null)
const selectedHair = computed(() => hairs.find((item) => item.id === state.hairId) ?? null)
const selectedOutfit = computed(() => outfits.find((item) => item.id === state.outfitId) ?? null)
const selectedTool = computed(() => tools.find((item) => item.id === state.toolId) ?? null)

const displayName = computed(() => state.name || 'Unforged')
const selectedRoleIcon = computed(() => selectedRole.value?.icon || 'fa-star')

const chargedChoices = computed(() => {
  let charged = 0
  if (selectedRole.value) charged += 1
  if (selectedHair.value) charged += 1
  if (selectedOutfit.value) charged += 1
  if (selectedTool.value) charged += 1
  return charged
})

const sealReady = computed(() => Boolean(
  state.name &&
  selectedRole.value &&
  selectedHair.value &&
  selectedOutfit.value &&
  selectedTool.value,
))

const progressCopy = computed(() => {
  if (!state.name) return 'Start by giving your traveler a codename.'
  if (chargedChoices.value < 4) return 'Keep charging the remaining sigils until the identity is stable enough to seal.'
  return 'All four sigils are charged. Your student card is ready.'
})

const avatarStyle = computed(() => ({
  '--hair': selectedHair.value?.color || '#3a2a25',
  '--outfit': selectedOutfit.value?.color || '#ffd46d',
}))

const forgedProfile = computed(() => ({
  name: displayName.value,
  archetype: selectedRole.value?.name || 'Awaiting role',
  familiar: selectedTool.value?.name || 'Awaiting tool',
  avatar: {
    hairColor: selectedHair.value?.color || '#3a2a25',
    outfitColor: selectedOutfit.value?.color || '#ffd46d',
  },
  sigilIcon: selectedRole.value?.icon || 'fa-star',
}))

function returnToMap() {
  emit('complete', {
    profile: forgedProfile.value,
  })
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.forge {
  width: 100%;
  min-height: 100%;
  background: rgba(14, 20, 35, 0.84);
  color: #eef2ff;
  border-radius: 22px;
  overflow: hidden;
}

.topbar {
  padding: 24px 28px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  background: linear-gradient(to bottom, rgba(148, 163, 184, 0.08), transparent);
}

.topbar h1 {
  margin: 0;
  font-size: 2rem;
  font-family: Georgia, serif;
  color: #f8d6a2;
  text-shadow: 0 0 16px rgba(248, 214, 162, 0.28);
}

.topbar p {
  margin: 8px 0 0;
  color: #a8b4d1;
  line-height: 1.45;
}

.charge {
  padding: 12px 18px;
  border-radius: 999px;
  white-space: nowrap;
  font-weight: 800;
  color: #fde68a;
  background: rgba(30, 41, 59, 0.72);
  border: 1px solid rgba(248, 214, 162, 0.28);
}

.main {
  display: grid;
  grid-template-columns: 1fr 1.15fr;
}

.preview,
.panel {
  padding: 24px 28px 28px;
}

.preview {
  border-right: 1px solid rgba(148, 163, 184, 0.12);
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(10, 14, 27, 0.98));
}

.label {
  margin: 0 0 14px;
  color: #cbd5f5;
  font-size: 0.84rem;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-weight: 800;
}

.stage {
  min-height: 280px;
  border-radius: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background: radial-gradient(circle at center, rgba(129, 140, 248, 0.16), transparent 42%), linear-gradient(180deg, rgba(30, 41, 59, 0.72), rgba(15, 23, 42, 0.92));
  border: 1px solid rgba(129, 140, 248, 0.14);
}

.avatar {
  position: relative;
  width: 180px;
  height: 210px;
}

.halo {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  width: 112px;
  height: 112px;
  border-radius: 50%;
  border: 2px solid rgba(248, 214, 162, 0.5);
  box-shadow: 0 0 30px rgba(248, 214, 162, 0.16);
}

.sigil {
  position: absolute;
  left: 50%;
  top: 44px;
  transform: translateX(-50%);
  color: #fde68a;
  font-size: 1.45rem;
  filter: drop-shadow(0 0 8px rgba(250, 204, 21, 0.5));
}

.shadow {
  position: absolute;
  left: 50%;
  bottom: 12px;
  transform: translateX(-50%);
  width: 90px;
  height: 18px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.35);
  filter: blur(4px);
}

.hair {
  position: absolute;
  left: 50%;
  top: 34px;
  transform: translateX(-50%);
  width: 74px;
  height: 34px;
  background: var(--hair);
  border: 4px solid #273640;
  border-bottom: none;
  border-radius: 24px 24px 12px 12px;
  z-index: 3;
}

.face {
  position: absolute;
  left: 50%;
  top: 42px;
  transform: translateX(-50%);
  width: 66px;
  height: 64px;
  background: #ffe8c7;
  border: 4px solid #273640;
  border-radius: 50% 50% 46% 46%;
  z-index: 2;
}

.face::before,
.face::after {
  content: '';
  position: absolute;
  top: 22px;
  width: 8px;
  height: 10px;
  border-radius: 50%;
  background: #273640;
}

.face::before {
  left: 16px;
}

.face::after {
  right: 16px;
}

.outfit {
  position: absolute;
  left: 50%;
  top: 112px;
  transform: translateX(-50%);
  width: 74px;
  height: 60px;
  background: var(--outfit);
  border: 4px solid #273640;
  border-radius: 18px 18px 12px 12px;
}

.outfit::before {
  content: '';
  position: absolute;
  left: 50%;
  top: -8px;
  transform: translateX(-50%);
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #f8fafc;
  border: 3px solid #273640;
}

.card {
  margin-top: 18px;
  padding: 18px;
  border-radius: 20px;
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.96), rgba(15, 23, 42, 0.98));
  border: 1px solid rgba(248, 214, 162, 0.2);
}

.cardhead {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.cardhead h2 {
  margin: 0;
  font-size: 1.08rem;
  color: #f8d6a2;
  font-family: Georgia, serif;
}

.badge {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #fde68a;
  background: rgba(248, 214, 162, 0.08);
  border: 1px solid rgba(248, 214, 162, 0.2);
}

.row {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.03);
  margin-top: 8px;
}

.key {
  color: #94a3b8;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.value {
  color: #f8fafc;
  font-weight: 700;
  text-align: right;
}

.panel {
  background: linear-gradient(180deg, rgba(12, 18, 32, 0.88), rgba(8, 11, 22, 0.96));
}

.box,
.group,
.progress {
  padding: 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(148, 163, 184, 0.12);
}

.box {
  margin-bottom: 18px;
}

.box label {
  display: block;
  margin-bottom: 10px;
  color: #dbe4ff;
  font-weight: 700;
}

input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.9);
  color: #f8fafc;
  font-size: 1rem;
  outline: none;
}

input:focus {
  border-color: rgba(96, 165, 250, 0.6);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.12);
}

.groups {
  display: grid;
  gap: 18px;
}

.group h3 {
  margin: 0 0 6px;
  color: #f8fafc;
  font-size: 1rem;
}

.group p {
  margin: 0 0 14px;
  color: #94a3b8;
  line-height: 1.45;
  font-size: 0.92rem;
}

.grid3 {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.opt,
.swatch {
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 16px;
  cursor: pointer;
  color: #e2e8f0;
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.96), rgba(15, 23, 42, 0.96));
  transition: 0.18s;
}

.opt:hover,
.swatch:hover {
  transform: translateY(-2px);
  border-color: rgba(248, 214, 162, 0.42);
}

.opt.sel,
.swatch.sel {
  border-color: #f8d6a2;
  box-shadow: 0 0 0 1px rgba(248, 214, 162, 0.25);
}

.opt {
  min-height: 94px;
  padding: 14px 12px;
  text-align: left;
}

.opt i {
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  margin-bottom: 10px;
  border-radius: 12px;
  color: #f8d6a2;
  background: rgba(248, 214, 162, 0.08);
}

.opt strong {
  display: block;
  margin-bottom: 5px;
  color: #f8fafc;
}

.opt span {
  display: block;
  color: #94a3b8;
  font-size: 0.84rem;
  line-height: 1.35;
}

.swatch {
  padding: 12px;
  text-align: center;
}

.dot {
  display: block;
  width: 34px;
  height: 34px;
  margin: 0 auto 8px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.65);
}

.swatch strong {
  font-size: 0.92rem;
}

.progress {
  margin-top: 18px;
}

.progressbar {
  height: 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.7);
  overflow: hidden;
  margin-top: 10px;
}

.fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #60a5fa, #f472b6, #fbbf24);
  transition: width 0.25s ease;
}

.progress p {
  margin: 12px 0 0;
  color: #cbd5e1;
  line-height: 1.45;
  font-size: 0.92rem;
}

.foot {
  margin-top: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.foot span {
  color: #94a3b8;
  font-size: 0.9rem;
}

.primary,
.primary2,
.secondary {
  border: none;
  border-radius: 999px;
  font-weight: 900;
  cursor: pointer;
}

.primary {
  padding: 14px 24px;
  font-size: 1rem;
  color: #1f2937;
  background: linear-gradient(135deg, #fde68a, #f8b86f);
  box-shadow: 0 10px 24px rgba(248, 184, 111, 0.24);
}

.primary:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}

.modal {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background: rgba(4, 8, 16, 0.86);
  backdrop-filter: blur(10px);
}

.modalcard {
  width: min(520px, 100%);
  padding: 28px;
  border-radius: 28px;
  background: linear-gradient(145deg, #1a2235, #0f172a);
  border: 1px solid rgba(248, 214, 162, 0.22);
  box-shadow: 0 30px 50px rgba(0, 0, 0, 0.45);
}

.modalcard h2 {
  margin: 0 0 10px;
  color: #fde68a;
  font-family: Georgia, serif;
}

.modalcard p {
  margin: 0 0 16px;
  color: #cbd5e1;
  line-height: 1.55;
}

.pill {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  font-weight: 700;
  margin: 0 10px 10px 0;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.secondary,
.primary2 {
  padding: 12px 18px;
}

.secondary {
  color: #dbe4ff;
  background: rgba(255, 255, 255, 0.08);
}

.primary2 {
  color: #1f2937;
  background: linear-gradient(135deg, #fde68a, #f8b86f);
}

@media (max-width: 920px) {
  .main {
    grid-template-columns: 1fr;
  }

  .preview {
    border-right: none;
    border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  }
}

@media (max-width: 700px) {
  .topbar,
  .preview,
  .panel {
    padding-left: 18px;
    padding-right: 18px;
  }

  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .grid3 {
    grid-template-columns: 1fr;
  }
}
</style>