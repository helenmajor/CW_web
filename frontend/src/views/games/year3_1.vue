<template>
  <GameLevelScaffold
    title="申请熔炉 / Application Crucible"
    subtitle="这关把“材料依赖顺序”做成配方融合：不是让你记死，而是理解什么必须先准备，什么必须后生成。/ This fusion node teaches material dependency and sequencing."
    :guide="guide"
    tone="violet"
    :tags="['时间顺序 / Timeline logic', '材料依赖 / Material dependency']"
    status-label="已解锁配方 / Unlocked Artifacts"
    :status-text="`${inventory.length} / ${Object.keys(itemDB).length}`"
  >
    <section class="forge-layout">
      <div class="fusion-card">
        <div class="slot-grid">
          <button type="button" class="slot" :class="{ filled: selectedSlots[0] }" @click="clearSlot(0)">
            <template v-if="selectedSlots[0]">
              <span class="icon">{{ itemDB[selectedSlots[0]].icon }}</span>
              <strong>{{ itemDB[selectedSlots[0]].nameZh }}</strong>
            </template>
            <template v-else>
              Empty Slot / 空槽位
            </template>
          </button>
          <div class="plus">+</div>
          <button type="button" class="slot" :class="{ filled: selectedSlots[1] }" @click="clearSlot(1)">
            <template v-if="selectedSlots[1]">
              <span class="icon">{{ itemDB[selectedSlots[1]].icon }}</span>
              <strong>{{ itemDB[selectedSlots[1]].nameZh }}</strong>
            </template>
            <template v-else>
              Empty Slot / 空槽位
            </template>
          </button>
        </div>

        <div class="cauldron-box">
          <p>玩法映射 / Game mechanic meaning</p>
          <strong>这里的“融合”代表真实申请材料的前后依赖顺序。</strong>
          <span>例如没有基本经历和目标项目，就很难先写出有说服力的 CV 与 PS。</span>
          <button class="primary" :disabled="!canMix" @click="mixElements">执行融合 / Fuse</button>
        </div>
      </div>

      <div class="inventory-card">
        <div class="inventory-head">
          <h2>材料仓库 / Inventory</h2>
          <span>点击物品放入熔炉 / Click to cast</span>
        </div>
        <div class="inventory-grid">
          <button
            v-for="itemId in inventory"
            :key="itemId"
            type="button"
            class="item-card"
            :class="itemDB[itemId].tier"
            @click="addToSlot(itemId)"
          >
            <span class="icon">{{ itemDB[itemId].icon }}</span>
            <strong>{{ itemDB[itemId].nameZh }}</strong>
            <span>{{ itemDB[itemId].name }}</span>
          </button>
        </div>
      </div>
    </section>

    <section v-if="toast.message" class="toast" :class="toast.tone">
      <strong>{{ toast.title }}</strong>
      <p>{{ toast.message }}</p>
    </section>

    <section v-if="hasOffer" class="victory-card">
      <h2>Grand Slam Offer / 终极 Offer 已解锁</h2>
      <p>你已经把申请依赖顺序串起来了：先有经历与项目匹配，再有 CV；再由 CV 延伸出 PS 与 RL；最后把材料包和语言成绩合并成可提交的完整申请。</p>
      <div class="recipe-summary">
        <div>经历 + 项目要求 → CV</div>
        <div>CV + 个人动机 → PS</div>
        <div>CV + 导师背书 → RL</div>
        <div>PS + RL → Application Package</div>
        <div>Package + 语言成绩 → Offer</div>
      </div>
      <div class="actions">
        <button class="secondary" @click="resetSlots">继续试配方 / Keep Exploring</button>
        <button class="primary" @click="completeLevel">保存时间线逻辑 / Save Timeline Takeaway</button>
      </div>
    </section>
  </GameLevelScaffold>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import GameLevelScaffold from '@/components/GameLevelScaffold.vue'
import { useLevelGuide } from '@/composables/useLevelGuide'

