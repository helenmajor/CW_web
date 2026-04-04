<template>
  <div class="star-room">
    <!-- 头部标题 -->
    <div class="header">
      <h2><i class="fas fa-project-diagram"></i> 记忆星图：文书连线</h2>
      <p>不再死板地填表。请<span class="hint-text">按逻辑顺序依次点击</span>星辰，画出你专属的“英雄轨迹”。</p>
    </div>

    <!-- 星图画布 -->
    <div 
      class="sky-canvas" 
      id="skyCanvas"
      :class="[canvasStatus]"
    >
      <!-- SVG 连线层 -->
      <svg class="svg-layer" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline class="magic-line" :points="magicLinePoints" />
      </svg>

      <!-- 星辰节点（v-for 渲染，更优雅） -->
      <div
        class="star-node"
        v-for="star in starList"
        :key="star.id"
        :id="`node-${star.id}`"
        :style="{ top: star.y + '%', left: star.x + '%' }"
        :class="{ active: selectedOrder.includes(star.id) }"
        @click="clickStar(star.id)"
      >
        <div class="star-core">
          <i :class="star.icon"></i>
          <div class="order-badge">{{ getOrderNumber(star.id) }}</div>
        </div>
        <div class="star-label">
          <div class="star-title">{{ star.title }}</div>
          <div class="star-desc">{{ star.desc }}</div>
        </div>
      </div>
    </div>

    <!-- 反馈弹窗 -->
    <div class="modal-overlay" :class="{ show: modalShow }">
      <div class="feedback-card" :class="`status-${feedback.type}`">
        <div class="fb-icon">{{ feedback.icon }}</div>
        <div class="fb-title">{{ feedback.title }}</div>
        <div class="fb-desc" v-html="feedback.desc"></div>
        <div style="display: flex; justify-content: center">
          <button class="btn-reset" @click="resetStars">重新画图</button>
          <button
            class="btn-next"
            v-show="feedback.type === 'success'"
            @click="handleNext"
          >
            保存星图前进
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 🌟 星辰节点数据（统一管理，易于维护）
const starList = ref([
  { id: 'motive', x: 20, y: 20, icon: 'fas fa-seedling', title: '初心启蒙', desc: '最初为什么对这个领域感兴趣' },
  { id: 'incident', x: 10, y: 55, icon: 'fas fa-bolt', title: '关键转折', desc: '遇到什么瓶颈或挫折让我渴望深造' },
  { id: 'action', x: 50, y: 80, icon: 'fas fa-hammer', title: '学术历练', desc: '为解决问题，我做了哪些硬核准备' },
  { id: 'match', x: 90, y: 55, icon: 'fas fa-university', title: '择校契合', desc: '贵校的项目刚好能弥补我的短板' },
  { id: 'goal', x: 80, y: 20, icon: 'fas fa-flag-checkered', title: '长远愿景', desc: '未来我想成为解决什么痛点的专家' },
])

// 🎯 响应式核心数据
const selectedOrder = ref([]) // 选中的星辰顺序
const magicLinePoints = ref('') // SVG连线坐标
const canvasStatus = ref('') // 画布状态：success/error/空
const modalShow = ref(false) // 弹窗显示状态

// 弹窗反馈数据
const feedback = ref({
  type: '',
  icon: '',
  title: '',
  desc: ''
})

// 获取星辰的选中序号
const getOrderNumber = (id) => {
  const index = selectedOrder.value.indexOf(id)
  return index !== -1 ? index + 1 : ''
}

// 🖱️ 点击星辰核心逻辑
const clickStar = (id) => {
  // 撤销逻辑：点击已选中的节点，删除后续所有选择
  if (selectedOrder.value.includes(id)) {
    const index = selectedOrder.value.indexOf(id)
    selectedOrder.value = selectedOrder.value.slice(0, index + 1)
    updateDrawings()
    return
  }

  // 新增选择（最多5个）
  if (selectedOrder.value.length < 5) {
    selectedOrder.value.push(id)
    updateDrawings()

    // 选满5个，自动判卷
    if (selectedOrder.value.length === 5) {
      setTimeout(validateConstellation, 400)
    }
  }
}

// 🎨 更新SVG连线坐标
const updateDrawings = () => {
  let points = ''
  selectedOrder.value.forEach(id => {
    const star = starList.value.find(item => item.id === id)
    points += `${star.x},${star.y} `
  })
  magicLinePoints.value = points.trim()
}

