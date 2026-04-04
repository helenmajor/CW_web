<template>
  <div class="astrolabe-room">
    <!-- 顶部标题 -->
    <div class="header">
      <h2><i class="fas fa-atom"></i> 命运星盘：精力分配法则</h2>
      <p>
        你拥有 <b>10 滴星尘 (行动点)</b>。要想在核心科技与商界巅峰立足，不能盲目努力。<br>
        请将星尘注入你认为当前“投入产出比(ROI)最高”的星轨中。
      </p>
    </div>

    <!-- 星尘能量条 -->
    <div class="energy-panel">
      <i class="fas fa-star energy-icon"></i>
      <span class="energy-text">可用星尘：</span>
      <span class="energy-count">{{ currentAP }}</span>
    </div>

    <!-- 任务分配网格（数据驱动渲染） -->
    <div class="allocation-grid">
      <div
        class="task-card"
        :class="{ active: item.val > 0 }"
        v-for="item in taskList"
        :key="item.id"
      >
        <div class="task-icon">{{ item.icon }}</div>
        <div class="task-name">{{ item.name }}</div>
        <div class="task-desc">{{ item.desc }}</div>
        <div class="controls-group">
          <button
            class="btn-ap btn-minus"
            @click="updateAP(item.id, -1)"
            :disabled="item.val <= 0"
          >
            -
          </button>
          <span class="ap-value">{{ item.val }}</span>
          <button
            class="btn-ap btn-plus"
            @click="updateAP(item.id, 1)"
            :disabled="currentAP === 0 || item.val >= 5"
          >
            +
          </button>
        </div>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-area">
      <button class="btn-predict" @click="generateProphecy">
        <i class="fas fa-eye"></i> 凝视星盘，推演未来
      </button>
    </div>

    <!-- 预言结果面板 -->
    <div class="prophecy-panel" v-show="showProphecy">
      <div class="prophecy-title"><i class="fas fa-scroll"></i> 星盘预言：个性化行动指南</div>
      <p style="color:#94a3b8; font-size:0.9rem; margin-top:-10px;">
        基于你的分配，系统提取了你当前最优先的 3 件事：
      </p>

      <div class="top-3-list">
        <div class="top-item" v-for="item in top3Tasks" :key="item.id">
          <i class="fas {{ item.icon }}"></i>
          <span>{{ item.label }} ({{ item.val }}点)</span>
        </div>
      </div>

      <div class="analysis-text" v-html="analysisContent"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// 常量配置
const MAX_AP = 10
const SINGLE_MAX = 5

// 响应式状态
const currentAP = ref(MAX_AP)
const showProphecy = ref(false)
const top3Tasks = ref([])
const analysisContent = ref('')

// 任务列表数据（核心：数据驱动渲染所有卡片）
const taskList = reactive([
  { id: 'gpa', val: 0, name: '研读魔典', desc: '刷高 GPA', icon: '📜', label: '刷高 GPA', fontIcon: 'fa-book' },
  { id: 'lang', val: 0, name: '海妖之歌', desc: '考出高分雅思', icon: '🗣️', label: '备考雅思', fontIcon: 'fa-language' },
  { id: 'proj', val: 0, name: '炼金造物', desc: '做个人/课程项目', icon: '⚙️', label: '硬核项目开发', fontIcon: 'fa-cogs' },
  { id: 'res', val: 0, name: '协助大魔法师', desc: '进组做科研论文', icon: '🔬', label: '进组科研', fontIcon: 'fa-microscope' },
  { id: 'int', val: 0, name: '勇者公会委派', desc: '名企大厂实习', icon: '💼', label: '名企大厂实习', fontIcon: 'fa-briefcase' },
  { id: 'comp', val: 0, name: '皇家角斗场', desc: '打ACM等专业比赛', icon: '⚔️', label: '专业高阶比赛', fontIcon: 'fa-trophy' },
  { id: 'info', val: 0, name: '凝视真理水晶', desc: '查选校查专业', icon: '🔮', label: '查院校资料', fontIcon: 'fa-globe' },
  { id: 'net', val: 0, name: '寻访先知幽灵', desc: '联系学长/套磁', icon: '🦉', label: '联系学长学姐', fontIcon: 'fa-comments' }
])

