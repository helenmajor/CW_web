<template>
  <div ref="host" class="html-game-runtime"></div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const loadedScriptCache = new Map()
let helperBootstrapped = false

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

const host = ref(null)
const contextId = `html-game-${Math.random().toString(36).slice(2, 10)}`
const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

let shadowRoot = null
let gameBody = null
let mutationObserver = null
let cleanupListeners = []
let restoreUserName = null
let timeoutIds = []
let intervalIds = []
let animationFrameIds = []
let activeDragImage = null

function encodeInlineHandler(code) {
  const bytes = textEncoder.encode(code)
  let binary = ''
  bytes.forEach((value) => {
    binary += String.fromCharCode(value)
  })
  return window.btoa(binary)
}

function decodeInlineHandler(value) {
  const binary = window.atob(value)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return textDecoder.decode(bytes)
}

function normalizeStyleText(css) {
  return css
    .replace(/\bhtml\b/g, ':host')
    .replace(/\bbody\b/g, '.game-body')
}

function extractHandlerNames(rawHtml) {
  const handlerNames = new Set()
  const pattern = /on[a-z]+="([^"]+)"/gi
  let match = pattern.exec(rawHtml)

  while (match) {
    const code = match[1]
    const nameMatch = code.match(/(?:^|[;\s])([A-Za-z_$][\w$]*)\s*\(/)
    if (nameMatch?.[1] && nameMatch[1] !== 'return') {
      handlerNames.add(nameMatch[1])
    }
    match = pattern.exec(rawHtml)
  }

  return [...handlerNames]
}

function rewriteInlineHandlers(root) {
  if (!root) return

  const elements = root instanceof Element ? [root, ...root.querySelectorAll('*')] : []
  elements.forEach((element) => {
    Array.from(element.attributes).forEach((attribute) => {
      if (!attribute.name.startsWith('on')) return
      if (attribute.value.includes('__htmlGameInvoke')) return

      const encoded = encodeInlineHandler(attribute.value)
      element.setAttribute(
        attribute.name,
        `return window.__htmlGameInvoke('${contextId}', '${encoded}', this, event)`,
      )
    })
  })
}

function bootstrapHelpers() {
  if (helperBootstrapped) return

  window.__htmlGameContexts ||= {}
  window.__htmlGameInvoke = (id, encoded, thisArg, eventArg) => {
    const context = window.__htmlGameContexts?.[id]
    if (!context) return undefined
    const code = decodeInlineHandler(encoded)
    return context.run(code, thisArg, eventArg)
  }

  helperBootstrapped = true
}

