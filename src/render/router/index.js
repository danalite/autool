import {createRouter, createWebHashHistory} from 'vue-router'


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
  },
  {
    path: '/taskEditor',
    name: 'TaskEditor',
    component: () => import('@/render/components/taskEditor/index.vue')
  },
  {
    path: '/queryMatch',
    name: 'QueryMatch',
    component: () => import('@/render/components/queryMatch/index.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
