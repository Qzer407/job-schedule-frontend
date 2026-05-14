<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getRoleList,
  createRole,
  updateRole,
  deleteRole,
  getAllPermissions,
  getRolePermissions,
  assignRolePermissions,
  exportRoles,
  type Role,
  type RoleCreateRequest,
  type RoleUpdateRequest
} from '@/api'

const loading = ref(false)
const roles = ref<Role[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchForm = ref({
  roleName: '',
  status: undefined as number | undefined
})

const dialogVisible = ref(false)
const dialogTitle = ref('新增角色')
const isEdit = ref(false)
const currentId = ref<number | null>(null)
const form = ref<RoleCreateRequest & RoleUpdateRequest>({
  roleName: '',
  roleCode: '',
  description: '',
  status: 1
})

const permissionDialogVisible = ref(false)
const allPermissions = ref<any[]>([])
const selectedPermissions = ref<number[]>([])
const currentRoleId = ref<number | null>(null)

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getRoleList({
      current: currentPage.value,
      size: pageSize.value,
      ...searchForm.value
    })
    roles.value = res.data.data.records
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
    roleName: '',
    status: undefined
  }
  handleSearch()
}

const handleAdd = () => {
  dialogTitle.value = '新增角色'
  isEdit.value = false
  currentId.value = null
  form.value = {
    roleName: '',
    roleCode: '',
    description: '',
    status: 1
  }
  dialogVisible.value = true
}

const handleEdit = (row: Role) => {
  dialogTitle.value = '编辑角色'
  isEdit.value = true
  currentId.value = row.id
  form.value = {
    roleName: row.roleName,
    roleCode: row.roleCode,
    description: row.description,
    status: row.status
  }
  dialogVisible.value = true
}

const handleDelete = async (row: Role) => {
  try {
    await ElMessageBox.confirm('确定要删除该角色吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteRole(row.id)
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
      await updateRole(currentId.value, form.value)
      ElMessage.success('更新成功')
    } else {
      await createRole(form.value as RoleCreateRequest)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    fetchData()
  } catch (error) {
    console.error(error)
  }
}

const handleAssignPermissions = async (row: Role) => {
  currentRoleId.value = row.id
  try {
    const [permsRes, rolePermsRes] = await Promise.all([
      getAllPermissions(),
      getRolePermissions(row.id)
    ])
    allPermissions.value = permsRes.data.data
    selectedPermissions.value = rolePermsRes.data.data
    permissionDialogVisible.value = true
  } catch (error) {
    console.error(error)
  }
}

const handleSavePermissions = async () => {
  if (!currentRoleId.value) return
  try {
    await assignRolePermissions(currentRoleId.value, selectedPermissions.value)
    ElMessage.success('分配权限成功')
    permissionDialogVisible.value = false
  } catch (error) {
    console.error(error)
  }
}

const handleExport = () => {
  exportRoles(searchForm.value)
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="role-management">
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="角色名称">
          <el-input v-model="searchForm.roleName" placeholder="请输入角色名称" clearable />
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
          <span>角色列表</span>
          <div>
            <el-button type="primary" @click="handleAdd">新增</el-button>
            <el-button @click="handleExport">导出</el-button>
          </div>
        </div>
      </template>
      <el-table :data="roles" v-loading="loading" stripe>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="roleName" label="角色名称" />
        <el-table-column prop="roleCode" label="角色编码" />
        <el-table-column prop="description" label="描述" />
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
            <el-button type="warning" link @click="handleAssignPermissions(row)">分配权限</el-button>
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
        <el-form-item label="角色名称" required>
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" required>
          <el-input v-model="form.roleCode" placeholder="请输入角色编码" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="请输入描述" />
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

    <el-dialog title="分配权限" v-model="permissionDialogVisible" width="600px">
      <el-tree
        v-model:checked-keys="selectedPermissions"
        :data="allPermissions"
        :props="{ label: 'permissionName', children: 'children' }"
        node-key="id"
        show-checkbox
        check-strictly
      />
      <template #footer>
        <el-button @click="permissionDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSavePermissions">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.role-management {
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
