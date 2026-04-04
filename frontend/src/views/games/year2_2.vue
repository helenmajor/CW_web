<template>
  <div class="crossroads-scene">
    <!-- 头部标题 -->
    <div class="header">
      <h2><i class="fas fa-compass"></i> 命运岔路口</h2>
      <p>传送门正处于休眠状态。你的每一个抉择，都会化作能量为其充能。</p>
    </div>

    <!-- 传送门容器 -->
    <div class="portals-container">
      <!-- 英国之门 -->
      <div 
        class="portal portal-uk" 
        :class="`active-${ukScore}`"
      >
        <div class="portal-icon">🏰</div>
        <div class="portal-name">英伦之径 (UK)</div>
      </div>

      <!-- 香港之门 -->
      <div 
        class="portal portal-hk" 
        :class="`active-${hkScore}`"
      >
        <div class="portal-icon">🌃</div>
        <div class="portal-name">香江之轨 (HK)</div>
      </div>
    </div>

    <!-- 问答卷轴 (仅在未完成时显示) -->
    <div 
      v-if="currentQuestionIndex < questions.length" 
      class="scroll-board"
      :class="{ 'fade-out': isFading }"
    >
      <div class="owl-guide">🦉</div>
      <div class="question-text">“{{ currentQuestion.q }}”</div>
      <div class="choices">
        <button 
          v-for="(choice, index) in currentQuestion.choices" 
          :key="index"
          class="btn-choice"
          @click="handleAnswer(choice.type)"
        >
          <i class="fas fa-feather-alt" style="color:#c8a165; margin-right:8px;"></i>
          {{ choice.text }}
        </button>
      </div>
    </div>

    <!-- 结果弹窗 -->
    <div class="result-overlay" v-if="showResultModal">
      <div class="tarot-card" :class="resultType === 'uk' ? 'tarot-uk' : 'tarot-hk'">
        <div class="tarot-title">{{ resultTitle }}</div>
        <div class="tarot-icon">{{ resultIcon }}</div>
        <div class="tarot-desc" v-html="resultDesc"></div>
        <div class="tarot-reward">✨ 解锁成就：地区探路者 (+30金币)</div>
        <button class="btn-claim" @click="closeModal">收下签证，继续前行</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// --- 数据定义 ---
const questions = [
  { 
    q: "面对未知的修行旅途，你更希望去往何方？",
    choices: [ 
      { text: "远赴重洋，沉浸体验纯正的西方魔法学院文化。", type: "uk" }, 
      { text: "留在熟悉的东方明珠，饮食与文化无缝衔接。", type: "hk" } 
    ] 
  },
  { 
    q: "毕业后的魔法卷轴，你打算在哪里展开？",
    choices: [ 
      { text: "追求极致名校光环，想在海外或归国大厂发光。", type: "uk" }, 
      { text: "渴望高强度的实战实习，毕业直接在亚洲金融/大厂圈极速立足。", type: "hk" } 
    ] 
  },
  { 
    q: "你的行囊里，哪一样资源更加充裕？",
    choices: [ 
      { text: "我有充足的金币预算，希望能更从容地体验异国生活。", type: "uk" }, 
      { text: "我的时间与预算有限，追求最高的性价比和留任机会。", type: "hk" } 
    ] 
  }
];

// --- 响应式状态 ---
const currentQuestionIndex = ref(0);
const ukScore = ref(0);
const hkScore = ref(0);
const isFading = ref(false);
const showResultModal = ref(false);
const resultType = ref('');
const resultTitle = ref('');
const resultIcon = ref('');
const resultDesc = ref('');

// --- 计算属性 ---
const currentQuestion = computed(() => questions[currentQuestionIndex.value]);

// --- 方法定义 ---
const handleAnswer = (type) => {
  // 1. 更新分数
  if (type === 'uk') ukScore.value++;
  else hkScore.value++;

  // 2. 触发动画 (先隐藏)
  isFading.value = true;

  // 3. 延迟后进入下一题或结算
  setTimeout(() => {
    currentQuestionIndex.value++;
    isFading.value = false; // 重置动画状态

    // 如果题目结束，触发结算
    if (currentQuestionIndex.value >= questions.length) {
      finishJourney();
    }
  }, 300);
};