const emit = defineEmits(['complete'])
const { guide, rewardCoins } = useLevelGuide('y3', 1)

const itemDB = {
  exp: { id: 'exp', name: 'Experience Fragments', nameZh: '经历碎片', icon: '📝', tier: 'tier-1' },
  school: { id: 'school', name: 'Program Requirements', nameZh: '项目要求', icon: '🏫', tier: 'tier-1' },
  story: { id: 'story', name: 'Personal Motive', nameZh: '个人动机', icon: '🔥', tier: 'tier-1' },
  prof: { id: 'prof', name: "Mentor's Support", nameZh: '导师支持', icon: '👨‍🏫', tier: 'tier-1' },
  eng: { id: 'eng', name: 'Language Score', nameZh: '语言成绩', icon: '📖', tier: 'tier-1' },
  cv: { id: 'cv', name: 'Draft CV', nameZh: '初版 CV', icon: '📋', tier: 'tier-2' },
  ps: { id: 'ps', name: 'Draft PS', nameZh: '初版 PS', icon: '✨', tier: 'tier-3' },
  rl: { id: 'rl', name: 'Recommendation Letter', nameZh: '推荐信', icon: '🤝', tier: 'tier-3' },
  package: { id: 'package', name: 'Application Package', nameZh: '申请材料包', icon: '📦', tier: 'tier-4' },
  offer: { id: 'offer', name: 'Offer', nameZh: '最终 Offer', icon: '🎓', tier: 'tier-4' },
}

const recipes = [
  { ing: ['exp', 'school'], result: 'cv', title: 'CV 生成 / CV forged', message: '先有经历和项目要求，你才能写出针对性的 CV。现实里这一步对应“整理经历并对照项目要求”。' },
  { ing: ['cv', 'story'], result: 'ps', title: 'PS 生成 / PS forged', message: 'PS 不该凭空写，它通常建立在 CV 已经整理好的经历基础上，再加入动机与反思。' },
  { ing: ['cv', 'prof'], result: 'rl', title: 'RL 生成 / RL forged', message: '推荐信也需要你的 CV 或信息包来帮推荐人快速回忆你的亮点。' },
  { ing: ['ps', 'rl'], result: 'package', title: '材料包生成 / Application package forged', message: '当 PS 与 RL 成型后，核心主申请材料包才算完整。' },
  { ing: ['package', 'eng'], result: 'offer', title: 'Offer 生成 / Offer summoned', message: '完整材料包再加上语言门槛，才更接近真实可提交的申请。' },
]

const failureNotes = [
  { check: ['exp', 'story'], message: '经历和动机都很重要，但没有项目要求参照时，你还没真正进入“面向申请”的写作阶段。' },
  { check: ['ps', 'prof'], message: '直接拿 PS 去找推荐人通常效率不高。推荐人更需要 CV 和信息包来快速了解你的亮点。' },
  { check: ['package', 'story'], message: '材料包已经成型，再补动机并不会替代语言门槛或正式提交要求。' },
]

const inventory = ref(['exp', 'school', 'story', 'prof', 'eng'])
const selectedSlots = ref([null, null])
const toast = reactive({
  title: '',
  message: '',
  tone: 'success',
})

const canMix = computed(() => Boolean(selectedSlots.value[0] && selectedSlots.value[1]))
const hasOffer = computed(() => inventory.value.includes('offer'))

function addToSlot(itemId) {
  if (selectedSlots.value.includes(itemId)) return
  if (!selectedSlots.value[0]) {
    selectedSlots.value[0] = itemId
    return
  }
  if (!selectedSlots.value[1]) {
    selectedSlots.value[1] = itemId
    return
  }
  showToast('warning', '熔炉已满 / Cauldron full', '请先融合或清空一个槽位。/ Fuse or clear one slot first.')
}

function clearSlot(index) {
  selectedSlots.value[index] = null
}

function resetSlots() {
  selectedSlots.value = [null, null]
}

function samePair(list, left, right) {
  return list.includes(left) && list.includes(right)
}

