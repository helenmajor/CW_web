<template>
  <component :is="currentGame" :levelId="levelId" />
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const levelId = computed(() => parseInt(route.params.id))

const currentGame = computed(() => {
  // 动态导入组件
  return defineAsyncComponent(() => import(`./games/Year2_${levelId.value}.vue`))
})
</script>