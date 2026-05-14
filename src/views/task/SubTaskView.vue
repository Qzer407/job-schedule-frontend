<template>
  <div class="sub-task-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Sub-Task Management</span>
          <el-button type="primary" @click="showDialog = true; isEdit = false; form = { status: 1 }">Create Sub-Task</el-button>
        </div>
      </template>

      <div class="filter-container">
        <el-form :inline="true">
          <el-form-item label="Parent Task ID">
            <el-input v-model.number="parentTaskId" placeholder="Enter parent task ID" style="width: 200px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadData">Search</el-button>
          </el-form-item>
        </el-form>
      </div>

      <el-table :data="tableData" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="parentTaskId" label="Parent Task ID" width="120" />
        <el-table-column prop="taskName" label="Task Name" min-width="150" />
        <el-table-column prop="taskDesc" label="Description" min-width="200" show-overflow-tooltip />
        <el-table-column prop="executeType" label="Execute Type" width="120" />
        <el-table-column prop="routeStrategy" label="Route Strategy" width="120" />
        <el-table-column prop="status" label="Status" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? 'Enabled' : 'Disabled' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="Create Time" width="180" />
        <el-table-column label="Operations" width="200" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">Edit</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">Delete</el-button>
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

    <el-dialog v-model="showDialog" :title="isEdit ? 'Edit Sub-Task' : 'Create Sub-Task'" width="700px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="140px">
        <el-form-item label="Task Name" prop="taskName">
          <el-input v-model="form.taskName" placeholder="Enter task name" />
        </el-form-item>
        <el-form-item label="Description" prop="taskDesc">
          <el-input v-model="form.taskDesc" type="textarea" :rows="3" placeholder="Enter description" />
        </el-form-item>
        <el-form-item label="Execute Type" prop="executeType">
          <el-select v-model="form.executeType" placeholder="Select execute type" style="width: 100%">
            <el-option label="Cron" value="CRON" />
            <el-option label="Fixed Rate" value="FIXED_RATE" />
            <el-option label="Manual" value="MANUAL" />
          </el-select>
        </el-form-item>
        <el-form-item label="Cron Expression" prop="cronExpression">
          <el-input v-model="form.cronExpression" placeholder="e.g., 0 0 * * * ?" />
        </el-form-item>
        <el-form-item label="Route Strategy" prop="routeStrategy">
          <el-select v-model="form.routeStrategy" placeholder="Select route strategy" style="width: 100%">
            <el-option label="First" value="FIRST" />
            <el-option label="Last" value="LAST" />
            <el-option label="Round" value="ROUND" />
            <el-option label="Random" value="RANDOM" />
          </el-select>
        </el-form-item>
        <el-form-item label="Executor Handler" prop="executorHandler">
          <el-input v-model="form.executorHandler" placeholder="Enter executor handler" />
        </el-form-item>
        <el-form-item label="Executor Param" prop="executorParam">
          <el-input v-model="form.executorParam" type="textarea" :rows="2" placeholder="Enter executor param" />
        </el-form-item>
        <el-form-item label="Status" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">Enabled</el-radio>
            <el-radio :label="0">Disabled</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">Cancel</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">Submit</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { getSubTaskList, createSubTask, updateSubTask, deleteSubTask, type SubTask } from '@/api'

const loading = ref(false)
const submitting = ref(false)
const showDialog = ref(false)
const isEdit = ref(false)
const tableData = ref<SubTask[]>([])
const total = ref(0)
const parentTaskId = ref<number>(1)
const formRef = ref<FormInstance>()
const currentId = ref<number | null>(null)

const queryParams = reactive({
  current: 1,
  size: 10
})

const form = reactive({
  taskName: '',
  taskDesc: '',
  executeType: 'CRON',
  cronExpression: '',
  routeStrategy: 'ROUND',
  executorHandler: '',
  executorParam: '',
  status: 1
})

const rules: FormRules = {
  taskName: [{ required: true, message: 'Please enter task name', trigger: 'blur' }]
}

const loadData = async () => {
  if (!parentTaskId.value) {
    ElMessage.warning('Please enter parent task ID')
    return
  }

  loading.value = true
  try {
    const res = await getSubTaskList(parentTaskId.value, queryParams)
    tableData.value = res.data.data.records
    total.value = res.data.data.total
  } catch (error) {
    console.error('Failed to load data', error)
  } finally {
    loading.value = false
  }
}

const handleEdit = (row: SubTask) => {
  isEdit.value = true
  currentId.value = row.id
  Object.assign(form, row)
  showDialog.value = true
}

const handleDelete = async (row: SubTask) => {
  try {
    await ElMessageBox.confirm('Are you sure to delete this sub-task?', 'Confirm', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning'
    })
    await deleteSubTask(row.id)
    ElMessage.success('Deleted successfully')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Delete failed', error)
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        if (isEdit.value && currentId.value) {
          await updateSubTask(currentId.value, form)
          ElMessage.success('Updated successfully')
        } else {
          await createSubTask(parentTaskId.value, form)
          ElMessage.success('Created successfully')
        }
        showDialog.value = false
        loadData()

        form.taskName = ''
        form.taskDesc = ''
        form.executeType = 'CRON'
        form.cronExpression = ''
        form.routeStrategy = 'ROUND'
        form.executorHandler = ''
        form.executorParam = ''
        form.status = 1
      } catch (error) {
        console.error('Submit failed', error)
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
.sub-task-container {
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
