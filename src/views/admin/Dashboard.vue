<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">控制台</h2>
    <el-row :gutter="20" class="mb-6">
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="flex items-center">
              <el-icon class="mr-2"><User /></el-icon>
              总用户数
            </div>
          </template>
          <div class="text-3xl font-bold">{{ statistics.userCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="flex items-center">
              <el-icon class="mr-2"><Document /></el-icon>
              总文件数
            </div>
          </template>
          <div class="text-3xl font-bold">{{ statistics.fileCount }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>
            <div class="flex items-center">
              <el-icon class="mr-2"><DataLine /></el-icon>
              总存储空间
            </div>
          </template>
          <div class="text-3xl font-bold">{{ formatFileSize(statistics.totalSize) }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="announcement-card">
      <template #header>
        <div class="flex justify-between items-center">
          <div class="flex items-center">
            <el-icon class="mr-2"><Bell /></el-icon>
            <span>系统公告</span>
          </div>
          <el-button type="primary" @click="handleAddAnnouncement">
            发布公告
          </el-button>
        </div>
      </template>
      
      <el-table :data="announcements" style="width: 100%">
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="content" label="内容" show-overflow-tooltip />
        <el-table-column label="发布时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="50%"
    >
      <el-form :model="announcementForm" label-width="80px">
        <el-form-item label="标题">
          <el-input v-model="announcementForm.title" />
        </el-form-item>
        <el-form-item label="内容">
          <el-input
            v-model="announcementForm.content"
            type="textarea"
            rows="4"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { Bell, DataLine, Document, User } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, ref } from 'vue'
import { addAnnouncement, deleteAnnouncement, getAnnouncements, getStatistics, updateAnnouncement } from '../../api/admin'
import { formatFileSize } from '../../utils/format'

const statistics = ref({
  userCount: 0,
  fileCount: 0,
  totalSize: 0
})

const announcements = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const announcementForm = ref({
  id: '',
  title: '',
  content: '',
})

const fetchAnnouncements = async () => {
  try {
    const { data } = await getAnnouncements()
    if (data.code === 200) {
      announcements.value = data.data
    }
  } catch (error) {
    console.error('获取公告列表失败:', error)
    ElMessage.error('获取公告列表失败')
  }
}

const handleAddAnnouncement = () => {
  dialogTitle.value = '发布公告'
  announcementForm.value = {
    id: '',
    title: '',
    content: '',
  }
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑公告'
  announcementForm.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm(
    '确定要删除该公告吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      await deleteAnnouncement(row.id)
      ElMessage.success('删除成功')
      await fetchAnnouncements()
    } catch (error) {
      ElMessage.error('删除失败')
    }
  })
}

const handleSubmit = async () => {
  try {
    if (announcementForm.value.id) {
      await updateAnnouncement(announcementForm.value.id, announcementForm.value)
      ElMessage.success('更新成功')
    } else {
      await addAnnouncement(announcementForm.value)
      ElMessage.success('发布成功')
    }
    dialogVisible.value = false
    await fetchAnnouncements()
  } catch (error) {
    ElMessage.error(announcementForm.value.id ? '更新失败' : '发布失败')
  }
}

const fetchStatistics = async () => {
  try {
    const { data } = await getStatistics()
    if (data.code === 200) {
      statistics.value = data.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace(/\//g, '-')
}

onMounted(() => {
  fetchStatistics()
  fetchAnnouncements()
})
</script>

<style scoped>
.announcement-card {
  margin-top: 20px;
}
</style> 