// 核心：更新行动点
const updateAP = (taskId, delta) => {
  // 找到对应任务
  const task = taskList.find(item => item.id === taskId)
  if (!task) return

  // 校验规则（完全复刻原版）
  if (delta > 0) {
    if (currentAP.value <= 0) return
    if (task.val >= SINGLE_MAX) {
      alert("⚠️ 魔法师，单一维度的过度沉迷会导致走火入魔！单项最高投入 5 点星尘。")
      return
    }
  } else {
    if (task.val <= 0) return
  }

  // 更新数值
  task.val += delta
  currentAP.value -= delta
}

// 核心：生成星盘预言
const generateProphecy = () => {
  // 校验：必须分配完所有星尘
  if (currentAP.value > 0) {
    alert(`🔮 你的星盘中还有 ${currentAP.value} 滴星尘未分配。请毫无保留地倾注你的全部精力！`)
    return
  }

  // 1. 排序获取前三名任务
  const sorted = [...taskList].sort((a, b) => b.val - a.val).slice(0, 3)
  top3Tasks.value = sorted

  // 2. 生成分析逻辑（1:1 复刻原版判定算法）
  const points = {}
  taskList.forEach(item => { points[item.id] = item.val })
  const hardSkills = points.gpa + points.proj + points.res + points.int
  const softInfo = points.info + points.net

  let analysis = ''
  // 判定 A：无效努力警告
  if (softInfo >= 4) {
    analysis = `⚠️ <b>先知警告：这是一种“看起来很努力”的内耗陷阱。</b><br>
            你在【查资料】或【套磁】上消耗了过多星尘。对于竞争激烈的信息科学与软件开发领域，这些是<span class="highlight-roi">低 ROI（投入产出比）的边缘行为</span>。学长学姐无法帮你写代码，中介的话术也不能代替你的 GPA。请立即缩减这里的精力，转移到硬核技能的打磨上！`
  } 
  // 判定 B：完美计算机/求职路线
  else if (points.int >= 3 && points.proj >= 2 && points.gpa >= 2) {
    analysis = `✨ <b>星象极其璀璨！这是通往顶级科技公会（如 SAP 等名企）的最佳路线。</b><br>
            你精准地抓住了计算机类专业的最强护城河：<span class="highlight-roi">硬核项目 + 名企实习背书 + 扎实的绩点底色</span>。在代码的世界里，一份高质量的系统开发项目（比如全栈平台）和一段核心研发实习的 ROI 是无与伦比的。继续保持这种极度务实的节奏！`
  }
  // 判定 C：偏科警告
  else if (points.res >= 4 && points.lang === 0) {
    analysis = `🤔 <b>星光略显黯淡：瘸腿的学术怪人。</b><br>
            你极度沉迷于实验室的魔法演算，却完全忽视了与外界沟通的【海妖之歌(雅思)】。要知道，哪怕你做出了跨时代的科研成果，如果语言成绩达不到申请的红线要求，所有的名校传送门都会对你紧闭。`
  }
  // 兜底：平衡但平庸
  else {
    analysis = `⚖️ <b>平稳的修行之路。</b><br>
            你的精力分配相对均衡。虽然没有犯大错，但也缺乏能够让你在千军万马中脱颖而出的“爆点”。建议在保证 GPA 不崩盘的前提下，集中火力攻克一段<b>高含金量的核心实习</b>或<b>重量级专业项目</b>，这会成为你日后申请文书里的杀手锏。`
  }

  analysisContent.value = analysis
  showProphecy.value = true
}
</script>

<style>
/* 完全保留原版样式，无任何修改 */
* {
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  user-select: none;
}

body {
  background: radial-gradient(circle at center, #0f172a 0%, #020617 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  padding: 20px;
  color: #e2e8f0;
}

.astrolabe-room {
  width: 100%;
  max-width: 900px;
  background: rgba(30, 41, 59, 0.6);
  border: 2px solid #38bdf8;
  border-radius: 30px;
  padding: 35px;
  box-shadow: 0 0 50px rgba(56, 189, 248, 0.2), inset 0 0 20px rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;
}

.astrolabe-room::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #38bdf8, transparent);
}

.header {
  text-align: center;
  margin-bottom: 25px;
}

