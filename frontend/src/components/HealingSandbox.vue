<template>
  <div class="modal-overlay" @click.self="closeSandbox">
    <div class="healing-modal-content">
      <div class="modal-header">
        <span><i class="fas fa-leaf"></i> 疗愈小站 / Reflection Nook</span>
      </div>

      <div class="healing-title-area">
        <h2>把压力放进沙盘，也把节奏找回来。/ Reset your pace in the sand tray.</h2>
        <p>这是一个低压力的恢复区，不计分，但服务于长期申请规划。/ No score, no judgment, just recovery support for a long application journey.</p>
      </div>

      <div class="reflection-note">
        <strong>功能说明 / Why this exists</strong>
        <span>申请是长跑。这里帮助你用轻量反思和情绪恢复维持节奏。/ Applications are a marathon, and this nook supports pacing and emotional recovery.</span>
      </div>

      <div
        ref="trayRef"
        class="sand-tray"
        @dragover.prevent
        @drop="dropToSandbox"
        @click.self="hideBubble"
      >
        <div v-if="bubble.visible" class="healing-bubble">{{ bubble.text }}</div>

        <button
          v-for="item in placedItems"
          :key="item.key"
          type="button"
          class="placed-item"
          :style="{ left: `${item.x}px`, top: `${item.y}px` }"
          @click.stop="showBubble(item.message)"
        >
          {{ item.emoji }}
        </button>
      </div>

      <div class="shelf">
        <button
          v-for="item in shelfItems"
          :key="item.id"
          type="button"
          class="item"
          draggable="true"
          @dragstart="dragSandboxItem($event, item.id)"
        >
          <span class="item-emoji">{{ item.emoji }}</span>
          <span class="item-label">{{ item.labelZh }} / {{ item.label }}</span>
        </button>
      </div>

      <button class="btn-exit" @click="closeSandbox">离开小站 / Leave Nook</button>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, reactive, ref } from 'vue'

const emit = defineEmits(['close'])

const trayRef = ref(null)
const placedItems = ref([])
const bubble = reactive({
  visible: false,
  text: '',
})

let bubbleTimer = null
let placedItemKey = 0

const shelfItems = [
  {
    id: 'tree',
    emoji: '\u{1F333}',
    labelZh: '扎根',
    label: 'Life',
    message: '你正在像树一样悄悄扎根。所有努力都会慢慢长成向上的力量。/ You are taking root quietly like a tree. Your effort will become upward strength.',
  },
  {
    id: 'home',
    emoji: '\u{1F3E0}',
    labelZh: '安全感',
    label: 'Safety',
    message: '不管走多远，也别忘了在心里给自己留一个安全的小角落。/ No matter how far you travel, keep a warm little sanctuary inside.',
  },
  {
    id: 'sun',
    emoji: '\u2600\uFE0F',
    labelZh: '能量',
    label: 'Energy',
    message: '你可以先做自己的太阳。恢复节奏，也是在恢复掌控感。/ You can be your own sun. Regaining pace is regaining control.',
  },
  {
    id: 'cat',
    emoji: '\u{1F431}',
    labelZh: '自由',
    label: 'Freedom',
    message: '像小猫一样保留一点自由感，不必把每一次波动都看成失败。/ Keep some freedom like a cat; not every setback is failure.',
  },
  {
    id: 'flower',
    emoji: '\u{1F338}',
    labelZh: '希望',
    label: 'Hope',
    message: '花会在自己的季节里开。你也可以按自己的节奏推进。/ Flowers bloom in their own time, and so can you.',
  },
  {
    id: 'boat',
    emoji: '\u26F5',
    labelZh: '航程',
    label: 'Journey',
    message: '如果很累，就允许自己短暂停靠。暂停不等于放弃。/ If you feel exhausted, allow yourself to anchor and rest. Rest is not quitting.',
  },
  {
    id: 'heart',
    emoji: '\u2764\uFE0F',
    labelZh: '自我关照',
    label: 'Love',
    message: '先把自己照顾好，才有力气完成漫长的申请旅程。/ Caring for yourself gives you strength for a long application journey.',
  },
]

function dragSandboxItem(event, itemId) {
  event.dataTransfer?.setData('text/plain', itemId)
}

