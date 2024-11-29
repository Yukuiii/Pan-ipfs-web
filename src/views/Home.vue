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
            <span class="text-lg font-semibold">IPFS个人文件系统</span>
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
            <el-upload
              class="custom-upload"
              :http-request="customUpload"
              :show-file-list="false"
              :multiple="true"
              drag
            >
              <div class="upload-content">
                <el-icon class="upload-icon"><upload-filled /></el-icon>
                <div class="upload-text">
                  <span class="primary-text">点击上传文件</span>
                  <span class="secondary-text">或将文件拖拽到这里</span>
                </div>
              </div>
            </el-upload>
          </div>
        </template>

        <!-- 添加全局拖拽上传区域 -->
        <div 
          class="global-upload-area"
          @dragover.prevent="handleDragOver"
          @dragleave.prevent="handleDragLeave"
          @drop.prevent="handleDrop"
        >
          <!-- 显示拖拽提示遮罩 -->
          <div 
            v-show="isDragging" 
            class="drag-overlay"
          >
            <div class="drag-overlay-content">
              <el-icon class="text-4xl mb-4"><upload-filled /></el-icon>
              <span class="text-xl">释放鼠标上传文件</span>
            </div>
          </div>

          <!-- 原有的文件列表表格 -->
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
                  <span>{{ row.file_name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="file_hash" label="Hash" min-width="400" />
            <el-table-column label="大小" width="120">
              <template #default="scope">
                {{ formatFileSize(scope.row.file_size) }}
              </template>
            </el-table-column>
            <el-table-column label="上传时间" width="180">
              <template #default="scope">
                {{ formatDate(scope.row.create_time) }}
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

/* 添加新的样式 */
.global-upload-area {
  position: relative;
  min-height: 200px;
}

.drag-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(24, 144, 255, 0.1);
  border: 2px dashed #1890ff;
  border-radius: 8px;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
}

.drag-overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #1890ff;
}

/* 美化上传组件样式 */
:deep(.el-upload-dragger) {
  width: auto;
  height: auto;
  padding: 12px 24px;
  border-color: #e4e7ed;
}

:deep(.el-upload-dragger:hover) {
  border-color: #409eff;
}

:deep(.el-icon--upload) {
  margin: 8px 0;
  font-size: 24px;
  color: #409eff;
}

:deep(.el-upload__text) {
  margin: 4px 0;
  font-size: 14px;
}

:deep(.el-upload__text em) {
  color: #409eff;
  font-style: normal;
}

.el-upload__tip {
  margin-top: 4px;
}

/* 自定义上传组件样式 */
.custom-upload :deep(.el-upload-dragger) {
  width: 300px;
  height: 40px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  transition: all 0.3s;
}

.custom-upload :deep(.el-upload-dragger:hover) {
  border-color: #409eff;
  background-color: #f5f7fa;
}

.custom-upload :deep(.el-upload) {
  width: 100%;
}

.upload-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.upload-icon {
  font-size: 20px;
  color: #409eff;
}

.upload-text {
  display: flex;
  gap: 8px;
}

.upload-text .primary-text {
  color: #409eff;
  font-weight: 500;
}

.upload-text .secondary-text {
  color: #909399;
}

/* 拖拽遮罩层样式优化 */
.drag-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(64, 158, 255, 0.08);
  border: 2px dashed #409eff;
  border-radius: 8px;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(2px);
}

.drag-overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #409eff;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 20px 40px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.drag-overlay-content .el-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

/* 移除原有的上传提示样式 */
:deep(.el-upload__tip) {
  display: none;
}

/* 移除原有的上传文本样式 */
:deep(.el-upload__text) {
  display: none;
}
</style>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus';
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { deleteFile, getFileList, uploadFile } from '../api/file';
import { formatFileSize } from '../utils/format';
import { Bell, Document, UploadFilled } from '@element-plus/icons-vue'
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
    const response = await getFileList(userInfo.value.id)
    if (response.code === 200) {
      fileList.value = response.data
    }
    console.log(fileList.value)
  } catch (error) {
    ElMessage.error('获取文件列表失败')
  } finally {
    loading.value = false
  }
}

// 添加拖拽相关的状态
const isDragging = ref(false)
let dragCounter = 0

// 处理拖拽事件
const handleDragOver = (e) => {
  e.preventDefault()
  dragCounter++
  isDragging.value = true
}

const handleDragLeave = (e) => {
  e.preventDefault()
  dragCounter--
  if (dragCounter === 0) {
    isDragging.value = false
  }
}

const handleDrop = async (e) => {
  e.preventDefault()
  isDragging.value = false
  dragCounter = 0
  
  const files = Array.from(e.dataTransfer.files)
  if (files.length === 0) return
  
  // 处理多文件上传
  for (const file of files) {
    try {
      loading.value = true
      const response = await uploadFile(file, userInfo.value.id)
      if (response.code === 200) {
        ElMessage.success(`文件 ${file.name} 上传成功`)
      } else {
        ElMessage.error(`文件 ${file.name} ${response.message || '上传失败'}`)
      }
    } catch (error) {
      ElMessage.error(`文件 ${file.name} 上传失败`)
    }
  }
  
  loading.value = false
  fetchFileList() // 刷新文件列表
}

// 修改原有的上传方法以支持多文件
const customUpload = async ({ file }) => {
  try {
    loading.value = true
    const response = await uploadFile(file, userInfo.value.id)
    if (response.code === 200) {
      ElMessage.success('上传成功')
      fetchFileList() // 刷新文件列表
    } else {
      ElMessage.error(response.message || '上传失败')
    }
  } catch (error) {
    ElMessage.error('上传失败')
  } finally {
    loading.value = false
  }
}

// 处理下载
const handleDownload = (file) => {
  window.open(file.file_url)
}

// 处理删除
const handleDelete = async (file) => {
  try {
    await ElMessageBox.confirm('确定要删除该文件吗？', '提示', {
      type: 'warning'
    })
    
    const response = await deleteFile(file.id)
    if (response.code === 200) {
      ElMessage.success('删除成功')
      fetchFileList() // 刷新文件列表
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 处理退出登录
const handleLogout = () => {
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
  // fetchAnnouncements()
})
</script> 