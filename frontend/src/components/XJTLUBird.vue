<template>
  <div class="xjtlu-bird-container">
    <!-- 小鸟头像 -->
    <div class="bird-wrapper">
      <div class="bird-avatar" @click="toggleChat" :class="{ clickable: isConfigured }">
        <!-- 小鸟 -->
        <div class="bird-body" :class="`mood-${currentMood}`">
          <!-- 天线/尾巴 -->
          <div class="antenna"></div>

          <!-- 身体（白色圆形） -->
          <div class="body"></div>

          <!-- 蓝色服装 -->
          <div class="outfit">XJTLU</div>

          <!-- 表情 -->
          <div class="face">
            <!-- 左眼 -->
            <div class="eye eye-left" :class="eyeState">
              <div class="pupil"></div>
            </div>

            <!-- 右眼 -->
            <div class="eye eye-right" :class="eyeState">
              <div class="pupil"></div>
            </div>

            <!-- 黄色嘴巴 -->
            <div class="mouth" :class="mouthState"></div>

            <!-- 脸颊 -->
            <div class="cheek cheek-left"></div>
            <div class="cheek cheek-right"></div>
          </div>

          <!-- 耳包 -->
          <div class="ear ear-left"></div>
          <div class="ear ear-right"></div>

          <!-- 胳膊 -->
          <div class="arm arm-left"></div>
          <div class="arm arm-right"></div>

          <!-- 腿 -->
          <div class="leg leg-left"></div>
          <div class="leg leg-right"></div>
        </div>

        <!-- 通知气泡 -->
        <div v-if="showNotification" class="notification-bubble">
          {{ notificationText }}
        </div>
      </div>
    </div>

    <!-- 聊天框 -->
    <transition name="slide-up">
      <div v-if="showChat" class="chat-box">
        <div class="chat-header">
          <h3>XJTLU AI Assistant</h3>
          <button class="close-btn" @click="toggleChat">✕</button>
        </div>

        <!-- API密钥设置 -->
        <div v-if="!isConfigured" class="api-key-setup">
          <p>Please enter your DeepSeek API key:</p>
          <input
            v-model="inputApiKey"
            type="password"
            placeholder="sk-..."
            @keyup.enter="setApiKey"
            class="api-key-input"
          />
          <button @click="setApiKey" class="setup-btn">Confirm</button>
          <p class="hint">
            Get your API key from
            <a href="https://platform.deepseek.com/api/keys" target="_blank">DeepSeek</a>
          </p>
        </div>

        <!-- 聊天区域 -->
        <div v-else class="chat-content">
          <div class="messages">
            <div
              v-for="(msg, idx) in messages"
              :key="idx"
              class="message"
              :class="msg.role === 'user' ? 'user-msg' : 'ai-msg'"
            >
              <div class="message-bubble">
                {{ msg.content }}
              </div>
            </div>

            <div v-if="isLoading" class="message ai-msg">
              <div class="message-bubble typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>

          <!-- 输入区 -->
          <div class="input-area">
            <input
              v-model="inputMessage"
              type="text"
              placeholder="Ask anything..."
              @keyup.enter="sendMessage"
              :disabled="isLoading"
              class="chat-input"
            />
            <button @click="sendMessage" :disabled="isLoading" class="send-btn">
              {{ isLoading ? '...' : '→' }}
            </button>
          </div>

          <div v-if="error" class="error-msg">{{ error }}</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useDeepSeekChat } from '@/composables/useDeepSeekChat'

const {
  isConfigured,
  isLoading,
  error,
  setApiKey: saveApiKey,
  loadApiKey,
  sendMessage: deepSeekSend
} = useDeepSeekChat()

const showChat = ref(false)
const inputMessage = ref('')
const inputApiKey = ref('')
const messages = ref([])
const currentMood = ref('happy')
const showNotification = ref(false)
const notificationText = ref('Hey! 👋')

const eyeState = ref('normal')
const mouthState = ref('smile')

const toggleChat = () => {
  if (!isConfigured.value && !showChat.value) {
    showChat.value = true
    return
  }
  showChat.value = !showChat.value
  updateMood()
}

const setApiKey = () => {
  if (inputApiKey.value.trim()) {
    saveApiKey(inputApiKey.value)
    inputApiKey.value = ''
    messages.value = [
      {
        role: 'assistant',
        content: "Hello! I'm your XJTLU AI assistant. How can I help you today? 🤖"
      }
    ]
    updateMood()
  }
}

const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return

  const userMsg = inputMessage.value
  messages.value.push({
    role: 'user',
    content: userMsg
  })
  inputMessage.value = ''

  updateMood('thinking')

  const conversationHistory = messages.value.slice(0, -1)
  const response = await deepSeekSend(userMsg, conversationHistory)

  if (response) {
    messages.value.push({
      role: 'assistant',
      content: response
    })
    updateMood('happy')
  } else {
    messages.value.push({
      role: 'assistant',
      content: 'Sorry, something went wrong. Please try again.'
    })
    updateMood('sad')
  }
}