function mixElements() {
  if (!canMix.value) return

  const [left, right] = selectedSlots.value
  const recipe = recipes.find((entry) => samePair(entry.ing, left, right))

  if (recipe) {
    if (!inventory.value.includes(recipe.result)) {
      inventory.value = [...inventory.value, recipe.result]
    }

    showToast('success', recipe.title, recipe.message)
    resetSlots()
    return
  }

  const failure = failureNotes.find((entry) => samePair(entry.check, left, right))
  showToast(
    'error',
    '配方不成立 / Invalid pairing',
    failure?.message || '这两个元素之间还没有形成真实申请逻辑。请想想哪一步必须先完成，哪一步必须后生成。',
  )
  resetSlots()
}

function showToast(tone, title, message) {
  toast.tone = tone
  toast.title = title
  toast.message = message
}

function completeLevel() {
  emit('complete', {
    rewardCoins,
    preferences: {
      latestTakeaway: '申请材料不是并列出现的，它们有真实的依赖顺序。/ Application materials are not parallel artifacts; they depend on each other in sequence.',
    },
  })
}
</script>

<style scoped>
.forge-layout {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 18px;
}

.fusion-card,
.inventory-card,
.toast,
.victory-card {
  border-radius: 24px;
  border: 1px solid rgba(129, 140, 248, 0.18);
  background: rgba(15, 23, 42, 0.78);
  color: #e2e8f0;
  padding: 22px;
}

.slot-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 16px;
  align-items: center;
}

.slot {
  min-height: 140px;
  border-radius: 20px;
  border: 1px dashed rgba(129, 140, 248, 0.4);
  background: rgba(0, 0, 0, 0.24);
  color: #cbd5e1;
  cursor: pointer;
  display: grid;
  place-items: center;
  text-align: center;
  padding: 16px;
}

.slot.filled {
  border-style: solid;
  background: linear-gradient(135deg, #3730a3, #1e1b4b);
  color: #fff;
}

.slot .icon,
.item-card .icon {
  font-size: 2rem;
}

.plus {
  font-size: 2rem;
  color: #818cf8;
  font-weight: 900;
}

.cauldron-box {
  margin-top: 20px;
  display: grid;
  gap: 8px;
  padding: 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.05);
}

.cauldron-box p {
  margin: 0;
  color: #c4b5fd;
  font-weight: 900;
}

.cauldron-box span {
  line-height: 1.7;
  color: #cbd5e1;
}

.primary,
.secondary {
  border: none;
  border-radius: 999px;
  padding: 12px 18px;
  font-weight: 900;
  cursor: pointer;
}

.primary {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
}

.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.secondary {
  background: rgba(255, 255, 255, 0.08);
  color: #f8fafc;
}

.inventory-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
}

.inventory-head h2,
.victory-card h2 {
  margin: 0;
  color: #f8fafc;
  font-family: Georgia, serif;
}

.inventory-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 12px;
}

.item-card {
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  background: rgba(30, 41, 59, 0.9);
  color: #f8fafc;
  padding: 14px;
  text-align: center;
  cursor: pointer;
  display: grid;
  gap: 6px;
}

.item-card.tier-2 { border-color: rgba(59, 130, 246, 0.4); }
.item-card.tier-3 { border-color: rgba(168, 85, 247, 0.4); }
.item-card.tier-4 { border-color: rgba(245, 158, 11, 0.48); }

.toast.success {
  border-left: 4px solid #22c55e;
}

.toast.warning {
  border-left: 4px solid #f59e0b;
}

.toast.error {
  border-left: 4px solid #ef4444;
}

.toast strong {
  color: #f8fafc;
}

.toast p,
.victory-card p {
  margin: 8px 0 0;
  line-height: 1.8;
}

.recipe-summary {
  margin-top: 16px;
  display: grid;
  gap: 10px;
}

.recipe-summary div {
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
}

.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 18px;
}

@media (max-width: 920px) {
  .forge-layout {
    grid-template-columns: 1fr;
  }
}
</style>
