<template>
  <div class="alchemy-lab">
    <!-- 顶部标题 -->
    <div class="header">
      <h2><i class="fas fa-magic"></i> 真知炼妖炉</h2>
      <p>资源是有限的。请选择目标专业，从 8 味药材中挑选 <b>最核心的 3 项</b> 投入炼妖炉！</p>
    </div>

    <!-- 专业选择器 -->
    <div class="major-selector">
      <button 
        v-for="major in majors" 
        :key="major.key"
        class="major-btn" 
        :class="{ active: currentMajor === major.key }"
        @click="setMajor(major.key)"
      >
        {{ major.icon }} {{ major.name }}
      </button>
    </div>

    <!-- 工作区 -->
    <div class="workspace">
      <!-- 左侧材料架 -->
      <div class="ingredient-shelf" id="shelf">
        <div
          v-for="ing in ingredients"
          :key="ing.type"
          class="ingredient"
          :class="{ 'no-drop': addedItems.some(i => i.type === ing.type) }"
          draggable="true"
          :data-type="ing.type"
          :data-name="ing.name"
          @dragstart="onDragStart"
          @click="handleClick(ing)"
        >
          <div class="ing-tag" v-if="ing.tag">{{ ing.tag }}</div>
          <div class="ing-icon">{{ ing.icon }}</div>
          <div class="ing-name">{{ ing.name }}</div>
        </div>
      </div>

      <!-- 右侧炼妖炉 -->
      <div class="cauldron-area">
        <div class="cauldron-wrapper" id="cauldronWrap">
          <div 
            class="cauldron" 
            id="cauldron" 
            :class="{ 'drag-over': isDraggingOver }"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
            @drop="onDrop"
          >
            <span class="item-count" :style="{ color: addedItems.length > 0 ? '#f9d976' : '#fff' }">
              容量 ({{ addedItems.length }}/3)
            </span>
            <div class="added-list" id="addedList">
              {{ addedItems.map(i => i.name).join(' + ') || '空空如也' }}
            </div>
          </div>
        </div>
        <button class="btn-brew" @click="brewPotion()">
          <i class="fas fa-fire"></i> 点火鉴定配方
        </button>
        <button class="btn-reset" @click="resetCauldron()">[倒掉重炼]</button>
      </div>
    </div>

    <!-- 反馈面板 -->
    <div 
      id="feedback" 
      class="feedback-panel" 
      :class="feedbackClass"
      v-show="showFeedback"
      v-html="feedbackMessage"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// --- 数据定义 ---
const majors = [
  { key: 'cs', name: '理工/计算类 (STEM)', icon: '💻' },
  { key: 'business', name: '泛商科类 (Business)', icon: '📈' },
  { key: 'arts', name: '设计艺术类 (Arts)', icon: '🎨' }
];

const rawIngredients = [
  { type: 'gpa', name: '高阶羊皮卷 (高GPA)', icon: '📜', tag: null },
  { type: 'lang', name: '海妖羽毛 (高雅思)', icon: '🗣️', tag: null },
  { type: 'gre', name: '巨龙逆鳞 (GRE/GMAT)', icon: '🐉', tag: '进阶' },
  { type: 'research', name: '星尘试管 (核心科研)', icon: '🔬', tag: null },
  { type: 'intern', name: '大亨算盘 (名企实习)', icon: '💼', tag: null },
  { type: 'contest', name: '决斗徽章 (ACM等竞赛)', icon: '🏅', tag: null },
  { type: 'portfolio', name: '幻象水晶 (作品集)', icon: '🔮', tag: '特化' },
  { type: 'exchange', name: '远洋罗盘 (海外交换)', icon: '🧭', tag: null }
];

// --- 响应式状态 ---
const currentMajor = ref('cs');
const addedItems = ref([]);
const isDraggingOver = ref(false);
const showFeedback = ref(false);
const feedbackMessage = ref('');
const feedbackType = ref(''); // success, error, warning

// 计算属性：动态生成反馈面板的类名
const feedbackClass = computed(() => {
  return showFeedback.value ? `feedback-panel ${feedbackType.value}` : 'feedback-panel';
});

// --- 事件处理 ---
const setMajor = (major) => {
  currentMajor.value = major;
};

const onDragStart = (event) => {
  const type = event.target.dataset.type;
  const name = event.target.dataset.name;
  event.dataTransfer.setData('type', type);
  event.dataTransfer.setData('name', name);
  setTimeout(() => event.target.style.opacity = '0.4', 0);
};

const onDragEnd = (event) => {
  event.target.style.opacity = '1';
};

const onDragOver = (event) => {
  event.preventDefault();
  isDraggingOver.value = true;
};

const onDragLeave = () => {
  isDraggingOver.value = false;
};

