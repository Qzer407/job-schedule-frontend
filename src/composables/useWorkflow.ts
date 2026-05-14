import { ref } from 'vue'
import {
  getWorkflowList, getWorkflow, createWorkflow, updateWorkflow,
  deleteWorkflow, executeWorkflow, pauseWorkflow, terminateWorkflow
} from '@/api'
import type { Workflow, WorkflowCreateRequest } from '@/types'
import { ElMessage } from 'element-plus'

export function useWorkflow() {
  const loading = ref(false)
  const workflowList = ref<Workflow[]>([])
  const currentWorkflow = ref<Workflow | null>(null)

  const fetchWorkflowList = async (params?: any) => {
    loading.value = true
    try {
      const response = await getWorkflowList(params)
      workflowList.value = response.data.data.records || []
      return workflowList.value
    } finally {
      loading.value = false
    }
  }

  const fetchWorkflow = async (id: number) => {
    loading.value = true
    try {
      const response = await getWorkflow(id)
      currentWorkflow.value = response.data.data
      return currentWorkflow.value
    } finally {
      loading.value = false
    }
  }

  const create = async (data: WorkflowCreateRequest) => {
    loading.value = true
    try {
      await createWorkflow(data)
      ElMessage.success('创建成功')
      return true
    } catch (error) {
      ElMessage.error('创建失败')
      return false
    } finally {
      loading.value = false
    }
  }

  const update = async (id: number, data: WorkflowCreateRequest) => {
    loading.value = true
    try {
      await updateWorkflow(id, data)
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
      await deleteWorkflow(id)
      ElMessage.success('删除成功')
      return true
    } catch (error) {
      ElMessage.error('删除失败')
      return false
    }
  }

  const execute = async (id: number) => {
    try {
      await executeWorkflow(id)
      ElMessage.success('执行成功')
      return true
    } catch (error) {
      ElMessage.error('执行失败')
      return false
    }
  }

  const pause = async (id: number) => {
    try {
      await pauseWorkflow(id)
      ElMessage.success('暂停成功')
      return true
    } catch (error) {
      ElMessage.error('暂停失败')
      return false
    }
  }

  const terminate = async (id: number) => {
    try {
      await terminateWorkflow(id)
      ElMessage.success('终止成功')
      return true
    } catch (error) {
      ElMessage.error('终止失败')
      return false
    }
  }

  return {
    loading,
    workflowList,
    currentWorkflow,
    fetchWorkflowList,
    fetchWorkflow,
    create,
    update,
    remove,
    execute,
    pause,
    terminate
  }
}
