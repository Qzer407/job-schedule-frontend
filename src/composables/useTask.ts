import { ref } from 'vue'
import { 
  getTaskList, getTask, createTask, updateTask, deleteTask, 
  startTask, stopTask, triggerTask 
} from '@/api'
import type { TaskInfo, TaskCreateRequest, TaskUpdateRequest } from '@/types'
import { ElMessage } from 'element-plus'

export function useTask() {
  const loading = ref(false)
  const taskList = ref<TaskInfo[]>([])
  const currentTask = ref<TaskInfo | null>(null)

  const fetchTaskList = async (params?: any) => {
    loading.value = true
    try {
      const response = await getTaskList(params)
      taskList.value = response.data.data.records || []
      return taskList.value
    } finally {
      loading.value = false
    }
  }

  const fetchTask = async (id: number) => {
    loading.value = true
    try {
      const response = await getTask(id)
      currentTask.value = response.data.data
      return currentTask.value
    } finally {
      loading.value = false
    }
  }

  const create = async (data: TaskCreateRequest) => {
    loading.value = true
    try {
      await createTask(data)
      ElMessage.success('创建成功')
      return true
    } catch (error) {
      ElMessage.error('创建失败')
      return false
    } finally {
      loading.value = false
    }
  }

  const update = async (id: number, data: TaskUpdateRequest) => {
    loading.value = true
    try {
      await updateTask(id, data)
      ElMessage.success('更新成功')
      return true
    } catch (error) {
      ElMessage.error('更新失败')
      return false
    } finally {
      loading.value = false
    }
  }

  const remove = async (id: number) => {
    try {
      await deleteTask(id)
      ElMessage.success('删除成功')
      return true
    } catch (error) {
      ElMessage.error('删除失败')
      return false
    }
  }

  const start = async (id: number) => {
    try {
      await startTask(id)
      ElMessage.success('启动成功')
      return true
    } catch (error) {
      ElMessage.error('启动失败')
      return false
    }
  }

  const stop = async (id: number) => {
    try {
      await stopTask(id)
      ElMessage.success('停止成功')
      return true
    } catch (error) {
      ElMessage.error('停止失败')
      return false
    }
  }

  const trigger = async (id: number, executorParam?: string) => {
    try {
      await triggerTask(id, { executorParam })
      ElMessage.success('触发成功')
      return true
    } catch (error) {
      ElMessage.error('触发失败')
      return false
    }
  }

  return {
    loading,
    taskList,
    currentTask,
    fetchTaskList,
    fetchTask,
    create,
    update,
    remove,
    start,
    stop,
    trigger
  }
}
