<template>
  <div class="min-h-screen bg-gray-100">
    <!-- 顶部导航栏 -->
    <nav class="bg-white shadow-sm">
      <div class="w-full px-4">
        <div class="flex justify-between h-16">
          <!-- 左侧Logo和标题 -->
          <div class="flex items-center">
            <img 
              src="https://ae01.alicdn.com/kf/S8cf0304e2cf04c79a85ad4edca0f63a6m.png" 
              alt="Logo" 
              class="w-8 h-8 mr-2"
            >
            <span class="text-2xl font-semibold">IPFS文件系统管理后台</span>
          </div>
          
          <!-- 右侧用户信息和退出按钮 -->
          <div class="flex items-center space-x-4 pr-4">
            <el-button type="primary" link @click="router.push('/')">
              <el-icon class="mr-1"><Back /></el-icon>
              返回首页
            </el-button>
            <div class="flex items-center">
              <el-icon class="mr-2"><User /></el-icon>
              <span>{{ userInfo?.nickname || userInfo?.username }}</span>
            </div>
            <el-button 
              type="danger" 
              size="normal" 
              @click="handleLogout"
              class="min-w-[80px]"
            >
              退出登录
            </el-button>
          </div>
        </div>
      </div>
    </nav>

    <div class="flex">
      <!-- 侧边栏 -->
      <div class="w-64 bg-white shadow-sm min-h-screen">
        <el-menu
          :default-active="activeMenu"
          class="h-full"
          @select="handleSelect"
        >
          <el-menu-item index="/admin/dashboard">
            <el-icon><DataLine /></el-icon>
            <span>控制台</span>
          </el-menu-item>
          <el-menu-item index="/admin/users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/files">
            <el-icon><Document /></el-icon>
            <span>文件管理</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 主要内容区 -->
      <div class="flex-1 p-8">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { DataLine, Document, User, Back } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter()
const route = useRoute()
const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

const activeMenu = computed(() => route.path)

const handleSelect = (path) => {
  router.push(path)
}

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  ElMessage.success('退出登录成功')
  router.push('/login')
}
</script> 