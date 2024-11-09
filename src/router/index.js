import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      requiresAuth: true // 需要认证
    }
  },
  {
    path: '/about',
    name: 'About', 
    component: () => import('../views/About.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  
  if (to.meta.requiresAuth) { // 需要登录的路由
    if (token) {
      next() // 已登录，放行
    } else {
      ElMessage.warning('请先登录')
      next({
        path: '/login'
      })
    }
  } else {
    if (token && (to.path === '/login' || to.path === '/register')) {
      // 已登录状态下访问登录/注册页，重定向到首页
      next('/')
    } else {
      next()
    }
  }
})

export default router 