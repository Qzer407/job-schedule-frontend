export interface MonitorStatistics {
  totalTaskCount: number
  runningTaskCount: number
  successRate: number
  avgDuration: number
  todayExecuteCount: number
  todayFailCount: number
}

export interface ExecutorInfo {
  id: number
  executorName: string
  executorAddress: string
  executorGroup: string
  status: number
  lastHeartbeat?: string
  createTime?: string
  updateTime?: string
}