const finishJourney = () => {
  // 判断胜者
  const winner = ukScore.value > hkScore.value ? 'uk' : 'hk';
  resultType.value = winner;
  
  // 强制胜者门为满级状态 (视觉反馈)
  if (winner === 'uk') ukScore.value = 3;
  else hkScore.value = 3;

  // 显示结果弹窗
  setTimeout(() => {
    showResultModal.value = true;
    
    // 设置结果内容
    if (winner === 'uk') {
      resultTitle.value = "签证：英伦探索者";
      resultIcon.value = "🏰";
      resultDesc.value = "<b>你的灵魂共鸣指向：英国</b><br><br>你追求名校的光环与正统的学术体验。英国拥有顶尖的 QS 排名和深厚的文化底蕴。准备好充足的预算，去拥抱更广阔的异国修行吧！";
    } else {
      resultTitle.value = "签证：香江实战派";
      resultIcon.value = "🌃";
      resultDesc.value = "<b>你的灵魂共鸣指向：香港</b><br><br>你是个极致的实用主义者。香港节奏极快，背靠亚洲金融中心与大厂资源，留任与实习机会极其丰富。适合追求高性价比和极速就业的你！";
    }
  }, 800);
};

const closeModal = () => {
  showResultModal.value = false;
  alert("地图向导：你已点亮地区方向！接下来，看看你的分数能冲击什么学校吧！（即将进入 Y2-3）");
  // 这里可以触发路由跳转或 EventBus 通知父组件
};

// --- 初始化 ---
// 页面加载时自动渲染第一题 (由模板自动处理)
</script>

<style scoped>
/* 注意：为了确保样式生效，这里保留了原生 CSS。
   如果在 scoped 样式中使用 Font Awesome，可能需要将 icon 样式移至全局，或者使用 CDN。 */

