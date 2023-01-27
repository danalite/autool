import { createRouter, createWebHashHistory } from 'vue-router'
import stylesheets from '@/render/router/middleware/stylesheets'

const routes = [
  {
    path: '/',
    redirect: '/index'
  },
  {
    path: '/index',
    name: 'Index',
    component: () => import('@/render/components/home')
  },
  {
    path: '/assist',
    name: 'Assist',
    component: () => import('@/render/components/assist/assistWindow.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// router.beforeEach(stylesheets)
export default router
