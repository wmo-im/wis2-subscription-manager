import { createWebHashHistory, createRouter } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'Configure',
      component: () => import('@/components/ConfigSub.vue')
    },
    {
      path: '/catalogue',
      name: 'Catalogue',
      component: () => import('@/components/CatalogueView.vue')
    }
  ]
})
export default router