const onDrop = (event) => {
  event.preventDefault();
  isDraggingOver.value = false;
  
  const type = event.dataTransfer.getData('type');
  const name = event.dataTransfer.getData('name');

  // 校验逻辑
  if (addedItems.value.length >= 3) {
    alert("🪄 炼妖炉已满！只能容纳最核心的 3 味药材。");
    return;
  }
  if (addedItems.value.some(i => i.type === type)) {
    alert("🪄 同样的药材加一遍就够啦！");
    return;
  }

  // 添加药材
  addedItems.value.push({ type, name });
};

// --- 核心业务逻辑 ---
const brewPotion = () => {
  if (addedItems.value.length !== 3) {
    showFeedbackPanel('warning', '⏳ 必须放满 3 味核心药材才能点火鉴定！(升学规划需要有完整的组合拳)');
    return;
  }

  const types = addedItems.value.map(i => i.type);
  const has = (item) => types.includes(item);

  let msg = "";
  let status = "error";

  // 陷阱：非艺术专业加了作品集
  if (has('portfolio') && currentMajor.value !== 'arts') {
    msg = "💥 轰隆！实验室炸了！<br>你往非设计专业里扔了【作品集】？理工科和商科的老板对你的艺术细菌毫无兴趣，这纯属浪费精力！";
  } 
  // 理工科 (STEM)
  else if (currentMajor.value === 'cs') {
    if (has('gpa') && (has('research') || has('intern') || has('contest'))) {
      msg = "✨ 炼制成功：【极客超载灵药】！<br>对于理工计算类方向，高GPA是绝对底色。配合硬核科研，或者大厂核心岗位实习/ACM竞赛，是证明你代码落地能力的最强王炸组合！";
      status = "success";
    } else if (!has('gpa')) {
      msg = "💨 药水变成了一团黑烟...<br>缺少了【高阶羊皮卷(GPA)】。理工科导师非常看重学术基础，没有绩点打底，再多花里胡哨的经历也容易被当成空中楼阁。";
    } else {
      msg = "🤔 药水只发出了微弱的光芒。<br>方向对了，但缺乏“硬核输出”。理工科需要【星尘试管(科研)】或【算盘(大厂实习)】来证明你的实战落地能力。";
      status = "warning";
    }
  } 
  // 商科 (Business)
  else if (currentMajor.value === 'business') {
    if (has('gpa') && has('intern') && (has('gre') || has('lang') || has('exchange'))) {
      msg = "✨ 炼制成功：【华尔街之狼魔药】！<br>商科极度看重职场潜力和实务经历！【名企实习】是商科的核心护城河，配合体面的三围（GPA/语言/GMAT），这就是顶级商学院的最爱。";
      status = "success";
    } else if (!has('intern')) {
      msg = "💥 药水变成了一摊泥！<br>缺少【大亨的金算盘(实习)】？商学院旨在培养职场精英，没有两段以上的拿手实习，在商科申请池里寸步难行！";
    } else {
      msg = "🤔 药水沸腾得不够剧烈。<br>商科非常看重沟通与门槛。建议加入【海妖羽毛(雅思)】或【巨龙逆鳞(GMAT)】来提升配方的纯度。";
      status = "warning";
    }
  } 
  // 艺术类 (Arts)
  else if (currentMajor.value === 'arts') {
    if (has('portfolio') && has('gpa')) {
      msg = "✨ 炼制成功：【达芬奇密码合剂】！<br>艺术设计类的黄金铁律：【作品集】就是绝对的话语权！只要GPA和语言过线，神级作品集能让你逆袭一切！";
      status = "success";
    } else if (!has('portfolio')) {
      msg = "💥 实验彻底失败！<br>竟然没放【幻象水晶(作品集)】？没有作品集，哪怕你GPA满分、GRE满分，艺术学院的大门也绝不会为你敞开半条缝！";
    }
  }

  showFeedbackPanel(status, msg);
};

const resetCauldron = () => {
  addedItems.value = [];
  showFeedback.value = false;
};

const showFeedbackPanel = (type, message) => {
  feedbackType.value = type;
  feedbackMessage.value = message;
  showFeedback.value = true;
};
</script>

