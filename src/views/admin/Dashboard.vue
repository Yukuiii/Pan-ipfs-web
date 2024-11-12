<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">控制台</h2>
    <el-row :gutter="20">
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { User, Document, DataLine } from '@element-plus/icons-vue'
import { getStatistics } from '../../api/admin'
import { formatFileSize } from '../../utils/format'

const statistics = ref({
  userCount: 0,
  fileCount: 0,
  totalSize: 0
})

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

onMounted(() => {
  fetchStatistics()
})
</script> 