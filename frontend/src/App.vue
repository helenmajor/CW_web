<template>
  <RouterView />
</template>

<script setup>
import { RouterView } from 'vue-router'
import { useGameStore } from './stores/game'

const store = useGameStore()
store.hydrate()
</script>
