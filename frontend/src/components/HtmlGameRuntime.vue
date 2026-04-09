<template>
  <iframe
    ref="frame"
    class="html-game-runtime"
    title="GradQuest HTML game"
    :srcdoc="srcdoc"
    sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-pointer-lock"
  ></iframe>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  html: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['complete', 'close'])

const frame = ref(null)

const srcdoc = computed(() => {
  if (!props.userName) return props.html

  const escapedName = JSON.stringify(props.userName)
  const userBootstrap = `<script>localStorage.setItem('userName', ${escapedName});<\/script>`

  if (props.html.includes('</head>')) {
    return props.html.replace('</head>', `${userBootstrap}</head>`)
  }

  return `${userBootstrap}${props.html}`
})

function handleCompletionMessage(data) {
  if (!data || typeof data !== 'object') return

  if (data.type === 'gradquest:identity-complete') {
    emit('complete', { profile: data.payload || null })
    return
  }

  if (data.type === 'gradquest:node-complete') {
    emit('complete', {
      rewardCoins: Number(data.payload?.rewardCoins) || 0,
      profile: data.payload?.profile || null,
    })
    return
  }

  if (data.type === 'gradquest:close') {
    emit('close')
  }
}

function handleMessage(event) {
  if (frame.value?.contentWindow && event.source !== frame.value.contentWindow) return
  handleCompletionMessage(event.data)
}

onMounted(() => {
  window.addEventListener('message', handleMessage)
})

onBeforeUnmount(() => {
  window.removeEventListener('message', handleMessage)
})
</script>

<style scoped>
.html-game-runtime {
  width: 100%;
  min-height: 100%;
  height: 100%;
  display: block;
  border: 0;
  background: #000;
}
</style>
