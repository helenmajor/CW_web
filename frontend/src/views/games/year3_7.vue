<template>
  <!-- 全局背景 -->
  <div class="swamp-page">
    <!-- 沼泽气泡动画 -->
    <div class="bubbles">
      <div 
        class="bubble"
        v-for="(bubble, index) in bubblesList"
        :key="index"
        :style="{
          left: bubble.left + '%',
          width: bubble.size + 'px',
          height: bubble.size + 'px',
          animationDelay: bubble.delay + 's',
          animationDuration: bubble.duration + 's'
        }"
      ></div>
    </div>

    <!-- 伤害泛红遮罩 -->
    <div class="damage-overlay" :class="{ active: damageActive }"></div>

    <div class="game-container">
      <!-- 顶部信息栏 -->
      <div class="header">
        <div class="title-box">
          <h2>DIY 沼泽排雷</h2>
          <p>不要犹豫，用正确的魔法击碎陷阱！</p>
        </div>
        <div class="status-box">
          <div style="color: #94a3b8; font-size: 0.8rem; margin-bottom: 4px;">净化进度</div>
          <div style="font-weight: bold; color: #34d399;">{{ currentIndex }} / {{ mines.length }}</div>
          <div class="hp" style="margin-top: 6px;">护盾: {{ heartDisplay }}</div>
        </div>
      </div>

      <!-- 沼泽雷区核心 -->
      <div class="swamp-center">
        <div 
          class="mine-orb"
          :class="{ shake: isShake, shatter: isShatter }"
          v-show="!gameWin"
        >
          <div class="mine-text">{{ currentMineText }}</div>
        </div>
        
        <!-- 提示弹窗 -->
        <div class="toast" :class="{ show: showToast }">
          <h3 :style="{ color: isSuccess ? '#34d399' : '#fb7185' }">{{ toastTitle }}</h3>
          <p>{{ toastDesc }}</p>
          <button class="next-btn" @click="closeToast">
            {{ toastBtnText }}
          </button>
        </div>
      </div>

      <!-- 法术面板 -->
      <div class="spell-panel" v-show="!gameWin && hp > 0">
        <button class="spell-btn btn-fatal" @click="castSpell('fatal')">
          <span class="spell-icon">🔴</span>
          <span class="spell-name">致命破除</span>
          <span class="spell-desc">直接被拒</span>
        </button>
        <button class="spell-btn btn-severe" @click="castSpell('severe')">
          <span class="spell-icon">🟡</span>
          <span class="spell-name">泥潭净化</span>
          <span class="spell-desc">严重减分</span>
        </button>
        <button class="spell-btn btn-minor" @click="castSpell('minor')">
          <span class="spell-icon">🟢</span>
          <span class="spell-name">荆棘修剪</span>
          <span class="spell-desc">扣印象分</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// 关卡陷阱数据库（完全保留原数据）
const mines = [
  { 
    text: "错过网申截止时间", 
    type: "fatal", 
    title: "🔴 致命级失误", 
    desc: "毫无商量余地！大部分学校的系统一过时间自动关闭，这是不可挽回的致命伤。" 
  },
  { 
    text: "推荐信缺抬头和手写签名", 
    type: "severe", 
    title: "🟡 严重级失误", 
    desc: "学校可能会打回要求重传，这会严重拖延你的审理进度，甚至导致错过首轮审核。" 
  },
  { 
    text: "雅思小分差0.5未达标", 
    type: "fatal", 
    title: "🔴 致命级失误", 
    desc: "特别是香港和英国部分专业，语言是硬门槛，没达标机器初筛就会直接把你刷掉。" 
  },
  { 
    text: "所有材料命名全叫'1.pdf'", 
    type: "minor", 
    title: "🟢 印象级失误", 
    desc: "不会直接被拒，但招生官下载后看到一堆乱码文件名，你的专业度和细节分会大打折扣。" 
  }
]

// 响应式状态
const currentIndex = ref(0) // 当前关卡
const hp = ref(3) // 护盾生命值
const isAnimating = ref(false) // 防连点
const gameWin = ref(false) // 游戏胜利

// 动画控制
const isShake = ref(false) // 震动动画
const isShatter = ref(false) // 碎裂动画
const damageActive = ref(false) // 红屏伤害

