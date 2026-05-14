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

// Executor Group APIs
export interface ExecutorGroup {
  id: number
  groupName: string
  groupCode: string
  description: string
  status: number
  createTime: string
  updateTime: string
}

export interface ExecutorGroupCreateRequest {
  groupName: string
  groupCode: string
  description?: string
  status?: number
}

export interface ExecutorGroupUpdateRequest {
  groupName?: string
  groupCode?: string
  description?: string
  status?: number
}

export const getExecutorGroupList = (params?: PageParams & { groupName?: string; status?: number }) => {
  return request.get<ApiResponse<PageResult<ExecutorGroup>>>('/api/v1/executor-group', { params })
}

export const getExecutorGroup = (id: number) => {
  return request.get<ApiResponse<ExecutorGroup>>(`/api/v1/executor-group/${id}`)
}

export const createExecutorGroup = (data: ExecutorGroupCreateRequest) => {
  return request.post<ApiResponse<ExecutorGroup>>('/api/v1/executor-group', data)
}

export const updateExecutorGroup = (id: number, data: ExecutorGroupUpdateRequest) => {
  return request.put<ApiResponse<ExecutorGroup>>(`/api/v1/executor-group/${id}`, data)
}

export const deleteExecutorGroup = (id: number) => {
  return request.delete<ApiResponse<void>>(`/api/v1/executor-group/${id}`)
}

// Audit Log APIs
export interface AuditLog {
  id: number
  userId: number
  username: string
  operation: string
  module: string
  description: string
  requestMethod: string
  requestUrl: string
  requestParams: string
  responseResult: string
  ipAddress: string
  status: number
  costTime: number
  errorMessage: string
  createTime: string
}

export const getAuditLogList = (params?: PageParams & { module?: string; status?: number }) => {
  return request.get<ApiResponse<PageResult<AuditLog>>>('/api/v1/audit-log', { params })
}

export const getAuditLog = (id: number) => {
  return request.get<ApiResponse<AuditLog>>(`/api/v1/audit-log/${id}`)
}

// Schedule Log APIs
export interface ScheduleLog {
  id: number
  taskId: number
  taskName: string
  scheduleTime: string
  triggerType: string
  status: number
  errorMessage: string
  costTime: number
  createTime: string
}

export const getScheduleLogList = (params?: PageParams & { taskId?: number; status?: number }) => {
  return request.get<ApiResponse<PageResult<ScheduleLog>>>('/api/v1/schedule-log', { params })
}

export const getScheduleLog = (id: number) => {
  return request.get<ApiResponse<ScheduleLog>>(`/api/v1/schedule-log/${id}`)
}

// Health Check API
export interface HealthStatus {
  status: string
  components: {
    database?: { status: string; message?: string }
    redis?: { status: string; message?: string }
    xxlJob?: { status: string; message?: string }
  }
}

export const getHealthStatus = () => {
  return request.get<ApiResponse<HealthStatus>>('/api/v1/health')
}

// Report API
export interface ExecutionReport {
  totalExecutions: number
  successRate: number
  avgCostTime: number
  executionsByDay: Array<{ date: string; count: number; successCount: number; failCount: number }>
  topFailedTasks: Array<{ taskId: number; taskName: string; failCount: number }>
}

export const getExecutionReport = () => {
  return request.get<ApiResponse<ExecutionReport>>('/api/v1/report/execution')
}

// SubTask APIs
export interface SubTask {
  id: number
  parentTaskId: number
  taskName: string
  taskDesc: string
  executeType: string
  cronExpression: string
  routeStrategy: string
  executorHandler: string
  executorParam: string
  status: number
  createTime: string
  updateTime: string
}

export interface SubTaskCreateRequest {
  taskName: string
  taskDesc?: string
  executeType?: string
  cronExpression?: string
  routeStrategy?: string
  executorHandler?: string
  executorParam?: string
}

export interface SubTaskUpdateRequest {
  taskName?: string
  taskDesc?: string
  executeType?: string
  cronExpression?: string
  routeStrategy?: string
  executorHandler?: string
  executorParam?: string
  status?: number
}

export const getSubTaskList = (parentTaskId: number, params?: PageParams) => {
  return request.get<ApiResponse<PageResult<SubTask>>>(`/api/v1/sub-tasks`, { params: { ...params, parentTaskId } })
}

