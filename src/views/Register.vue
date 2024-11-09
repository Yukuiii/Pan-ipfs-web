<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center px-4">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm">
      <div class="flex items-center justify-center mb-8 space-x-4">
        <img 
          src="https://ae01.alicdn.com/kf/S8cf0304e2cf04c79a85ad4edca0f63a6m.png" 
          alt="Logo" 
          class="w-16 h-16"
        >
        <h1 class="text-2xl font-semibold text-gray-900">用户注册</h1>
      </div>
      
      <form @submit.prevent="handleRegister" class="space-y-6">
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
            type="text"
            v-model="formData.nickname" 
            required
            placeholder="昵称"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
          >
        </div>

        <div>
          <input 
            type="email"
            v-model="formData.email" 
            required
            placeholder="邮箱"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
          >
        </div>
        
        <div>
          <input 
            type="password"
            v-model="formData.password" 
            required
            placeholder="密码"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
          >
        </div>

        <div>
          <input 
            type="password"
            v-model="formData.confirmPassword" 
            required
            placeholder="确认密码"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
          >
        </div>

        <div class="text-sm text-right">
          <router-link 
            to="/login" 
            class="font-medium text-blue-600 hover:text-blue-500"
          >
            已有账号？立即登录
          </router-link>
        </div>

        <button 
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../api/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)

const formData = reactive({
  username: '',
  nickname: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validateForm = () => {
  if (!formData.username) {
    ElMessage.warning('请输入用户名')
    return false
  }
  if (!formData.nickname) {
    ElMessage.warning('请输入昵称')
    return false
  }
  if (!formData.email) {
    ElMessage.warning('请输入邮箱')
    return false
  }
  if (!formData.password) {
    ElMessage.warning('请输入密码')
    return false
  }
  if (!formData.confirmPassword) {
    ElMessage.warning('请确认密码')
    return false
  }
  if (formData.password !== formData.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致')
    return false
  }
  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(formData.email)) {
    ElMessage.warning('请输入正确的邮箱格式')
    return false
  }
  return true
}

const handleRegister = async () => {
  if (!validateForm()) return

  try {
    loading.value = true
    const { data } = await register({
      username: formData.username,
      nickname: formData.nickname,
      email: formData.email,
      password: formData.password
    })
    
    if (data.code === 200) {
      ElMessage.success('注册成功')
      // 注册成功后跳转到登录页
      router.push('/login')
    } else {
      ElMessage.error(data.message || '注册失败')
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '注册失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script> 