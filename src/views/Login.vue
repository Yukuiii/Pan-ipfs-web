<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center px-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8">
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
            type="email" 
            v-model="email" 
            required
            placeholder="电子邮件"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors"
          >
        </div>
        
        <div>
          <input 
            type="password"
            v-model="password" 
            required
            placeholder="密码"
            autocomplete="new-password"
            spellcheck="false"
            class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors [-webkit-text-security:disc] [text-security:disc]"
          >
        </div>

        <div class="flex items-center justify-between">
          <label class="flex items-center">
            <input 
              type="checkbox" 
              v-model="rememberMe"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            >
            <span class="ml-2 text-sm text-gray-600">记住我</span>
          </label>
          <a href="#" class="text-sm text-blue-600 hover:text-blue-700">忘记密码？</a>
        </div>

        <div class="flex items-center justify-between pt-2">
          <a href="#" class="text-sm text-blue-600 hover:text-blue-700">创建账号</a>
          <button 
            type="submit" 
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            登录
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const rememberMe = ref(false)

const handleLogin = async () => {
  try {
    console.log('登录信息：', {
      email: email.value,
      password: password.value,
      rememberMe: rememberMe.value
    })
  } catch (error) {
    console.error('登录失败：', error)
  }
}
</script> 