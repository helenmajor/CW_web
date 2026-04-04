<template>
  <div class="room">
    <h2 style="color:#f9d976; margin-top: 0;">
      <i class="fas fa-star"></i> Year 2 终极考验
    </h2>

    <!-- 答题区域 -->
    <div id="qBox" v-show="showQuestion">
      <p style="font-size: 1.1rem; margin-bottom: 25px; color:#e0e6ed;">
        看完了前人的档案，你认为决定大二/大三申请成败最关键的心态是什么？
      </p>
      <button class="btn-ans" @click="checkAnswer(false)">A. 盲目焦虑，看别人卷我也卷</button>
      <button class="btn-ans" @click="checkAnswer(true)">B. 尽早明确梯度，针对性补齐硬核背景</button>
      <button class="btn-ans" @click="checkAnswer(false)">C. 顺其自然，等大四再说</button>
      <div 
        v-show="showError" 
        style="color: #e74c3c; margin-top: 15px; font-weight: bold;"
      >
        💀 错误！盲目的跟风或拖延是最大的杀手。
      </div>
    </div>

    <!-- 成功区域 -->
    <div id="successBox" v-show="showSuccess">
      <h3 style='color:#2ecc71'>✅ 考验通过！点击下方扭蛋机抽取毕业奖励！</h3>
      <div 
        class="gacha" 
        :class="{ shaking: isShaking }"
        :style="{ display: showMachine ? 'block' : 'none' }"
        @click="playGacha"
      >
        🎰
      </div>
    </div>
  </div>

  <!-- 遮罩层 -->
  <div class="overlay" :class="{ active: showOverlay }"></div>

  <!-- 金券弹窗 -->
  <div class="golden-ticket" :class="{ active: showTicket }">
    <div class="ticket-title">GOLDEN TICKET</div>
    <div class="ticket-subtitle">Year 2 完美通关凭证</div>

    <div class="reward-content">
      <i class="fas fa-gem"></i>名校大牛 1v1 诊断券
    </div>

    <p style="font-size: 0.95rem; margin-bottom: 20px; line-height: 1.5; font-weight: 600;">
      请收拾好行囊，带着这份荣誉与认知，<br>准备迈入 Year 3 申请季的修罗场！
    </p>
    <button class="btn-claim" @click="closeTicket">收下金券，继续前行</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 响应式状态
const showQuestion = ref(true)    // 显示答题区
const showSuccess = ref(false)    // 显示成功区
const showMachine = ref(false)    // 显示扭蛋机
const isShaking = ref(false)      // 扭蛋机抖动状态
const showOverlay = ref(false)    // 显示遮罩
const showTicket = ref(false)     // 显示金券
const showError = ref(false)       // 显示错误提示

// 检查答案
const checkAnswer = (isRight) => {
  if (isRight) {
    showQuestion.value = false
    showSuccess.value = true
    // 延迟显示扭蛋机
    setTimeout(() => {
      showMachine.value = true
    }, 100)
  } else {
    showError.value = true
    // 错误抖动动画
    const errorEl = document.querySelector('[style*="color: #e74c3c"]')
    errorEl.animate(
      [{ transform: 'translateX(-5px)' }, { transform: 'translateX(5px)' }, { transform: 'translateX(0)' }],
      { duration: 300 }
    )
    // 3秒后隐藏错误提示
    setTimeout(() => {
      showError.value = false
    }, 3000)
  }
}

// 启动扭蛋机
const playGacha = () => {
  if (isShaking.value) return
  isShaking.value = true

  setTimeout(() => {
    isShaking.value = false
    // 弹出金券
    showOverlay.value = true
    showTicket.value = true
  }, 1500)
}

// 关闭金券
const closeTicket = () => {
  showOverlay.value = false
  showTicket.value = false

  setTimeout(() => {
    alert("向导：即将为您开启 Year 3 大门！(此处可对接路由跳转)")
  }, 500)
}
</script>

<style scoped>
/* 完全复刻原版所有样式，无任何修改 */
* {
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
  background: radial-gradient(circle, #2b1b3d 0%, #0a0a0a 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
  color: #fff;
}

.room {
  text-align: center;
  background: rgba(0, 0, 0, 0.6);
  padding: 40px;
  border-radius: 20px;
  border: 2px dashed #f9d976;
  max-width: 600px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.btn-ans {
  background: transparent;
  color: #f9d976;
  border: 1px solid #f9d976;
  padding: 15px;
  width: 100%;
  margin-bottom: 15px;
  border-radius: 10px;
  cursor: pointer;
  transition: 0.3s;
  font-size: 1.1rem;
  font-weight: bold;
}

.btn-ans:hover {
  background: #f9d976;
  color: #000;
  transform: translateX(5px);
  box-shadow: 0 5px 15px rgba(249, 217, 118, 0.4);
}

.gacha {
  font-size: 6rem;
  cursor: pointer;
  margin: 20px auto;
  transition: 0.3s;
  filter: drop-shadow(0 0 20px rgba(249, 217, 118, 0.5));
  display: none;
}

.gacha:hover {
  transform: scale(1.1);
  filter: drop-shadow(0 0 30px rgba(249, 217, 118, 0.8));
}

.shaking {
  animation: shake 0.5s infinite;
  pointer-events: none;
}

@keyframes shake {
  0%,
  100% {
    transform: rotate(0) scale(1.1);
  }

  25% {
    transform: rotate(15deg) scale(1.1);
  }

  75% {
    transform: rotate(-15deg) scale(1.1);
  }
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(5px);
  z-index: 90;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s ease;
}

.overlay.active {
  opacity: 1;
  pointer-events: auto;
}

.golden-ticket {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  width: 90%;
  max-width: 480px;
  z-index: 100;
  background: linear-gradient(135deg, #FFD700 0%, #FDB931 50%, #996515 100%);
  padding: 40px;
  border-radius: 15px;
  border: 4px dashed #fff;
  box-shadow: 0 20px 60px rgba(255, 215, 0, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.5);
  text-align: center;
  color: #5c3a00;
  transition: transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.golden-ticket.active {
  transform: translate(-50%, -50%) scale(1);
}

.ticket-title {
  font-size: 2.2rem;
  font-weight: 900;
  margin-bottom: 10px;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.8);
  letter-spacing: 2px;
}

.ticket-subtitle {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 25px;
  border-bottom: 2px solid #5c3a00;
  padding-bottom: 15px;
}

.reward-content {
  background: rgba(255, 255, 255, 0.3);
  padding: 20px;
  border-radius: 10px;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 25px;
  border: 1px solid rgba(255, 255, 255, 0.6);
}

.reward-content i {
  color: #d4af37;
  margin-right: 10px;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.3));
}

.btn-claim {
  background: #5c3a00;
  color: #FFD700;
  border: none;
  padding: 15px 40px;
  border-radius: 30px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 5px 15px rgba(92, 58, 0, 0.5);
  width: 100%;
}

.btn-claim:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(92, 58, 0, 0.7);
  background: #3d2600;
}
</style>