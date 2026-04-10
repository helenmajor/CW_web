<template>
  <RouterView />
  <LanguageToggle />
</template>

<script setup>
import { RouterView } from 'vue-router'
import LanguageToggle from '@/components/LanguageToggle.vue'
import { useGameStore } from './stores/game'
import { useLanguageStore } from './stores/language'

const store = useGameStore()
store.hydrate()

const languageStore = useLanguageStore()
languageStore.hydrate()
</script>
