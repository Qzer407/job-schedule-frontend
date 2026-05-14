
&lt;template&gt;
  &lt;div class="audit-log-list"&gt;
    &lt;el-card&gt;
      &lt;template #header&gt;
        &lt;span&gt;审计日志&lt;/span&gt;
      &lt;/template&gt;

      &lt;el-form :inline="true" :model="searchForm" class="search-form"&gt;
        &lt;el-form-item label="模块"&gt;
          &lt;el-select v-model="searchForm.module" placeholder="请选择" clearable&gt;
            &lt;el-option label="任务管理" value="任务管理" /&gt;
            &lt;el-option label="工作流" value="工作流" /&gt;
            &lt;el-option label="告警管理" value="告警管理" /&gt;
            &lt;el-option label="用户认证" value="用户认证" /&gt;
            &lt;el-option label="监控中心" value="监控中心" /&gt;
            &lt;el-option label="执行器分组" value="执行器分组" /&gt;
          &lt;/el-select&gt;
        &lt;/el-form-item&gt;
        &lt;el-form-item label="状态"&gt;
          &lt;el-select v-model="searchForm.status" placeholder="请选择" clearable&gt;
            &lt;el-option label="成功" :value="1" /&gt;
            &lt;el-option label="失败" :value="0" /&gt;
          &lt;/el-select&gt;
        &lt;/el-form-item&gt;
        &lt;el-form-item&gt;
          &lt;el-button type="primary" @click="loadData"&gt;查询&lt;/el-button&gt;
          &lt;el-button @click="resetSearch"&gt;重置&lt;/el-button&gt;
        &lt;/el-form-item&gt;
      &lt;/el-form&gt;

      &lt;el-table :data="tableData" v-loading="loading" border stripe max-height="600"&gt;
        &lt;el-table-column prop="id" label="ID" width="80" /&gt;
        &lt;el-table-column prop="module" label="模块" width="120" /&gt;
        &lt;el-table-column prop="operation" label="操作" width="120" /&gt;
        &lt;el-table-column prop="requestMethod" label="方法" width="80" /&gt;
        &lt;el-table-column prop="requestUrl" label="URL" show-overflow-tooltip width="200" /&gt;
        &lt;el-table-column prop="ipAddress" label="IP地址" width="130" /&gt;
        &lt;el-table-column prop="costTime" label="耗时(ms)" width="100"&gt;
          &lt;template #default="{ row }"&gt;
            &lt;el-tag :type="row.costTime &gt; 1000 ? 'warning' : 'success'" size="small"&gt;
              {{ row.costTime }}
            &lt;/el-tag&gt;
          &lt;/template&gt;
        &lt;/el-table-column&gt;
        &lt;el-table-column prop="status" label="状态" width="100"&gt;
          &lt;template #default="{ row }"&gt;
            &lt;el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small"&gt;
              {{ row.status === 1 ? '成功' : '失败' }}
            &lt;/el-tag&gt;
          &lt;/template&gt;
        &lt;/el-table-column&gt;
        &lt;el-table-column prop="createTime" label="创建时间" width="180" /&gt;
        &lt;el-table-column label="操作" width="80" fixed="right"&gt;
          &lt;template #default="{ row }"&gt;
            &lt;el-button type="primary" link size="small" @click="showDetail(row)"&gt;详情&lt;/el-button&gt;
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

    &lt;el-dialog v-model="detailVisible" title="日志详情" width="700px"&gt;
      &lt;el-descriptions v-if="currentRow" :column="2" border&gt;
        &lt;el-descriptions-item label="ID"&gt;{{ currentRow.id }}&lt;/el-descriptions-item&gt;
        &lt;el-descriptions-item label="模块"&gt;{{ currentRow.module }}&lt;/el-descriptions-item&gt;
        &lt;el-descriptions-item label="操作"&gt;{{ currentRow.operation }}&lt;/el-descriptions-item&gt;
        &lt;el-descriptions-item label="状态"&gt;
          &lt;el-tag :type="currentRow.status === 1 ? 'success' : 'danger'" size="small"&gt;
            {{ currentRow.status === 1 ? '成功' : '失败' }}
          &lt;/el-tag&gt;
        &lt;/el-descriptions-item&gt;
        &lt;el-descriptions-item label="请求方法" :span="2"&gt;{{ currentRow.requestMethod }}&lt;/el-descriptions-item&gt;
        &lt;el-descriptions-item label="请求URL" :span="2"&gt;{{ currentRow.requestUrl }}&lt;/el-descriptions-item&gt;
        &lt;el-descriptions-item label="IP地址"&gt;{{ currentRow.ipAddress }}&lt;/el-descriptions-item&gt;
        &lt;el-descriptions-item label="耗时"&gt;{{ currentRow.costTime }}ms&lt;/el-descriptions-item&gt;
        &lt;el-descriptions-item label="请求参数" :span="2"&gt;
          &lt;el-input v-model="currentRow.requestParams" type="textarea" :rows="3" readonly /&gt;
        &lt;/el-descriptions-item&gt;
        &lt;el-descriptions-item label="错误信息" :span="2" v-if="currentRow.errorMessage"&gt;
          &lt;el-input v-model="currentRow.errorMessage" type="textarea" :rows="2" readonly /&gt;
        &lt;/el-descriptions-item&gt;
        &lt;el-descriptions-item label="创建时间" :span="2"&gt;{{ currentRow.createTime }}&lt;/el-descriptions-item&gt;
      &lt;/el-descriptions&gt;
    &lt;/el-dialog&gt;
  &lt;/div&gt;
&lt;/template&gt;

&lt;script setup lang="ts"&gt;
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/api'

const loading = ref(false)
const detailVisible = ref(false)
const currentRow = ref&lt;any&gt;(null)
const tableData = ref&lt;any[]&gt;([])

const searchForm = reactive({
  module: '',
  status: undefined as number | undefined
})

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const loadData = async () =&gt; {
  loading.value = true
  try {
    const res = await request.get('/api/v1/audit-log', {
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
  searchForm.module = ''
  searchForm.status = undefined
  pagination.current = 1
  loadData()
}

const showDetail = (row: any) =&gt; {
  currentRow.value = row
  detailVisible.value = true
}

onMounted(() =&gt; {
  loadData()
})
&lt;/script&gt;

&lt;style scoped&gt;
.audit-log-list {
  padding: 20px;
}
.search-form {
  margin-bottom: 20px;
}
&lt;/style&gt;