function dropToSandbox(event) {
  const tray = trayRef.value
  if (!tray) return

  const itemId = event.dataTransfer?.getData('text/plain')
  const source = shelfItems.find((item) => item.id === itemId)
  if (!source) return

  const rect = tray.getBoundingClientRect()
  const x = Math.max(0, Math.min(event.clientX - rect.left - 24, rect.width - 48))
  const y = Math.max(0, Math.min(event.clientY - rect.top - 24, rect.height - 48))

  placedItems.value.push({
    key: placedItemKey += 1,
    emoji: source.emoji,
    message: source.message,
    x,
    y,
  })
}

function showBubble(text) {
  bubble.text = text
  bubble.visible = true

  if (bubbleTimer) {
    clearTimeout(bubbleTimer)
  }

  bubbleTimer = window.setTimeout(() => {
    bubble.visible = false
  }, 2500)
}

function hideBubble() {
  bubble.visible = false

  if (bubbleTimer) {
    clearTimeout(bubbleTimer)
    bubbleTimer = null
  }
}

function closeSandbox() {
  hideBubble()
  emit('close')
}

onBeforeUnmount(() => {
  if (bubbleTimer) {
    clearTimeout(bubbleTimer)
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 20, 30, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.healing-modal-content {
  background: #fffcf4;
  width: 88%;
  max-width: 750px;
  border-radius: 28px;
  padding: 35px;
  border: 3px solid #e2bc7c;
  box-shadow: 0 20px 32px rgba(0, 0, 0, 0.28);
  position: relative;
}

.modal-header {
  font-size: 1.5rem;
  color: #5d4037;
  font-weight: 900;
  font-family: Georgia, serif;
  margin-bottom: 8px;
}

.healing-title-area {
  text-align: center;
  margin-bottom: 20px;
}

.healing-title-area h2 {
  color: #5d4037;
  margin: 5px;
  font-size: 1.6rem;
  font-family: Georgia, serif;
}

.healing-title-area p {
  color: #8d6e63;
  font-size: 0.95rem;
  font-style: italic;
  margin: 0;
}

.reflection-note {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin-bottom: 20px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(93, 64, 55, 0.08);
  border: 1px solid rgba(141, 110, 99, 0.2);
  color: #6c564e;
  line-height: 1.55;
}

.reflection-note strong {
  color: #5d4037;
  white-space: nowrap;
}

.sand-tray {
  width: 100%;
  height: 350px;
  background-color: #fdf5e6;
  border: 12px solid #8d6e63;
  border-radius: 12px;
  position: relative;
  box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.1), 0 10px 25px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 20px;
  background-image: radial-gradient(#efe0c9 1px, transparent 1px);
  background-size: 20px 20px;
}

.healing-bubble {
  position: absolute;
  top: 22px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.98);
  padding: 16px 22px;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border: 2px solid #ff8a80;
  color: #444;
  font-weight: bold;
  z-index: 100;
  text-align: center;
  max-width: 320px;
  line-height: 1.6;
  font-size: 1rem;
}

.shelf {
  width: 100%;
  background: white;
  padding: 15px;
  border-radius: 20px;
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.item {
  border: 0;
  background: transparent;
  font-size: 2.5rem;
  cursor: grab;
  transition: transform 0.2s;
  user-select: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.item:hover {
  transform: scale(1.1) rotate(5deg);
}

.item-emoji {
  line-height: 1;
}

.item-label {
  font-size: 0.8rem;
  color: #999;
  margin-top: 5px;
  font-weight: bold;
}

.placed-item {
  position: absolute;
  font-size: 3rem;
  cursor: pointer;
  z-index: 10;
  user-select: none;
  animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border: 0;
  background: transparent;
  padding: 0;
}

@keyframes pop-in {
  from {
    transform: scale(0);
  }

  to {
    transform: scale(1);
  }
}

.btn-exit {
  display: block;
  width: 100%;
  margin-top: 20px;
  background: #e74c3c;
  color: white;
  border: 2px solid #c0392b;
  padding: 12px;
  border-radius: 999px;
  font-weight: 900;
  font-size: 1.05rem;
  cursor: pointer;
  box-shadow: 0 4px 0 #922b21;
  transition: 0.2s;
}

.btn-exit:hover {
  background: #c0392b;
  transform: translateY(-2px);
}
</style>
