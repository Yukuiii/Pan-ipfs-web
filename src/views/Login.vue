<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center px-4">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm">
      <div class="flex items-center justify-center mb-8 space-x-4">
        <img 
          src="https://ae01.alicdn.com/kf/S8cf0304e2cf04c79a85ad4edca0f63a6m.png" 
          alt="Logo" 
          class="w-16 h-16"
        >
        <h1 class="text-2xl font-semibold text-gray-900">网盘登录系统</h1>
      </div>
      
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <input 
            type="text"
            v-model="formData.username" 
            required
            placeholder="用户名"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
          >
        </div>
        
        <div>
          <input 
            type="password"
            v-model="formData.password" 
            required
            placeholder="密码"
            autocomplete="current-password"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
          >
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input 
              type="checkbox" 
              v-model="rememberMe"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            >
            <label class="ml-2 block text-sm text-gray-900">记住我</label>
          </div>

          <div class="text-sm">
            <router-link 
              to="/register" 
              class="font-medium text-blue-600 hover:text-blue-500"
            >
              没有账号？立即注册
            </router-link>
          </div>
        </div>

        <button 
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { login } from '../api/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const rememberMe = ref(false)

const formData = reactive({
  username: '',
  password: ''
})

const handleLogin = async () => {
  if (!formData.username || !formData.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }

  try {
    loading.value = true
    const { data } = await login(formData)
    
    if (data.code === 200) {
      localStorage.setItem('token', data.data.token)
      localStorage.setItem('userInfo', JSON.stringify(data.data.user))
      
      ElMessage.success('登录成功')
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    } else {
      ElMessage.error(data.message || '登录失败')
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script> 