const updateMood = (mood) => {
  if (mood) {
    currentMood.value = mood

    if (mood === 'thinking') {
      eyeState.value = 'wide'
      mouthState.value = 'surprised'
    } else if (mood === 'sad') {
      eyeState.value = 'normal'
      mouthState.value = 'sad'
    } else {
      eyeState.value = 'normal'
      mouthState.value = 'smile'
    }
  } else if (isLoading.value) {
    currentMood.value = 'thinking'
    eyeState.value = 'wide'
    mouthState.value = 'surprised'
  } else {
    currentMood.value = 'happy'
    eyeState.value = 'normal'
    mouthState.value = 'smile'
  }
}

onMounted(() => {
  loadApiKey()

  if (isConfigured.value) {
    messages.value = [
      {
        role: 'assistant',
        content: "Hello! I'm your XJTLU AI assistant. How can I help you today? 🤖"
      }
    ]
  }

  setInterval(() => {
    if (!showChat.value) {
      showNotification.value = true
      const greetings = ['Hey! 👋', 'Need help? 🤔', "Let's chat! 💬"]
      notificationText.value = greetings[Math.floor(Math.random() * greetings.length)]

      setTimeout(() => {
        showNotification.value = false
      }, 3000)
    }
  }, 15000)
})
</script>

<style scoped>
.xjtlu-bird-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ==== 小鸟头像 ==== */
.bird-wrapper {
  position: relative;
}

.bird-avatar {
  width: 100px;
  height: 100px;
  cursor: pointer;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
  transition: transform 0.3s ease;
}

.bird-avatar:hover {
  transform: scale(1.1);
}

.bird-avatar.clickable:hover {
  animation: bounce 0.6s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: scale(1.1) translateY(0);
  }
  50% {
    transform: scale(1.1) translateY(-10px);
  }
}

.bird-body {
  position: relative;
  width: 100%;
  height: 100%;
  transition: all 0.3s ease;
}

