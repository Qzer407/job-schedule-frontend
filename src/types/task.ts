export interface TaskInfo {
  id: number
  taskName: string
  taskGroup: string
  cronExpression: string
  executorHandler: string
  executorParam?: string
  shardingTotal?: number
  shardingParam?: string
  retryCount?: number
  alarmStatus?: number
  status: number
  description?: string
  createTime?: string
  updateTime?: string
}

export interface TaskCreateRequest {
  taskName: string
  taskGroup: string
  cronExpression: string
  executorHandler: string
  executorParam?: string
  shardingTotal?: number
  shardingParam?: string
  retryCount?: number
  alarmStatus?: number
  description?: string
}

export interface TaskUpdateRequest extends TaskCreateRequest {}

export interface TaskLog {
  id: number
  taskId: number
  taskName: string
  executorAddress?: string
  shardingIndex?: number
  shardingParam?: string
  triggerTime: string
  startTime?: string
  endTime?: string
  duration?: number
  executionStatus: number
  executionLog?: string
  errorMsg?: string
  createTime?: string
}
