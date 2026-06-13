<template>
  <div class="admin-page">
    <div class="page-header">
      <h1 class="page-heading">Товары</h1>
      <button class="btn btn-primary" @click="openModal()">+ Добавить товар</button>
    </div>

    <div class="table-container">
      <div v-if="loading" class="loading-state">Загрузка товаров...</div>
      <div v-else-if="loadError" class="error-state">
        <p>Ошибка: {{ loadError }}</p>
        <button class="btn btn-primary" @click="load">Повторить</button>
      </div>
      <table class="data-table" v-else-if="products.length">
        <thead>
          <tr>
             <th>Название</th>
             <th>Цена</th>
             <th>Цена со скидкой</th>
             <th>Остаток</th>
            <th>Рейтинг</th>
            <th>Отзывы</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in products" :key="p._id">
            <td>{{ p.name }}</td>
            <td>{{ p.price }} ₽</td>
            <td>{{ p.discountPrice ? p.discountPrice + ' ₽' : '—' }}</td>
            <td>{{ p.stock }}</td>
            <td>
              <div class="rating-cell">
                <span class="stars">
                  {{ renderStars(p.averageRating || 0) }}
                </span>
                <span class="rating-value">{{ (p.averageRating || 0).toFixed(1) }}</span>
              </div>
            </td>
            <td>{{ p.reviewCount || 0 }}</td>
            <td class="actions-cell">
              <button
                class="btn-icon"
                title="Просмотреть/управление отзывами"
                @click="viewReviews(p)"
              >
                💬
              </button>
              <button class="btn-icon" title="Редактировать" @click="openModal(p)">✏️</button>
              <button class="btn-icon btn-icon--danger" title="Удалить" @click="deleteProduct(p)">
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">Нет товаров</div>
    </div>

    <!-- Modal overlay -->
    <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingId ? 'Редактировать товар' : 'Новый товар' }}</h2>
          <button class="modal-close" @click="showModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Название *</label>
            <input type="text" v-model="form.name" class="form-input" placeholder="Болт М6x20" />
          </div>
          <div class="form-group">
            <label>Описание *</label>
            <textarea
              v-model="form.description"
              class="form-input"
              rows="3"
              placeholder="Описание товара"
            ></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Цена *</label>
              <input
                type="number"
                v-model.number="form.price"
                class="form-input"
                min="0"
                step="0.01"
              />
            </div>
            <div class="form-group">
              <label>Остаток</label>
              <input type="number" v-model.number="form.stock" class="form-input" min="0" />
            </div>
          </div>
          <div class="form-group">
            <label>Цена со скидкой (необязательно)</label>
            <input
              type="number"
              v-model.number="form.discountPrice"
              class="form-input"
              min="0"
              step="0.01"
              placeholder="Оставьте пусто если нет скидки"
            />
          </div>
          <div class="form-group">
            <label>Категория *</label>
            <select v-model="form.categoryId" class="form-input">
              <option value="">Выберите категорию</option>
              <option v-for="cat in categories" :key="cat._id" :value="cat._id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- Image upload -->
          <div class="form-group">
            <label>Изображения</label>
            <div class="image-upload-area">
              <input
                type="file"
                ref="fileInput"
                multiple
                accept="image/*"
                @change="onFilesSelected"
                class="hidden-input"
              />
              <button class="btn btn-outline" type="button" @click="fileInput?.click()">
                📷 Выбрать файлы
              </button>
              <div v-if="previewImages.length || existingImages.length" class="image-preview-grid">
                <div v-for="(img, i) in previewImages" :key="'prev' + i" class="image-preview-item">
                  <img :src="img" />
                  <button class="remove-img" @click="previewImages.splice(i, 1)">✕</button>
                </div>
                <div v-for="(img, i) in existingImages" :key="'ex' + i" class="image-preview-item">
                  <img :src="img" />
                  <button class="remove-img" @click="removeExistingImage(i)">✕</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn" @click="showModal = false">Отмена</button>
          <button class="btn btn-primary" :disabled="saving" @click="saveProduct">
            {{ saving ? 'Сохраняем...' : 'Сохранить' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import api from '../api/client'
import type { Category } from '@krepesh/types'

interface Product {
  _id: string
  name: string
  slug: string
  description: string
  price: number
  categoryId: string
  images: string[]
  stock: number
  specifications: Record<string, string>
  discountPrice?: number | null
  averageRating?: number
  reviewCount?: number
}

const message = useMessage()

const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const loading = ref(true)
const loadError = ref('')
const showModal = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFiles = ref<File[]>([])
const previewImages = ref<string[]>([])
const existingImages = ref<string[]>([])

const form = reactive({ name: '', description: '', price: 0, categoryId: '', stock: 0, discountPrice: null as number | null })

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const [p, c] = await Promise.all([api.get('/products?limit=200'), api.get('/categories')])
    console.log('Products API response:', p.data)
    console.log('Categories API response:', c.data)
    products.value = p.data.data?.items || []
    categories.value = c.data.data || []
    console.log('Loaded products:', products.value.length)
  } catch (e: any) {
    loadError.value = e.message || 'Ошибка загрузки'
    message.error(loadError.value)
    console.error('Load error:', e)
  } finally {
    loading.value = false
  }
}

