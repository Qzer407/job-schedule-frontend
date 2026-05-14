
&lt;template&gt;
  &lt;div class="executor-group-manager"&gt;
    &lt;el-card&gt;
      &lt;template #header&gt;
        &lt;div class="card-header"&gt;
          &lt;span&gt;执行器分组管理&lt;/span&gt;
          &lt;el-button type="primary" @click="showCreateDialog"&gt;新增分组&lt;/el-button&gt;
        &lt;/div&gt;
      &lt;/template&gt;

      &lt;el-form :inline="true" :model="searchForm" class="search-form"&gt;
        &lt;el-form-item label="分组名称"&gt;
          &lt;el-input v-model="searchForm.groupName" placeholder="请输入" clearable /&gt;
        &lt;/el-form-item&gt;
        &lt;el-form-item label="状态"&gt;
          &lt;el-select v-model="searchForm.status" placeholder="请选择" clearable&gt;
            &lt;el-option label="启用" :value="1" /&gt;
            &lt;el-option label="禁用" :value="0" /&gt;
          &lt;/el-select&gt;
        &lt;/el-form-item&gt;
        &lt;el-form-item&gt;
          &lt;el-button type="primary" @click="loadData"&gt;查询&lt;/el-button&gt;
          &lt;el-button @click="resetSearch"&gt;重置&lt;/el-button&gt;
        &lt;/el-form-item&gt;
      &lt;/el-form&gt;

      &lt;el-table :data="tableData" v-loading="loading" border stripe&gt;
        &lt;el-table-column prop="id" label="ID" width="80" /&gt;
        &lt;el-table-column prop="groupName" label="分组名称" width="150" /&gt;
        &lt;el-table-column prop="groupCode" label="分组编码" width="150" /&gt;
        &lt;el-table-column prop="description" label="描述" show-overflow-tooltip /&gt;
        &lt;el-table-column prop="status" label="状态" width="100"&gt;
          &lt;template #default="{ row }"&gt;
            &lt;el-tag :type="row.status === 1 ? 'success' : 'danger'"&gt;
              {{ row.status === 1 ? '启用' : '禁用' }}
            &lt;/el-tag&gt;
          &lt;/template&gt;
        &lt;/el-table-column&gt;
        &lt;el-table-column prop="createTime" label="创建时间" width="180" /&gt;
        &lt;el-table-column label="操作" width="200" fixed="right"&gt;
          &lt;template #default="{ row }"&gt;
            &lt;el-button type="primary" size="small" @click="showEditDialog(row)"&gt;编辑&lt;/el-button&gt;
            &lt;el-button type="danger" size="small" @click="handleDelete(row)"&gt;删除&lt;/el-button&gt;
          &lt;/template&gt;
        &lt;/el-table-column&gt;
      &lt;/el-table&gt;

      &lt;el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
        style="margin-top: 20px; justify-content: flex-end"
      /&gt;
    &lt;/el-card&gt;

    &lt;el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分组' : '新增分组'"
      width="500px"
    &gt;
      &lt;el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px"&gt;
        &lt;el-form-item label="分组名称" prop="groupName"&gt;
          &lt;el-input v-model="formData.groupName" placeholder="请输入" /&gt;
        &lt;/el-form-item&gt;
        &lt;el-form-item label="分组编码" prop="groupCode" v-if="!isEdit"&gt;
          &lt;el-input v-model="formData.groupCode" placeholder="请输入" /&gt;
        &lt;/el-form-item&gt;
        &lt;el-form-item label="描述" prop="description"&gt;
          &lt;el-input v-model="formData.description" type="textarea" placeholder="请输入" /&gt;
        &lt;/el-form-item&gt;
        &lt;el-form-item label="状态" prop="status" v-if="isEdit"&gt;
          &lt;el-select v-model="formData.status" placeholder="请选择"&gt;
            &lt;el-option label="启用" :value="1" /&gt;
            &lt;el-option label="禁用" :value="0" /&gt;
          &lt;/el-select&gt;
        &lt;/el-form-item&gt;
      &lt;/el-form&gt;
      &lt;template #footer&gt;
        &lt;el-button @click="dialogVisible = false"&gt;取消&lt;/el-button&gt;
        &lt;el-button type="primary" @click="handleSubmit" :loading="submitLoading"&gt;确定&lt;/el-button&gt;
      &lt;/template&gt;
    &lt;/el-dialog&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import request from '@/api'

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref&lt;FormInstance&gt;()
const tableData = ref&lt;any[]&gt;([])

const searchForm = reactive({
  groupName: '',
  status: undefined as number | undefined
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const formData = reactive({
  id: undefined as number | undefined,
  groupName: '',
  groupCode: '',
  description: '',
  status: 1
})

const formRules: FormRules = {
  groupName: [{ required: true, message: '请输入分组名称', trigger: 'blur' }],
  groupCode: [{ required: true, message: '请输入分组编码', trigger: 'blur' }]
}

const loadData = async () =&gt; {
  loading.value = true
  try {
    const res = await request.get('/api/v1/executor-group', {
      params: {
        current: pagination.current,
        size: pagination.size,
        ...searchForm
      }
    })
    tableData.value = res.data.data.records
    pagination.total = res.data.data.total
  } catch (e) {
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const resetSearch = () =&gt; {
  searchForm.groupName = ''
  searchForm.status = undefined
  pagination.current = 1
  loadData()
}

const showCreateDialog = () =&gt; {
  isEdit.value = false
  Object.assign(formData, {
    id: undefined,
    groupName: '',
    groupCode: '',
    description: '',
    status: 1
  })
  dialogVisible.value = true
}

const showEditDialog = (row: any) =&gt; {
  isEdit.value = true
  Object.assign(formData, {
    id: row.id,
    groupName: row.groupName,
    groupCode: row.groupCode,
    description: row.description,
    status: row.status
  })
  dialogVisible.value = true
}

const handleSubmit = async () =&gt; {
  await formRef.value?.validate()
  submitLoading.value = true
  try {
    if (isEdit.value) {
      await request.put(`/api/v1/executor-group/${formData.id}`, formData)
      ElMessage.success('更新成功')
    } else {
      await request.post('/api/v1/executor-group', formData)
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (e) {
    ElMessage.error(isEdit.value ? '更新失败' : '创建失败')
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = async (row: any) =&gt; {
  try {
    await ElMessageBox.confirm('确定要删除该分组吗？', '提示', {
      type: 'warning'
    })
    await request.delete(`/api/v1/executor-group/${row.id}`)
    ElMessage.success('删除成功')
    loadData()
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() =&gt; {
  loadData()
})
&lt;/script&gt;

&lt;style scoped&gt;
.executor-group-manager {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.search-form {
  margin-bottom: 20px;
}
&lt;/style&gt;

