import { ref } from 'vue'
import {
  getAlarmConfigList, createAlarmConfig, updateAlarmConfig,
  deleteAlarmConfig, testAlarmChannel, getAlarmRecords
} from '@/api'
import type { AlarmConfig, AlarmCreateRequest } from '@/types'
import { ElMessage } from 'element-plus'

export function useAlarm() {
  const loading = ref(false)
  const alarmConfigList = ref<AlarmConfig[]>([])

  const fetchConfigList = async () => {
    loading.value = true
    try {
      const response = await getAlarmConfigList()
      alarmConfigList.value = response.data.data || []
      return alarmConfigList.value
    } finally {
      loading.value = false
    }
  }

  const create = async (data: AlarmCreateRequest) => {
    loading.value = true
    try {
      await createAlarmConfig(data)
      ElMessage.success('创建成功')
      await fetchConfigList()
      return true
    } catch (error) {
      ElMessage.error('创建失败')
      return false
    } finally {
      loading.value = false
    }
  }

  const update = async (channelType: string, data: AlarmCreateRequest) => {
    loading.value = true
    try {
      await updateAlarmConfig(channelType, data)
      ElMessage.success('更新成功')
      await fetchConfigList()
      return true
    } catch (error) {
      ElMessage.error('更新失败')
      return false
    } finally {
      loading.value = false
    }
  }

  const remove = async (channelType: string) => {
    try {
      await deleteAlarmConfig(channelType)
      ElMessage.success('删除成功')
      await fetchConfigList()
      return true
    } catch (error) {
      ElMessage.error('删除失败')
      return false
    }
  }

  const test = async (channelType: string) => {
    try {
      await testAlarmChannel(channelType)
      ElMessage.success('测试消息已发送')
      return true
    } catch (error) {
      ElMessage.error('测试失败')
      return false
    }
  }

  const fetchRecords = async (params?: any) => {
    loading.value = true
    try {
      const response = await getAlarmRecords(params)
      return response.data.data
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    alarmConfigList,
    fetchConfigList,
    create,
    update,
    remove,
    test,
    fetchRecords
  }
}
