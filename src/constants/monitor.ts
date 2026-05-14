export const EXECUTOR_STATUS = {
  OFFLINE: 0,
  ONLINE: 1
} as const

export const EXECUTOR_STATUS_TEXT = {
  [EXECUTOR_STATUS.OFFLINE]: '离线',
  [EXECUTOR_STATUS.ONLINE]: '在线'
} as const
