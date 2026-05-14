export interface Role {
  id: number
  roleName: string
  roleCode: string
  description?: string
  status: number
  createTime: string
  updateTime: string
}

export interface Permission {
  id: number
  permissionName: string
  permissionCode: string
  permissionType: string
  parentId: number
  path?: string
  icon?: string
  sortOrder: number
  status: number
  createTime: string
  updateTime: string
  children?: Permission[]
}

export interface Tenant {
  id: number
  tenantCode: string
  tenantName: string
  contactName?: string
  contactPhone?: string
  contactEmail?: string
  status: number
  expireTime?: string
  maxUsers: number
  maxTasks: number
  createTime: string
  updateTime: string
}

export interface OAuthClient {
  id: number
  clientId: string
  clientName: string
  provider: string
  clientSecret: string
  redirectUri?: string
  scope?: string
  status: number
  createTime: string
  updateTime: string
}

export interface OAuthUser {
  id: number
  userId: number
  provider: string
  openid: string
  nickname?: string
  avatar?: string
  email?: string
  createTime: string
  updateTime: string
}

export interface ApiKey {
  id: number
  userId: number
  apiKey: string
  apiSecret: string
  keyName: string
  permissions?: string
  rateLimit: number
  expireTime?: string
  status: number
  createTime: string
  updateTime: string
}

export interface ApiLog {
  id: number
  apiKeyId?: number
  userId?: number
  endpoint: string
  method: string
  requestParams?: string
  responseStatus?: number
  costTime?: number
  ip?: string
  userAgent?: string
  createTime: string
}

export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

export interface ApiResponse<T> {
  code: number
  data: T
  message: string
  success: boolean
}
