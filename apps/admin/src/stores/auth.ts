import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../api/client'

interface User {
  _id: string
  email: string
  name: string
  role: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Initialize from localStorage
  const storedToken = localStorage.getItem('token')
  if (storedToken) {
    token.value = storedToken
  }

  async function login(email: string, password: string) {
    const { data } = await api.post<{ success: boolean; data: { user: User; token: string } }>('/auth/login', { email, password })
    user.value = data.data.user
    token.value = data.data.token
    localStorage.setItem('token', data.data.token)
  }

  async function fetchProfile() {
    if (!token.value) return
    try {
      const { data } = await api.get<{ success: boolean; data: User }>('/auth/profile')
      user.value = data.data
    } catch {
      logout()
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  return { user, token, isLoggedIn, isAdmin, login, fetchProfile, logout }
})
