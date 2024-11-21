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
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    meta: {
      requiresAuth: true,
      requiresAdmin: true // 需要管理员权限
    },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/admin/Dashboard.vue')
      },
      {
        path: 'users',
        name: 'UserManagement',
        component: () => import('../views/admin/UserManagement.vue')
      },
      {
        path: 'files',
        name: 'FileManagement',
        component: () => import('../views/admin/FileManagement.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫
router.beforeEach((to, from, next) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo') )
  
  if (to.meta.requiresAuth) {
    if (!userInfo) {
      ElMessage.warning('请先登录')
      next({ path: '/login' })
      return
    }
    
    if (to.meta.requiresAdmin && userInfo.role !== 'ADMIN') {
      ElMessage.error('无权访问')
      next({ path: '/' })
      return
    }
    next()
  } else {
    if (userInfo && (to.path === '/login' || to.path === '/register')) {
      next('/')
    } else {
      next()
    }
  }
})

export default router 