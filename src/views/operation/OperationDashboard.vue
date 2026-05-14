
&lt;template&gt;
  &lt;div class="operation-dashboard"&gt;
    &lt;el-card class="health-card"&gt;
      &lt;template #header&gt;
        &lt;div class="card-header"&gt;
          &lt;span&gt;系统健康检查&lt;/span&gt;
          &lt;el-button type="primary" size="small" @click="loadHealth"&gt;刷新&lt;/el-button&gt;
        &lt;/div&gt;
      &lt;/template&gt;
      &lt;el-descriptions v-if="healthData" :column="2" border&gt;
        &lt;el-descriptions-item label="系统状态"&gt;
          &lt;el-tag :type="healthData.status === 'UP' ? 'success' : 'danger'"&gt;
            {{ healthData.status }}
          &lt;/el-tag&gt;
        &lt;/el-descriptions-item&gt;
        &lt;el-descriptions-item label="数据库"&gt;
          &lt;el-tag :type="healthData.database.status === 'UP' ? 'success' : 'danger'"&gt;
            {{ healthData.database.status }}
          &lt;/el-tag&gt;
        &lt;/el-descriptions-item&gt;
        &lt;el-descriptions-item label="Redis"&gt;
          &lt;el-tag :type="healthData.redis.status === 'UP' ? 'success' : 'danger'"&gt;
            {{ healthData.redis.status }}
          &lt;/el-tag&gt;
        &lt;/el-descriptions-item&gt;
      &lt;/el-descriptions&gt;
    &lt;/el-card&gt;

    &lt;el-card class="report-card"&gt;
      &lt;template #header&gt;
        &lt;span&gt;执行报告&lt;/span&gt;
      &lt;/template&gt;
      &lt;el-row :gutter="20"&gt;
        &lt;el-col :span="8" v-for="(data, period) in reportData" :key="period"&gt;
          &lt;el-card class="stat-card" shadow="hover"&gt;
            &lt;div class="stat-title"&gt;{{ getPeriodLabel(period) }}&lt;/div&gt;
            &lt;el-descriptions :column="1" size="small"&gt;
              &lt;el-descriptions-item label="总执行"&gt;{{ data.total }}&lt;/el-descriptions-item&gt;
              &lt;el-descriptions-item label="成功"&gt;
                &lt;el-tag type="success" size="small"&gt;{{ data.success }}&lt;/el-tag&gt;
              &lt;/el-descriptions-item&gt;
              &lt;el-descriptions-item label="失败"&gt;
                &lt;el-tag type="danger" size="small"&gt;{{ data.fail }}&lt;/el-tag&gt;
              &lt;/el-descriptions-item&gt;
              &lt;el-descriptions-item label="成功率"&gt;
                &lt;el-progress :percentage="data.successRate" :color="getSuccessColor(data.successRate)" :stroke-width="10" /&gt;
              &lt;/el-descriptions-item&gt;
            &lt;/el-descriptions&gt;
          &lt;/el-card&gt;
        &lt;/el-col&gt;
      &lt;/el-row&gt;
    &lt;/el-card&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/api'

const healthData = ref&lt;any&gt;(null)
const reportData = ref&lt;any&gt;({})

const getPeriodLabel = (period: string) =&gt; {
  const labels: Record&lt;string, string&gt; = {
    today: '今日',
    week: '本周',
    month: '本月'
  }
  return labels[period] || period
}

const getSuccessColor = (rate: number) =&gt; {
  if (rate &gt;= 95) return '#67C23A'
  if (rate &gt;= 80) return '#E6A23C'
  return '#F56C6C'
}

const loadHealth = async () =&gt; {
  try {
    const res = await request.get('/api/v1/health')
    healthData.value = res.data.data
  } catch (e) {
    ElMessage.error('加载健康检查失败')
  }
}

const loadReport = async () =&gt; {
  try {
    const res = await request.get('/api/v1/report/execution')
    reportData.value = res.data.data
  } catch (e) {
    ElMessage.error('加载执行报告失败')
  }
}

onMounted(() =&gt; {
  loadHealth()
  loadReport()
})
&lt;/script&gt;

&lt;style scoped&gt;
.operation-dashboard {
  padding: 20px;
}
.health-card {
  margin-bottom: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.stat-card {
  margin-bottom: 20px;
}
.stat-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #303133;
}
&lt;/style&gt;

