<template>
  <div class="forge">
    <div class="topbar">
      <div>
        <h1><i class="fas fa-id-card"></i> 身份锻炉 / Identity Forge</h1>
        <p>先定义你的申请者起点，再进入地区选择和选校判断。/ Define your applicant baseline before moving into route choice and school strategy.</p>
      </div>
      <div class="charge">锻造进度 / Forge Charge {{ chargedChoices }} / 4</div>
    </div>

    <div class="guide-shell">
      <LevelGuideCard :guide="guide" :context-tags="guideTags" />
    </div>

    <div class="main">
      <section class="preview">
        <p class="label">实时预览 / Live Preview</p>
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
            <h2>申请者档案卡 / Applicant Card</h2>
            <div class="badge"><i class="fas" :class="selectedRoleIcon"></i></div>
          </div>
          <div class="row"><span class="key">代号 / Codename</span><span class="value">{{ displayName }}</span></div>
          <div class="row"><span class="key">画像 / Archetype</span><span class="value">{{ selectedRole?.nameZhEn || '待选择 / Awaiting choice' }}</span></div>
          <div class="row"><span class="key">发色 / Hair Rune</span><span class="value">{{ selectedHair?.nameZhEn || '待选择 / Awaiting choice' }}</span></div>
          <div class="row"><span class="key">服装 / Uniform Aura</span><span class="value">{{ selectedOutfit?.nameZhEn || '待选择 / Awaiting choice' }}</span></div>
          <div class="row"><span class="key">工具 / Familiar Tool</span><span class="value">{{ selectedTool?.nameZhEn || '待选择 / Awaiting choice' }}</span></div>
        </div>
      </section>

      <section class="panel">
        <p class="label">锻造控制台 / Forging Console</p>

        <div ref="nameRef" class="box" :class="{ missing: showValidation && !state.name }">
          <label for="codename">1. 选择代号 / Choose your codename</label>
          <input id="codename" v-model.trim="state.name" maxlength="18" placeholder="示例 / Example: Nova / Atlas / Iris">
        </div>

        <div v-if="validationMessage" class="validation-banner">
          <i class="fas fa-triangle-exclamation"></i>
          <span>{{ validationMessage }}</span>
        </div>

        <div class="groups">
          <div ref="roleRef" class="group" :class="{ missing: showValidation && !selectedRole }">
            <h3>2. 选择学习画像 / Select your study archetype</h3>
            <p>这会影响你后续如何理解申请任务。/ This sets the lens through which you approach later planning tasks.</p>
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
                <strong>{{ role.nameZhEn }}</strong>
                <span>{{ role.copyZhEn }}</span>
              </button>
            </div>
          </div>

          <div ref="hairRef" class="group" :class="{ missing: showValidation && !selectedHair }">
            <h3>3. 选择外观标记 / Infuse a hair rune</h3>
            <p>这是地图角色的实时视觉反馈。/ This becomes a live visual change on your traveler.</p>
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
                <strong>{{ hair.nameZhEn }}</strong>
              </button>
            </div>
          </div>

          <div ref="outfitRef" class="group" :class="{ missing: showValidation && !selectedOutfit }">
            <h3>4. 选择阶段徽色 / Choose a uniform aura</h3>
            <p>它会强化你当前阶段的身份感。/ This reinforces your current planning-stage identity.</p>
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
                <strong>{{ outfit.nameZhEn }}</strong>
              </button>
            </div>
          </div>

          <div ref="toolRef" class="group" :class="{ missing: showValidation && !selectedTool }">
            <h3>5. 选择代表工具 / Carry one familiar tool</h3>
            <p>它代表你解决申请问题时最依赖的能力。/ It represents the strength you rely on when solving application problems.</p>
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
                <strong>{{ tool.nameZhEn }}</strong>
                <span>{{ tool.copyZhEn }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="progress">
          <strong>{{ chargedChoices }} / 4 项已完成 / sigils charged</strong>
          <div class="progressbar">
            <div class="fill" :style="{ width: `${chargedChoices * 25}%` }"></div>
          </div>
          <p>{{ progressCopy }}</p>
        </div>

        <div class="foot">
          <span>完成后，地图角色与阶段身份会即时更新。/ Finishing here updates your live traveler card and map avatar.</span>
          <button class="primary" @click="attemptSeal">封印身份 / Seal Identity</button>
        </div>
      </section>
    </div>

    <div v-if="showSummary" class="modal" @click.self="showSummary = false">
      <div class="modalcard">
        <h2><i class="fas fa-wand-sparkles"></i> 身份已封印 / Identity Sealed</h2>
        <p>你已经完成申请者起点设定。返回后会解锁地区路线选择，并把这份画像应用到地图角色上。/ Your traveler baseline is now ready, and Y2-2 route selection will build on it.</p>
        <div class="pill"><i class="fas fa-user"></i> {{ forgedProfile.name }}</div>
        <div class="pill"><i class="fas" :class="selectedRoleIcon"></i> {{ forgedProfile.archetype }}</div>
        <div class="pill"><i class="fas fa-wand-sparkles"></i> {{ forgedProfile.familiar }}</div>
        <div class="actions">
          <button class="secondary" @click="showSummary = false">继续微调 / Refine Again</button>
          <button class="primary2" @click="returnToMap">返回地图 / Return To Map</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import LevelGuideCard from '@/components/LevelGuideCard.vue'

const emit = defineEmits(['complete', 'close'])

const roles = [
  { id: 'analyst', name: 'Quiet Analyst', nameZhEn: '冷静分析者 / Quiet Analyst', icon: 'fa-chart-line', copyZhEn: '偏向结构化和证据化思考。/ Plans with structure and evidence.' },
  { id: 'storyweaver', name: 'Story Weaver', nameZhEn: '叙事编织者 / Story Weaver', icon: 'fa-feather-pointed', copyZhEn: '擅长把经历组织成有记忆点的故事。/ Turns ideas into memorable stories.' },
  { id: 'trailblazer', name: 'Trailblazer', nameZhEn: '先行探索者 / Trailblazer', icon: 'fa-compass', copyZhEn: '喜欢快速试错并主动开路。/ Explores first and learns fast.' },
]

const hairs = [
  { id: 'walnut', name: 'Walnut', nameZhEn: '胡桃 / Walnut', color: '#3a2a25' },
  { id: 'midnight', name: 'Midnight', nameZhEn: '夜幕 / Midnight', color: '#1f2937' },
  { id: 'ember', name: 'Ember', nameZhEn: '余烬 / Ember', color: '#8a3f1f' },
]

const outfits = [
  { id: 'amber', name: 'Amber', nameZhEn: '琥珀 / Amber', color: '#ffd46d' },
  { id: 'azure', name: 'Azure', nameZhEn: '湛蓝 / Azure', color: '#7dc6ff' },
  { id: 'rose', name: 'Rose', nameZhEn: '蔷薇 / Rose', color: '#ff9f9f' },
]

const tools = [
  { id: 'quill', name: 'Quill of Clarity', nameZhEn: '清晰羽笔 / Quill of Clarity', icon: 'fa-pen-nib', copyZhEn: '把混乱想法整理成清楚表达。/ Shapes messy thoughts into crisp language.' },
  { id: 'prism', name: 'Prism Lens', nameZhEn: '棱镜透镜 / Prism Lens', icon: 'fa-gem', copyZhEn: '把复杂问题拆成更清楚的角度。/ Breaks one problem into clean angles.' },
  { id: 'satchel', name: 'Compass Satchel', nameZhEn: '罗盘行囊 / Compass Satchel', icon: 'fa-bag-shopping', copyZhEn: '当计划变化时保持秩序和机动性。/ Keeps essentials ready when plans shift.' },
]

const state = reactive({
  name: '',
  roleId: '',
  hairId: '',
  outfitId: '',
  toolId: '',
})

const showSummary = ref(false)
const showValidation = ref(false)
const validationMessage = ref('')
const nameRef = ref(null)
const roleRef = ref(null)
const hairRef = ref(null)
const outfitRef = ref(null)
const toolRef = ref(null)

const guide = {
  eyebrow: '本关学习目标 / Learning Goal',
  summary: 'Define your baseline as an applicant before making later planning decisions.',
  summaryZh: '在做后续申请判断前，先定义你的申请者起点。',
  learn: '你将学会什么 / What you will learn',
  learnBody: 'How to summarize your profile into a clear archetype, visible identity, and problem-solving strength.',
  learnBodyZh: '学会把自己的背景概括成清晰的申请画像、可视化身份和问题解决风格。',
  realTask: '本关对应的真实申请任务 / Real-world application task',
  realTaskBody: 'Create a simple applicant profile card that later route and school decisions can build on.',
  realTaskBodyZh: '建立一张后续地区选择和选校定位都能沿用的申请者基础画像卡。',
  mechanics: [
    { term: '学习画像 / Archetype', meaning: 'maps to the way you present yourself in later applications and narratives.' },
    { term: '实时外观 / Live avatar', meaning: 'gives immediate visual feedback so your planning stage feels tangible.' },
    { term: '代表工具 / Familiar tool', meaning: 'stands for the strength you naturally use when solving study-abroad planning problems.' },
  ],
  help: '缺少选项时会直接提示你哪里还没完成。/ If something is missing, the page will tell you exactly which section still needs attention.',
}

const guideTags = ['起点建模 / Baseline setup', '角色实时变化 / Live avatar changes']

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
  if (!state.name) return '先填写代号，再继续定义申请者画像。/ Start by naming your traveler.'
  if (chargedChoices.value < 4) return '还差一些信息未完成，补齐后你的申请者画像才足够稳定。/ Finish the remaining choices to stabilize your applicant identity.'
  return '五项信息已完整，你的申请者基础画像已经成型。/ Your baseline applicant identity is ready.'
})

