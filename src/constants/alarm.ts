export const ALARM_CHANNEL = {
  EMAIL: 'EMAIL',
  WECHAT: 'WECHAT',
  DINGTALK: 'DINGTALK',
  SMS: 'SMS',
  WEBHOOK: 'WEBHOOK'
} as const

export const ALARM_CHANNEL_TEXT = {
  [ALARM_CHANNEL.EMAIL]: '邮件',
  [ALARM_CHANNEL.WECHAT]: '企业微信',
  [ALARM_CHANNEL.DINGTALK]: '钉钉',
  [ALARM_CHANNEL.SMS]: '短信',
  [ALARM_CHANNEL.WEBHOOK]: 'Webhook'
} as const

export const ALARM_LEVEL = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
} as const

export const ALARM_LEVEL_TEXT = {
  [ALARM_LEVEL.INFO]: '信息',
  [ALARM_LEVEL.WARN]: '警告',
  [ALARM_LEVEL.ERROR]: '错误'
} as const
