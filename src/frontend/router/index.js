import { createWebHashHistory, createRouter } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'Configure',
      component: () => import('@/components/ConfigSub.vue')
    }
  ]
})
export default router