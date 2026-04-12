import api from './client'
import type { Product, Category, PaginatedResponse, ProductQueryParams, CreateProductDTO } from '@krepesh/types'

export async function getProducts(params?: ProductQueryParams): Promise<PaginatedResponse<Product>> {
  const { data: response } = await api.get<{ success: boolean; data: PaginatedResponse<Product> }>('/products', { params })
  return response.data
}

export async function getProduct(id: string): Promise<Product> {
  const { data: response } = await api.get<{ success: boolean; data: Product }>(`/products/${id}`)
  return response.data
}

export async function getCategories(): Promise<Category[]> {
  const { data: response } = await api.get<{ success: boolean; data: Category[] }>('/categories')
  return response.data
}

export async function createProduct(data: CreateProductDTO): Promise<Product> {
  const { data: response } = await api.post<{ success: boolean; data: Product }>('/products', data)
  return response.data
}

export async function updateProduct(id: string, data: Partial<CreateProductDTO>): Promise<Product> {
  const { data: response } = await api.put<{ success: boolean; data: Product }>(`/products/${id}`, data)
  return response.data
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete<{ success: boolean }>(`/products/${id}`)
}
