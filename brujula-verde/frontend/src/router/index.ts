import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/pueblos',
      name: 'pueblos',
      component: () => import('@/views/PueblosView.vue'),
    },
    {
      path: '/pueblo/:id',
      name: 'pueblo-detail',
      component: () => import('@/views/PuebloDetailView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/pages/login.vue'),
    },
  ],
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

export default router