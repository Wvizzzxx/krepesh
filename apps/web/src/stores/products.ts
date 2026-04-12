import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Product, Category, PaginatedResponse, ProductQueryParams } from '@krepesh/types'
import { getProducts, getProduct, getCategories } from '../api/products'

export const useProductsStore = defineStore('products', () => {
  const products = ref<Product[]>([])
  const categories = ref<Category[]>([])
  const currentProduct = ref<Product | null>(null)
  const loading = ref(false)
  const pagination = ref({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 0,
  })

  async function fetchProducts(params?: ProductQueryParams): Promise<PaginatedResponse<Product>> {
    loading.value = true
    try {
      const result = await getProducts(params)
      products.value = result.items
      pagination.value = {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      }
      return result
    } finally {
      loading.value = false
    }
  }

  async function fetchProduct(id: string): Promise<Product> {
    loading.value = true
    try {
      const product = await getProduct(id)
      currentProduct.value = product
      return product
    } finally {
      loading.value = false
    }
  }

  async function fetchCategories(): Promise<Category[]> {
    try {
      const result = await getCategories()
      categories.value = result
      return result
    } catch {
      categories.value = []
      throw new Error('Failed to fetch categories')
    }
  }

  function clearCurrentProduct(): void {
    currentProduct.value = null
  }

  return {
    products,
    categories,
    currentProduct,
    loading,
    pagination,
    fetchProducts,
    fetchProduct,
    fetchCategories,
    clearCurrentProduct,
  }
})
