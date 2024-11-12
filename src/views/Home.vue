<template>
  <div class="min-h-screen bg-gray-100">
    <!-- 顶部导航栏 -->
    <nav class="bg-white shadow-sm">
      <div class="w-full px-4">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <img 
              src="https://ae01.alicdn.com/kf/S8cf0304e2cf04c79a85ad4edca0f63a6m.png" 
              alt="Logo" 
              class="w-8 h-8 mr-2"
            >
            <span class="text-lg font-semibold">个人网盘</span>
          </div>
          <div class="flex items-center space-x-4">
            <!-- 如果是管理员显示后台入口 -->
            <el-button 
              v-if="isAdmin"
              type="primary" 
              size="normal"
              @click="goToAdmin"
              class="mr-4"
            >
              管理后台
            </el-button>
            <span>{{ userInfo?.nickname || userInfo?.username }}</span>
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

    <!-- 主要内容区 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 公告展示区域 -->
      <div class="mb-8">
        <el-card class="announcement-card">
          <template #header>
            <div class="flex items-center">
              <el-icon class="mr-2"><Bell /></el-icon>
              <span class="text-lg font-bold">系统公告</span>
            </div>
          </template>
          
          <el-collapse v-if="announcements.length > 0">
            <el-collapse-item v-for="item in announcements" :key="item.id">
              <template #title>
                <div class="flex items-center">
                  <span class="font-medium">{{ item.title }}</span>
                  <span class="text-gray-400 text-sm ml-4">
                    {{ formatDate(item.createTime) }}
                  </span>
                </div>
              </template>
              <div class="whitespace-pre-wrap">{{ item.content }}</div>
            </el-collapse-item>
          </el-collapse>
          
          <el-empty v-else description="暂无公告" />
        </el-card>
      </div>

      <!-- 上传按钮 -->
      <div class="mb-6">
        <el-upload
          class="upload-demo"
          :http-request="customUpload"
          :show-file-list="false"
          :multiple="false"
        >
          <el-button type="primary">上传文件</el-button>
        </el-upload>
      </div>

      <!-- 文件列表 -->
      <el-table
        v-loading="loading"
        :data="fileList"
        style="width: 100%"
        border
      >
        <el-table-column prop="fileName" label="文件名" min-width="200" />
        <el-table-column prop="fileHash" label="Hash" min-width="400" />
        <el-table-column label="大小" width="120">
          <template #default="scope">
            {{ formatFileSize(scope.row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column label="上传时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              @click="handleDownload(scope.row)"
              link
            >
              下载
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              @click="handleDelete(scope.row)"
              link
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.announcement-card {
  background-color: #fff;
  border-radius: 8px;
}

.announcement-card :deep(.el-collapse-item__header) {
  font-size: 16px;
  color: #333;
}

.announcement-card :deep(.el-collapse-item__content) {
  padding: 16px;
  color: #666;
  line-height: 1.6;
}
</style>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus';
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { deleteFile, getFileList, uploadFile } from '../api/file';
import { formatFileSize } from '../utils/format';
import { Bell } from '@element-plus/icons-vue'
import { getAnnouncements } from '../api/admin'

const router = useRouter()
const loading = ref(false)
const fileList = ref([])
const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))
const announcements = ref([])

// 判断是否为管理员
const isAdmin = computed(() => userInfo.value?.role === 'ADMIN')

// 跳转到管理后台
const goToAdmin = () => {
  router.push('/admin/dashboard')
}

// 获取文件列表
const fetchFileList = async () => {
  try {
    loading.value = true
    const { data } = await getFileList()
    if (data.code === 200) {
      fileList.value = data.data
    }
  } catch (error) {
    ElMessage.error('获取文件列表失败')
  } finally {
    loading.value = false
  }
}

// 自定义上传方法
const customUpload = async ({ file }) => {
  try {
    loading.value = true
    const { data } = await uploadFile(file)
    if (data.code === 200) {
      ElMessage.success('上传成功')
      fetchFileList() // 刷新文件列表
    } else {
      ElMessage.error(data.message || '上传失败')
    }
  } catch (error) {
    ElMessage.error('上传失败')
  } finally {
    loading.value = false
  }
}

// 处理下载
const handleDownload = (file) => {
  window.open(file.fileUrl)
}

// 处理删除
const handleDelete = async (file) => {
  try {
    await ElMessageBox.confirm('确定要删除该文件吗？', '提示', {
      type: 'warning'
    })
    
    const { data } = await deleteFile(file.id)
    if (data.code === 200) {
      ElMessage.success('删除成功')
      fetchFileList() // 刷新文件列表
    } else {
      ElMessage.error(data.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 处理退出登录
const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  ElMessage.success('退出登录成功')
  router.push('/login')
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString()
}

// 获取公告列表
const fetchAnnouncements = async () => {
  try {
    const { data } = await getAnnouncements()
    if (data.code === 200) {
      // 按创建时间倒序排序
      announcements.value = data.data.sort((a, b) => 
        new Date(b.createTime) - new Date(a.createTime)
      )
    }
  } catch (error) {
    console.error('获取公告列表失败:', error)
    ElMessage.error('获取公告列表失败')
  }
}

// 页面加载时获取文件列表
onMounted(() => {
  fetchFileList()
  fetchAnnouncements()
})
</script> 