export const getSubTask = (id: number) => {
  return request.get<ApiResponse<SubTask>>(`/api/v1/sub-tasks/${id}`)
}

export const createSubTask = (parentTaskId: number, data: SubTaskCreateRequest) => {
  return request.post<ApiResponse<SubTask>>(`/api/v1/sub-tasks?parentTaskId=${parentTaskId}`, data)
}

export const updateSubTask = (id: number, data: SubTaskUpdateRequest) => {
  return request.put<ApiResponse<SubTask>>(`/api/v1/sub-tasks/${id}`, data)
}

export const deleteSubTask = (id: number) => {
  return request.delete<ApiResponse<void>>(`/api/v1/sub-tasks/${id}`)
}

// Workflow Template APIs
export interface WorkflowTemplate {
  id: number
  templateName: string
  templateType: string
  description: string
  templateData: string
  createTime: string
  updateTime: string
}

export interface WorkflowTemplateCreateRequest {
  templateName: string
  templateType: string
  description?: string
  templateData: string
}

export interface WorkflowTemplateUpdateRequest {
  templateName?: string
  templateType?: string
  description?: string
  templateData?: string
}

export const getWorkflowTemplateList = (params?: { templateType?: string }) => {
  return request.get<ApiResponse<WorkflowTemplate[]>>('/api/v1/workflow-templates', { params })
}

export const getWorkflowTemplate = (id: number) => {
  return request.get<ApiResponse<WorkflowTemplate>>(`/api/v1/workflow-templates/${id}`)
}

export const createWorkflowTemplate = (data: WorkflowTemplateCreateRequest) => {
  return request.post<ApiResponse<WorkflowTemplate>>('/api/v1/workflow-templates', data)
}

export const updateWorkflowTemplate = (id: number, data: WorkflowTemplateUpdateRequest) => {
  return request.put<ApiResponse<WorkflowTemplate>>(`/api/v1/workflow-templates/${id}`, data)
}

export const deleteWorkflowTemplate = (id: number) => {
  return request.delete<ApiResponse<void>>(`/api/v1/workflow-templates/${id}`)
}

export const applyWorkflowTemplate = (id: number) => {
  return request.post<ApiResponse<Workflow>>(`/api/v1/workflow-templates/${id}/apply`)
}

// Message Queue APIs
export interface MessageTask {
  id: number
  taskId: number
  taskName: string
  messageId: string
  queueName: string
  messageType: string
  payload: string
  status: number
  delayTime: number
  executeTime: string
  retryCount: number
  maxRetry: number
  errorMessage: string
  createTime: string
  updateTime: string
}

export interface AsyncTaskRequest {
  taskId?: number
  taskName?: string
  payload: string
  maxRetry?: number
}

export interface DelayTaskRequest {
  taskId?: number
  taskName?: string
  payload: string
  delayTime: number
  maxRetry?: number
}

export const submitAsyncTask = (data: AsyncTaskRequest) => {
  return request.post<ApiResponse<{ messageId: string }>>('/api/v1/message/task', data)
}

export const submitDelayTask = (data: DelayTaskRequest) => {
  return request.post<ApiResponse<{ messageId: string }>>('/api/v1/message/task/delay', data)
}

export const getMessageTaskList = (params?: PageParams & { status?: number }) => {
  return request.get<ApiResponse<PageResult<MessageTask>>>('/api/v1/message/task', { params })
}

export const getMessageTask = (id: number) => {
  return request.get<ApiResponse<MessageTask>>(`/api/v1/message/task/${id}`)
}

export const cancelMessageTask = (id: number) => {
  return request.delete<ApiResponse<void>>(`/api/v1/message/task/${id}`)
}

export const retryMessageTask = (id: number) => {
  return request.post<ApiResponse<void>>(`/api/v1/message/task/${id}/retry`)
}

// Cluster APIs
export interface ClusterNode {
  id: number
  nodeId: string
  nodeName: string
  nodeIp: string
  nodePort: number
  status: number
  role: string
  lastHeartbeat: string
  cpuLoad?: number
  memoryUsage?: number
  createTime: string
  updateTime: string
}

export interface TaskShard {
  id: number
  taskId: number
  shardKey?: string
  assignedNodeId?: string
  shardStatus: number
  createTime: string
  updateTime: string
}

export interface ClusterEvent {
  id: number
  eventType: string
  eventData?: string
  eventTime: string
  sourceNode?: string
  targetNode?: string
  createTime: string
}

