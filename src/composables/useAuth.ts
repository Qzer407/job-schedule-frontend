import { ref, computed } from 'vue'
import { login as loginApi, register as registerApi, logout as logoutApi, getCurrentUser as getCurrentUserApi } from '@/api'
import type { User } from '@/types'
import { STORAGE_KEY } from '@/constants'

const user = ref<User | null>(null)
const token = ref<string | null>(localStorage.getItem(STORAGE_KEY.TOKEN))
const loading = ref(false)

export function useAuth() {
  const isLoggedIn = computed(() => !!token.value)
  const currentUser = computed(() => user.value)

  const login = async (username: string, password: string) => {
    loading.value = true
    try {
      const response = await loginApi({ username, password })
      const { token: newToken, user: userInfo } = response.data.data
      token.value = newToken
      user.value = userInfo
      localStorage.setItem(STORAGE_KEY.TOKEN, newToken)
      localStorage.setItem(STORAGE_KEY.USER, JSON.stringify(userInfo))
      return userInfo
    } finally {
      loading.value = false
    }
  }

  const register = async (data: { username: string; password: string; email?: string }) => {
    loading.value = true
    try {
      await registerApi(data)
      return true
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await logoutApi()
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem(STORAGE_KEY.TOKEN)
      localStorage.removeItem(STORAGE_KEY.USER)
    }
  }

  const fetchCurrentUser = async () => {
    if (!token.value) return null
    try {
      const response = await getCurrentUserApi()
      user.value = response.data.data
      return user.value
    } catch {
      token.value = null
      user.value = null
      localStorage.removeItem(STORAGE_KEY.TOKEN)
      localStorage.removeItem(STORAGE_KEY.USER)
      return null
    }
  }

  const initAuth = () => {
    const storedToken = localStorage.getItem(STORAGE_KEY.TOKEN)
    const storedUser = localStorage.getItem(STORAGE_KEY.USER)
    if (storedToken) {
      token.value = storedToken
    }
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch {
        user.value = null
      }
    }
  }

  initAuth()

  return {
    user,
    token,
    loading,
    isLoggedIn,
    currentUser,
    login,
    register,
    logout,
    fetchCurrentUser,
    initAuth
  }
}
