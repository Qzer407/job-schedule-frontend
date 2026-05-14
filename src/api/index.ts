import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import type { ApiResponse, PageParams, PageResult } from '@/types'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000
})

request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return response
  },
  (error: AxiosError<ApiResponse>) => {
    if (error.response?.data?.code === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      const router = useRouter()
      router.push('/login')
      ElMessage.error('登录已过期，请重新登录')
    } else {
      ElMessage.error(error.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

export { request }

export * from '@/types'

import type {
  User,
  TaskInfo,
  TaskCreateRequest,
  TaskUpdateRequest,
  TaskLog,
  AlarmConfig,
  AlarmRecord,
  AlarmCreateRequest,
  Workflow,
  WorkflowCreateRequest,
  TaskDependency,
  DependencyCreateRequest,
  MonitorStatistics,
  ExecutorInfo
} from '@/types'

export const login = (data: { username: string; password: string }) => {
  return request.post<ApiResponse<{ token: string; tokenType: string; user: User }>>('/api/v1/auth/login', data)
}

export const register = (data: { username: string; password: string; email?: string; role?: string }) => {
  return request.post<ApiResponse<void>>('/api/v1/auth/register', data)
}

export const getCurrentUser = () => {
  return request.get<ApiResponse<User>>('/api/v1/auth/me')
}

export const logout = () => {
  return request.post<ApiResponse<void>>('/api/v1/auth/logout')
}

export const getTaskList = (params?: PageParams) => {
  return request.get<ApiResponse<PageResult<TaskInfo>>>('/api/v1/tasks', { params })
}

export const getTask = (id: number) => {
  return request.get<ApiResponse<TaskInfo>>(`/api/v1/tasks/${id}`)
}

export const createTask = (data: TaskCreateRequest) => {
  return request.post<ApiResponse<TaskInfo>>('/api/v1/tasks', data)
}

export const updateTask = (id: number, data: TaskUpdateRequest) => {
  return request.put<ApiResponse<TaskInfo>>(`/api/v1/tasks/${id}`, data)
}

export const deleteTask = (id: number) => {
  return request.delete<ApiResponse<void>>(`/api/v1/tasks/${id}`)
}

export const startTask = (id: number) => {
  return request.post<ApiResponse<void>>(`/api/v1/tasks/${id}/start`)
}

export const stopTask = (id: number) => {
  return request.post<ApiResponse<void>>(`/api/v1/tasks/${id}/stop`)
}

export const triggerTask = (id: number, params?: { executorParam?: string }) => {
  return request.post<ApiResponse<void>>(`/api/v1/tasks/${id}/trigger`, null, { params })
}

export const getAlarmConfigList = () => {
  return request.get<ApiResponse<AlarmConfig[]>>('/api/v1/alarms/config')
}

export const getAlarmConfig = (channelType: string) => {
  return request.get<ApiResponse<AlarmConfig>>(`/api/v1/alarms/config/${channelType}`)
}

export const createAlarmConfig = (data: AlarmCreateRequest) => {
  return request.post<ApiResponse<AlarmConfig>>('/api/v1/alarms/config', data)
}

export const updateAlarmConfig = (channelType: string, data: AlarmCreateRequest) => {
  return request.put<ApiResponse<void>>(`/api/v1/alarms/config/${channelType}`, data)
}

export const deleteAlarmConfig = (channelType: string) => {
  return request.delete<ApiResponse<void>>(`/api/v1/alarms/config/${channelType}`)
}

export const testAlarmChannel = (channelType: string) => {
  return request.post<ApiResponse<void>>(`/api/v1/alarms/test/${channelType}`)
}

export const getAlarmRecords = (params?: PageParams) => {
  return request.get<ApiResponse<PageResult<AlarmRecord>>>('/api/v1/alarms/records', { params })
}

export const getWorkflowList = (params?: PageParams) => {
  return request.get<ApiResponse<PageResult<Workflow>>>('/api/v1/workflows', { params })
}

export const getWorkflow = (id: number) => {
  return request.get<ApiResponse<Workflow>>(`/api/v1/workflows/${id}`)
}

export const createWorkflow = (data: WorkflowCreateRequest) => {
  return request.post<ApiResponse<Workflow>>('/api/v1/workflows', data)
}

export const updateWorkflow = (id: number, data: WorkflowCreateRequest) => {
  return request.put<ApiResponse<void>>(`/api/v1/workflows/${id}`, data)
}

export const deleteWorkflow = (id: number) => {
  return request.delete<ApiResponse<void>>(`/api/v1/workflows/${id}`)
}

export const executeWorkflow = (id: number) => {
  return request.post<ApiResponse<void>>(`/api/v1/workflows/${id}/execute`)
}

export const pauseWorkflow = (id: number) => {
  return request.post<ApiResponse<void>>(`/api/v1/workflows/${id}/pause`)
}

export const terminateWorkflow = (id: number) => {
  return request.post<ApiResponse<void>>(`/api/v1/workflows/${id}/terminate`)
}

export const getWorkflowDependencies = (id: number) => {
  return request.get<ApiResponse<TaskDependency[]>>(`/api/v1/workflows/${id}/dependencies`)
}

export const addTaskDependency = (workflowId: number, data: DependencyCreateRequest) => {
  return request.post<ApiResponse<void>>(`/api/v1/workflows/${workflowId}/dependencies`, data)
}

export const getStatistics = () => {
  return request.get<ApiResponse<MonitorStatistics>>('/api/v1/monitor/statistics')
}

export const getExecutors = (params?: PageParams) => {
  return request.get<ApiResponse<PageResult<ExecutorInfo>>>('/api/v1/monitor/executors', { params })
}

export const getTaskLogs = (params?: PageParams) => {
  return request.get<ApiResponse<PageResult<TaskLog>>>('/api/v1/logs', { params })
}

export const getTaskLog = (id: number) => {
  return request.get<ApiResponse<TaskLog>>(`/api/v1/logs/${id}`)
}

export const deleteTaskLog = (id: number) => {
  return request.delete<ApiResponse<void>>(`/api/v1/logs/${id}`)
}
