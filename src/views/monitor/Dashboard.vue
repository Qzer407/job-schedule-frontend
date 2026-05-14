<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getStatistics } from '@/api'
import type { MonitorStatistics } from '@/types'

const statistics = ref<Partial<MonitorStatistics>>({})

const loadStatistics = async () => {
  try {
    const res = await getStatistics()
    statistics.value = res.data.data
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadStatistics()
})
</script>

<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-label">总任务数</div>
            <div class="stat-value">{{ statistics.totalTaskCount || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-label">运行中</div>
            <div class="stat-value running">{{ statistics.runningTaskCount || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-label">今日执行</div>
            <div class="stat-value">{{ statistics.todayExecuteCount || 0 }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-label">成功率</div>
            <div class="stat-value success">{{ statistics.successRate || 0 }}%</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>执行耗时(毫秒)</span>
          </template>
          <div class="stat-item">
            <span class="label">平均执行耗时:</span>
            <span class="value">{{ statistics.avgDuration || 0 }} ms</span>
          </div>
          <div class="stat-item">
            <span class="label">今日失败次数:</span>
            <span class="value error">{{ statistics.todayFailCount || 0 }}</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>系统状态</span>
          </template>
          <div class="status-item">
            <el-tag type="success" size="large">调度中心</el-tag>
            <span>已连接</span>
          </div>
          <div class="status-item">
            <el-tag type="success" size="large">数据库</el-tag>
            <span>已连接</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 20px;
}

.stat-card {
  text-align: center;
}

.stat-content {
  padding: 20px 0;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
}

.stat-value.running {
  color: #67c23a;
}

.stat-value.success {
  color: #409eff;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-item .label {
  color: #909399;
}

.stat-item .value {
  font-weight: bold;
  color: #303133;
}

.stat-item .value.error {
  color: #f56c6c;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
}

.status-item span {
  color: #909399;
}
</style>
