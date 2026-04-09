<template>
  <HtmlGameRuntime :html="html" @complete="$emit('complete', $event)" @close="$emit('close')" />
</template>

<script setup>
import { computed } from 'vue'
import HtmlGameRuntime from '@/components/HtmlGameRuntime.vue'
import sourceHtml from '../../../../year3_6.html?raw'

defineEmits(['complete', 'close'])

const vueBattleLayoutPatch = `
<style id="year3-6-vue-battle-layout-patch">
  .roco-game-screen {
    max-width: min(1040px, 100%);
    height: clamp(500px, calc(100dvh - 140px), 620px);
  }
  .ui-bottom {
    height: 112px;
    flex: 0 0 112px;
  }
  .message-box {
    padding: 12px 18px;
    font-size: 1rem;
    line-height: 1.35;
  }
  .action-menu {
    padding: 8px 10px;
    gap: 8px 10px;
  }
  .skill-name { font-size: 0.92rem; }
  .skill-pp {
    font-size: 0.72rem;
    margin-top: 2px;
  }
  .skill-type {
    font-size: 0.66rem;
    padding: 1px 6px;
    margin-top: 2px;
  }
  .hint {
    bottom: 10px;
    width: min(820px, 82vw);
    padding: 8px 18px;
    font-size: 0.9rem;
    line-height: 1.28;
    pointer-events: none;
  }
</style>`

const html = computed(() => sourceHtml.replace('</head>', `${vueBattleLayoutPatch}</head>`))
</script>
