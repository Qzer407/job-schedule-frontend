<template>
  <div class="audit-log-container">
    <el-card>
      <template #header>
        <span>Audit Log</span>
      </template>

      <div class="filter-container">
        <el-form :inline="true" :model="queryParams">
          <el-form-item label="Module">
            <el-select v-model="queryParams.module" placeholder="Select module" clearable style="width: 200px">
              <el-option label="All" :value="undefined" />
              <el-option label="Task" value="task" />
              <el-option label="Workflow" value="workflow" />
              <el-option label="Alarm" value="alarm" />
              <el-option label="Auth" value="auth" />
            </el-select>
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
        <el-table-column prop="username" label="Username" width="120" />
        <el-table-column prop="operation" label="Operation" width="150" />
        <el-table-column prop="module" label="Module" width="120">
          <template #default="{ row }">
            <el-tag>{{ row.module }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="Description" min-width="200" show-overflow-tooltip />
        <el-table-column prop="requestMethod" label="Method" width="80" />
        <el-table-column prop="ipAddress" label="IP" width="140" />
        <el-table-column prop="status" label="Status" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? 'Success' : 'Failed' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="costTime" label="Cost Time (ms)" width="120" />
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

    <el-dialog v-model="showDetailDialog" title="Audit Log Detail" width="800px">
      <el-descriptions :column="2" border v-if="currentLog">
        <el-descriptions-item label="ID">{{ currentLog.id }}</el-descriptions-item>
        <el-descriptions-item label="Username">{{ currentLog.username }}</el-descriptions-item>
        <el-descriptions-item label="Operation">{{ currentLog.operation }}</el-descriptions-item>
        <el-descriptions-item label="Module">{{ currentLog.module }}</el-descriptions-item>
        <el-descriptions-item label="Request Method">{{ currentLog.requestMethod }}</el-descriptions-item>
        <el-descriptions-item label="IP Address">{{ currentLog.ipAddress }}</el-descriptions-item>
        <el-descriptions-item label="Status">
          <el-tag :type="currentLog.status === 1 ? 'success' : 'danger'">
            {{ currentLog.status === 1 ? 'Success' : 'Failed' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="Cost Time">{{ currentLog.costTime }} ms</el-descriptions-item>
        <el-descriptions-item label="Create Time" :span="2">{{ currentLog.createTime }}</el-descriptions-item>
        <el-descriptions-item label="Request URL" :span="2">{{ currentLog.requestUrl }}</el-descriptions-item>
        <el-descriptions-item label="Description" :span="2">{{ currentLog.description }}</el-descriptions-item>
        <el-descriptions-item label="Request Params" :span="2">
          <pre style="margin: 0; white-space: pre-wrap; word-break: break-all;">{{ currentLog.requestParams || '-' }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="Response Result" :span="2">
          <pre style="margin: 0; white-space: pre-wrap; word-break: break-all;">{{ currentLog.responseResult || '-' }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="Error Message" :span="2" v-if="currentLog.errorMessage">
          <el-alert type="error" :closable="false">{{ currentLog.errorMessage }}</el-alert>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getAuditLogList, getAuditLog, type AuditLog } from '@/api'

const loading = ref(false)
const showDetailDialog = ref(false)
const tableData = ref<AuditLog[]>([])
const total = ref(0)
const currentLog = ref<AuditLog | null>(null)

const queryParams = reactive({
  current: 1,
  size: 10,
  module: undefined as string | undefined,
  status: undefined as number | undefined
})

const loadData = async () => {
  loading.value = true
  try {
    const res = await getAuditLogList(queryParams)
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
  queryParams.module = undefined
  queryParams.status = undefined
  loadData()
}

const handleView = async (row: AuditLog) => {
  try {
    const res = await getAuditLog(row.id)
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
.audit-log-container {
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
