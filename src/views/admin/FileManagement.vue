<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">文件管理</h2>
    
    <el-table
      v-loading="loading"
      :data="fileList"
      border
      style="width: 100%"
    >
      <template #empty>
        <el-empty v-if="!loading" description="暂无数据" />
        <div v-else></div>
      </template>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="file_name" label="文件名" min-width="200" />
      <el-table-column prop="file_hash" label="Hash" min-width="400" />
      <el-table-column label="大小" width="120">
        <template #default="scope">
          {{ formatFileSize(scope.row.file_size) }}
        </template>
      </el-table-column>
      <el-table-column prop="user_nickname" label="上传用户" width="150">
        <template #default="scope">
          {{ scope.row.user?.nickname || scope.row.user?.username || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="上传时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.create_time) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" fixed="right" width="200">
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
            @click="handleDeleteFile(scope.row)"
            link
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllFiles, deleteFile } from '../../api/admin'
import { formatFileSize } from '../../utils/format'

const loading = ref(false)
const fileList = ref([])

// 获取文件列表
const fetchFileList = async () => {
  loading.value = true
  try {
    const result = await getAllFiles()
    if (result.code === 200) {
      console.log('文件列表数据:', result.data)
      fileList.value = result.data
    } else {
      console.error('获取文件列表失败:', result.message)
      ElMessage.error(result.message || '获取文件列表失败')
    }
  } catch (error) {
    console.error('获取文件列表失败:', error)
    ElMessage.error('获取文件列表失败')
  } finally {
    loading.value = false
  }
}

// 下载文件
const handleDownload = (file) => {
  if (!file.file_url) {
    ElMessage.warning('文件链接不可用')
    return
  }
  window.open(file.file_url)
}

// 删除文件
const handleDeleteFile = async (file) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文件 ${file.file_name} 吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const result = await deleteFile(file.id)
    if (result.code === 200) {
      ElMessage.success('删除成功')
      await fetchFileList()
    } else {
      ElMessage.error(result.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除文件失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return '-'
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  } catch (error) {
    console.error('日期格式化失败:', error)
    return '-'
  }
}

onMounted(() => {
  fetchFileList()
})
</script>