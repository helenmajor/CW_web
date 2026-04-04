<template>
  <div class="alchemy-room">
    <!-- 头部标题 -->
    <div class="header">
      <h2><i class="fas fa-flask"></i> 命运坩埚：申请炼金术</h2>
      <p>不再死记硬背时间线！请在下方选中 2 个元素投入坩埚，探索合成出终极材料【大满贯 Offer】的配方。</p>
    </div>

    <!-- 炼金操作区 -->
    <div 
      class="cauldron-area" 
      :class="{ 'shake-error': shakeError }"
    >
      <!-- 槽位1 -->
      <div 
        class="slot" 
        :class="{ filled: currentSlots[0] }"
        @click="clearSlot(1)"
      >
        <template v-if="currentSlots[0]">
          <div style="font-size:3rem;margin-bottom:5px;">{{ itemDB[currentSlots[0]].icon }}</div>
          <div style="font-size:0.8rem;font-weight:bold;">{{ itemDB[currentSlots[0]].name }}</div>
        </template>
        <template v-else>空</template>
      </div>

      <div class="plus-sign">+</div>

      <!-- 槽位2 -->
      <div 
        class="slot" 
        :class="{ filled: currentSlots[1] }"
        @click="clearSlot(2)"
      >
        <template v-if="currentSlots[1]">
          <div style="font-size:3rem;margin-bottom:5px;">{{ itemDB[currentSlots[1]].icon }}</div>
          <div style="font-size:0.8rem;font-weight:bold;">{{ itemDB[currentSlots[1]].name }}</div>
        </template>
        <template v-else>空</template>
      </div>
      
      <!-- 融合按钮 -->
      <div style="margin-left: 20px;">
        <div 
          ref="mixBtnRef"
          class="cauldron-btn"
          :class="{ 
            disabled: !currentSlots[0] || !currentSlots[1],
            'mix-anim': mixAnim
          }"
          @click="mixElements"
        ></div>
      </div>
    </div>

    <!-- 背包区域 -->
    <div class="inventory-section">
      <div class="inventory-title">
        <span>🎒 你的炼金背包</span>
        <span style="color:#64748b; font-size:0.9rem;">(点击放入熔炉)</span>
      </div>
      <div class="inventory-grid">
        <!-- Vue 循环渲染背包物品（替代原生innerHTML） -->
        <div 
          class="element-item"
          :class="itemDB[itemId].tier"
          @click="addToSlot(itemId)"
          v-for="itemId in inventory"
          :key="itemId"
        >
          <div class="item-icon">{{ itemDB[itemId].icon }}</div>
          <div class="item-name">{{ itemDB[itemId].name }}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- 提示弹窗 -->
  <div 
    class="toast" 
    :class="{ show: toastShow, error: toastType === 'error' }"
  >
    <i :class="toastType === 'error' ? 'fas fa-bomb' : 'fas fa-star'"></i>
    <span>{{ toastMsg }}</span>
  </div>

  <!-- 胜利弹窗 -->
  <div class="victory-modal" v-show="victoryShow">
    <div class="victory-card">
      <div style="font-size: 5rem; margin-bottom: 20px; text-shadow: 0 0 20px #fde047;">🎓</div>
      <h2 style="color: #fde047; font-size: 2rem; margin-top: 0;">大满贯达成！</h2>
      <p style="color: #cbd5e1; line-height: 1.6; margin-bottom: 30px;">
        你完美推演出了整个申请体系的依赖树：<br><br>
        <b>经历+目标=CV</b> (地基)<br>
        <b>CV+肝力=PS</b> (升华)<br>
        <b>CV+导师=RL</b> (背书)<br>
        最后组合成<b>网申包</b>换取 Offer！
      </p>
      <button 
        style="background: linear-gradient(135deg, #f59e0b, #d97706); border: none; padding: 12px 30px; border-radius: 30px; color: #fff; font-weight: bold; font-size: 1.1rem; cursor: pointer; box-shadow: 0 5px 15px rgba(245, 158, 11, 0.5);" 
        @click="showToast('success', '解锁时间线大地图！')"
      >
        领取【炼金术士】成就
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 游戏核心数据库（完全保留）
const itemDB = {
  'exp': { id: 'exp', name: '个人碎碎念', icon: '📝', tier: 'tier-1' },
  'school': { id: 'school', name: '梦校官网要求', icon: '🏫', tier: 'tier-1' },
  'hair': { id: 'hair', name: '大把头发(肝力)', icon: '🔥', tier: 'tier-1' },
  'prof': { id: 'prof', name: '导师的善意', icon: '👨‍🏫', tier: 'tier-1' },
  'eng': { id: 'eng', name: '四六级底子', icon: '📖', tier: 'tier-1' },
  'cv': { id: 'cv', name: '初版 CV', icon: '📋', tier: 'tier-2' },
  'ielts': { id: 'ielts', name: '雅思成绩单', icon: '💯', tier: 'tier-2' },
  'ps': { id: 'ps', name: '完美 PS 文书', icon: '✨', tier: 'tier-3' },
  'rl': { id: 'rl', name: '强推推荐信', icon: '🤝', tier: 'tier-3' },
  'package': { id: 'package', name: '完整网申材料包', icon: '📦', tier: 'tier-4' },
  'offer': { id: 'offer', name: '大满贯 Offer', icon: '🎓', tier: 'tier-4' }
}