/* 天线/尾巴 */
.antenna {
  position: absolute;
  width: 3px;
  height: 28px;
  background: #2563eb;
  border-radius: 2px;
  top: -2px;
  left: 50%;
  transform: translateX(-50%) rotate(-20deg);
  animation: antennaWave 1.5s ease-in-out infinite;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

@keyframes antennaWave {
  0%, 100% {
    transform: translateX(-50%) rotate(-20deg);
  }
  50% {
    transform: translateX(-50%) rotate(20deg);
  }
}

/* 身体（白色圆形） */
.body {
  position: absolute;
  width: 70px;
  height: 70px;
  background: #ffffff;
  border-radius: 50%;
  left: 15px;
  top: 18px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

/* XJTLU文字在outfit中 */
.outfit {
  position: absolute;
  width: 70px;
  height: 42px;
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  border-radius: 6px 6px 16px 16px;
  left: 15px;
  top: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: white;
  font-size: 8px;
  letter-spacing: 1px;
  z-index: 2;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
}

.face {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 3;
}

.eye {
  position: absolute;
  width: 11px;
  height: 13px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 31px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.eye-left {
  left: 28px;
}

.eye-right {
  right: 28px;
}

.pupil {
  width: 5px;
  height: 7px;
  background: #000;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.eye.wide .pupil {
  width: 6px;
  height: 8px;
}

/* 黄色嘴巴 */
.mouth {
  position: absolute;
  bottom: 52px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 8px;
  background: #fbbf24;
  border-radius: 0 0 8px 8px;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.mouth.smile {
  border-radius: 0 0 9px 9px;
  transform: translateX(-50%) scaleY(1);
}

.mouth.surprised {
  height: 12px;
  border-radius: 50%;
  width: 9px;
  left: 50%;
  transform: translateX(-50%);
  background: #fbbf24;
}

.mouth.sad {
  border-radius: 8px 8px 0 0;
  border-bottom: none;
  background: transparent;
  bottom: 50px;
  border-top: 2px solid #fbbf24;
}

.cheek {
  position: absolute;
  width: 11px;
  height: 11px;
  background: rgba(248, 113, 113, 0.3);
  border-radius: 50%;
  top: 41px;
}

.cheek-left {
  left: 16px;
}

.cheek-right {
  right: 16px;
}

/* ==== 耳包 ==== */
.ear {
  position: absolute;
  width: 20px;
  height: 26px;
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  border-radius: 50%;
  top: 28px;
  z-index: 1;
  box-shadow:
    inset 0 0 0 4px #60a5fa,
    0 1px 3px rgba(0, 0, 0, 0.12);
}

.ear-left {
  left: 2px;
}

.ear-right {
  right: 2px;
}

/* ==== 胳膊 ==== */
.arm {
  position: absolute;
  width: 8px;
  height: 22px;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  top: 52px;
  z-index: 1;
  border-radius: 6px;
  transform-origin: top center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.arm-left {
  left: 12px;
  transform: rotate(-28deg);
  animation: armSwingLeft 2s ease-in-out infinite;
}

.arm-right {
  right: 12px;
  transform: rotate(28deg);
  animation: armSwingRight 2s ease-in-out infinite;
}

@keyframes armSwingLeft {
  0%, 100% {
    transform: rotate(-28deg);
  }
  50% {
    transform: rotate(-12deg);
  }
}

@keyframes armSwingRight {
  0%, 100% {
    transform: rotate(28deg);
  }
  50% {
    transform: rotate(12deg);
  }
}

/* 黄色腿 */
.leg {
  position: absolute;
  width: 5px;
  height: 18px;
  background: #fbbf24;
  border-radius: 3px;
  bottom: -4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.leg-left {
  left: 32px;
}

.leg-right {
  right: 32px;
}

.notification-bubble {
  position: absolute;
  bottom: 110px;
  right: -5px;
  background: white;
  color: #2563eb;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12);
  animation: popIn 0.3s ease-out;
}

@keyframes popIn {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* ==== 聊天框 ==== */
.chat-box {
  position: absolute;
  bottom: 100px;
  right: 0;
  width: 360px;
  max-height: 500px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
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

.chat-header {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  color: white;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.chat-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* API密钥设置 */
.api-key-setup {
  padding: 20px;
  text-align: center;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

.api-key-setup p {
  margin: 0;
  font-size: 13px;
  color: #4b5563;
}

.api-key-input {
  padding: 10px 12px;
  border: 1.5px solid #dfe4ea;
  border-radius: 8px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.api-key-input:focus {
  border-color: #1e40af;
}

.setup-btn {
  padding: 10px 16px;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: opacity 0.2s;
}

.setup-btn:hover {
  opacity: 0.9;
}

.hint {
  font-size: 12px !important;
  color: #9ca3af;
}

.hint a {
  color: #1e40af;
  text-decoration: none;
}

/* 聊天内容 */
.chat-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message {
  display: flex;
  animation: messageIn 0.3s ease-out;
}

@keyframes messageIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-msg {
  justify-content: flex-end;
}

.ai-msg {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.4;
  word-wrap: break-word;
}

.user-msg .message-bubble {
  background: #1e40af;
  color: white;
  border-radius: 12px 4px 12px 12px;
}

.ai-msg .message-bubble {
  background: #f3f4f6;
  color: #1f2937;
  border-radius: 4px 12px 12px 12px;
}

.typing {
  display: flex;
  align-items: center;
  gap: 4px;
}

.typing span {
  width: 6px;
  height: 6px;
  background: #1e40af;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: 0.3;
  }
  30% {
    opacity: 1;
  }
}

.input-area {
  display: flex;
  gap: 8px;
  padding: 10px;
  border-top: 1px solid #f3f4f6;
  flex-shrink: 0;
}

.chat-input {
  flex: 1;
  padding: 8px 12px;
  border: 1.5px solid #dfe4ea;
  border-radius: 20px;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s;
}

.chat-input:focus {
  border-color: #1e40af;
}

.chat-input:disabled {
  background: #f9fafb;
}

.send-btn {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.send-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-msg {
  padding: 8px 10px;
  font-size: 12px;
  color: #dc2626;
  background: #fee2e2;
  margin: 8px;
  border-radius: 6px;
}

/* 动画过渡 */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 响应式 */
@media (max-width: 480px) {
  .chat-box {
    width: calc(100vw - 40px);
    max-height: 70vh;
  }
}

/* 不同心情的动画 */
.bird-body.mood-thinking .ear {
  animation: earPulse 1s ease-in-out infinite;
}

.bird-body.mood-thinking .arm-left {
  animation: armThinkingLeft 0.8s ease-in-out infinite;
}

.bird-body.mood-thinking .arm-right {
  animation: armThinkingRight 0.8s ease-in-out infinite;
}

.bird-body.mood-thinking .antenna {
  animation: antennaTilt 0.8s ease-in-out infinite;
}

@keyframes antennaTilt {
  0%, 100% {
    transform: translateX(-50%) rotate(-20deg);
  }
  50% {
    transform: translateX(-50%) rotate(0deg);
  }
}

@keyframes earPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow:
      inset 0 0 0 4px #60a5fa,
      0 1px 3px rgba(0, 0, 0, 0.12);
  }
  50% {
    transform: scale(1.08);
    box-shadow:
      inset 0 0 0 4px #93c5fd,
      0 0 8px rgba(59, 130, 246, 0.35);
  }
}

@keyframes armThinkingLeft {
  0%, 100% {
    transform: rotate(-28deg);
  }
  50% {
    transform: rotate(-5deg);
  }
}

@keyframes armThinkingRight {
  0%, 100% {
    transform: rotate(28deg);
  }
  50% {
    transform: rotate(5deg);
  }
}

.bird-body.mood-sad .arm-left {
  animation: armSadLeft 1s ease-in-out infinite;
}

.bird-body.mood-sad .arm-right {
  animation: armSadRight 1s ease-in-out infinite;
}

@keyframes armSadLeft {
  0%, 100% {
    transform: rotate(-40deg);
  }
  50% {
    transform: rotate(-32deg);
  }
}

@keyframes armSadRight {
  0%, 100% {
    transform: rotate(40deg);
  }
  50% {
    transform: rotate(32deg);
  }
}
</style>