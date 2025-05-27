import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/LoginRegister.vue')
    },
    {
      path: '/index',
      name: 'Index', 
      component: () => import('../views/Index.vue')
    }
  ]
})

export default router