/* 通用重置与基础样式 */
* {
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.crossroads-scene {
  width: 100%;
  max-width: 900px;
  height: 650px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 背景样式 (通常建议放在全局 App.vue 或 index.css 中，但为了完整展示放在这里) */
body {
  background: radial-gradient(circle at center, #1a2a3a 0%, #0a0f14 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  padding: 20px;
  color: #e0e6ed;
  overflow: hidden;
}

/* 顶部标题 */
.header {
  text-align: center;
  margin-bottom: 20px;
  z-index: 10;
}
.header h2 {
  margin: 0;
  font-size: 2.2rem;
  color: #f9d976;
  text-shadow: 0 0 15px rgba(249, 217, 118, 0.5);
  font-family: 'Courier New', Courier, monospace;
}
.header p {
  color: #8b9bb4;
  font-size: 1rem;
  margin-top: 5px;
}

/* 两扇传送门区域 */
.portals-container {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0 50px;
  margin-top: 20px;
  z-index: 1;
}

/* 传送门通用样式 */
.portal {
  width: 220px;
  height: 350px;
  border-radius: 110px 110px 0 0;
  position: relative;
  transition: all 0.5s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 4px solid #2c3e50;
  background: #0b131a;
  box-shadow: inset 0 0 20px rgba(0,0,0,0.8);
  opacity: 0.6;
  filter: grayscale(0.8);
}
.portal::after {
  content: '';
  position: absolute;
  bottom: -10px;
  width: 120%;
  height: 20px;
  background: radial-gradient(ellipse, rgba(0,0,0,0.8) 0%, transparent 70%);
  z-index: -1;
}
.portal-icon {
  font-size: 4rem;
  opacity: 0.5;
  transition: 0.5s;
  text-shadow: 0 0 20px rgba(255,255,255,0.2);
}
.portal-name {
  font-size: 1.2rem;
  font-weight: bold;
  margin-top: 20px;
  opacity: 0.5;
  transition: 0.5s;
  letter-spacing: 2px;
}

/* 英国之门 (幽蓝) */
.portal-uk {
  border-color: #2c3e50;
}
.portal-uk .portal-name {
  color: #82b1ff;
}

/* 吸收能量状态 */
.portal-uk.active-1 {
  box-shadow: 0 0 30px rgba(65, 105, 225, 0.4), inset 0 0 30px rgba(65, 105, 225, 0.3);
  opacity: 0.8; filter: grayscale(0.4); border-color: #4169e1;
}
.portal-uk.active-2 {
  box-shadow: 0 0 60px rgba(65, 105, 225, 0.6), inset 0 0 60px rgba(65, 105, 225, 0.5);
  opacity: 0.9; filter: grayscale(0.2); border-color: #5c85ff;
}
.portal-uk.active-3 {
  box-shadow: 0 0 100px rgba(65, 105, 225, 0.9), inset 0 0 100px rgba(65, 105, 225, 0.8);
  opacity: 1; filter: grayscale(0); border-color: #82b1ff;
  background: radial-gradient(circle at bottom, #1a3673, #0b131a);
}

/* 香港之门 (暗金) */
.portal-hk {
  border-color: #3d342b;
}
.portal-hk .portal-name {
  color: #ffd700;
}

.portal-hk.active-1 {
  box-shadow: 0 0 30px rgba(218, 165, 32, 0.4), inset 0 0 30px rgba(218, 165, 32, 0.3);
  opacity: 0.8; filter: grayscale(0.4); border-color: #daa520;
}
.portal-hk.active-2 {
  box-shadow: 0 0 60px rgba(218, 165, 32, 0.6), inset 0 0 60px rgba(218, 165, 32, 0.5);
  opacity: 0.9; filter: grayscale(0.2); border-color: #ffcc00;
}
.portal-hk.active-3 {
  box-shadow: 0 0 100px rgba(218, 165, 32, 0.9), inset 0 0 100px rgba(218, 165, 32, 0.8);
  opacity: 1; filter: grayscale(0); border-color: #ffe066;
  background: radial-gradient(circle at bottom, #5c4716, #0b131a);
}

/* 选中态内部元素亮起 */
.portal[class*="active-"] .portal-icon {
  opacity: 1;
  transform: scale(1.1);
}
.portal[class*="active-"] .portal-name {
  opacity: 1;
  text-shadow: 0 0 10px currentColor;
}

/* 动画辅助类 */
.fade-out {
  transform: scale(0.9);
  opacity: 0;
  transition: transform 0.3s, opacity 0.3s;
}

/* 中央魔法卷轴 (问答区) */
.scroll-board {
  position: absolute;
  top: 180px;
  width: 450px;
  background: linear-gradient(135deg, #fdf5e6, #f3e5ab);
  border-radius: 10px;
  padding: 30px;
  border: 3px solid #c8a165;
  box-shadow: 0 20px 40px rgba(0,0,0,0.6), inset 0 0 20px rgba(200,161,101,0.2);
  color: #3e2723;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: float 3s ease-in-out infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.owl-guide {
  position: absolute;
  top: -40px;
  font-size: 3.5rem;
  filter: drop-shadow(0 5px 5px rgba(0,0,0,0.5));
}

.question-text {
  font-size: 1.2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 25px;
  margin-top: 15px;
  line-height: 1.5;
  font-family: "KaiTi", "楷体", serif;
}

.choices {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.btn-choice {
  background: rgba(255,255,255,0.6);
  border: 2px solid #c8a165;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 1rem;
  color: #5d4037;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
  text-align: left;
  position: relative;
  overflow: hidden;
}
.btn-choice:hover {
  background: #fff;
  transform: scale(1.02);
  box-shadow: 0 5px 15px rgba(200,161,101,0.4);
}

/* 结果弹窗 (塔罗牌) */
.result-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.85);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.tarot-card {
  width: 320px;
  height: 500px;
  border-radius: 15px;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 0 50px rgba(255,255,255,0.2);
  position: relative;
  animation: cardReveal 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes cardReveal {
  from { transform: scale(0.5) rotateY(90deg); opacity: 0; }
  to { transform: scale(1) rotateY(0); opacity: 1; }
}

.tarot-uk {
  background: linear-gradient(135deg, #1a3673, #0b131a);
  border: 4px solid #82b1ff;
  color: #e0ebff;
}
.tarot-hk {
  background: linear-gradient(135deg, #5c4716, #0b131a);
  border: 4px solid #ffe066;
  color: #fff3cc;
}

.tarot-title {
  font-size: 1.5rem;
  font-weight: bold;
  border-bottom: 2px dashed currentColor;
  padding-bottom: 10px;
  width: 100%;
  margin-bottom: 20px;
  letter-spacing: 2px;
}
.tarot-icon {
  font-size: 5rem;
  margin-bottom: 20px;
  filter: drop-shadow(0 0 15px currentColor);
}
.tarot-desc {
  font-size: 1rem;
  line-height: 1.6;
  text-align: left;
  background: rgba(0,0,0,0.3);
  padding: 15px;
  border-radius: 10px;
  flex: 1;
}
.tarot-reward {
  margin-top: 20px;
  color: #2ecc71;
  font-weight: bold;
  font-size: 1.1rem;
}
.btn-claim {
  margin-top: 25px;
  background: #fff;
  color: #000;
  border: none;
  padding: 10px 30px;
  border-radius: 20px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
}
.btn-claim:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(255,255,255,0.4);
}
</style>