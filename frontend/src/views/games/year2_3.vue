<template>
  <div class="balance-room">
    <!-- 顶部信息面板 -->
    <div class="header">
      <h2><i class="fas fa-balance-scale-right"></i> 命运天平：分拣你的梦校</h2>
      <p>评估隐形未来，将你的焦虑具象化。请将下方的魔法学院拖入你认为合适的梯队中！</p>
      <div class="user-profile">
        <i class="fas fa-user-graduate"></i> 当前画像档案：均分 82/100 | 理工/计算机方向 | 有一段普通实习
      </div>
    </div>

    <!-- 选校卡片牌库 -->
    <div 
      class="card-deck" 
      id="deck"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <div
        class="school-card"
        v-for="card in schoolCards"
        :key="card.id"
        :id="`sch-${card.id}`"
        :data-id="card.id"
        draggable="true"
        @dragstart="handleDragStart"
        @dragend="handleDragEnd"
      >
        <div class="school-icon">{{ card.icon }}</div>
        <div class="school-name">{{ card.name }}</div>
        <div class="school-tag">{{ card.tag }}</div>
      </div>
    </div>

    <!-- 梯度放置区 -->
    <div class="tiers-container">
      <div
        class="tier-zone"
        id="zone-reach"
        data-tier="reach"
        @dragover.prevent="handleDragOver"
        @dragleave="handleDragLeave"
        @drop.prevent="handleDrop"
      >
        <i class="fas fa-fire tier-icon"></i>
        <div class="tier-header">冲刺区 (Reach)</div>
      </div>

      <div
        class="tier-zone"
        id="zone-match"
        data-tier="match"
        @dragover.prevent="handleDragOver"
        @dragleave="handleDragLeave"
        @drop.prevent="handleDrop"
      >
        <i class="fas fa-bullseye tier-icon"></i>
        <div class="tier-header">主申区 (Match)</div>
      </div>

      <div
        class="tier-zone"
        id="zone-safety"
        data-tier="safety"
        @dragover.prevent="handleDragOver"
        @dragleave="handleDragLeave"
        @drop.prevent="handleDrop"
      >
        <i class="fas fa-shield-alt tier-icon"></i>
        <div class="tier-header">保底区 (Safety)</div>
      </div>
    </div>

    <!-- 操作区 -->
    <div class="controls">
      <button class="btn-predict" @click="evaluateTiers">
        <i class="fas fa-crystal-ball"></i> 鉴定天平预测
      </button>
    </div>

    <!-- 诊断结果面板 -->
    <div class="feedback-panel" v-show="showFeedback">
      <div class="fb-title">
        <span><i class="fas fa-chart-pie"></i> 分层诊断报告</span>
        <span class="fb-score">{{ score }} <i class="fas fa-coins"></i></span>
      </div>
      <div id="feedbackList">
        <div
          class="fb-item"
          :class="item.statusClass"
          v-for="(item, index) in feedbackList"
          :key="index"
        >
          <div class="fb-icon"><i class="fas" :class="item.iconClass"></i></div>
          <div class="fb-text">
            <h4>{{ item.title }}</h4>
            <p>{{ item.text }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 学校卡片数据（数据驱动渲染）
const schoolCards = ref([
  { id: 'ic', name: '皇家理工学院', icon: '👑', tag: 'QS Top 10' },
  { id: 'ucl', name: '伦敦大学学院', icon: '🏛️', tag: 'QS Top 10' },
  { id: 'kcl', name: '国王学院', icon: '🦁', tag: 'QS Top 40' },
  { id: 'soton', name: '南安普顿大学', icon: '⚓', tag: 'QS Top 80' },
  { id: 'cardiff', name: '卡迪夫大学', icon: '🐉', tag: 'QS 150+' },
])

// 选校评估逻辑数据库
const logicDB = {
  'ic': { realTier: 'unrealistic', name: '皇家理工 (IC)' },
  'ucl': { realTier: 'reach', name: 'UCL' },
  'kcl': { realTier: 'match', name: '国王学院 (KCL)' },
  'soton': { realTier: 'match', name: '南安普顿' },
  'cardiff': { realTier: 'safety', name: '卡迪夫' }
}

// 响应式状态
const draggedCardId = ref('') // 拖拽中的卡片ID
const feedbackList = ref([])  // 反馈列表
const score = ref('')         // 评估分数
const showFeedback = ref(false) // 显示反馈面板

// ———— 拖拽事件处理 ————
const handleDragStart = (e) => {
  draggedCardId.value = e.target.id
  setTimeout(() => e.target.style.opacity = '0.5', 0)
}

const handleDragEnd = (e) => {
  e.target.style.opacity = '1'
}

const handleDragOver = (e) => {
  const zone = e.currentTarget
  if (zone.classList.contains('tier-zone')) {
    zone.classList.add('drag-over')
  }
}

const handleDragLeave = (e) => {
  e.currentTarget.classList.remove('drag-over')
}

const handleDrop = (e) => {
  const zone = e.currentTarget
  zone.classList.remove('drag-over')
  // 将卡片移动到目标区域
  const card = document.getElementById(draggedCardId.value)
  zone.appendChild(card)
}

// ———— 核心：选校梯队评估 ————
const evaluateTiers = () => {
  // 校验：必须分配所有学校
  const deck = document.getElementById('deck')
  if (deck.children.length > 0) {
    alert("🔮 先知提醒：请将所有学校分配完毕后再进行预测！")
    return
  }

  // 重置状态
  feedbackList.value = []
  let points = 50
  let allPerfect = true
  showFeedback.value = true

  // 获取指定梯队内的学校ID
  const getSchoolsInTier = (tierId) => {
    return Array.from(document.getElementById(tierId).querySelectorAll('.school-card'))
      .map(card => card.dataset.id)
  }

  const reaches = getSchoolsInTier('zone-reach')
  const matches = getSchoolsInTier('zone-match')
  const safeties = getSchoolsInTier('zone-safety')

  // 诊断逻辑（完全保留原有的评估规则）
  if (matches.includes('ic') || safeties.includes('ic')) {
    addFeedback('status-danger', 'fa-skull-crossbones', '极度高估：IC 居然是保底？',
      'GPA 82 想要申请理工科神校帝国理工，甚至把它放在主申/保底区，这是极度危险的“彩票行为”，大概率会全军覆没！IC 应属于【超冲刺】甚至放弃区。')
    allPerfect = false
    points -= 10
  }

  if (matches.includes('ucl') || safeties.includes('ucl')) {
    addFeedback('status-danger', 'fa-exclamation-triangle', '盲目乐观：UCL 定位过低',
      'UCL 的泛计算机和工程类竞争极度激烈，82分对它来说属于纯纯的【冲刺区】。把它放主申会让你浪费一个稳妥的名额！')
    allPerfect = false
    points -= 10
  } else if (reaches.includes('ucl')) {
    addFeedback('status-perfect', 'fa-check-circle', '完美定位：UCL 冲刺',
      '非常清醒！UCL 对 82 分来说是有机会触碰的天花板，放在冲刺区摸奖是非常科学的策略。')
  }

  if (reaches.includes('kcl') || reaches.includes('soton')) {
    addFeedback('status-waste', 'fa-arrow-down', '过度自卑：浪费了冲刺名额',
      'KCL 和南安普顿对于 82 分的理工科来说是恰好匹配的【主申区】。你把它们放在冲刺，意味着你本来可以去更好的学校！你太保守了！')
    allPerfect = false
    points -= 10
  } else if (safeties.includes('kcl')) {
    addFeedback('status-danger', 'fa-exclamation', '主申当保底：防线脆弱',
      'KCL 虽好，但绝不是 82 分的“稳妥保底”。如果今年卷起来，你的保底防线会被直接击穿。')
    allPerfect = false
  }

  if (reaches.includes('cardiff') || matches.includes('cardiff')) {
    addFeedback('status-waste', 'fa-arrow-down', '严重低估自我',
      '卡迪夫大学对你的背景来说是妥妥的【保底区】。把它放在主申甚至冲刺，说明你对自己的背景极其缺乏自信。')
    allPerfect = false
    points -= 10
  } else if (safeties.includes('cardiff')) {
    addFeedback('status-perfect', 'fa-shield-alt', '稳固的后防线：卡迪夫',
      '干得漂亮！这才是真正的保底线。无论前面的神仙打架多激烈，这张卡片能保证你明年绝对有书读。')
  }

  // 兜底反馈
  if (feedbackList.value.length === 0) {
    addFeedback('status-waste', 'fa-question-circle', '阵型混沌', '你的分层缺乏明显的梯队感，建议再好好研究一下各个院校的平均录取门槛。')
  }

  // 设置最终分数
  score.value = `+${Math.max(10, points)}`
}

// 添加反馈项
const addFeedback = (statusClass, iconClass, title, text) => {
  feedbackList.value.push({
    statusClass,
    iconClass,
    title,
    text
  })
}
</script>

<style>
/* 完全保留原有样式，无任何修改 */
* {
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
  background: radial-gradient(circle at top, #1c2331 0%, #0b0f19 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  padding: 20px;
  color: #e2e8f0;
}

.balance-room {
  width: 100%;
  max-width: 1000px;
  background: rgba(15, 23, 42, 0.7);
  border: 2px solid #3b82f6;
  border-radius: 24px;
  padding: 30px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(59, 130, 246, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.header {
  text-align: center;
  margin-bottom: 25px;
  width: 100%;
}

.header h2 {
  margin: 0;
  font-size: 2.2rem;
  color: #60a5fa;
  text-shadow: 0 0 15px rgba(96, 165, 250, 0.5);
}

.header p {
  color: #94a3b8;
  font-size: 1.05rem;
  margin-top: 10px;
}

.user-profile {
  background: linear-gradient(90deg, rgba(30, 58, 138, 0.5), rgba(17, 24, 39, 0.5));
  border-left: 4px solid #f59e0b;
  padding: 10px 20px;
  border-radius: 8px;
  display: inline-block;
  margin-top: 15px;
  font-weight: bold;
  color: #fbbf24;
}

.card-deck {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 30px;
  width: 100%;
  border: 1px dashed #475569;
  min-height: 120px;
}

.school-card {
  background: linear-gradient(145deg, #1e293b, #0f172a);
  border: 2px solid #64748b;
  border-radius: 12px;
  width: 140px;
  padding: 15px 10px;
  text-align: center;
  cursor: grab;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.4);
  transition: 0.2s;
  position: relative;
}

.school-card:hover {
  transform: translateY(-5px);
  border-color: #fbbf24;
  box-shadow: 0 10px 20px rgba(251, 191, 36, 0.3);
}

.school-card:active {
  cursor: grabbing;
  transform: scale(0.95);
}

.school-icon {
  font-size: 2rem;
  margin-bottom: 8px;
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.2));
}

.school-name {
  font-size: 0.95rem;
  font-weight: bold;
  color: #f8fafc;
  margin-bottom: 5px;
}

.school-tag {
  font-size: 0.7rem;
  background: #334155;
  padding: 2px 6px;
  border-radius: 8px;
  color: #cbd5e1;
}

.tiers-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  width: 100%;
}

.tier-zone {
  background: rgba(15, 23, 42, 0.6);
  border: 2px dashed #475569;
  border-radius: 16px;
  min-height: 250px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  transition: 0.3s;
  position: relative;
  overflow: hidden;
}

.tier-header {
  font-size: 1.2rem;
  font-weight: 900;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 2px;
  z-index: 2;
}

.tier-icon {
  font-size: 3rem;
  position: absolute;
  opacity: 0.1;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

#zone-reach {
  border-color: #ef4444;
}

#zone-reach .tier-header {
  color: #fca5a5;
  text-shadow: 0 0 10px #ef4444;
}