// 弹窗控制
const showToast = ref(false)
const toastTitle = ref('')
const toastDesc = ref('')
const toastBtnText = ref('')
const isSuccess = ref(true)

// 动态生成沼泽气泡（15个）
const bubblesList = ref([])
const generateBubbles = () => {
  bubblesList.value = []
  for (let i = 0; i < 15; i++) {
    bubblesList.value.push({
      left: Math.random() * 100,
      size: Math.random() * 40 + 20,
      delay: Math.random() * 4,
      duration: Math.random() * 3 + 3
    })
  }
}

// 计算属性：生命值爱心显示
const heartDisplay = computed(() => {
  return '❤️'.repeat(hp.value) + '🖤'.repeat(3 - hp.value)
})

// 计算属性：当前雷区文本
const currentMineText = computed(() => {
  if (currentIndex.value >= mines.length) return ''
  return mines[currentIndex.value].text
})

// 加载当前关卡
const loadMine = () => {
  if (currentIndex.value >= mines.length) {
    gameWin.value = true
    showFinalWin()
    return
  }
  isShake.value = false
  isShatter.value = false
  isAnimating.value = false
}

// 施法核心逻辑
const castSpell = (spellType) => {
  if (isAnimating.value) return
  const currentMine = mines[currentIndex.value]

  if (spellType === currentMine.type) {
    // 选择正确：碎裂动画
    isAnimating.value = true
    isShatter.value = true

    setTimeout(() => {
      showToastMsg(currentMine.title, currentMine.desc, true)
    }, 400)
  } else {
    // 选择错误：震动+红屏
    isAnimating.value = true
    hp.value--
    isShake.value = true
    damageActive.value = true

    setTimeout(() => {
      isShake.value = false
      damageActive.value = false
      isAnimating.value = false

      if (hp.value <= 0) {
        showToastMsg("💀 护盾碎裂", "你踩中了太多暗雷，申请进度彻底瘫痪了！请重新挑战。", false)
      }
    }, 500)
  }
}

// 显示弹窗
const showToastMsg = (title, desc, success) => {
  toastTitle.value = title
  toastDesc.value = desc
  isSuccess.value = success
  toastBtnText.value = success ? "继续净化" : "重新尝试"
  showToast.value = true
}

// 关闭弹窗/下一步
const closeToast = () => {
  showToast.value = false
  if (isSuccess.value) {
    // 成功：下一关
    currentIndex.value++
    loadMine()
  } else {
    // 失败：重置游戏
    hp.value = 3
    currentIndex.value = 0
    loadMine()
  }
}

// 最终胜利
const showFinalWin = () => {
  gameWin.value = true
  toastTitle.value = "🎓 沼泽肃清完毕！"
  toastDesc.value = "你已成功避开所有高频 DIY 申请死角。\n\n获得《DIY避坑手册》\n请返回地图，继续完成你的申请旅程！"
  toastBtnText.value = "前往加冕 (返回地图)"
  isSuccess.value = true
  showToast.value = true
}

// 初始化游戏
onMounted(() => {
  generateBubbles()
  setTimeout(loadMine, 500)
})
</script>

