<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getTaskList,
  createTask,
  updateTask,
  deleteTask,
  startTask,
  stopTask,
  triggerTask
} from '@/api'
import type { TaskInfo, TaskCreateRequest } from '@/types'

const tableData = ref<TaskInfo[]>([])
const loading = ref(false)

const searchForm = reactive({
  taskName: '',
  taskGroup: '',
  status: null as number | null
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 20,
  total: 0
})

const dialogVisible = ref(false)
const dialogTitle = ref('创建任务')
const submitLoading = ref(false)
const isEdit = ref(false)
const currentId = ref<number | null>(null)

const form = reactive<TaskCreateRequest>({
  taskName: '',
  taskGroup: '',
  cronExpression: '',
  executorHandler: '',
  executorParam: '',
  shardingTotal: 1,
  shardingParam: '',
  retryCount: 3,
  alarmStatus: 1,
  description: ''
})

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      ...searchForm
    }
    const res = await getTaskList(params)
    tableData.value = res.data.data.records
    pagination.total = res.data.data.total
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.pageNum = 1
  loadData()
}

const handleReset = () => {
  searchForm.taskName = ''
  searchForm.taskGroup = ''
  searchForm.status = null
  handleSearch()
}

const handleCreate = () => {
  isEdit.value = false
  currentId.value = null
  dialogTitle.value = '创建任务'
  form.taskName = ''
  form.taskGroup = ''
  form.cronExpression = ''
  form.executorHandler = ''
  form.executorParam = ''
  form.shardingTotal = 1
  form.shardingParam = ''
  form.retryCount = 3
  form.alarmStatus = 1
  form.description = ''
  dialogVisible.value = true
}

const handleEdit = (row: TaskInfo) => {
  isEdit.value = true
  currentId.value = row.id
  dialogTitle.value = '编辑任务'
  form.taskName = row.taskName
  form.taskGroup = row.taskGroup
  form.cronExpression = row.cronExpression
  form.executorHandler = row.executorHandler
  form.executorParam = row.executorParam || ''
  form.shardingTotal = row.shardingTotal || 1
  form.shardingParam = row.shardingParam || ''
  form.retryCount = row.retryCount || 3
  form.alarmStatus = row.alarmStatus || 1
  form.description = row.description || ''
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.taskName || !form.taskGroup || !form.cronExpression || !form.executorHandler) {
    ElMessage.warning('请填写必填项')
    return
  }
  submitLoading.value = true
  try {
    if (isEdit.value && currentId.value) {
      await updateTask(currentId.value, form)
      ElMessage.success('更新成功')
    } else {
      await createTask(form)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (e) {
    console.error(e)
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = (row: TaskInfo) => {
  ElMessageBox.confirm('确定要删除该任务吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteTask(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (e) {
      console.error(e)
    }
  }).catch(() => {})
}

const handleToggleStatus = async (row: TaskInfo) => {
  try {
    if (row.status === 1) {
      await stopTask(row.id)
      ElMessage.success('已停止')
    } else {
      await startTask(row.id)
      ElMessage.success('已启动')
    }
    loadData()
  } catch (e) {
    console.error(e)
  }
}

const handleTrigger = async (row: TaskInfo) => {
  try {
    await triggerTask(row.id, { executorParam: '' })
    ElMessage.success('触发成功')
  } catch (e) {
    console.error(e)
  }
}

const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  loadData()
}

const handleCurrentChange = (val: number) => {
  pagination.pageNum = val
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="task-manager">
    <el-form :model="searchForm" inline>
      <el-form-item label="任务名称">
        <el-input v-model="searchForm.taskName" placeholder="请输入任务名称" clearable />
      </el-form-item>
      <el-form-item label="任务分组">
        <el-input v-model="searchForm.taskGroup" placeholder="请输入任务分组" clearable />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
          <el-option label="停用" :value="0" />
          <el-option label="启用" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="toolbar">
      <el-button type="primary" @click="handleCreate">创建任务</el-button>
    </div>

    <el-table :data="tableData" border stripe v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="taskName" label="任务名称" min-width="150" />
      <el-table-column prop="taskGroup" label="任务分组" width="120" />
      <el-table-column prop="cronExpression" label="Cron表达式" width="150" />
      <el-table-column prop="executorHandler" label="执行器" width="150" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" min-width="150" show-overflow-tooltip />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button link :type="row.status === 1 ? 'warning' : 'success'" @click="handleToggleStatus(row)">
            {{ row.status === 1 ? '停止' : '启动' }}
          </el-button>
          <el-button link type="success" @click="handleTrigger(row)">触发</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="pagination"
      v-model:current-page="pagination.pageNum"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      :page-sizes="[10, 20, 50]"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" destroy-on-close>
      <el-form :model="form" label-width="100px">
        <el-form-item label="任务名称" required>
          <el-input v-model="form.taskName" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务分组" required>
          <el-input v-model="form.taskGroup" placeholder="请输入任务分组" />
        </el-form-item>
        <el-form-item label="Cron表达式" required>
          <el-input v-model="form.cronExpression" placeholder="如: 0 0 * * * ?" />
        </el-form-item>
        <el-form-item label="执行器" required>
          <el-input v-model="form.executorHandler" placeholder="请输入执行器Handler名称" />
        </el-form-item>
        <el-form-item label="执行参数">
          <el-input v-model="form.executorParam" type="textarea" placeholder="请输入执行参数" />
        </el-form-item>
        <el-form-item label="分片总数">
          <el-input-number v-model="form.shardingTotal" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="重试次数">
          <el-input-number v-model="form.retryCount" :min="0" :max="10" />
        </el-form-item>
        <el-form-item label="告警状态">
          <el-switch v-model="form.alarmStatus" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.task-manager {
  padding: 20px;
}

.toolbar {
  margin-bottom: 16px;
}

.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
