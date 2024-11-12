<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">文件管理</h2>
    
    <el-table
      v-loading="loading"
      :data="fileList"
      border
      style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="fileName" label="文件名" min-width="200" />
      <el-table-column prop="fileHash" label="Hash" min-width="400" />
      <el-table-column label="大小" width="120">
        <template #default="scope">
          {{ formatFileSize(scope.row.fileSize) }}
        </template>
      </el-table-column>
      <el-table-column prop="nickname" label="上传用户" width="150" />
      <el-table-column label="上传时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.createTime) }}
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
  try {
    loading.value = true
    const { data } = await getAllFiles()
    if (data.code === 200) {
      fileList.value = data.data
    }
  } catch (error) {
    ElMessage.error('获取文件列表失败')
  } finally {
    loading.value = false
  }
}

// 下载文件
const handleDownload = (file) => {
  window.open(file.fileUrl)
}

// 删除文件
const handleDeleteFile = async (file) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文件 ${file.fileName} 吗？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const { data } = await deleteFile(file.id)
    if (data.code === 200) {
      ElMessage.success('删除成功')
      fetchFileList()
    } else {
      ElMessage.error(data.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString()
}

onMounted(() => {
  fetchFileList()
})
</script> 