export interface FailureRecord {
  id: number
  nodeId: string
  failureType: string
  failureDetail?: string
  recoveryStatus: number
  failureTime: string
  recoveryTime?: string
  createTime: string
  updateTime: string
}

export interface ClusterStatus {
  totalNodes: number
  onlineNodes: number
  failedNodes: number
}

export interface NodeRegisterRequest {
  nodeName: string
  nodeIp: string
  nodePort: number
  role: string
}

export interface TaskAssignRequest {
  taskId: number
  nodeId: string
}

export interface TaskMigrateRequest {
  targetNodeId: string
}

export const registerClusterNode = (data: NodeRegisterRequest) => {
  return request.post<ApiResponse<string>>('/api/v1/cluster/nodes/register', data)
}

export const sendNodeHeartbeat = (nodeId: string) => {
  return request.post<ApiResponse<void>>(`/api/v1/cluster/nodes/${nodeId}/heartbeat`)
}

export const getClusterNodes = () => {
  return request.get<ApiResponse<ClusterNode[]>>('/api/v1/cluster/nodes')
}

export const getClusterNode = (nodeId: string) => {
  return request.get<ApiResponse<ClusterNode>>(`/api/v1/cluster/nodes/${nodeId}`)
}

export const removeClusterNode = (nodeId: string) => {
  return request.delete<ApiResponse<void>>(`/api/v1/cluster/nodes/${nodeId}`)
}

export const getTaskShards = () => {
  return request.get<ApiResponse<TaskShard[]>>('/api/v1/cluster/shards')
}

export const assignTaskToNode = (data: TaskAssignRequest) => {
  return request.post<ApiResponse<void>>('/api/v1/cluster/shards/assign', data)
}

export const rebalanceTaskShards = () => {
  return request.post<ApiResponse<void>>('/api/v1/cluster/shards/rebalance')
}

export const migrateTaskToNode = (taskId: number, data: TaskMigrateRequest) => {
  return request.post<ApiResponse<void>>(`/api/v1/cluster/shards/${taskId}/migrate`, data)
}

export const getClusterEvents = () => {
  return request.get<ApiResponse<ClusterEvent[]>>('/api/v1/cluster/events')
}

export const getFailureRecords = () => {
  return request.get<ApiResponse<FailureRecord[]>>('/api/v1/cluster/failures')
}

export const getFailureRecord = (id: number) => {
  return request.get<ApiResponse<FailureRecord>>(`/api/v1/cluster/failures/${id}`)
}

export const recoverFailure = (id: number) => {
  return request.post<ApiResponse<void>>(`/api/v1/cluster/failures/${id}/recover`)
}

export const getClusterStatus = () => {
  return request.get<ApiResponse<string>>('/api/v1/cluster/status')
}

// ==================== System Management APIs ====================

// Role APIs
export interface RoleCreateRequest {
  roleName: string
  roleCode: string
  description?: string
  status?: number
}

export interface RoleUpdateRequest {
  roleName?: string
  roleCode?: string
  description?: string
  status?: number
}

export const getRoleList = (params?: { current?: number; size?: number; roleName?: string; status?: number }) => {
  return request.get<ApiResponse<PageResult<Role>>>('/api/v1/system/role/page', { params })
}

export const getAllRoles = () => {
  return request.get<ApiResponse<Role[]>>('/api/v1/system/role/all')
}

export const getRole = (id: number) => {
  return request.get<ApiResponse<Role>>(`/api/v1/system/role/${id}`)
}

export const createRole = (data: RoleCreateRequest) => {
  return request.post<ApiResponse<Role>>('/api/v1/system/role', data)
}

export const updateRole = (id: number, data: RoleUpdateRequest) => {
  return request.put<ApiResponse<Role>>(`/api/v1/system/role/${id}`, data)
}

export const deleteRole = (id: number) => {
  return request.delete<ApiResponse<void>>(`/api/v1/system/role/${id}`)
}

export const assignRolePermissions = (roleId: number, permissionIds: number[]) => {
  return request.post<ApiResponse<void>>(`/api/v1/system/role/${roleId}/permissions`, permissionIds)
}

export const getRolePermissions = (roleId: number) => {
  return request.get<ApiResponse<number[]>>(`/api/v1/system/role/${roleId}/permissions`)
}

