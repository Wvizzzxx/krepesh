import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@krepesh/types'
import { login, register, getProfile } from '../api/auth'
import api from '../api/client'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function loginFn(email: string, password: string): Promise<void> {
    const data = await login({ email, password })
    user.value = data.user
    token.value = data.token
    localStorage.setItem('token', data.token)
  }

  async function registerFn(name: string, email: string, password: string): Promise<void> {
    const data = await register({ name, email, password })
    user.value = data.user
    token.value = data.token
    localStorage.setItem('token', data.token)
  }

  async function fetchProfile(): Promise<void> {
    if (!token.value) return
    try {
      user.value = await getProfile()
    } catch {
      logout()
    }
  }

  function logout(): void {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    // Clear Authorization header so next requests are unauthenticated
    delete api.defaults.headers.common['Authorization']
  }

  // Restore session on store init
  if (token.value) {
    fetchProfile()
  }

  return { user, token, isLoggedIn, isAdmin, login: loginFn, register: registerFn, fetchProfile, logout }
})
