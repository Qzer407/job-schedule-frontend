<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import WorkflowEditor from '@/components/business/WorkflowEditor.vue'
import {
  getWorkflowList,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  executeWorkflow
} from '@/api'
import type { Workflow, WorkflowCreateRequest } from '@/types'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('创建工作流')
const designerVisible = ref(false)
const isEdit = ref(false)
const currentId = ref<number | null>(null)

const workflowList = ref<Workflow[]>([])

const form = reactive<WorkflowCreateRequest>({
  workflowName: '',
  workflowDesc: '',
  status: 0
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 20,
  total: 0
})

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    }
    const res = await getWorkflowList(params)
    workflowList.value = res.data.data.records || []
    pagination.total = res.data.data.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  isEdit.value = false
  currentId.value = null
  dialogTitle.value = '创建工作流'
  form.workflowName = ''
  form.workflowDesc = ''
  form.status = 0
  dialogVisible.value = true
}

const handleEdit = (row: Workflow) => {
  isEdit.value = true
  currentId.value = row.id
  dialogTitle.value = '编辑工作流'
  form.workflowName = row.workflowName
  form.workflowDesc = row.workflowDesc || ''
  form.status = row.status
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.workflowName) {
    ElMessage.warning('请填写工作流名称')
    return
  }
  submitLoading.value = true
  try {
    if (isEdit.value && currentId.value) {
      await updateWorkflow(currentId.value, form)
      ElMessage.success('更新成功')
    } else {
      await createWorkflow(form)
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

const handleDelete = (row: Workflow) => {
  ElMessageBox.confirm('确定要删除该工作流吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteWorkflow(row.id)
      ElMessage.success('删除成功')
      loadData()
    } catch (e) {
      console.error(e)
    }
  }).catch(() => {})
}

const handleDesign = (row: Workflow) => {
  currentId.value = row.id
  designerVisible.value = true
}

const handleExecute = async (row: Workflow) => {
  try {
    await executeWorkflow(row.id)
    ElMessage.success('已触发执行')
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="workflow-manager">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>工作流管理</span>
          <el-button type="primary" @click="handleCreate">创建工作流</el-button>
        </div>
      </template>

      <el-table :data="workflowList" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="workflowName" label="工作流名称" min-width="180" />
        <el-table-column prop="workflowDesc" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="primary" @click="handleDesign(row)">设计</el-button>
            <el-button link type="success" @click="handleExecute(row)">执行</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.pageNum"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
      />
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" destroy-on-close>
      <el-form :model="form" label-width="100px">
        <el-form-item label="工作流名称" required>
          <el-input v-model="form.workflowName" placeholder="请输入工作流名称" />
        </el-form-item>
        <el-form-item label="工作流描述">
          <el-input
            v-model="form.workflowDesc"
            type="textarea"
            placeholder="请输入工作流描述"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="designerVisible" title="工作流设计" fullscreen destroy-on-close>
      <WorkflowEditor v-if="designerVisible" />
    </el-dialog>
  </div>
</template>

<style scoped>
.workflow-manager {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
