export interface AlarmConfig {
  id: number
  channelType: string
  channelName?: string
  channelConfig: string
  enabled: boolean
  createTime?: string
  updateTime?: string
}

export interface AlarmRecord {
  id: number
  taskId?: number
  taskName?: string
  alarmType: string
  alarmLevel?: string
  alarmTitle: string
  alarmContent?: string
  alarmChannel: string
  alarmTime?: string
  sendStatus: number
  errorMsg?: string
  createTime?: string
}

export interface AlarmCreateRequest {
  channelType: string
  channelName?: string
  channelConfig: string
  enabled?: boolean
}
