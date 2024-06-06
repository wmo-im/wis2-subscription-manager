import { createWebHashHistory, createRouter } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/configure',
      name: 'Configure',
      component: () => import('@/components/ConfigSub.vue')
    },
    {
      path: '/',
      name: 'Catalogue',
      component: () => import('@/components/CatalogueView.vue')
    }
  ]
})
export default router