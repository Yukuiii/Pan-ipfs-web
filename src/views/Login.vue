<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center px-4">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm">
      <div class="flex flex-col items-center justify-center mb-8">
        <div class="flex items-center space-x-4 mb-2">
          <img 
            src="https://ae01.alicdn.com/kf/S8cf0304e2cf04c79a85ad4edca0f63a6m.png" 
            alt="Logo" 
            class="w-16 h-16"
          >
          <h1 class="text-2xl font-semibold text-gray-900">IPFS个人文件系统</h1>
        </div>
        <div class="text-sm text-gray-500">永久、去中心化、无审查的文件系统</div>
      </div>
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <input 
            type="text"
            v-model="formData.username" 
            required
            placeholder="用户名"
            autocomplete="username"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
          >
        </div>
        
        <div>
          <input 
            type="password"
            v-model="formData.password" 
            required
            placeholder="密码"
            autocomplete="password"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
          >
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
          </div>

          <div class="text-sm float-right">
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
const loading = ref(false)
const rememberMe = ref(false)
const userInfo = ref({
  username: '',
  nickname: '',
  email: '',
  role: '',
  create_time: ''
})

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
    const response = await login(formData)
    
    if (response.code === 200) {
      userInfo.value = response.data
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
      ElMessage.success('登录成功')
      router.push('/')
    } else {
      ElMessage.error('密码错误')
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script> 