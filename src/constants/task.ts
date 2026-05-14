export const TASK_STATUS = {
  DISABLED: 0,
  ENABLED: 1,
  PAUSED: 2,
  TERMINATED: 3
} as const

export const TASK_STATUS_TEXT = {
  [TASK_STATUS.DISABLED]: '停用',
  [TASK_STATUS.ENABLED]: '启用',
  [TASK_STATUS.PAUSED]: '暂停',
  [TASK_STATUS.TERMINATED]: '终止'
} as const
