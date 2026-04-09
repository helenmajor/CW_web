<template>
  <div class="modal-overlay" @click.self="closeSandbox">
    <div class="healing-modal-content">
      <div class="modal-header">
        <span><i class="fas fa-leaf"></i> Sanctuary of Healing</span>
      </div>

      <div class="healing-title-area">
        <h2>Drag items into the sand tray and listen to your inner voice</h2>
        <p>This is your safe space. No right or wrong, just comfort.</p>
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
          <span class="item-label">{{ item.label }}</span>
        </button>
      </div>

      <button class="btn-exit" @click="closeSandbox">Leave Sanctuary</button>
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
    label: 'Life',
    message: 'You are taking root quietly like a tree. All your efforts will become upward strength.',
  },
  {
    id: 'home',
    emoji: '\u{1F3E0}',
    label: 'Safety',
    message: 'No matter how far you travel, do not forget to build a warm little sanctuary in your heart.',
  },
  {
    id: 'sun',
    emoji: '\u2600\uFE0F',
    label: 'Energy',
    message: 'You are your own sun; you do not need to rely on anyone else for light.',
  },
  {
    id: 'cat',
    emoji: '\u{1F431}',
    label: 'Freedom',
    message: 'Be like a little cat. Do not flatter the world, just please yourself.',
  },
  {
    id: 'flower',
    emoji: '\u{1F338}',
    label: 'Hope',
    message: 'Flowers bloom in their own time. No need to rush; you will have your moment.',
  },
  {
    id: 'boat',
    emoji: '\u26F5',
    label: 'Journey',
    message: 'If you feel exhausted, allow yourself to drop anchor and rest for a while.',
  },
  {
    id: 'heart',
    emoji: '\u2764\uFE0F',
    label: 'Love',
    message: 'Loving yourself is the beginning of a lifelong romance.',
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
