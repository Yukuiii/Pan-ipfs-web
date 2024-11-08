<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-sm">
      <div class="flex items-center justify-center space-x-4">
        <img class="h-16 w-auto" src="https://ae01.alicdn.com/kf/S8cf0304e2cf04c79a85ad4edca0f63a6m.png" alt="Logo">
        <h2 class="text-2xl font-semibold text-gray-900">注册账号</h2>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="space-y-4">
          <div>
            <input
              id="username"
              v-model="formData.username"
              type="text"
              required
              class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="用户名"
            >
          </div>
          
          <div>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              required
              class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="电子邮箱地址"
            >
          </div>
          
          <div>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              required
              class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="密码"
            >
          </div>
          
          <div>
            <input
              id="confirmPassword"
              v-model="formData.confirmPassword"
              type="password"
              required
              class="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="确认密码"
            >
          </div>
        </div>

        <button
          type="submit"
          class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          注册
        </button>

        <p class="text-center text-sm text-gray-600">
          已有账号？
          <router-link 
            to="/login" 
            class="font-medium text-blue-600 hover:text-blue-500"
          >
            立即登录
          </router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const formData = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const handleRegister = () => {
  if (formData.value.password !== formData.value.confirmPassword) {
    alert('两次输入的密码不一致！')
    return
  }
  // TODO: 实现注册逻辑
  console.log('注册信息：', formData.value)
}
</script> 