export const exportRoles = (params?: { roleName?: string; status?: number }) => {
  const url = '/api/v1/system/role/export'
  window.open(`${request.defaults.baseURL}${url}${params ? '?' + new URLSearchParams(params as any).toString() : ''}`)
}

// Permission APIs
export interface PermissionCreateRequest {
  permissionName: string
  permissionCode: string
  permissionType: string
  parentId?: number
  path?: string
  icon?: string
  sortOrder?: number
  status?: number
}

export interface PermissionUpdateRequest {
  permissionName?: string
  permissionCode?: string
  permissionType?: string
  parentId?: number
  path?: string
  icon?: string
  sortOrder?: number
  status?: number
}

export const getPermissionList = (params?: { current?: number; size?: number; permissionName?: string; status?: number }) => {
  return request.get<ApiResponse<PageResult<Permission>>>('/api/v1/system/permission/page', { params })
}

export const getAllPermissions = () => {
  return request.get<ApiResponse<Permission[]>>('/api/v1/system/permission/all')
}

export const getPermissionTree = () => {
  return request.get<ApiResponse<Permission[]>>('/api/v1/system/permission/tree')
}

export const getPermission = (id: number) => {
  return request.get<ApiResponse<Permission>>(`/api/v1/system/permission/${id}`)
}

export const createPermission = (data: PermissionCreateRequest) => {
  return request.post<ApiResponse<Permission>>('/api/v1/system/permission', data)
}

export const updatePermission = (id: number, data: PermissionUpdateRequest) => {
  return request.put<ApiResponse<Permission>>(`/api/v1/system/permission/${id}`, data)
}

export const deletePermission = (id: number) => {
  return request.delete<ApiResponse<void>>(`/api/v1/system/permission/${id}`)
}

export const getPermissionsByRole = (roleId: number) => {
  return request.get<ApiResponse<Permission[]>>(`/api/v1/system/permission/role/${roleId}`)
}

export const getPermissionsByUser = (userId: number) => {
  return request.get<ApiResponse<Permission[]>>(`/api/v1/system/permission/user/${userId}`)
}

// Tenant APIs
export interface TenantCreateRequest {
  tenantCode: string
  tenantName: string
  contactName?: string
  contactPhone?: string
  contactEmail?: string
  status?: number
  expireTime?: string
  maxUsers?: number
  maxTasks?: number
}

export interface TenantUpdateRequest {
  tenantName?: string
  contactName?: string
  contactPhone?: string
  contactEmail?: string
  status?: number
  expireTime?: string
  maxUsers?: number
  maxTasks?: number
}

export const getTenantList = (params?: { current?: number; size?: number; tenantName?: string; status?: number }) => {
  return request.get<ApiResponse<PageResult<Tenant>>>('/api/v1/system/tenant/page', { params })
}

export const getAllTenants = () => {
  return request.get<ApiResponse<Tenant[]>>('/api/v1/system/tenant/all')
}

export const getTenant = (id: number) => {
  return request.get<ApiResponse<Tenant>>(`/api/v1/system/tenant/${id}`)
}

export const createTenant = (data: TenantCreateRequest) => {
  return request.post<ApiResponse<Tenant>>('/api/v1/system/tenant', data)
}

export const updateTenant = (id: number, data: TenantUpdateRequest) => {
  return request.put<ApiResponse<Tenant>>(`/api/v1/system/tenant/${id}`, data)
}

export const deleteTenant = (id: number) => {
  return request.delete<ApiResponse<void>>(`/api/v1/system/tenant/${id}`)
}

export const exportTenants = () => {
  const url = '/api/v1/system/tenant/export'
  window.open(`${request.defaults.baseURL}${url}`)
}

// OAuth APIs
export interface OAuthClientCreateRequest {
  clientId: string
  clientName: string
  provider: string
  clientSecret: string
  redirectUri?: string
  scope?: string
  status?: number
}

export interface OAuthClientUpdateRequest {
  clientName?: string
  clientSecret?: string
  redirectUri?: string
  scope?: string
  status?: number
}

export const getOAuthClientList = (params?: { current?: number; size?: number; clientName?: string; status?: number }) => {
  return request.get<ApiResponse<PageResult<OAuthClient>>>('/api/v1/system/oauth/client/page', { params })
}

export const getAllOAuthClients = () => {
  return request.get<ApiResponse<OAuthClient[]>>('/api/v1/system/oauth/client/all')
}