const recipes = [
  { ing: ['exp', 'school'], result: 'cv', msg: '成功将杂乱的经历匹配了学校需求，获得了【初版 CV】！' },
  { ing: ['eng', 'hair'], result: 'ielts', msg: '献祭了大量头发疯狂刷题，获得了【雅思成绩单】！' },
  { ing: ['cv', 'hair'], result: 'ps', msg: '基于 CV 的骨架，耗费肝力深挖故事，炼成了【完美 PS 文书】！' },
  { ing: ['cv', 'prof'], result: 'rl', msg: '拿着准备好的 CV 唤醒了导师的记忆，获得了【强推推荐信】！' },
  { ing: ['ps', 'rl'], result: 'package', msg: '文书与推荐信合璧，形成【完整网申材料包】！(默认已含CV)' },
  { ing: ['package', 'ielts'], result: 'offer', msg: '轰隆隆！万事俱备，召唤出了【大满贯 Offer】！！！' }
]

const failMsgs = [
  { check: ['exp', 'hair'], text: "只有碎碎念加熬夜，你只得到了两个黑眼圈，写不出学术材料。" },
  { check: ['ps', 'prof'], text: "你把长篇大论的 PS 扔给导师，导师表示太长不看，拒绝给你写推荐信。你需要给他简练的 CV。" },
  { check: ['package', 'hair'], text: "材料都齐了还熬夜？快去点交网申按钮！" },
  { check: ['school', 'prof'], text: "导师不关心你要申请哪个学校的八卦，他只在乎你做了什么。" }
]

// 响应式状态
const inventory = ref(['exp', 'school', 'hair', 'prof', 'eng']) // 初始背包
const currentSlots = ref([null, null]) // 坩埚槽位
const mixAnim = ref(false) // 融合动画
const shakeError = ref(false) // 失败震动动画
const toastShow = ref(false) // 提示框显示
const toastType = ref('success') // 提示框类型
const toastMsg = ref('') // 提示框文字
const victoryShow = ref(false) // 胜利弹窗

// DOM 引用
const mixBtnRef = ref(null)
let toastTimeout = null // 定时器

// 点击背包物品加入槽位
const addToSlot = (itemId) => {
  if (currentSlots.value[0] === null) {
    currentSlots.value[0] = itemId
  } else if (currentSlots.value[1] === null) {
    currentSlots.value[1] = itemId
  } else {
    showToast('error', '坩埚已经满了！请先融合或点击槽位清空。')
  }
}

// 清空槽位
const clearSlot = (index) => {
  currentSlots.value[index - 1] = null
}

// 融合核心逻辑
const mixElements = () => {
  const [itemA, itemB] = currentSlots.value
  if (!itemA || !itemB) return

  // 触发融合动画
  mixAnim.value = true
  setTimeout(() => mixAnim.value = false, 600)

  setTimeout(() => {
    // 匹配配方
    const matchedRecipe = recipes.find(r => 
      r.ing.includes(itemA) && r.ing.includes(itemB)
    )

    if (matchedRecipe) {
      // 合成成功
      if (!inventory.value.includes(matchedRecipe.result)) {
        inventory.value.push(matchedRecipe.result)
        if (matchedRecipe.result === 'offer') {
          setTimeout(() => victoryShow.value = true, 500)
        } else {
          showToast('success', '✨ 炼金成功：' + matchedRecipe.msg)
        }
      } else {
        showToast('success', '✨ 这个配方你已经解锁过了！')
      }
    } else {
      // 合成失败
      let failText = '💥 砰！黑烟冒出，这两个元素无法产生共鸣。请尝试其他逻辑搭配。'
      const specialFail = failMsgs.find(f => f.check.includes(itemA) && f.check.includes(itemB))
      if (specialFail) failText = specialFail.text

      // 触发震动动画
      shakeError.value = true
      setTimeout(() => shakeError.value = false, 400)
      showToast('error', failText)
    }

    // 清空槽位
    currentSlots.value = [null, null]
  }, 500)
}

// 提示弹窗
const showToast = (type, msg) => {
  clearTimeout(toastTimeout)
  toastType.value = type
  toastMsg.value = msg
  toastShow.value = true

  toastTimeout = setTimeout(() => {
    toastShow.value = false
  }, 3500)
}

// 销毁定时器
onUnmounted(() => {
  clearTimeout(toastTimeout)
})
</script>

<style>
/* 完全保留原有CSS样式，无任何修改 */
* { box-sizing: border-box; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; user-select: none; }

