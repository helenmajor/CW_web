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