function loadExternalScript(src) {
  if (loadedScriptCache.has(src)) {
    return loadedScriptCache.get(src)
  }

  const loader = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-html-game-src="${src}"]`)
    if (existing) {
      if (existing.dataset.loaded === 'true') {
        resolve()
        return
      }
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.dataset.htmlGameSrc = src
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true'
      resolve()
    }, { once: true })
    script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true })
    document.head.appendChild(script)
  })

  loadedScriptCache.set(src, loader)
  return loader
}

function removeActiveDragImage() {
  activeDragImage?.remove()
  activeDragImage = null
}

function moveDragImageOutOfView(dragImage) {
  if (activeDragImage !== dragImage) return

  dragImage.style.left = '-10000px'
  dragImage.style.top = '-10000px'
}

function clampDragOffset(value, fallback, max) {
  if (!Number.isFinite(value)) return fallback
  return Math.max(0, Math.min(value, max))
}

function getReadableDragText(source) {
  return source.innerText
    ?.replace(/\s+/g, ' ')
    .trim()
    .slice(0, 72) || ''
}

function colorOrFallback(value, fallback) {
  return value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent'
    ? value
    : fallback
}

function paintRoundedRect(context, width, height, radius) {
  context.beginPath()
  context.moveTo(radius, 0)
  context.lineTo(width - radius, 0)
  context.quadraticCurveTo(width, 0, width, radius)
  context.lineTo(width, height - radius)
  context.quadraticCurveTo(width, height, width - radius, height)
  context.lineTo(radius, height)
  context.quadraticCurveTo(0, height, 0, height - radius)
  context.lineTo(0, radius)
  context.quadraticCurveTo(0, 0, radius, 0)
  context.closePath()
}

function createCanvasDragImage(source) {
  const rect = source.getBoundingClientRect()
  const style = window.getComputedStyle(source)
  const scale = window.devicePixelRatio || 1
  const width = Math.max(1, Math.round(rect.width))
  const height = Math.max(1, Math.round(rect.height))
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  canvas.width = Math.ceil(width * scale)
  canvas.height = Math.ceil(height * scale)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  context.scale(scale, scale)

  const radius = Math.min(14, width / 5, height / 5)
  context.shadowColor = 'rgba(0, 0, 0, 0.38)'
  context.shadowBlur = 12
  context.shadowOffsetY = 5
  paintRoundedRect(context, width - 14, height - 14, radius)
  context.translate(7, 4)
  context.fillStyle = colorOrFallback(style.backgroundColor, '#0f172a')
  context.fill()

  context.shadowColor = 'transparent'
  context.lineWidth = Math.max(2, Number.parseFloat(style.borderTopWidth) || 2)
  context.strokeStyle = colorOrFallback(style.borderTopColor, '#fbbf24')
  context.stroke()

  const label = getReadableDragText(source)
  const fontSize = Math.max(13, Math.min(18, Number.parseFloat(style.fontSize) || 15))
  context.fillStyle = colorOrFallback(style.color, '#f8fafc')
  context.font = `700 ${fontSize}px ${style.fontFamily || 'sans-serif'}`
  context.textAlign = 'center'
  context.textBaseline = 'middle'

  const firstLine = label.slice(0, 22)
  const secondLine = label.length > 22 ? label.slice(22, 44).trim() : ''
  context.fillText(firstLine, (width - 14) / 2, secondLine ? (height - 14) / 2 - fontSize * 0.55 : (height - 14) / 2)
  if (secondLine) {
    context.font = `600 ${Math.max(11, fontSize - 3)}px ${style.fontFamily || 'sans-serif'}`
    context.fillText(secondLine, (width - 14) / 2, (height - 14) / 2 + fontSize * 0.8)
  }

  return canvas
}

function getDraggableSource(event) {
  const path = event.composedPath?.() || []
  const fromPath = path.find((node) => node instanceof HTMLElement && node.draggable)
  if (fromPath) return fromPath

  if (event.target instanceof HTMLElement) {
    return event.target.closest('[draggable="true"]')
  }

  return null
}

function installDragImageBridge() {
  if (!gameBody) return

  const handleDragStart = (event) => {
    const source = getDraggableSource(event)
    if (!source || !event.dataTransfer) return

    removeActiveDragImage()

    const rect = source.getBoundingClientRect()
    const dragImage = createCanvasDragImage(source)

    Object.assign(dragImage.style, {
      position: 'fixed',
      left: '0',
      top: '0',
      margin: '0',
      pointerEvents: 'none',
      transform: 'none',
      zIndex: '2147483647',
    })

    document.body.appendChild(dragImage)
    activeDragImage = dragImage

    event.dataTransfer.setDragImage(
      dragImage,
      clampDragOffset(event.clientX - rect.left, rect.width / 2, rect.width),
      clampDragOffset(event.clientY - rect.top, rect.height / 2, rect.height),
    )

    window.requestAnimationFrame(() => moveDragImageOutOfView(dragImage))
  }

  gameBody.addEventListener('dragstart', handleDragStart, true)
  gameBody.addEventListener('dragend', removeActiveDragImage, true)
  gameBody.addEventListener('drop', removeActiveDragImage, true)

  cleanupListeners.push(() => {
    gameBody?.removeEventListener('dragstart', handleDragStart, true)
    gameBody?.removeEventListener('dragend', removeActiveDragImage, true)
    gameBody?.removeEventListener('drop', removeActiveDragImage, true)
    removeActiveDragImage()
  })
}

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
  }
}

function createDocumentProxy() {
  const documentProxy = {
    get body() {
      return gameBody
    },
    get head() {
      return shadowRoot
    },
    get documentElement() {
      return gameBody
    },
    readyState: 'complete',
    getElementById(id) {
      return shadowRoot.getElementById(id)
    },
    querySelector(selector) {
      return shadowRoot.querySelector(selector)
    },
    querySelectorAll(selector) {
      return shadowRoot.querySelectorAll(selector)
    },
    createElement(tagName) {
      return document.createElement(tagName)
    },
    createElementNS(namespace, tagName) {
      return document.createElementNS(namespace, tagName)
    },
    createTextNode(text) {
      return document.createTextNode(text)
    },
    addEventListener(type, listener, options) {
      if (type === 'DOMContentLoaded' || type === 'load') {
        window.queueMicrotask(() => listener.call(documentProxy, { type, target: gameBody }))
        return
      }

      gameBody.addEventListener(type, listener, options)
      cleanupListeners.push(() => gameBody?.removeEventListener(type, listener, options))
    },
    removeEventListener(type, listener, options) {
      gameBody.removeEventListener(type, listener, options)
    },
  }

  return documentProxy
}

function createWindowProxy(documentProxy) {
  const trackedSetTimeout = (callback, delay, ...args) => {
    const id = window.setTimeout(callback, delay, ...args)
    timeoutIds.push(id)
    return id
  }

  const trackedSetInterval = (callback, delay, ...args) => {
    const id = window.setInterval(callback, delay, ...args)
    intervalIds.push(id)
    return id
  }

  const trackedRequestAnimationFrame = (callback) => {
    const id = window.requestAnimationFrame(callback)
    animationFrameIds.push(id)
    return id
  }

  const proxy = {
    document: documentProxy,
    parent: {
      postMessage: handleCompletionMessage,
      closeGame: () => emit('close'),
    },
    console: window.console,
    localStorage: window.localStorage,
    sessionStorage: window.sessionStorage,
    navigator: window.navigator,
    location: window.location,
    alert: window.alert.bind(window),
    confirm: window.confirm.bind(window),
    prompt: window.prompt.bind(window),
    requestAnimationFrame: trackedRequestAnimationFrame,
    cancelAnimationFrame(id) {
      animationFrameIds = animationFrameIds.filter((value) => value !== id)
      window.cancelAnimationFrame(id)
    },
    setTimeout: trackedSetTimeout,
    clearTimeout(id) {
      timeoutIds = timeoutIds.filter((value) => value !== id)
      window.clearTimeout(id)
    },
    setInterval: trackedSetInterval,
    clearInterval(id) {
      intervalIds = intervalIds.filter((value) => value !== id)
      window.clearInterval(id)
    },
    dispatchEvent: window.dispatchEvent.bind(window),
    addEventListener(type, listener, options) {
      if (type === 'load' || type === 'DOMContentLoaded') {
        window.queueMicrotask(() => listener.call(proxy, { type, target: proxy }))
        return
      }

      window.addEventListener(type, listener, options)
      cleanupListeners.push(() => window.removeEventListener(type, listener, options))
    },
    removeEventListener(type, listener, options) {
      window.removeEventListener(type, listener, options)
    },
  }

  Object.defineProperties(proxy, {
    innerWidth: {
      get: () => window.innerWidth,
    },
    innerHeight: {
      get: () => window.innerHeight,
    },
  })

  return proxy
}

function cleanupRuntime() {
  mutationObserver?.disconnect()
  mutationObserver = null

  cleanupListeners.forEach((cleanup) => cleanup())
  cleanupListeners = []

  timeoutIds.forEach((id) => window.clearTimeout(id))
  intervalIds.forEach((id) => window.clearInterval(id))
  animationFrameIds.forEach((id) => window.cancelAnimationFrame(id))
  timeoutIds = []
  intervalIds = []
  animationFrameIds = []
  removeActiveDragImage()

  if (window.__htmlGameContexts) {
    delete window.__htmlGameContexts[contextId]
  }

  if (restoreUserName) {
    restoreUserName()
    restoreUserName = null
  }

  if (shadowRoot) {
    shadowRoot.innerHTML = ''
  }
}

async function mountRuntime() {
  if (!host.value) return

  bootstrapHelpers()

  shadowRoot = host.value.shadowRoot || host.value.attachShadow({ mode: 'open' })
  shadowRoot.innerHTML = ''

  const parser = new DOMParser()
  const parsed = parser.parseFromString(props.html, 'text/html')

  const baseStyle = document.createElement('style')
  baseStyle.textContent = `
    :host {
      display: block;
      min-height: 100%;
      height: 100%;
    }
    .game-body {
      display: block;
      min-height: 100%;
      position: relative;
      color: initial;
    }
  `
  shadowRoot.appendChild(baseStyle)

  parsed.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
    const clone = document.createElement('link')
    clone.rel = 'stylesheet'
    clone.href = link.href
    shadowRoot.appendChild(clone)
  })

  parsed.querySelectorAll('style').forEach((style) => {
    const styleElement = document.createElement('style')
    styleElement.textContent = normalizeStyleText(style.textContent)
    shadowRoot.appendChild(styleElement)
  })

  gameBody = document.createElement('div')
  gameBody.className = 'game-body'
  shadowRoot.appendChild(gameBody)

  Array.from(parsed.body.childNodes).forEach((node) => {
    if (node.nodeName.toLowerCase() === 'script') return
    gameBody.appendChild(node.cloneNode(true))
  })

  rewriteInlineHandlers(gameBody)

  mutationObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          rewriteInlineHandlers(node)
        }
      })
    })
  })
  mutationObserver.observe(gameBody, { childList: true, subtree: true })
  installDragImageBridge()

  if (props.userName) {
    const previous = window.localStorage.getItem('userName')
    window.localStorage.setItem('userName', props.userName)
    restoreUserName = () => {
      if (previous === null) {
        window.localStorage.removeItem('userName')
        return
      }
      window.localStorage.setItem('userName', previous)
    }
  }

  await Promise.all(
    Array.from(parsed.querySelectorAll('script[src]')).map((script) => loadExternalScript(script.src)),
  )

  const handlerNames = extractHandlerNames(props.html)
  const exposeHandlers = handlerNames
    .map((name) => `try { if (typeof ${name} !== 'undefined') window.${name} = ${name}; } catch (error) {}`)
    .join('\n')
  const inlineScript = Array.from(parsed.querySelectorAll('script:not([src])'))
    .map((script) => script.textContent)
    .join('\n\n')

  const documentProxy = createDocumentProxy()
  const windowProxy = createWindowProxy(documentProxy)

  window.__htmlGameContexts[contextId] = {
    window: windowProxy,
    document: documentProxy,
    run(code, thisArg, eventArg) {
      return new Function(
        'window',
        'document',
        '__this',
        'event',
        `with (window) { return (function () { ${code} }).call(__this); }`,
      )(windowProxy, documentProxy, thisArg ?? windowProxy, eventArg)
    },
  }

  if (inlineScript.trim()) {
    const runner = new Function(
      'window',
      'document',
      'console',
      'localStorage',
      'sessionStorage',
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'alert',
      'confirm',
      'prompt',
      'navigator',
      'location',
      `${inlineScript}\n${exposeHandlers}`,
    )

    runner(
      windowProxy,
      documentProxy,
      window.console,
      window.localStorage,
      window.sessionStorage,
      windowProxy.setTimeout,
      windowProxy.clearTimeout,
      windowProxy.setInterval,
      windowProxy.clearInterval,
      windowProxy.requestAnimationFrame,
      windowProxy.cancelAnimationFrame,
      windowProxy.alert,
      windowProxy.confirm,
      windowProxy.prompt,
      window.navigator,
      window.location,
    )
  }

  if (typeof windowProxy.onload === 'function') {
    windowProxy.onload()
  }
}

onMounted(() => {
  mountRuntime()
})

onBeforeUnmount(() => {
  cleanupRuntime()
})
</script>

<style scoped>
.html-game-runtime {
  width: 100%;
  min-height: 100%;
  height: 100%;
  display: block;
}
</style>
