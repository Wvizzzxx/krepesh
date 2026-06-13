import axios, { AxiosInstance, AxiosError } from 'axios'

const api: AxiosInstance = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`

  // Let browser set proper multipart boundary automatically
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    const headers = config.headers as any
    if (headers?.delete) {
      headers.delete('Content-Type')
      headers.delete('content-type')
    }
    delete headers?.['Content-Type']
    delete headers?.['content-type']
  }

  return config
})

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ error?: string }>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    const msg = error.response?.data?.error || error.message
    return Promise.reject(new Error(msg))
  },
)

export default api
