export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

export const STORAGE_KEY = {
  TOKEN: 'token',
  USER: 'user'
} as const
