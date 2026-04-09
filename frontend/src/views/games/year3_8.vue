<template>
  <HtmlGameRuntime :html="html" :user-name="userName" @complete="$emit('complete', $event)" @close="$emit('close')" />
</template>

<script setup>
import { computed } from 'vue'
import HtmlGameRuntime from '@/components/HtmlGameRuntime.vue'
import { useGameStore } from '@/stores/game'
import html from '../../../../year3_8.html?raw'

defineEmits(['complete', 'close'])

const store = useGameStore()
const userName = computed(() => store.travelerProfile?.name || '')
</script>
