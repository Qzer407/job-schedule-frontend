<template>
  <div class="executor-group-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Executor Group Management</span>
          <el-button type="primary" @click="showDialog = true; isEdit = false; form = {}">Create Group</el-button>
        </div>
      </template>

      <div class="filter-container">
        <el-form :inline="true" :model="queryParams">
          <el-form-item label="Group Name">
            <el-input v-model="queryParams.groupName" placeholder="Enter group name" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item label="Status">
            <el-select v-model="queryParams.status" placeholder="Select status" clearable style="width: 150px">
              <el-option label="All" :value="undefined" />
              <el-option label="Enabled" :value="1" />
              <el-option label="Disabled" :value="0" />
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
        <el-table-column prop="groupName" label="Group Name" min-width="150" />
        <el-table-column prop="groupCode" label="Group Code" min-width="120" />
        <el-table-column prop="description" label="Description" min-width="200" show-overflow-tooltip />
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

    <el-dialog v-model="showDialog" :title="isEdit ? 'Edit Group' : 'Create Group'" width="600px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="Group Name" prop="groupName">
          <el-input v-model="form.groupName" placeholder="Enter group name" />
        </el-form-item>
        <el-form-item label="Group Code" prop="groupCode">
          <el-input v-model="form.groupCode" placeholder="Enter group code" />
        </el-form-item>
        <el-form-item label="Description" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="Enter description" />
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
import { getExecutorGroupList, createExecutorGroup, updateExecutorGroup, deleteExecutorGroup, type ExecutorGroup } from '@/api'

const loading = ref(false)
const submitting = ref(false)
const showDialog = ref(false)
const isEdit = ref(false)
const tableData = ref<ExecutorGroup[]>([])
const total = ref(0)
const formRef = ref<FormInstance>()

const queryParams = reactive({
  current: 1,
  size: 10,
  groupName: '',
  status: undefined as number | undefined
})

const form = reactive({
  groupName: '',
  groupCode: '',
  description: '',
  status: 1
})

const rules: FormRules = {
  groupName: [{ required: true, message: 'Please enter group name', trigger: 'blur' }],
  groupCode: [{ required: true, message: 'Please enter group code', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getExecutorGroupList(queryParams)
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
  queryParams.groupName = ''
  queryParams.status = undefined
  loadData()
}

const handleEdit = (row: ExecutorGroup) => {
  isEdit.value = true
  Object.assign(form, row)
  showDialog.value = true
}

const handleDelete = async (row: ExecutorGroup) => {
  try {
    await ElMessageBox.confirm('Are you sure to delete this group?', 'Confirm', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning'
    })
    await deleteExecutorGroup(row.id)
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
        if (isEdit.value) {
          await updateExecutorGroup(form.id, form)
          ElMessage.success('Updated successfully')
        } else {
          await createExecutorGroup(form)
          ElMessage.success('Created successfully')
        }
        showDialog.value = false
        loadData()

        form.groupName = ''
        form.groupCode = ''
        form.description = ''
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
.executor-group-container {
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
