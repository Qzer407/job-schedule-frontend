export interface User {
  id: number
  username: string
  email?: string
  role: string
  status: number
  createTime?: string
  updateTime?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  tokenType: string
  user: User
}

export interface RegisterRequest {
  username: string
  password: string
  email?: string
  role?: string
}