const avatarStyle = computed(() => ({
  '--hair': selectedHair.value?.color || '#3a2a25',
  '--outfit': selectedOutfit.value?.color || '#ffd46d',
}))

const forgedProfile = computed(() => ({
  name: displayName.value,
  archetype: selectedRole.value?.nameZhEn || '待选择 / Awaiting role',
  familiar: selectedTool.value?.nameZhEn || '待选择 / Awaiting tool',
  avatar: {
    hairColor: selectedHair.value?.color || '#3a2a25',
    outfitColor: selectedOutfit.value?.color || '#ffd46d',
  },
  sigilIcon: selectedRole.value?.icon || 'fa-star',
}))

function scrollToFirstMissing() {
  const target = [
    !state.name && nameRef.value,
    !selectedRole.value && roleRef.value,
    !selectedHair.value && hairRef.value,
    !selectedOutfit.value && outfitRef.value,
    !selectedTool.value && toolRef.value,
  ].find(Boolean)

  target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function attemptSeal() {
  showValidation.value = true

  if (sealReady.value) {
    validationMessage.value = ''
    showSummary.value = true
    return
  }

  const missing = []
  if (!state.name) missing.push('代号 / codename')
  if (!selectedRole.value) missing.push('学习画像 / study archetype')
  if (!selectedHair.value) missing.push('外观标记 / appearance mark')
  if (!selectedOutfit.value) missing.push('阶段徽色 / uniform aura')
  if (!selectedTool.value) missing.push('代表工具 / familiar tool')

  validationMessage.value = `你还没有完成：${missing.join('、')}。请先补全高亮区域。/ You still need to complete: ${missing.join(', ')}. Please finish the highlighted section first.`
  scrollToFirstMissing()
}

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

.guide-shell {
  padding: 0 28px 18px;
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

.box.missing,
.group.missing {
  border-color: rgba(248, 113, 113, 0.55);
  box-shadow: 0 0 0 1px rgba(248, 113, 113, 0.22);
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

.validation-banner {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 18px;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(127, 29, 29, 0.28);
  border: 1px solid rgba(248, 113, 113, 0.38);
  color: #fee2e2;
  line-height: 1.5;
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
  .guide-shell,
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
