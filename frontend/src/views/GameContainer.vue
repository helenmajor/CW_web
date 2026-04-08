<template>
  <component :is="currentGame" :levelId="levelId" />
</template>

<script setup>
import { computed, defineAsyncComponent, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { getLevelDefinition } from '@/config/levels'
import { useGameStore } from '@/stores/game'

const route = useRoute()
const store = useGameStore()
const levelId = computed(() => Number.parseInt(route.params.id, 10))
const gameModules = import.meta.glob('./games/*.vue')

watchEffect(() => {
  const routeYear = route.query.year
  if ((routeYear === 'y2' || routeYear === 'y3') && store.year !== routeYear) {
    store.switchYear(routeYear)
  }
})

const MissingLevelView = {
  template: `
    <div style="min-height: 100vh; display: grid; place-items: center; padding: 24px; background: linear-gradient(145deg, #c2e4f5 0%, #aad0e8 100%);">
      <div style="max-width: 520px; text-align: center; background: #fffcf3; border: 3px solid #e2bc7c; border-radius: 24px; padding: 32px; box-shadow: 0 25px 40px rgba(0, 0, 0, 0.2);">
        <h2 style="margin-bottom: 12px; color: #2d5a6e;">关卡暂不可用</h2>
        <p style="color: #4b5563; line-height: 1.6;">当前路由没有匹配到可加载的关卡文件，请返回地图重新进入。</p>
      </div>
    </div>
  `,
}

const currentGame = computed(() => {
  const level = getLevelDefinition(store.year, levelId.value)
  if (!level) return MissingLevelView

  const loader = gameModules[`./games/${level.file}`]
  if (!loader) return MissingLevelView

  return defineAsyncComponent({
    loader,
    errorComponent: MissingLevelView,
  })
})
</script>
