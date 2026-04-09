<template>
  <HtmlGameRuntime :html="html" @complete="$emit('complete', $event)" @close="$emit('close')" />
</template>

<script setup>
import HtmlGameRuntime from '@/components/HtmlGameRuntime.vue'
import html from '../../../../year2_6.html?raw'

defineEmits(['complete', 'close'])
</script>
