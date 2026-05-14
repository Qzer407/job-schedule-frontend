<template>
  <div class="report-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Execution Report</span>
          <el-button type="primary" @click="loadData">
            <el-icon><Refresh /></el-icon>
            Refresh
          </el-button>
        </div>
      </template>

      <div v-loading="loading" v-if="reportData">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ reportData.totalExecutions }}</div>
                <div class="stat-label">Total Executions</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ (reportData.successRate * 100).toFixed(2) }}%</div>
                <div class="stat-label">Success Rate</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ reportData.avgCostTime.toFixed(0) }}</div>
                <div class="stat-label">Avg Cost Time (ms)</div>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-card class="chart-card" style="margin-top: 20px">
          <template #header>
            <span>Execution Trend</span>
          </template>
          <div v-if="reportData.executionsByDay?.length" class="chart-container">
            <el-table :data="reportData.executionsByDay" stripe>
              <el-table-column prop="date" label="Date" width="150" />
              <el-table-column prop="count" label="Total" width="100" />
              <el-table-column prop="successCount" label="Success" width="100">
                <template #default="{ row }">
                  <el-tag type="success">{{ row.successCount }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="failCount" label="Failed" width="100">
                <template #default="{ row }">
                  <el-tag type="danger">{{ row.failCount }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="Success Rate" min-width="150">
                <template #default="{ row }">
                  <el-progress
                    :percentage="row.count > 0 ? (row.successCount / row.count * 100) : 0"
                    :color="getProgressColor"
                  />
                </template>
              </el-table-column>
            </el-table>
          </div>
          <el-empty v-else description="No execution data available" />
        </el-card>

        <el-card class="chart-card" style="margin-top: 20px">
          <template #header>
            <span>Top Failed Tasks</span>
          </template>
          <div v-if="reportData.topFailedTasks?.length">
            <el-table :data="reportData.topFailedTasks" stripe>
              <el-table-column prop="taskId" label="Task ID" width="120" />
              <el-table-column prop="taskName" label="Task Name" min-width="200" />
              <el-table-column prop="failCount" label="Fail Count" width="120">
                <template #default="{ row }">
                  <el-tag type="danger">{{ row.failCount }}</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <el-empty v-else description="No failed tasks" />
        </el-card>
      </div>

      <el-empty v-if="!reportData && !loading" description="No report data available" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { getExecutionReport, type ExecutionReport } from '@/api'

const loading = ref(false)
const reportData = ref<ExecutionReport | null>(null)

const loadData = async () => {
  loading.value = true
  try {
    const res = await getExecutionReport()
    reportData.value = res.data.data
  } catch (error) {
    console.error('Failed to load report', error)
  } finally {
    loading.value = false
  }
}

const getProgressColor = (percentage: number) => {
  if (percentage >= 90) return '#67c23a'
  if (percentage >= 70) return '#e6a23c'
  return '#f56c6c'
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.report-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-card {
  text-align: center;
}

.stat-content {
  padding: 20px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-container {
  min-height: 200px;
}
</style>
