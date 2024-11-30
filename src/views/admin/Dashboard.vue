<template>
  <div>
    <h2 class="text-2xl font-bold mb-6">控制台</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <el-card shadow="hover" v-loading="loading" element-loading-text="加载中...">
        <template #header>
          <div class="flex items-center">
            <el-icon class="mr-2"><User /></el-icon>
            总用户数
          </div>
        </template>
        <div class="text-3xl font-bold">{{ statistics.userCount }}</div>
      </el-card>

      <el-card shadow="hover" v-loading="loading" element-loading-text="加载中...">
        <template #header>
          <div class="flex items-center">
            <el-icon class="mr-2"><Document /></el-icon>
            总文件数
          </div>
        </template>
        <div class="text-3xl font-bold">{{ statistics.fileCount }}</div>
      </el-card>

      <el-card shadow="hover" v-loading="loading" element-loading-text="加载中...">
        <template #header>
          <div class="flex items-center">
            <el-icon class="mr-2"><DataLine /></el-icon>
            总存储空间
          </div>
        </template>
        <div class="text-3xl font-bold">{{ formatFileSize(statistics.totalSize) }}</div>
      </el-card>
    </div>
    
    <!-- 统计图表 -->
    <el-card class="mt-6">
      <template #header>
        <div class="flex items-center">
          <el-icon class="mr-2"><DataLine /></el-icon>
          <span>数据统计</span>
        </div>
      </template>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div ref="pieChartRef" style="height: 400px"></div>
        <div ref="lineChartRef" style="height: 400px"></div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { DataLine, Document, User } from '@element-plus/icons-vue'
import { onMounted, ref, onUnmounted } from 'vue'
import { getStatistics } from '../../api/admin'
import { formatFileSize } from '../../utils/format'
import * as echarts from 'echarts'

const statistics = ref({
  userCount: 0,
  fileCount: 0,
  totalSize: 0
})

const loading = ref(false)
const pieChartRef = ref(null)
const lineChartRef = ref(null)
let pieChart = null
let lineChart = null

const initPieChart = () => {
  if (!pieChartRef.value) return
  
  pieChart = echarts.init(pieChartRef.value)
  const option = {
    title: {
      text: '系统资源分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        type: 'pie',
        radius: '60%',
        data: [
          { value: statistics.value.userCount, name: '用户数' },
          { value: statistics.value.fileCount, name: '文件数' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  pieChart.setOption(option)
}

const initLineChart = () => {
  if (!lineChartRef.value) return
  
  lineChart = echarts.init(lineChartRef.value)
  const option = {
    title: {
      text: '存储空间使用趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['当前']
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value) => formatFileSize(value)
      }
    },
    series: [
      {
        name: '存储空间',
        type: 'line',
        data: [statistics.value.totalSize],
        areaStyle: {}
      }
    ]
  }
  lineChart.setOption(option)
}

const fetchStatistics = async () => {
  loading.value = true
  try {
    const response = await getStatistics()
    if (response.code === 200) {
      statistics.value = response.data
      // 更新图表数据
      initPieChart()
      initLineChart()
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 监听窗口大小变化，调整图表大小
const handleResize = () => {
  pieChart?.resize()
  lineChart?.resize()
}

onMounted(() => {
  fetchStatistics()
  window.addEventListener('resize', handleResize)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  pieChart?.dispose()
  lineChart?.dispose()
})
</script>

<style scoped>
</style>