#zone-reach.drag-over {
  background: rgba(239, 68, 68, 0.15);
  box-shadow: inset 0 0 30px rgba(239, 68, 68, 0.3);
  transform: scale(1.02);
}

#zone-match {
  border-color: #3b82f6;
}

#zone-match .tier-header {
  color: #93c5fd;
  text-shadow: 0 0 10px #3b82f6;
}

#zone-match.drag-over {
  background: rgba(59, 130, 246, 0.15);
  box-shadow: inset 0 0 30px rgba(59, 130, 246, 0.3);
  transform: scale(1.02);
}

#zone-safety {
  border-color: #10b981;
}

#zone-safety .tier-header {
  color: #6ee7b7;
  text-shadow: 0 0 10px #10b981;
}

#zone-safety.drag-over {
  background: rgba(16, 185, 129, 0.15);
  box-shadow: inset 0 0 30px rgba(16, 185, 129, 0.3);
  transform: scale(1.02);
}

.tier-zone .school-card {
  width: 90%;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 2;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
}

.tier-zone .school-icon {
  font-size: 1.5rem;
  margin: 0;
}

.tier-zone .school-name {
  margin: 0;
  font-size: 0.85rem;
}

.controls {
  margin-top: 30px;
  text-align: center;
}

.btn-predict {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  padding: 15px 40px;
  border-radius: 30px;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
  box-shadow: 0 10px 20px rgba(99, 102, 241, 0.4);
}

.btn-predict:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 25px rgba(99, 102, 241, 0.6);
}

.feedback-panel {
  margin-top: 25px;
  background: rgba(15, 23, 42, 0.9);
  border: 2px solid #8b5cf6;
  border-radius: 16px;
  padding: 25px;
  width: 100%;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fb-title {
  color: #c4b5fd;
  font-size: 1.4rem;
  font-weight: bold;
  border-bottom: 1px dashed #6d28d9;
  padding-bottom: 10px;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
}

.fb-score {
  color: #f59e0b;
}

.fb-item {
  margin-bottom: 15px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.fb-icon {
  font-size: 1.5rem;
}

.fb-text h4 {
  margin: 0 0 5px 0;
  color: #f1f5f9;
}

.fb-text p {
  margin: 0;
  color: #94a3b8;
  font-size: 0.9rem;
  line-height: 1.5;
}

.status-danger {
  border-left: 4px solid #ef4444;
}

.status-danger .fb-icon {
  color: #ef4444;
}

.status-perfect {
  border-left: 4px solid #10b981;
}

.status-perfect .fb-icon {
  color: #10b981;
}

.status-waste {
  border-left: 4px solid #f59e0b;
}

.status-waste .fb-icon {
  color: #f59e0b;
}
</style>