function openModal(product?: Product) {
  editingId.value = product?._id || null
  if (product) {
    const normalizedCategoryId =
      typeof product.categoryId === 'string'
        ? product.categoryId
        : ((product.categoryId as any)?._id ?? '')

    Object.assign(form, {
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: normalizedCategoryId,
      stock: product.stock,
      discountPrice: product.discountPrice || null,
    })
    existingImages.value = [...(product.images || [])]
  } else {
    Object.assign(form, { name: '', description: '', price: 0, categoryId: '', stock: 0, discountPrice: null })
    existingImages.value = []
  }
  previewImages.value = []
  selectedFiles.value = []
  showModal.value = true
}

function onFilesSelected(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  selectedFiles.value = Array.from(files)
  previewImages.value = []
  for (const file of files) {
    const reader = new FileReader()
    reader.onload = (ev) => previewImages.value.push(ev.target?.result as string)
    reader.readAsDataURL(file)
  }
}

async function removeExistingImage(index: number) {
  if (!editingId.value) return
  const imageUrl = existingImages.value[index]
  try {
    await api.delete(`/products/${editingId.value}/images`, { data: { imageUrl } })
    existingImages.value.splice(index, 1)
    message.success('Изображение удалено')
  } catch {
    message.error('Не удалось удалить изображение')
  }
}

async function saveProduct() {
  if (!form.name || !form.description || !form.categoryId) {
    message.error('Заполните обязательные поля')
    return
  }
  try {
    saving.value = true

    // Send discountPrice as null when 0 or empty
    const payload = { ...form, discountPrice: form.discountPrice || null }

    // Create/update product without images first
    let product: Product
    if (editingId.value) {
      const { data } = await api.put<{ success: boolean; data: Product }>(
        `/products/${editingId.value}`,
        payload,
      )
      product = data.data
    } else {
      const { data } = await api.post<{ success: boolean; data: Product }>('/products', payload)
      product = data.data
    }

    // Upload images separately
    if (selectedFiles.value.length > 0) {
      const formData = new FormData()
      for (const file of selectedFiles.value) {
        formData.append('images', file)
      }

      // Add token to headers for authentication
      const token = localStorage.getItem('token')
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      }

      await api.post(`/products/${product._id}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...headers,
        },
      })
    }

    message.success(editingId.value ? 'Обновлено' : 'Создано')
    showModal.value = false
    load()
  } catch (e: any) {
    console.error('Save product error:', e)
    message.error(e.message || 'Ошибка сохранения')
  } finally {
    saving.value = false
  }
}

function deleteProduct(product: Product) {
  if (!confirm(`Удалить "${product.name}"?`)) return
  api
    .delete(`/products/${product._id}`)
    .then(() => {
      message.success('Удалено')
      load()
    })
    .catch((e: any) => message.error(e.message))
}

function renderStars(rating: number) {
  const stars = Math.round(rating)
  return '★'.repeat(stars) + '☆'.repeat(5 - stars)
}

function viewReviews(product: Product) {
  alert(
    `Просмотр отзывов для товара: ${product.name}\n\nЭта функция будет реализована в следующей версии.`,
  )
}

onMounted(load)
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-heading {
  font-size: 28px;
  margin: 0;
}

.table-container {
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 14px 20px;
  background: var(--gray-light);
  font-weight: 600;
  font-size: 14px;
  color: var(--gray);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table td {
  padding: 14px 20px;
  border-top: 1px solid var(--gray-light);
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: var(--gray-light);
}

.btn-icon--danger:hover {
  background: #fef2f2;
}

.empty-state {
  padding: 60px;
  text-align: center;
  color: var(--gray);
}

.loading-state {
  padding: 60px;
  text-align: center;
  color: var(--gray);
  font-size: 16px;
}

.error-state {
  padding: 60px;
  text-align: center;
}

.error-state p {
  color: #dc2626;
  margin-bottom: 16px;
  font-size: 16px;
}

.btn {
  display: inline-block;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid var(--gray-light);
  background: var(--white);
  font-size: 15px;
}

.btn:hover:not(:disabled) {
  border-color: var(--gray);
}

.btn-primary {
  background: var(--primary);
  color: var(--white);
  border-color: var(--primary);
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
}

.btn-outline {
  background: var(--white);
  border-color: var(--gray-light);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: var(--white);
  border-radius: 16px;
  width: 600px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid var(--gray-light);
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--gray);
  padding: 4px;
}

.modal-body {
  padding: 24px 32px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 32px;
  border-top: 1px solid var(--gray-light);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid var(--gray-light);
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.hidden-input {
  display: none;
}

.image-upload-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-preview-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.image-preview-item {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-img {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
