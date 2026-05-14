<template>
  <div class="health-check-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>System Health Check</span>
          <el-button type="primary" @click="checkHealth">
            <el-icon><Refresh /></el-icon>
            Refresh
          </el-button>
        </div>
      </template>

      <div v-loading="loading">
        <el-row :gutter="20" v-if="healthData">
          <el-col :span="24">
            <el-card class="status-card">
              <template #header>
                <span>Overall Status</span>
              </template>
              <div class="overall-status">
                <el-tag :type="healthData.status === 'UP' ? 'success' : 'danger'" size="large">
                  <el-icon v-if="healthData.status === 'UP'"><SuccessFilled /></el-icon>
                  <el-icon v-else><CircleCloseFilled /></el-icon>
                  {{ healthData.status === 'UP' ? 'Healthy' : 'Unhealthy' }}
                </el-tag>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" v-if="healthData?.components" style="margin-top: 20px">
          <el-col :span="8" v-if="healthData.components.database">
            <el-card class="component-card">
              <template #header>
                <span>Database</span>
              </template>
              <div class="component-content">
                <el-tag :type="healthData.components.database.status === 'UP' ? 'success' : 'danger'">
                  {{ healthData.components.database.status === 'UP' ? 'Connected' : 'Disconnected' }}
                </el-tag>
                <p class="message">{{ healthData.components.database.message || '-' }}</p>
              </div>
            </el-card>
          </el-col>

          <el-col :span="8" v-if="healthData.components.redis">
            <el-card class="component-card">
              <template #header>
                <span>Redis</span>
              </template>
              <div class="component-content">
                <el-tag :type="healthData.components.redis.status === 'UP' ? 'success' : 'danger'">
                  {{ healthData.components.redis.status === 'UP' ? 'Connected' : 'Disconnected' }}
                </el-tag>
                <p class="message">{{ healthData.components.redis.message || '-' }}</p>
              </div>
            </el-card>
          </el-col>

          <el-col :span="8" v-if="healthData.components.xxlJob">
            <el-card class="component-card">
              <template #header>
                <span>XXL-Job</span>
              </template>
              <div class="component-content">
                <el-tag :type="healthData.components.xxlJob.status === 'UP' ? 'success' : 'danger'">
                  {{ healthData.components.xxlJob.status === 'UP' ? 'Connected' : 'Disconnected' }}
                </el-tag>
                <p class="message">{{ healthData.components.xxlJob.message || '-' }}</p>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-empty v-if="!healthData && !loading" description="No health data available" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Refresh, SuccessFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import { getHealthStatus, type HealthStatus } from '@/api'

const loading = ref(false)
const healthData = ref<HealthStatus | null>(null)

const checkHealth = async () => {
  loading.value = true
  try {
    const res = await getHealthStatus()
    healthData.value = res.data.data
  } catch (error) {
    console.error('Failed to check health', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  checkHealth()
})
</script>

<style scoped>
.health-check-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-card {
  text-align: center;
}

.overall-status {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.overall-status .el-tag {
  font-size: 24px;
  padding: 15px 30px;
}

.component-card {
  margin-bottom: 20px;
}

.component-content {
  padding: 10px 0;
}

.component-content .el-tag {
  margin-bottom: 10px;
}

.message {
  color: #666;
  font-size: 14px;
  margin: 10px 0 0 0;
  word-break: break-all;
}
</style>
