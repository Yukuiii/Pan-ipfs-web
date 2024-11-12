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
              <el-icon class="mr-2 text-blue-500"><Bell /></el-icon>
              <span class="text-lg font-bold text-gray-800">系统公告</span>
            </div>
          </template>
          
          <div v-if="announcements.length > 0">
            <el-timeline>
              <el-timeline-item
                v-for="item in announcements"
                :key="item.id"
                :timestamp="formatDate(item.createTime)"
                placement="top"
                type="primary"
              >
                <el-card class="announcement-item">
                  <h3 class="text-lg font-semibold text-gray-800 mb-2">
                    {{ item.title }}
                  </h3>
                  <div class="text-gray-600 whitespace-pre-wrap leading-relaxed">
                    {{ item.content }}
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>
          
          <el-empty 
            v-else 
            description="暂无公告" 
            :image-size="100"
          >
            <template #description>
              <p class="text-gray-400">暂时没有任何系统公告</p>
            </template>
          </el-empty>
        </el-card>
      </div>

      <!-- 文件列表区域 -->
      <el-card class="file-card">
        <template #header>
          <div class="flex justify-between items-center">
            <div class="flex items-center">
              <el-icon class="mr-2 text-blue-500"><Document /></el-icon>
              <span class="text-lg font-bold text-gray-800">我的文件</span>
            </div>
            <!-- 上传按钮移到这里 -->
            <el-upload
              class="upload-demo"
              :http-request="customUpload"
              :show-file-list="false"
              :multiple="false"
            >
              <el-button type="primary">上传文件</el-button>
            </el-upload>
          </div>
        </template>

        <el-table
          v-loading="loading"
          :data="fileList"
          style="width: 100%"
          border
        >
          <el-table-column prop="fileName" label="文件名" min-width="200">
            <template #default="{ row }">
              <div class="flex items-center">
                <el-icon class="mr-2"><Document /></el-icon>
                <span>{{ row.fileName }}</span>
              </div>
            </template>
          </el-table-column>
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
      </el-card>
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
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.announcement-card :deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  background-color: #f8fafc;
}

.announcement-item {
  margin-bottom: 0;
  border: none;
  box-shadow: none;
  background: transparent;
}

/* 移除卡片的内边距 */
.announcement-item :deep(.el-card__body) {
  padding: 0;
}

/* 调整时间轴样式 */
:deep(.el-timeline-item__node--primary) {
  background-color: #409eff;
}

:deep(.el-timeline-item__timestamp) {
  color: #666;
  font-size: 0.9em;
  margin-bottom: 8px;
}

:deep(.el-timeline) {
  padding: 16px;
}

:deep(.el-timeline-item__content) {
  margin-left: 20px;
}

/* 调整公告内容样式 */
.announcement-item h3 {
  margin-bottom: 8px;
  color: #303133;
}

.announcement-item .text-gray-600 {
  color: #606266;
  line-height: 1.6;
}

/* 空状态样式优化 */
:deep(.el-empty__description) {
  margin-top: 10px;
}

:deep(.el-empty__image) {
  opacity: 0.7;
}

.file-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  margin-top: 20px;
}

.file-card :deep(.el-card__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  background-color: #f8fafc;
}

/* 美化表格样式 */
.file-card :deep(.el-table) {
  --el-table-border-color: #ebeef5;
  --el-table-header-bg-color: #f8fafc;
}

.file-card :deep(.el-table th) {
  background-color: var(--el-table-header-bg-color);
  font-weight: 600;
  color: #606266;
}

.file-card :deep(.el-table--border) {
  border-radius: 4px;
  overflow: hidden;
}

/* 移除之前的上传按钮容器样式 */
.mb-6 {
  margin-bottom: 0;
}
</style>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus';
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { deleteFile, getFileList, uploadFile } from '../api/file';
import { formatFileSize } from '../utils/format';
import { Bell, Document } from '@element-plus/icons-vue'
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