<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getAlarmConfigList,
  createAlarmConfig,
  updateAlarmConfig,
  deleteAlarmConfig
} from '@/api'
import type { AlarmConfig, AlarmCreateRequest } from '@/types'

const configList = ref<AlarmConfig[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加告警渠道')
const submitLoading = ref(false)
const isEdit = ref(false)

const form = reactive<AlarmCreateRequest>({
  channelType: '',
  channelName: '',
  enabled: true,
  channelConfig: ''
})

const getChannelTypeName = (type: string): string => {
  const map: Record<string, string> = {
    EMAIL: '邮件',
    WECHAT: '企业微信',
    DINGTALK: '钉钉'
  }
  return map[type] || type
}

const getChannelTypeTag = (type: string): string => {
  const map: Record<string, string> = {
    EMAIL: 'primary',
    WECHAT: 'success',
    DINGTALK: 'warning'
  }
  return map[type] || 'info'
}

const getConfigPlaceholder = (): string => {
  const placeholders: Record<string, string> = {
    EMAIL: '请输入邮件配置(JSON):\n{"to": "admin@example.com", "from": "noreply@example.com"}',
    WECHAT: '请输入企业微信配置(JSON):\n{"webhookUrl": "https://qyapi.weixin.qq.com/..."}',
    DINGTALK: '请输入钉钉配置(JSON):\n{"webhookUrl": "https://oapi.dingtalk.com/...", "secret": "..."}'
  }
  return placeholders[form.channelType] || '请输入配置信息(JSON格式)'
}

const formatDate = (date?: string): string => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getAlarmConfigList()
    configList.value = res.data.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '添加告警渠道'
  form.channelType = ''
  form.channelName = ''
  form.enabled = true
  form.channelConfig = ''
  dialogVisible.value = true
}

const handleEdit = (row: AlarmConfig) => {
  isEdit.value = true
  dialogTitle.value = '编辑告警渠道'
  form.channelType = row.channelType
  form.channelName = row.channelName || ''
  form.enabled = row.enabled
  form.channelConfig = row.channelConfig || ''
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.channelType || !form.channelName || !form.channelConfig) {
    ElMessage.warning('请填写完整信息')
    return
  }

  submitLoading.value = true
  try {
    if (isEdit.value) {
      await updateAlarmConfig(form.channelType, form)
      ElMessage.success('更新成功')
    } else {
      await createAlarmConfig(form)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (e) {
    console.error(e)
  } finally {
    submitLoading.value = false
  }
}

const handleToggle = async (row: AlarmConfig) => {
  try {
    await updateAlarmConfig(row.channelType, {
      ...row,
      enabled: !row.enabled
    })
    ElMessage.success(row.enabled ? '已禁用' : '已启用')
    loadData()
  } catch (e) {
    console.error(e)
  }
}

const handleDelete = (row: AlarmConfig) => {
  ElMessageBox.confirm('确定要删除该告警渠道吗？', '提示', {
    type: 'warning'
  }).then(async () => {
    try {
      await deleteAlarmConfig(row.channelType)
      ElMessage.success('删除成功')
      loadData()
    } catch (e) {
      console.error(e)
    }
  }).catch(() => {})
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="alarm-config">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>告警配置</span>
          <el-button type="primary" @click="handleAdd">添加渠道</el-button>
        </div>
      </template>

      <el-table :data="configList" border stripe v-loading="loading">
        <el-table-column prop="channelType" label="渠道类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getChannelTypeTag(row.channelType)">
              {{ getChannelTypeName(row.channelType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="channelName" label="渠道名称" width="150" />
        <el-table-column prop="enabled" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'">
              {{ row.enabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link :type="row.enabled ? 'warning' : 'success'" @click="handleToggle(row)">
              {{ row.enabled ? '禁用' : '启用' }}
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" destroy-on-close>
      <el-form :model="form" label-width="100px">
        <el-form-item label="渠道类型" required>
          <el-select v-model="form.channelType" placeholder="请选择渠道类型" :disabled="isEdit">
            <el-option label="邮件" value="EMAIL" />
            <el-option label="企业微信" value="WECHAT" />
            <el-option label="钉钉" value="DINGTALK" />
          </el-select>
        </el-form-item>
        <el-form-item label="渠道名称" required>
          <el-input v-model="form.channelName" placeholder="请输入渠道名称" />
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch v-model="form.enabled" :active-value="true" :inactive-value="false" />
        </el-form-item>
        <el-form-item label="配置信息" required>
          <el-input
            v-model="form.channelConfig"
            type="textarea"
            :rows="4"
            :placeholder="getConfigPlaceholder()"
          />
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
.alarm-config {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