export const getOAuthClient = (id: number) => {
  return request.get<ApiResponse<OAuthClient>>(`/api/v1/system/oauth/client/${id}`)
}

export const createOAuthClient = (data: OAuthClientCreateRequest) => {
  return request.post<ApiResponse<OAuthClient>>('/api/v1/system/oauth/client', data)
}

export const updateOAuthClient = (id: number, data: OAuthClientUpdateRequest) => {
  return request.put<ApiResponse<OAuthClient>>(`/api/v1/system/oauth/client/${id}`, data)
}

export const deleteOAuthClient = (id: number) => {
  return request.delete<ApiResponse<void>>(`/api/v1/system/oauth/client/${id}`)
}

export const bindOAuthUser = (userId: number, data: { provider: string; openid: string; nickname?: string; avatar?: string; email?: string }) => {
  return request.post<ApiResponse<OAuthUser>>(`/api/v1/system/oauth/user/${userId}/bind`, null, { params: data })
}

export const unbindOAuthUser = (userId: number, provider: string) => {
  return request.delete<ApiResponse<void>>(`/api/v1/system/oauth/user/${userId}/bind/${provider}`)
}

export const getUserOAuthBindings = (userId: number) => {
  return request.get<ApiResponse<OAuthUser[]>>(`/api/v1/system/oauth/user/${userId}/bindings`)
}

// ==================== API Management APIs ====================

// ApiKey APIs
export interface ApiKeyCreateRequest {
  userId: number
  keyName: string
  permissions?: string
  rateLimit?: number
  expireTime?: string
}

export interface ApiKeyUpdateRequest {
  keyName?: string
  permissions?: string
  rateLimit?: number
  expireTime?: string
  status?: number
}

export const getApiKeyList = (params?: { current?: number; size?: number; userId?: number; status?: number }) => {
  return request.get<ApiResponse<PageResult<ApiKey>>>('/api/v1/system/apikey/page', { params })
}

export const getUserApiKeys = (userId: number) => {
  return request.get<ApiResponse<ApiKey[]>>(`/api/v1/system/apikey/user/${userId}`)
}

export const getApiKey = (id: number) => {
  return request.get<ApiResponse<ApiKey>>(`/api/v1/system/apikey/${id}`)
}

export const createApiKey = (data: ApiKeyCreateRequest) => {
  return request.post<ApiResponse<ApiKey>>('/api/v1/system/apikey', data)
}

export const updateApiKey = (id: number, data: ApiKeyUpdateRequest) => {
  return request.put<ApiResponse<ApiKey>>(`/api/v1/system/apikey/${id}`, data)
}

export const deleteApiKey = (id: number) => {
  return request.delete<ApiResponse<void>>(`/api/v1/system/apikey/${id}`)
}

export const toggleApiKeyStatus = (id: number) => {
  return request.put<ApiResponse<void>>(`/api/v1/system/apikey/${id}/toggle`)
}

export const regenerateApiKey = (id: number) => {
  return request.post<ApiResponse<string>>(`/api/v1/system/apikey/${id}/regenerate`)
}

export const exportApiKeys = (params?: { userId?: number }) => {
  const url = '/api/v1/system/apikey/export'
  window.open(`${request.defaults.baseURL}${url}${params ? '?' + new URLSearchParams(params as any).toString() : ''}`)
}

// ApiLog APIs
export const getApiLogList = (params?: { 
  current?: number; 
  size?: number; 
  apiKeyId?: number; 
  userId?: number; 
  endpoint?: string; 
  method?: string;
  startTime?: string;
  endTime?: string;
}) => {
  return request.get<ApiResponse<PageResult<ApiLog>>>('/api/v1/system/apilog/page', { params })
}

export const getApiLog = (id: number) => {
  return request.get<ApiResponse<ApiLog>>(`/api/v1/system/apilog/${id}`)
}

export const deleteOldApiLogs = (before: string) => {
  return request.delete<ApiResponse<void>>('/api/v1/system/apilog/old', { params: { before } })
}

// ==================== Profile API ====================
export interface UpdatePasswordRequest {
  userId: number
  oldPassword: string
  newPassword: string
}

export const updatePassword = (data: UpdatePasswordRequest) => {
  return request.post<ApiResponse<void>>('/api/v1/auth/change-password', data)
}
