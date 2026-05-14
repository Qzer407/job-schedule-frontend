<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getApiKeyList,
  createApiKey,
  updateApiKey,
  deleteApiKey,
  toggleApiKeyStatus,
  regenerateApiKey,
  exportApiKeys,
  type ApiKey,
  type ApiKeyCreateRequest,
  type ApiKeyUpdateRequest,
  getCurrentUser
} from '@/api'

const loading = ref(false)
const apiKeys = ref<ApiKey[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchForm = ref({
  userId: undefined as number | undefined,
  status: undefined as number | undefined
})

const currentUser = computed(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }
  return null
})

const dialogVisible = ref(false)
const dialogTitle = ref('新增API密钥')
const isEdit = ref(false)
const currentId = ref<number | null>(null)
const form = ref<ApiKeyCreateRequest & ApiKeyUpdateRequest>({
  userId: 0,
  keyName: '',
  permissions: '',
  rateLimit: 1000
})

const regenerateDialogVisible = ref(false)
const newSecret = ref('')

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getApiKeyList({
      current: currentPage.value,
      size: pageSize.value,
      ...searchForm.value
    })
    apiKeys.value = res.data.data.records
    total.value = res.data.data.total
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

const handleReset = () => {
  searchForm.value = {
    userId: undefined,
    status: undefined
  }
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = '新增API密钥'
  isEdit.value = false
  currentId.value = null
  form.value = {
    userId: currentUser.value?.id || 0,
    keyName: '',
    permissions: '',
    rateLimit: 1000
  }
  dialogVisible.value = true
}

const handleEdit = (row: ApiKey) => {
  dialogTitle.value = '编辑API密钥'
  isEdit.value = true
  currentId.value = row.id
  form.value = {
    keyName: row.keyName,
    permissions: row.permissions,
    rateLimit: row.rateLimit,
    status: row.status
  }
  dialogVisible.value = true
}

const handleDelete = async (row: ApiKey) => {
  try {
    await ElMessageBox.confirm('确定要删除该API密钥吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteApiKey(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const handleToggleStatus = async (row: ApiKey) => {
  try {
    await toggleApiKeyStatus(row.id)
    ElMessage.success('状态切换成功')
    fetchData()
  } catch (error) {
    console.error(error)
  }
}

const handleRegenerate = async (row: ApiKey) => {
  try {
    const res = await regenerateApiKey(row.id)
    newSecret.value = res.data.data
    regenerateDialogVisible.value = true
    ElMessage.success('密钥重新生成成功，请妥善保管新密钥！')
  } catch (error) {
    console.error(error)
  }
}

const handleSubmit = async () => {
  try {
    if (isEdit.value && currentId.value) {
      await updateApiKey(currentId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      const res = await createApiKey(form.value as ApiKeyCreateRequest)
      ElMessage.success('创建成功，请妥善保管密钥！')
    }
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error(error)
  }
}

const handleExport = () => {
  exportApiKeys(searchForm.value)
}

const copySecret = () => {
  navigator.clipboard.writeText(newSecret.value)
  ElMessage.success('已复制到剪贴板')
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="api-key-management">
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <span>API密钥列表</span>
          <div>
            <el-button type="primary" @click="handleAdd">新增</el-button>
            <el-button @click="handleExport">导出</el-button>
          </div>
        </div>
      </template>
      <el-table :data="apiKeys" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="keyName" label="密钥名称" />
        <el-table-column prop="apiKey" label="API Key" show-overflow-tooltip />
        <el-table-column prop="permissions" label="权限" show-overflow-tooltip />
        <el-table-column prop="rateLimit" label="限流次数" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="warning" link @click="handleToggleStatus(row)">
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="info" link @click="handleRegenerate(row)">重新生成</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="fetchData"
        @size-change="fetchData"
      />
    </el-card>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="密钥名称" required>
          <el-input v-model="form.keyName" placeholder="请输入密钥名称" />
        </el-form-item>
        <el-form-item label="权限">
          <el-input v-model="form.permissions" type="textarea" :rows="3" placeholder="请输入权限，多个用逗号分隔" />
        </el-form-item>
        <el-form-item label="限流次数">
          <el-input-number v-model="form.rateLimit" :min="1" />
        </el-form-item>
        <el-form-item label="状态" v-if="isEdit">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog title="密钥重新生成成功" v-model="regenerateDialogVisible" width="500px">
      <el-alert type="warning" title="请妥善保管新的密钥，仅显示一次！" :closable="false" show-icon />
      <el-input v-model="newSecret" readonly style="margin-top: 20px;">
        <template #append>
          <el-button @click="copySecret">复制</el-button>
        </template>
      </el-input>
      <template #footer>
        <el-button type="primary" @click="regenerateDialogVisible = false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.api-key-management {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>