.header h2 {
  margin: 0 0 10px 0;
  font-size: 2.2rem;
  color: #e0f2fe;
  text-shadow: 0 0 15px rgba(56, 189, 248, 0.6);
}

.header p {
  color: #94a3b8;
  font-size: 1rem;
  margin: 0;
  line-height: 1.5;
}

.energy-panel {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  background: rgba(15, 23, 42, 0.8);
  padding: 15px 30px;
  border-radius: 50px;
  margin: 0 auto 30px auto;
  width: fit-content;
  border: 1px solid #0ea5e9;
  box-shadow: 0 0 20px rgba(14, 165, 233, 0.4);
}

.energy-icon {
  font-size: 2rem;
  color: #fde047;
  filter: drop-shadow(0 0 10px #fde047);
  animation: pulse 2s infinite;
}

.energy-text {
  font-size: 1.2rem;
  font-weight: bold;
  color: #bae6fd;
}

.energy-count {
  font-size: 1.8rem;
  color: #fde047;
  font-weight: 900;
  font-family: monospace;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    filter: drop-shadow(0 0 10px #fde047);
  }

  50% {
    transform: scale(1.1);
    filter: drop-shadow(0 0 20px #fde047);
  }
}

.allocation-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.task-card {
  background: linear-gradient(145deg, #1e293b, #0f172a);
  border: 2px solid #475569;
  border-radius: 16px;
  padding: 15px 10px;
  text-align: center;
  transition: 0.3s;
  position: relative;
}

.task-card:hover {
  border-color: #38bdf8;
  box-shadow: 0 5px 15px rgba(56, 189, 248, 0.2);
}

.task-card.active {
  border-color: #fde047;
  box-shadow: 0 0 15px rgba(253, 224, 71, 0.3);
  background: linear-gradient(145deg, #334155, #1e293b);
}

.task-icon {
  font-size: 1.8rem;
  margin-bottom: 8px;
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.2));
}

.task-name {
  font-size: 0.85rem;
  font-weight: bold;
  color: #f8fafc;
  margin-bottom: 3px;
}

.task-desc {
  font-size: 0.7rem;
  color: #64748b;
  margin-bottom: 12px;
}

.controls-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 4px;
}

.btn-ap {
  background: #334155;
  border: none;
  color: #fff;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.2s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.btn-ap:hover {
  background: #0ea5e9;
}

.btn-ap:active {
  transform: scale(0.9);
}

.btn-ap:disabled {
  background: #1e293b;
  color: #475569;
  cursor: not-allowed;
}

.ap-value {
  font-weight: 900;
  font-size: 1.1rem;
  color: #fde047;
  width: 20px;
}

.action-area {
  text-align: center;
}

.btn-predict {
  background: linear-gradient(135deg, #0ea5e9, #3b82f6);
  border: none;
  padding: 15px 45px;
  border-radius: 30px;
  color: white;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
  box-shadow: 0 10px 20px rgba(14, 165, 233, 0.4);
}

.btn-predict:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 25px rgba(14, 165, 233, 0.6);
}

.prophecy-panel {
  margin-top: 30px;
  background: rgba(15, 23, 42, 0.9);
  border: 2px solid #fde047;
  border-radius: 20px;
  padding: 25px;
  box-shadow: 0 0 40px rgba(253, 224, 71, 0.2);
  animation: reveal 0.5s ease-out;
}

@keyframes reveal {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.prophecy-title {
  color: #fde047;
  font-size: 1.4rem;
  font-weight: bold;
  border-bottom: 1px dashed #ca8a04;
  padding-bottom: 10px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.top-3-list {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.top-item {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  padding: 12px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid #475569;
}

.top-item i {
  font-size: 1.5rem;
  color: #38bdf8;
  margin-bottom: 5px;
  display: block;
}

.top-item span {
  font-weight: bold;
  color: #e2e8f0;
  font-size: 0.9rem;
}

.analysis-text {
  color: #cbd5e1;
  font-size: 1rem;
  line-height: 1.6;
  background: rgba(0, 0, 0, 0.3);
  padding: 15px;
  border-radius: 12px;
}

.analysis-text strong {
  color: #38bdf8;
}

.highlight-roi {
  color: #fde047;
  font-weight: bold;
}
</style>