// 🔄 一键重置所有状态
const resetStars = () => {
  selectedOrder.value = []
  magicLinePoints.value = ''
  canvasStatus.value = ''
  modalShow.value = false
  feedback.value = { type: '', icon: '', title: '', desc: '' }
}

// ✅ 判卷逻辑（完全还原原版规则）
const validateConstellation = () => {
  const order = selectedOrder.value

  // 错误1：开头直接夸学校
  if (order[0] === 'match') {
    return showResult('error', '💥 模板警告：生硬的谄媚', '第一段直接写“我非常渴望加入贵校”，这会让教授觉得你毫无个性，像群发的模板邮件。PS 必须由【你自己的故事】开篇！')
  }

  // 错误2：目标在行动之前（假大空）
  if (order.indexOf('goal') < order.indexOf('action') || order.indexOf('match') < order.indexOf('action')) {
    return showResult('error', '💥 逻辑坍塌：缺乏根基', '你还没讲述自己受过哪些【学术历练】，就开始谈长远愿景和择校契合度了？这会让你的目标显得极其空泛。')
  }

  // 错误3：动机在行动之后（倒叙翻车）
  if (order.indexOf('motive') > order.indexOf('action')) {
    return showResult('error', '🤔 悬念翻车风险', '你把【学术历练】放在了【初心启蒙】前面。在学术文书中，最好先交代动机，再展示行动，顺叙的逻辑推演最具说服力。')
  }

  // 正确1：王道叙事法
  if (order.join(',') === 'motive,incident,action,match,goal') {
    return showResult('success', '✨ 史诗级星图：王道英雄之旅', '<b>初心启蒙 → 关键转折 → 学术历练 → 择校契合 → 长远愿景</b><br><br>完美的逻辑闭环！按照这个骨架去填血肉，你的 PS 绝对是一篇逻辑清晰、感情真挚的神作！')
  }

  // 正确2：进阶倒叙法
  if (order.join(',') === 'incident,motive,action,match,goal') {
    return showResult('success', '✨ 惊艳的星图：悬念开局', '<b>关键转折 → 初心启蒙 → 学术历练 → 择校契合 → 长远愿景</b><br><br>非常高级的叙事手法！开篇直接用一个硬核挑战抓住眼球，再娓娓道来你的初心，引人入胜。')
  }

  // 兜底错误
  showResult('error', '🤔 星光闪烁不定', '顺序还能更顺畅一些。记住最核心的规律：<br><br><b>你的过去（动机/历练）决定了你的现在（择校），进而指向你的未来（愿景）。</b>请重新调整连线顺序。')
}

// 📢 显示结果弹窗
const showResult = (type, title, desc) => {
  feedback.value = {
    type,
    icon: type === 'success' ? '👑' : '💔',
    title,
    desc
  }
  canvasStatus.value = type
  modalShow.value = true
}

// 🚀 成功后下一步
const handleNext = () => {
  alert('恭喜解锁文书骨架！获得工坊入场券。')
}
</script>

<style scoped>
/* 完全保留原版样式，仅添加 scoped 作用域 */
* {
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  user-select: none;
}

body {
  background: radial-gradient(circle at center, #1e103c 0%, #0a0410 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  padding: 20px;
  color: #e2e8f0;
  overflow: hidden;
}

.star-room {
  width: 100%;
  max-width: 900px;
  background: rgba(20, 10, 35, 0.4);
  border: 1px solid #6b21a8;
  border-radius: 24px;
  padding: 40px 20px;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.8), inset 0 0 30px rgba(168, 85, 247, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  display: flex;
  flex-direction: column;
}

.header {
  text-align: center;
  margin-bottom: 20px;
  z-index: 10;
}

.header h2 {
  margin: 0 0 10px 0;
  font-size: 2.2rem;
  color: #e9d5ff;
  text-shadow: 0 0 15px rgba(216, 180, 254, 0.6);
  letter-spacing: 2px;
}

.header p {
  color: #a8b2d1;
  font-size: 1.05rem;
  margin: 0;
  line-height: 1.6;
}

.hint-text {
  color: #fde047;
  font-weight: bold;
  font-size: 1.1rem;
  margin-top: 10px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
    text-shadow: 0 0 10px #fde047;
  }
}

