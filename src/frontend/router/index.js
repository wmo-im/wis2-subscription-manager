// Composables
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    children: [
      {
        path: '',
        name: 'Configure',
        component: () => import('@/views/ConfigSub.vue'),
      }
    ],
  },
]

// Create the router
const router = createRouter({
  history: createWebHistory('/'),
  routes,
})

// Assign the title of the browser tab for each page
router.beforeEach((to, from, next) => {
  const nearestWithTitle = to.matched.slice().reverse().find(r => r.meta && r.meta.title);
  if(nearestWithTitle) document.title = nearestWithTitle.meta.title;
  next();
});

export default router
