<template>
  <component :is="currentGame" :levelId="levelId" />
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { useGameStore } from '@/stores/game'

const route = useRoute()
const store = useGameStore()
const levelId = computed(() => parseInt(route.params.id))

const currentGame = computed(() => {
  const year = store.year  // 'y2' 或 'y3'
  const prefix = year === 'y2' ? 'Year2' : 'Year3'
  return defineAsyncComponent(() => import(`./games/${prefix}_${levelId.value}.vue`))
})
</script>