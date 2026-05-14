<template>
  <div class="message-queue-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>消息队列管理</span>
          <el-button type="primary" @click="showSubmitDialog = true">提交任务</el-button>
        </div>
      </template>

      <div class="filter-container">
        <el-form :inline="true" :model="queryParams">
          <el-form-item label="状态">
            <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 200px">
              <el-option label="全部" :value="undefined" />
              <el-option label="待发送" :value="0" />
              <el-option label="已发送" :value="1" />
              <el-option label="消费中" :value="2" />
              <el-option label="成功" :value="3" />
              <el-option label="失败" :value="4" />
              <el-option label="已取消" :value="5" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadData">查询</el-button>
            <el-button @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="taskName" label="任务名称" min-width="150" />
        <el-table-column prop="messageId" label="消息ID" min-width="200" show-overflow-tooltip />
        <el-table-column prop="messageType" label="消息类型" width="120">
          <template #default="{ row }">
            <el-tag :type="row.messageType === 'DELAY' ? 'warning' : 'success'">
              {{ row.messageType === 'DELAY' ? '延迟' : '异步' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="queueName" label="队列" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="retryCount" label="重试次数" width="100">
          <template #default="{ row }">
            {{ row.retryCount }} / {{ row.maxRetry }}
          </template>
        </el-table-column>
        <el-table-column prop="executeTime" label="执行时间" width="180">
          <template #default="{ row }">
            {{ row.executeTime || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">查看</el-button>
            <el-button link type="warning" size="small" @click="handleRetry(row)" 
                       v-if="row.status === 4" :loading="row.retrying">
              重试
            </el-button>
            <el-button link type="danger" size="small" @click="handleCancel(row)" 
                       v-if="row.status <= 1">
              取消
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.current"
          v-model:page-size="queryParams.size"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <el-dialog v-model="showSubmitDialog" title="提交任务" width="600px">
      <el-form :model="submitForm" :rules="submitRules" ref="submitFormRef" label-width="100px">
        <el-form-item label="任务名称" prop="taskName">
          <el-input v-model="submitForm.taskName" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="消息类型" prop="messageType">
          <el-radio-group v-model="submitForm.messageType">
            <el-radio label="ASYNC">异步任务</el-radio>
            <el-radio label="DELAY">延迟任务</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="延迟时间" prop="delayTime" v-if="submitForm.messageType === 'DELAY'">
          <el-input-number v-model="submitForm.delayTime" :min="1000" :step="1000" />
          <span style="margin-left: 10px">毫秒</span>
        </el-form-item>
        <el-form-item label="消息载荷" prop="payload">
          <el-input v-model="submitForm.payload" type="textarea" :rows="4" placeholder="请输入消息内容" />
        </el-form-item>
        <el-form-item label="最大重试次数" prop="maxRetry">
          <el-input-number v-model="submitForm.maxRetry" :min="0" :max="10" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSubmitDialog = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">提交</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showDetailDialog" title="任务详情" width="700px">
      <el-descriptions :column="2" border v-if="currentTask">
        <el-descriptions-item label="ID">{{ currentTask.id }}</el-descriptions-item>
        <el-descriptions-item label="任务名称">{{ currentTask.taskName }}</el-descriptions-item>
        <el-descriptions-item label="消息ID">{{ currentTask.messageId }}</el-descriptions-item>
        <el-descriptions-item label="消息类型">
          <el-tag :type="currentTask.messageType === 'DELAY' ? 'warning' : 'success'">
            {{ currentTask.messageType === 'DELAY' ? '延迟' : '异步' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="队列名称">{{ currentTask.queueName }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentTask.status)">
            {{ getStatusText(currentTask.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="延迟时间">{{ currentTask.delayTime }} ms</el-descriptions-item>
        <el-descriptions-item label="执行时间">{{ currentTask.executeTime }}</el-descriptions-item>
        <el-descriptions-item label="重试次数">{{ currentTask.retryCount }} / {{ currentTask.maxRetry }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ currentTask.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间" :span="2">{{ currentTask.updateTime }}</el-descriptions-item>
        <el-descriptions-item label="消息载荷" :span="2">
          <pre style="margin: 0; white-space: pre-wrap; word-break: break-all;">{{ currentTask.payload }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="错误信息" :span="2" v-if="currentTask.errorMessage">
          <el-alert type="error" :closable="false">{{ currentTask.errorMessage }}</el-alert>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getMessageTaskList, submitAsyncTask, submitDelayTask, getMessageTask, cancelMessageTask, retryMessageTask, type MessageTask, type AsyncTaskRequest, type DelayTaskRequest } from '@/api'

const loading = ref(false)
const submitting = ref(false)
const showSubmitDialog = ref(false)
const showDetailDialog = ref(false)
const tableData = ref<MessageTask[]>([])
const total = ref(0)
const currentTask = ref<MessageTask | null>(null)
const submitFormRef = ref<FormInstance>()

const queryParams = reactive({
  current: 1,
  size: 10,
  status: undefined as number | undefined
})

const submitForm = reactive({
  taskName: '',
  messageType: 'ASYNC',
  delayTime: 5000,
  payload: '',
  maxRetry: 3
})

const submitRules: FormRules = {
  payload: [
    { required: true, message: '请输入消息载荷', trigger: 'blur' }
  ]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getMessageTaskList(queryParams)
    tableData.value = res.data.data.records
    total.value = res.data.data.total
  } catch (error) {
    console.error('加载数据失败', error)
  } finally {
    loading.value = false
  }
}

const resetQuery = () => {
  queryParams.current = 1
  queryParams.size = 10
  queryParams.status = undefined
  loadData()
}

const getStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '待发送',
    1: '已发送',
    2: '消费中',
    3: '成功',
    4: '失败',
    5: '已取消'
  }
  return statusMap[status] || '未知'
}

const getStatusType = (status: number) => {
  const typeMap: Record<number, string> = {
    0: 'info',
    1: 'primary',
    2: 'warning',
    3: 'success',
    4: 'danger',
    5: 'info'
  }
  return typeMap[status] || 'info'
}

const handleView = async (row: MessageTask) => {
  try {
    const res = await getMessageTask(row.id)
    currentTask.value = res.data.data
    showDetailDialog.value = true
  } catch (error) {
    console.error('获取任务详情失败', error)
  }
}

const handleRetry = async (row: MessageTask) => {
  try {
    row.retrying = true
    await ElMessageBox.confirm('确定要重试该任务吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await retryMessageTask(row.id)
    ElMessage.success('任务已重新提交')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('重试失败', error)
    }
  } finally {
    row.retrying = false
  }
}

const handleCancel = async (row: MessageTask) => {
  try {
    await ElMessageBox.confirm('确定要取消该任务吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await cancelMessageTask(row.id)
    ElMessage.success('任务已取消')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('取消失败', error)
    }
  }
}

const handleSubmit = async () => {
  if (!submitFormRef.value) return
  
  await submitFormRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (submitForm.messageType === 'ASYNC') {
          const data: AsyncTaskRequest = {
            taskName: submitForm.taskName,
            payload: submitForm.payload,
            maxRetry: submitForm.maxRetry
          }
          await submitAsyncTask(data)
          ElMessage.success('异步任务提交成功')
        } else {
          const data: DelayTaskRequest = {
            taskName: submitForm.taskName,
            payload: submitForm.payload,
            delayTime: submitForm.delayTime,
            maxRetry: submitForm.maxRetry
          }
          await submitDelayTask(data)
          ElMessage.success('延迟任务提交成功')
        }
        showSubmitDialog.value = false
        loadData()
        
        submitForm.taskName = ''
        submitForm.payload = ''
        submitForm.messageType = 'ASYNC'
        submitForm.delayTime = 5000
        submitForm.maxRetry = 3
      } catch (error) {
        console.error('提交失败', error)
      } finally {
        submitting.value = false
      }
    }
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.message-queue-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-container {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
