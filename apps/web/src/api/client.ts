import axios, { AxiosInstance, AxiosError } from 'axios'

const api: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ success: boolean; error?: string }>) => {
    const status = error.response?.status

    if (status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    if (status === 403) {
      return Promise.reject(new Error('Доступ запрещён'))
    }

    const message = error.response?.data?.error || error.message || 'Произошла ошибка'
    return Promise.reject(new Error(message))
  },
)

export default api
