import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import {
  mockCategories,
  mockProducts,
  mockAssets,
  mockUser,
  getProductsWithCategories,
  getProductById,
} from './mockData'

// Simple mock order storage in localStorage
function getMockOrders() {
  try { return JSON.parse(localStorage.getItem('mockOrders') || '[]') } catch { return [] }
}
function saveMockOrders(orders: any[]) {
  localStorage.setItem('mockOrders', JSON.stringify(orders))
}

function mockDelay<T>(data: T, ms = 100): Promise<AxiosResponse<T>> {
  return new Promise(resolve => setTimeout(() => resolve({ data, config: {} as any, headers: {} as any, status: 200, statusText: 'OK' }), ms))
}

function matchRoute(method: string, url: string): { route: string; params: Record<string, string> } | null {
  const patterns: { method: string; pattern: RegExp; route: string }[] = [
    { method: 'GET', pattern: /^\/products$/, route: 'GET /products' },
    { method: 'GET', pattern: /^\/products\/([^/]+)$/, route: 'GET /products/:id' },
    { method: 'GET', pattern: /^\/products\/([^/]+)\/reviews$/, route: 'GET /products/:id/reviews' },
    { method: 'GET', pattern: /^\/categories$/, route: 'GET /categories' },
    { method: 'GET', pattern: /^\/assets$/, route: 'GET /assets' },
    { method: 'GET', pattern: /^\/auth\/profile$/, route: 'GET /auth/profile' },
    { method: 'POST', pattern: /^\/auth\/login$/, route: 'POST /auth/login' },
    { method: 'POST', pattern: /^\/auth\/register$/, route: 'POST /auth/register' },
    { method: 'GET', pattern: /^\/orders$/, route: 'GET /orders' },
    { method: 'POST', pattern: /^\/orders$/, route: 'POST /orders' },
    { method: 'GET', pattern: /^\/reviews$/, route: 'GET /reviews' },
    { method: 'POST', pattern: /^\/reviews$/, route: 'POST /reviews' },
    { method: 'GET', pattern: /^\/admin\/orders$/, route: 'GET /admin/orders' },
    { method: 'GET', pattern: /^\/admin\/users$/, route: 'GET /admin/users' },
    { method: 'GET', pattern: /^\/health$/, route: 'GET /health' },
  ]
  for (const p of patterns) {
    if (p.method !== method.toUpperCase()) continue
    const m = url.replace(/\?.*$/, '').match(p.pattern)
    if (m) {
      const params: Record<string, string> = {}
      if (m[1]) params.id = m[1]
      return { route: p.route, params }
    }
  }
  return null
}

function handleMockRequest(method: string, url: string, body?: any): any {
  const match = matchRoute(method, url)
  if (!match) return { success: false, error: 'Not found' }

  switch (match.route) {
    case 'GET /products': {
      const params = new URLSearchParams(url.split('?')[1] || '')
      let items = getProductsWithCategories()
      const search = params.get('search') || ''
      if (search) {
        const q = search.toLowerCase()
        items = items.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
      }
      const catId = params.get('categoryId')
      if (catId) items = items.filter(p => (typeof p.categoryId === 'object' ? (p.categoryId as any)._id : p.categoryId) === catId)
      const sortBy = params.get('sortBy') || 'createdAt'
      const sortOrder = params.get('sortOrder') || 'desc'
      items.sort((a: any, b: any) => {
        const av = a[sortBy], bv = b[sortBy]
        if (typeof av === 'number') return sortOrder === 'asc' ? av - bv : bv - av
        return sortOrder === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
      })
      const page = parseInt(params.get('page') || '1')
      const limit = parseInt(params.get('limit') || '12')
      const total = items.length
      const paged = items.slice((page - 1) * limit, page * limit)
      return { success: true, data: { items: paged, total, page, limit, totalPages: Math.ceil(total / limit) } }
    }
    case 'GET /products/:id': {
      const p = getProductById(match.params.id)
      if (!p) return { success: false, error: 'Not found' }
      return { success: true, data: p }
    }
    case 'GET /products/:id/reviews':
      return { success: true, data: [] }
    case 'GET /categories':
      return { success: true, data: mockCategories }
    case 'GET /assets':
      return { success: true, data: mockAssets }
    case 'GET /auth/profile':
      return { success: true, data: mockUser }
    case 'POST /auth/login': {
      const token = 'mock-jwt-token-demo'
      return { success: true, data: { token, user: mockUser } }
    }
    case 'POST /auth/register':
      return { success: true, data: { token: 'mock-jwt-token-demo', user: mockUser } }
    case 'GET /orders':
      return { success: true, data: getMockOrders() }
    case 'POST /orders': {
      const orders = getMockOrders()
      const newOrder = { _id: 'ord' + Date.now(), ...body, status: 'pending', createdAt: new Date().toISOString() }
      orders.push(newOrder)
      saveMockOrders(orders)
      return { success: true, data: newOrder }
    }
    case 'GET /reviews':
      return { success: true, data: [] }
    case 'POST /reviews':
      return { success: true, data: { _id: 'rev' + Date.now(), ...body, userId: mockUser, createdAt: new Date().toISOString() } }
    case 'GET /admin/orders':
      return { success: true, data: getMockOrders() }
    case 'GET /admin/users':
      return { success: true, data: [mockUser] }
    case 'GET /health':
      return { status: 'ok' }
    default:
      return { success: false, error: 'Not found' }
  }
}

// Create mock axios-like instance
const mockApi = {
  defaults: { headers: { common: {} as Record<string, string> } },
  interceptors: {
    request: { use: (_fulfilled: any, _rejected?: any) => {} },
    response: {
      use: (_fulfilled: any, _rejected?: any) => {},
    },
  },
  get(url: string, config?: AxiosRequestConfig) {
    const fullUrl = config?.params ? `${url}?${new URLSearchParams(config.params).toString()}` : url
    return mockDelay(handleMockRequest('GET', fullUrl))
  },
  post(url: string, data?: any, _config?: AxiosRequestConfig) {
    return mockDelay(handleMockRequest('POST', url, data))
  },
  put(url: string, data?: any, _config?: AxiosRequestConfig) {
    return mockDelay(handleMockRequest('POST', url, data))
  },
  delete(url: string, _config?: AxiosRequestConfig) {
    return mockDelay(handleMockRequest('DELETE', url))
  },
} as unknown as AxiosInstance

// Detect if running in static mode (no backend available)
const isStaticBuild = import.meta.env.VITE_STATIC_BUILD === 'true'

const api: AxiosInstance = isStaticBuild
  ? mockApi
  : (() => {
      const instance = axios.create({
        baseURL: '/api',
        headers: { 'Content-Type': 'application/json' },
      })
      instance.interceptors.request.use((config) => {
        const token = localStorage.getItem('token')
        if (token) config.headers.Authorization = `Bearer ${token}`
        return config
      })
      instance.interceptors.response.use(
        (response) => response,
        (error) => {
          const status = error.response?.status
          if (status === 401) {
            localStorage.removeItem('token')
            if (window.location.pathname !== '/login') window.location.href = '/login'
          }
          const message = error.response?.data?.error || error.message || 'Произошла ошибка'
          return Promise.reject(new Error(message))
        },
      )
      return instance
    })()

export default api