/* --- 核心星图交互区 --- */
.sky-canvas {
  position: relative;
  width: 100%;
  height: 450px;
  margin: 0 auto;
  border-radius: 16px;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(255, 255, 255, 0.03) 0%,
    transparent 60%
  );
}

/* SVG 连线层 */
.svg-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.magic-line {
  fill: none;
  stroke: #d8b4fe;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 0 8px #a855f7);
  transition: all 0.3s ease;
}

/* 成功时的光效 */
.sky-canvas.success .magic-line {
  stroke: #fde047;
  filter: drop-shadow(0 0 15px #fde047);
}

.sky-canvas.error .magic-line {
  stroke: #ef4444;
  filter: drop-shadow(0 0 15px #ef4444);
  stroke-dasharray: 10 10;
}

/* 记忆星辰节点 */
.star-node {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: 0.3s;
}

.star-core {
  width: 50px;
  height: 50px;
  background: radial-gradient(circle, #f3e8ff, #7e22ce);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  color: #fff;
  box-shadow: 0 0 20px rgba(126, 34, 206, 0.6);
  border: 2px solid transparent;
  transition: 0.3s;
  position: relative;
}

.star-node:hover .star-core {
  transform: scale(1.15);
  box-shadow: 0 0 30px rgba(216, 180, 254, 0.8);
}

.star-label {
  margin-top: 12px;
  text-align: center;
  background: rgba(15, 23, 42, 0.8);
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #4c1d95;
  pointer-events: none;
  width: 130px;
}

.star-title {
  font-weight: bold;
  color: #e9d5ff;
  font-size: 0.95rem;
  margin-bottom: 2px;
}

.star-desc {
  font-size: 0.7rem;
  color: #94a3b8;
  line-height: 1.2;
}

/* 点击选中后的状态 */
.star-node.active .star-core {
  background: radial-gradient(circle, #fff, #ca8a04);
  border-color: #fde047;
  box-shadow: 0 0 30px rgba(253, 224, 71, 0.8);
  transform: scale(1.1);
}

.star-node.active .star-label {
  border-color: #ca8a04;
}

.star-node.active .star-title {
  color: #fde047;
}

/* 选中顺序的数字标记 */
.order-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #0f172a;
  color: #fde047;
  border: 2px solid #fde047;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.8rem;
  font-weight: bold;
  opacity: 0;
  transform: scale(0);
  transition: 0.3s;
}

.star-node.active .order-badge {
  opacity: 1;
  transform: scale(1);
}

/* 反馈弹窗 */
.modal-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
  opacity: 0;
  pointer-events: none;
  transition: 0.3s;
  border-radius: 24px;
}

.modal-overlay.show {
  opacity: 1;
  pointer-events: auto;
}

.feedback-card {
  background: linear-gradient(180deg, #1e1b4b, #0f172a);
  border: 2px solid;
  border-radius: 20px;
  padding: 30px;
  width: 90%;
  max-width: 450px;
  text-align: center;
  transform: translateY(20px);
  transition: 0.3s;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8);
}

.modal-overlay.show .feedback-card {
  transform: translateY(0);
}

.fb-icon {
  font-size: 4rem;
  margin-bottom: 15px;
}

.fb-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 15px;
}

.fb-desc {
  color: #cbd5e1;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 25px;
  text-align: left;
}

.btn-reset {
  background: transparent;
  border: 2px solid #94a3b8;
  color: #f8fafc;
  padding: 10px 25px;
  border-radius: 30px;
  font-size: 1rem;
  cursor: pointer;
  transition: 0.2s;
  font-weight: bold;
}

.btn-reset:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #fff;
}

.btn-next {
  background: linear-gradient(135deg, #ca8a04, #a16207);
  border: none;
  color: white;
  padding: 12px 30px;
  border-radius: 30px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: 0.2s;
  font-weight: bold;
  margin-left: 10px;
}

.btn-next:hover {
  box-shadow: 0 0 20px rgba(253, 224, 71, 0.5);
  transform: translateY(-2px);
}

/* 状态颜色 */
.status-error {
  border-color: #ef4444;
}
.status-error .fb-icon,
.status-error .fb-title {
  color: #ef4444;
}

.status-success {
  border-color: #fde047;
}
.status-success .fb-icon,
.status-success .fb-title {
  color: #fde047;
}
</style>