<template>
  <div class="min-h-screen bg-gray-100">
    <!-- 顶部导航栏 -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <img 
              src="https://ae01.alicdn.com/kf/S8cf0304e2cf04c79a85ad4edca0f63a6m.png" 
              alt="Logo" 
              class="w-8 h-8 mr-2"
            >
            <span class="text-lg font-semibold">IPFS个人网盘管理系统</span>
          </div>
          <div class="flex items-center">
            <span class="mr-4">{{ userInfo?.nickname || userInfo?.username }}</span>
            <el-button type="danger" size="small" @click="handleLogout">退出登录</el-button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容区 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
</style>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { deleteFile, getFileList, uploadFile } from '../api/file';
import { formatFileSize } from '../utils/format';

const router = useRouter()
const loading = ref(false)
const fileList = ref([])
const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))

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
  router.push('/login')
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString()
}

// 页面加载时获取文件列表
onMounted(() => {
  fetchFileList()
})
</script> 