<template>
  <div class="schedule-log-container">
    <el-card>
      <template #header>
        <span>Schedule Log</span>
      </template>

      <div class="filter-container">
        <el-form :inline="true" :model="queryParams">
          <el-form-item label="Task ID">
            <el-input v-model.number="queryParams.taskId" placeholder="Enter task ID" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="Status">
            <el-select v-model="queryParams.status" placeholder="Select status" clearable style="width: 150px">
              <el-option label="All" :value="undefined" />
              <el-option label="Success" :value="1" />
              <el-option label="Failed" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadData">Search</el-button>
            <el-button @click="resetQuery">Reset</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="taskId" label="Task ID" width="100" />
        <el-table-column prop="taskName" label="Task Name" min-width="150" />
        <el-table-column prop="scheduleTime" label="Schedule Time" width="180" />
        <el-table-column prop="triggerType" label="Trigger Type" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.triggerType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="Status" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? 'Success' : 'Failed' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="costTime" label="Cost Time (ms)" width="120" />
        <el-table-column prop="errorMessage" label="Error Message" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="Create Time" width="180" />
        <el-table-column label="Operations" width="100" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleView(row)">View</el-button>
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

    <el-dialog v-model="showDetailDialog" title="Schedule Log Detail" width="700px">
      <el-descriptions :column="2" border v-if="currentLog">
        <el-descriptions-item label="ID">{{ currentLog.id }}</el-descriptions-item>
        <el-descriptions-item label="Task ID">{{ currentLog.taskId }}</el-descriptions-item>
        <el-descriptions-item label="Task Name" :span="2">{{ currentLog.taskName }}</el-descriptions-item>
        <el-descriptions-item label="Schedule Time">{{ currentLog.scheduleTime }}</el-descriptions-item>
        <el-descriptions-item label="Trigger Type">
          <el-tag>{{ currentLog.triggerType }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Status">
          <el-tag :type="currentLog.status === 1 ? 'success' : 'danger'">
            {{ currentLog.status === 1 ? 'Success' : 'Failed' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Cost Time">{{ currentLog.costTime }} ms</el-descriptions-item>
        <el-descriptions-item label="Create Time" :span="2">{{ currentLog.createTime }}</el-descriptions-item>
        <el-descriptions-item label="Error Message" :span="2" v-if="currentLog.errorMessage">
          <el-alert type="error" :closable="false">{{ currentLog.errorMessage }}</el-alert>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getScheduleLogList, getScheduleLog, type ScheduleLog } from '@/api'

const loading = ref(false)
const showDetailDialog = ref(false)
const tableData = ref<ScheduleLog[]>([])
const total = ref(0)
const currentLog = ref<ScheduleLog | null>(null)

const queryParams = reactive({
  current: 1,
  size: 10,
  taskId: undefined as number | undefined,
  status: undefined as number | undefined
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getScheduleLogList(queryParams)
    tableData.value = res.data.data.records
    total.value = res.data.data.total
  } catch (error) {
    console.error('Failed to load data', error)
  } finally {
    loading.value = false
  }
}

const resetQuery = () => {
  queryParams.current = 1
  queryParams.size = 10
  queryParams.taskId = undefined
  queryParams.status = undefined
  loadData()
}

const handleView = async (row: ScheduleLog) => {
  try {
    const res = await getScheduleLog(row.id)
    currentLog.value = res.data.data
    showDetailDialog.value = true
  } catch (error) {
    console.error('Failed to get detail', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.schedule-log-container {
  padding: 20px;
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