body { 
    background: #0f172a; 
    background-image: radial-gradient(circle at 50% 10%, #312e81 0%, #0f172a 80%);
    display: flex; justify-content: center; align-items: center; 
    min-height: 100vh; margin: 0; padding: 20px; color: #e2e8f0;
}

.alchemy-room {
    width: 100%; max-width: 900px; background: rgba(15, 23, 42, 0.6);
    border: 2px solid #6366f1; border-radius: 24px; padding: 30px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.8), inset 0 0 30px rgba(99, 102, 241, 0.2);
    backdrop-filter: blur(12px); display: flex; flex-direction: column; align-items: center;
}

.header { text-align: center; margin-bottom: 20px; }
.header h2 { margin: 0 0 10px 0; font-size: 2.2rem; color: #a5b4fc; text-shadow: 0 0 15px rgba(165, 180, 252, 0.5); }
.header p { color: #94a3b8; font-size: 1rem; margin: 0; line-height: 1.6;}

.cauldron-area {
    display: flex; align-items: center; justify-content: center; gap: 20px;
    margin-bottom: 30px; width: 100%; height: 220px; position: relative;
}

.slot {
    width: 110px; height: 110px; background: rgba(0,0,0,0.5); border: 2px dashed #6366f1;
    border-radius: 16px; display: flex; flex-direction: column; justify-content: center; align-items: center;
    font-size: 2rem; color: #475569; transition: 0.3s; cursor: pointer;
}
.slot:hover { background: rgba(99, 102, 241, 0.2); }
.slot.filled { border-style: solid; border-color: #a5b4fc; background: linear-gradient(135deg, #3730a3, #1e1b4b); color: #fff; box-shadow: 0 0 20px rgba(99, 102, 241, 0.4);}

.plus-sign { font-size: 2rem; color: #6366f1; font-weight: 900; }

.cauldron-btn {
    width: 140px; height: 140px; background: radial-gradient(circle at 30% 30%, #10b981, #064e3b);
    border: 4px solid #34d399; border-radius: 50%; display: flex; flex-direction: column;
    justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 0 30px rgba(16, 185, 129, 0.5);
    transition: all 0.2s; position: relative; z-index: 10;
}
.cauldron-btn::before { content: "⚡ 融合 ⚡"; font-weight: 900; font-size: 1.2rem; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.8); }
.cauldron-btn:hover { transform: scale(1.05); filter: brightness(1.2); box-shadow: 0 0 50px rgba(52, 211, 153, 0.8); }
.cauldron-btn:active { transform: scale(0.95); }
.cauldron-btn.disabled { filter: grayscale(1); pointer-events: none; opacity: 0.5; box-shadow: none; border-color: #475569; }

.mix-anim { animation: spinMix 0.6s ease-in-out; }
@keyframes spinMix { 0% { transform: scale(1) rotate(0deg); filter: hue-rotate(0deg); } 50% { transform: scale(1.2) rotate(180deg); filter: hue-rotate(180deg); } 100% { transform: scale(1) rotate(360deg); filter: hue-rotate(360deg); } }

.shake-error { animation: shake 0.4s forwards; }
@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-10px); } 75% { transform: translateX(10px); } }

.inventory-section { width: 100%; border-top: 2px dashed #334155; padding-top: 20px; }
.inventory-title { font-size: 1.1rem; font-weight: bold; color: #a5b4fc; margin-bottom: 15px; display: flex; justify-content: space-between;}

.inventory-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 12px;
    min-height: 200px;
}

.element-item {
    background: #1e293b; border: 2px solid #475569; border-radius: 12px;
    padding: 10px; display: flex; flex-direction: column; align-items: center;
    cursor: pointer; transition: 0.2s; text-align: center;
}
.element-item:hover { transform: translateY(-3px); border-color: #fde047; background: #334155; }
.element-item:active { transform: scale(0.95); }
.item-icon { font-size: 1.8rem; margin-bottom: 5px; }
.item-name { font-size: 0.8rem; font-weight: bold; color: #f8fafc; }

.tier-1 { border-color: #64748b; }
.tier-2 { border-color: #3b82f6; background: linear-gradient(135deg, #1e3a8a, #172554); }
.tier-3 { border-color: #a855f7; background: linear-gradient(135deg, #581c87, #2e1065); }
.tier-4 { border-color: #f59e0b; background: linear-gradient(135deg, #78350f, #451a03); box-shadow: 0 0 15px rgba(245, 158, 11, 0.4);}

.toast {
    position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(100px);
    background: #1e1b4b; border: 2px solid #8b5cf6; padding: 15px 30px; border-radius: 999px;
    color: #fff; font-weight: bold; opacity: 0; transition: 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    z-index: 100; box-shadow: 0 10px 20px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 10px;
}
.toast.show { transform: translateX(-50%) translateY(0); opacity: 1; }
.toast.error { border-color: #ef4444; background: #450a0a; }

.victory-modal {
    position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
    display: none; justify-content: center; align-items: center; z-index: 200;
}
/* Vue 适配弹窗显示 */
.victory-modal[v-show] { display: flex; }
.victory-card {
    background: linear-gradient(180deg, #1e3a8a, #0f172a); border: 2px solid #fde047;
    padding: 40px; border-radius: 20px; text-align: center; max-width: 450px;
    box-shadow: 0 0 60px rgba(253, 224, 71, 0.4); animation: popIn 0.5s;
}
@keyframes popIn { 0% { transform: scale(0.5); opacity: 0;} 100% { transform: scale(1); opacity: 1;} }
</style>