<style scoped>
/* 样式部分 (直接使用文档中的 CSS，仅添加 scoped 属性) */
/* 注意：由于使用了 scoped，如果 Font Awesome 图标不显示，可能需要在全局样式中引入 CSS */
* {
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
body {
  background: radial-gradient(circle at center, #1e142e 0%, #08050d 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  padding: 20px;
  color: #e0d8ee;
}
.alchemy-lab {
  background: rgba(30, 20, 45, 0.85);
  border: 3px solid #6b4c8a;
  border-radius: 30px;
  padding: 30px;
  width: 100%;
  max-width: 950px;
  box-shadow: 0 0 40px rgba(107, 76, 138, 0.5), inset 0 0 20px rgba(0,0,0,0.8);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}
.header {
  text-align: center;
  margin-bottom: 25px;
}
.header h2 {
  margin: 0 0 10px 0;
  font-size: 2.2rem;
  color: #f9d976;
  text-shadow: 0 0 15px rgba(249, 217, 118, 0.6);
}
.header p {
  color: #a99bbd;
  font-size: 1rem;
  margin: 0;
}
/* 专业选择 */
.major-selector {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 25px;
}
.major-btn {
  background: #2a1b3d;
  border: 2px solid #8c5aae;
  color: #d1bced;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  transition: 0.3s;
}
.major-btn.active {
  background: #8c5aae;
  color: #fff;
  border-color: #e5c3ff;
  box-shadow: 0 0 15px #8c5aae;
}
/* 工作区：左边架子(8个)，右边炉子 */
.workspace {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 20px;
  background: rgba(0,0,0,0.3);
  padding: 25px;
  border-radius: 20px;
  border: 1px dashed #523b6e;
}
/* 8格魔法材料架 */
.ingredient-shelf {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  width: 65%;
}
.ingredient {
  background: linear-gradient(135deg, #3c2a4d, #241630);
  border: 2px solid #5d4078;
  border-radius: 12px;
  padding: 12px 8px;
  text-align: center;
  cursor: grab;
  transition: 0.2s;
  position: relative;
}
.ingredient:hover {
  transform: translateY(-5px);
  border-color: #f9d976;
  box-shadow: 0 5px 15px rgba(249,217,118,0.3);
}
.ingredient.no-drop {
  opacity: 0.5;
  cursor: not-allowed;
}
.ing-icon {
  font-size: 1.8rem;
  margin-bottom: 5px;
  filter: drop-shadow(0 0 5px rgba(255,255,255,0.3));
}
.ing-name {
  font-size: 0.8rem;
  font-weight: bold;
  color: #d1bced;
  line-height: 1.2;
}
.ing-tag {
  position: absolute;
  top: -8px;
  right: -8px;
  font-size: 0.65rem;
  background:#e74c3c;
  color:white;
  padding:2px 6px;
  border-radius:10px;
  font-weight:bold;
  border:1px solid #fff;
}
/* 炼妖炉区域 */
.cauldron-area {
  width: 35%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-left: 2px dashed #4a3068;
  padding-left: 20px;
}
.cauldron-wrapper {
  position: relative;
  width: 160px;
  height: 160px;
}
.cauldron {
  width: 100%;
  height: 100%;
  background: #111;
  border-radius: 50% 50% 40% 40%;
  border: 6px solid #444;
  border-top: 15px solid #222;
  position: relative;
  z-index: 2;
  box-shadow: inset 0 -20px 30px rgba(0,0,0,0.8), 0 20px 20px rgba(0,0,0,0.6);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: 0.3s;
}
.cauldron::before {
  content: '';
  position: absolute;
  top: 5px;
  left: 15px;
  right: 15px;
  height: 30px;
  background: radial-gradient(ellipse at center, #00ffcc 0%, transparent 70%);
  border-radius: 50%;
  opacity: 0.5;
  transition: 0.5s;
}
.cauldron.drag-over {
  border-color: #00ffcc;
  box-shadow: 0 0 30px #00ffcc;
  transform: scale(1.05);
}
.cauldron.drag-over::before {
  opacity: 1;
  background: radial-gradient(ellipse at center, #00ffcc 0%, #0088ff 70%);
}
.item-count {
  font-weight: bold;
  color: #fff;
  background: rgba(0,0,0,0.7);
  padding: 4px 12px;
  border-radius: 12px;
  z-index: 3;
  font-size: 0.9rem;
}
.added-list {
  margin-top: 5px;
  font-size: 0.75rem;
  color: #00ffcc;
  z-index: 3;
  text-align: center;
  max-width: 90%;
}
.btn-brew {
  margin-top: 25px;
  background: linear-gradient(90deg, #f9d976, #e2954a);
  border: none;
  padding: 12px 35px;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 900;
  color: #2b1b3d;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 5px 15px rgba(226, 149, 74, 0.4);
}
.btn-brew:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(226, 149, 74, 0.6);
}
.btn-reset {
  margin-top: 10px;
  background: transparent;
  color: #a99bbd;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  text-decoration: underline;
}
.feedback-panel {
  margin-top: 20px;
  padding: 18px;
  border-radius: 12px;
  font-weight: bold;
  display: none;
  text-align: left;
  font-size: 1rem;
  line-height: 1.6;
  animation: slideUp 0.3s ease-out;
}
.feedback-panel.success {
  background: rgba(0, 255, 204, 0.15);
  border: 2px solid #00ffcc;
  color: #bdfceb;
}
.feedback-panel.error {
  background: rgba(255, 51, 102, 0.15);
  border: 2px solid #ff3366;
  color: #ffb3c6;
}
.feedback-panel.warning {
  background: rgba(249, 217, 118, 0.15);
  border: 2px solid #f9d976;
  color: #fef0c2;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>