<style>
/* 完全保留原CSS样式、动画、渐变、特效，无任何修改 */
* { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
.swamp-page { 
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
    background: radial-gradient(circle at 50% 100%, #064e3b 0%, #0f172a 60%, #020617 100%);
    color: #fff; height: 100vh; overflow: hidden; display: flex; flex-direction: column; align-items: center;
}

.bubbles { position: absolute; bottom: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }
.bubble { 
    position: absolute; bottom: -50px; background: radial-gradient(circle at 30% 30%, rgba(52, 211, 153, 0.4), rgba(6, 78, 59, 0.8));
    border-radius: 50%; animation: rise 4s infinite ease-in; opacity: 0; box-shadow: 0 0 10px rgba(52, 211, 153, 0.2);
}
@keyframes rise {
    0% { transform: translateY(0) scale(0.8); opacity: 0; }
    20% { opacity: 0.8; }
    100% { transform: translateY(-80vh) scale(1.5); opacity: 0; }
}

.game-container {
    position: relative; z-index: 10; width: 100%; max-width: 600px; height: 100%;
    display: flex; flex-direction: column; padding: 30px 20px;
}

.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
.title-box h2 { color: #34d399; font-size: 1.5rem; text-shadow: 0 0 10px rgba(52, 211, 153, 0.5); margin-bottom: 5px; }
.title-box p { color: #94a3b8; font-size: 0.9rem; }
.status-box { background: rgba(0,0,0,0.5); padding: 10px 15px; border-radius: 12px; border: 1px solid #1e293b; text-align: right; }
.hp { color: #fb7185; font-weight: bold; font-size: 1.1rem; }

.swamp-center {
    flex: 1; display: flex; justify-content: center; align-items: center; position: relative;
}

.mine-orb {
    width: 240px; height: 240px; border-radius: 50%;
    background: radial-gradient(circle at 40% 40%, #1e293b, #0f172a);
    border: 2px solid #475569;
    box-shadow: 0 0 40px rgba(0,0,0,0.8), inset 0 0 20px rgba(255,255,255,0.05);
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    text-align: center; padding: 20px; transition: 0.3s;
    animation: float 3s ease-in-out infinite; position: relative;
}
.mine-orb::before { content: "⚠️"; font-size: 2rem; margin-bottom: 10px; filter: drop-shadow(0 0 10px rgba(255,255,255,0.3)); }
.mine-text { font-size: 1.4rem; font-weight: 900; color: #f8fafc; text-shadow: 0 2px 4px rgba(0,0,0,0.8); }

@keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
}

.shake { animation: shakeError 0.4s ease-in-out; border-color: #ef4444 !important; box-shadow: 0 0 40px rgba(239, 68, 68, 0.6) !important; }
@keyframes shakeError {
    0%, 100% { transform: translateX(0); }
    20%, 60% { transform: translateX(-15px) rotate(-5deg); }
    40%, 80% { transform: translateX(15px) rotate(5deg); }
}

.shatter { animation: shatterAnim 0.5s forwards; }
@keyframes shatterAnim {
    0% { transform: scale(1); opacity: 1; filter: brightness(1); }
    50% { transform: scale(1.3); opacity: 0.8; filter: brightness(2); }
    100% { transform: scale(0); opacity: 0; filter: brightness(3); }
}

.spell-panel {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
    background: rgba(15, 23, 42, 0.8); padding: 20px; border-radius: 20px;
    border: 1px solid #1e293b; backdrop-filter: blur(10px);
}
.spell-btn {
    background: #1e293b; border: 2px solid transparent; border-radius: 12px;
    padding: 15px 10px; color: #fff; cursor: pointer; display: flex; flex-direction: column;
    align-items: center; gap: 8px; transition: 0.2s;
}
.spell-btn:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.4); }
.spell-btn:active { transform: scale(0.95); }
.spell-icon { font-size: 1.8rem; }
.spell-name { font-weight: bold; font-size: 0.9rem; }
.spell-desc { font-size: 0.7rem; color: #94a3b8; }

.btn-fatal:hover { border-color: #ef4444; background: rgba(239, 68, 68, 0.1); }
.btn-severe:hover { border-color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
.btn-minor:hover { border-color: #3b82f6; background: rgba(59, 130, 246, 0.1); }

.toast {
    position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%);
    background: rgba(15, 23, 42, 0.95); border: 2px solid #34d399; border-radius: 16px;
    padding: 25px; text-align: center; width: 90%; max-width: 400px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.6); z-index: 50; display: none;
    backdrop-filter: blur(5px);
}
.toast.show { display: block; animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes popIn { 0% { transform: translate(-50%, -40%) scale(0.8); opacity: 0;} 100% { transform: translate(-50%, -50%) scale(1); opacity: 1;} }

.toast h3 { font-size: 1.5rem; margin-bottom: 10px; }
.toast p { color: #cbd5e1; line-height: 1.6; font-size: 1rem; margin-bottom: 20px; }
.next-btn { 
    background: #34d399; color: #022c22; border: none; padding: 12px 30px; 
    border-radius: 999px; font-weight: bold; font-size: 1.1rem; cursor: pointer;
}
.next-btn:hover { background: #10b981; }

.damage-overlay { position: fixed; inset: 0; background: radial-gradient(circle, transparent 50%, rgba(239,68,68,0.4) 100%); pointer-events: none; opacity: 0; z-index: 100; transition: 0.2s;}
.damage-overlay.active { opacity: 1; }
</style>
