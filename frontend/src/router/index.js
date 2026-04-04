import { createRouter, createWebHistory } from 'vue-router'
import MapView from '@/views/MapView.vue'
import GameContainer from '@/views/GameContainer.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'map',
      component: MapView,
    },
    {
      path: '/game/:id',
      name: 'game',
      component: GameContainer,
      props: true,
    },
  ],
})

export default router