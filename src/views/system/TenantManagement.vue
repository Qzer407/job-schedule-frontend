<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getTenantList,
  createTenant,
  updateTenant,
  deleteTenant,
  exportTenants,
  type Tenant,
  type TenantCreateRequest,
  type TenantUpdateRequest
} from '@/api'

const loading = ref(false)
const tenants = ref<Tenant[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchForm = ref({
  tenantName: '',
  status: undefined as number | undefined
})

const dialogVisible = ref(false)
const dialogTitle = ref('新增租户')
const isEdit = ref(false)
const currentId = ref<number | null>(null)
const form = ref<TenantCreateRequest & TenantUpdateRequest>({
  tenantCode: '',
  tenantName: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  status: 1,
  maxUsers: 10,
  maxTasks: 100
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getTenantList({
      current: currentPage.value,
      size: pageSize.value,
      ...searchForm.value
    })
    tenants.value = res.data.data.records
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
    tenantName: '',
    status: undefined
  }
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = '新增租户'
  isEdit.value = false
  currentId.value = null
  form.value = {
    tenantCode: '',
    tenantName: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    status: 1,
    maxUsers: 10,
    maxTasks: 100
  }
  dialogVisible.value = true
}

const handleEdit = (row: Tenant) => {
  dialogTitle.value = '编辑租户'
  isEdit.value = true
  currentId.value = row.id
  form.value = {
    tenantName: row.tenantName,
    contactName: row.contactName,
    contactPhone: row.contactPhone,
    contactEmail: row.contactEmail,
    status: row.status,
    expireTime: row.expireTime,
    maxUsers: row.maxUsers,
    maxTasks: row.maxTasks
  }
  dialogVisible.value = true
}

const handleDelete = async (row: Tenant) => {
  try {
    await ElMessageBox.confirm('确定要删除该租户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteTenant(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}

const handleSubmit = async () => {
  try {
    if (isEdit.value && currentId.value) {
      await updateTenant(currentId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      await createTenant(form.value as TenantCreateRequest)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error(error)
  }
}

const handleExport = () => {
  exportTenants()
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="tenant-management">
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="租户名称">
          <el-input v-model="searchForm.tenantName" placeholder="请输入租户名称" clearable />
        </el-form-item>
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
          <span>租户列表</span>
          <div>
            <el-button type="primary" @click="handleAdd">新增</el-button>
            <el-button @click="handleExport">导出</el-button>
          </div>
        </div>
      </template>
      <el-table :data="tenants" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="tenantCode" label="租户编码" />
        <el-table-column prop="tenantName" label="租户名称" />
        <el-table-column prop="contactName" label="联系人" />
        <el-table-column prop="contactPhone" label="联系电话" />
        <el-table-column prop="contactEmail" label="联系邮箱" />
        <el-table-column prop="maxUsers" label="最大用户数" width="120" />
        <el-table-column prop="maxTasks" label="最大任务数" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
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

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="租户编码" required v-if="!isEdit">
          <el-input v-model="form.tenantCode" placeholder="请输入租户编码" />
        </el-form-item>
        <el-form-item label="租户名称" required>
          <el-input v-model="form.tenantName" placeholder="请输入租户名称" />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="form.contactName" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="联系邮箱">
          <el-input v-model="form.contactEmail" placeholder="请输入联系邮箱" />
        </el-form-item>
        <el-form-item label="最大用户数">
          <el-input-number v-model="form.maxUsers" :min="1" />
        </el-form-item>
        <el-form-item label="最大任务数">
          <el-input-number v-model="form.maxTasks" :min="1" />
        </el-form-item>
        <el-form-item label="状态">
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
  </div>
</template>

<style scoped>
.tenant-management {
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
