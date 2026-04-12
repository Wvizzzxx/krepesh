import api from './client'
import type { Order, CreateOrderDTO } from '@krepesh/types'

export async function getOrders(): Promise<Order[]> {
  const { data: response } = await api.get<{ success: boolean; data: Order[] }>('/orders')
  return response.data
}

export async function getOrder(id: string): Promise<Order> {
  const { data: response } = await api.get<{ success: boolean; data: Order }>(`/orders/${id}`)
  return response.data
}

export async function createOrder(data: CreateOrderDTO): Promise<Order> {
  const { data: response } = await api.post<{ success: boolean; data: Order }>('/orders', data)
  return response.data
}

// Admin
export async function getAllOrders(): Promise<Order[]> {
  const { data: response } = await api.get<{ success: boolean; data: Order[] }>('/admin/orders')
  return response.data
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
  const { data: response } = await api.put<{ success: boolean; data: Order }>(`/admin/orders/${id}/status`, { status })
  return response.data
}
