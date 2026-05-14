<template>
  <div class="workflow-template-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>Workflow Template Management</span>
          <el-button type="primary" @click="showDialog = true; isEdit = false; form = {}">Create Template</el-button>
        </div>
      </template>

      <div class="filter-container">
        <el-form :inline="true" :model="queryParams">
          <el-form-item label="Template Type">
            <el-select v-model="queryParams.templateType" placeholder="Select template type" clearable style="width: 200px">
              <el-option label="All" :value="undefined" />
              <el-option label="Data Processing" value="DATA_PROCESSING" />
              <el-option label="ETL" value="ETL" />
              <el-option label="Batch Processing" value="BATCH_PROCESSING" />
              <el-option label="Custom" value="CUSTOM" />
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
        <el-table-column prop="templateName" label="Template Name" min-width="150" />
        <el-table-column prop="templateType" label="Template Type" width="150">
          <template #default="{ row }">
            <el-tag>{{ row.templateType }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="Description" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createTime" label="Create Time" width="180" />
        <el-table-column label="Operations" width="300" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleEdit(row)">Edit</el-button>
            <el-button link type="success" size="small" @click="handleApply(row)">Apply</el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showDialog" :title="isEdit ? 'Edit Template' : 'Create Template'" width="700px">
      <el-form :model="form" :rules="rules" ref="formRef" label-width="140px">
        <el-form-item label="Template Name" prop="templateName">
          <el-input v-model="form.templateName" placeholder="Enter template name" />
        </el-form-item>
        <el-form-item label="Template Type" prop="templateType">
          <el-select v-model="form.templateType" placeholder="Select template type" style="width: 100%">
            <el-option label="Data Processing" value="DATA_PROCESSING" />
            <el-option label="ETL" value="ETL" />
            <el-option label="Batch Processing" value="BATCH_PROCESSING" />
            <el-option label="Custom" value="CUSTOM" />
          </el-select>
        </el-form-item>
        <el-form-item label="Description" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="Enter description" />
        </el-form-item>
        <el-form-item label="Template Data" prop="templateData">
          <el-input v-model="form.templateData" type="textarea" :rows="8" placeholder="Enter template data (JSON format)" />
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
import { getWorkflowTemplateList, createWorkflowTemplate, updateWorkflowTemplate, deleteWorkflowTemplate, applyWorkflowTemplate, type WorkflowTemplate } from '@/api'

const loading = ref(false)
const submitting = ref(false)
const showDialog = ref(false)
const isEdit = ref(false)
const tableData = ref<WorkflowTemplate[]>([])
const formRef = ref<FormInstance>()
const currentId = ref<number | null>(null)

const queryParams = reactive({
  templateType: undefined as string | undefined
})

const form = reactive({
  templateName: '',
  templateType: '',
  description: '',
  templateData: ''
})

const rules: FormRules = {
  templateName: [{ required: true, message: 'Please enter template name', trigger: 'blur' }],
  templateType: [{ required: true, message: 'Please select template type', trigger: 'change' }],
  templateData: [{ required: true, message: 'Please enter template data', trigger: 'blur' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getWorkflowTemplateList(queryParams)
    tableData.value = res.data.data
  } catch (error) {
    console.error('Failed to load data', error)
  } finally {
    loading.value = false
  }
}

const resetQuery = () => {
  queryParams.templateType = undefined
  loadData()
}

const handleEdit = (row: WorkflowTemplate) => {
  isEdit.value = true
  currentId.value = row.id
  Object.assign(form, row)
  showDialog.value = true
}

const handleDelete = async (row: WorkflowTemplate) => {
  try {
    await ElMessageBox.confirm('Are you sure to delete this template?', 'Confirm', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning'
    })
    await deleteWorkflowTemplate(row.id)
    ElMessage.success('Deleted successfully')
    loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Delete failed', error)
    }
  }
}

const handleApply = async (row: WorkflowTemplate) => {
  try {
    await ElMessageBox.confirm('Are you sure to apply this template? It will create a new workflow.', 'Confirm', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning'
    })
    const res = await applyWorkflowTemplate(row.id)
    ElMessage.success('Applied successfully! Workflow ID: ' + res.data.data.id)
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('Apply failed', error)
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
          await updateWorkflowTemplate(currentId.value, form)
          ElMessage.success('Updated successfully')
        } else {
          await createWorkflowTemplate(form)
          ElMessage.success('Created successfully')
        }
        showDialog.value = false
        loadData()

        form.templateName = ''
        form.templateType = ''
        form.description = ''
        form.templateData = ''
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
.workflow-template-container {
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
</style>
