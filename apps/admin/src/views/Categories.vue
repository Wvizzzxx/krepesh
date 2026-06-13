<template>
  <div class="admin-page">
    <div class="page-header">
      <h1 class="page-heading">Категории</h1>
      <button class="btn btn-primary" @click="openModal()">+ Добавить категорию</button>
    </div>

    <div class="table-container">
      <table class="data-table" v-if="categories.length">
        <thead>
          <tr>
            <th>Название</th>
            <th>Описание</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cat in categories" :key="cat._id">
            <td>{{ cat.name }}</td>
            <td class="ellipsis-cell">{{ cat.description || '—' }}</td>
            <td class="actions-cell">
              <button class="btn-icon" title="Редактировать" @click="openModal(cat)">✏️</button>
              <button
                class="btn-icon btn-icon--danger"
                title="Удалить"
                @click="deleteCategory(cat)"
              >
                🗑️
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">Нет категорий</div>
    </div>

    <div v-if="showModal" class="modal-backdrop" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingId ? 'Редактировать категорию' : 'Новая категория' }}</h2>
          <button class="modal-close" @click="showModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Название *</label>
            <input type="text" v-model="form.name" class="form-input" placeholder="Болты" />
          </div>
          <div class="form-group">
            <label>Описание</label>
            <textarea v-model="form.description" class="form-input" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>Изображение</label>
            <div class="image-upload-area">
              <input
                type="file"
                ref="fileInput"
                accept="image/*"
                @change="onFileSelected"
                class="hidden-input"
              />
              <button class="btn btn-outline" type="button" @click="fileInput?.click()">
                📷 Выбрать файл
              </button>
              <img
                v-if="previewImage || existingImage"
                :src="previewImage || existingImage"
                class="image-preview"
              />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn" @click="showModal = false">Отмена</button>
          <button class="btn btn-primary" :disabled="saving" @click="saveCategory">
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

const message = useMessage()

const categories = ref<Category[]>([])
const showModal = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const previewImage = ref('')
const existingImage = ref('')

const form = reactive({ name: '', description: '' })

async function load() {
  const { data } = await api.get('/categories')
  categories.value = data.data || []
}

function openModal(cat?: Category) {
  editingId.value = cat?._id || null
  if (cat) {
    Object.assign(form, { name: cat.name, description: cat.description || '' })
    existingImage.value = cat.image || ''
  } else {
    Object.assign(form, { name: '', description: '' })
    existingImage.value = ''
  }
  previewImage.value = ''
  selectedFile.value = null
  showModal.value = true
}

function onFileSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  selectedFile.value = file
  const reader = new FileReader()
  reader.onload = (ev) => {
    previewImage.value = ev.target?.result as string
  }
  reader.readAsDataURL(file)
}

async function saveCategory() {
  if (!form.name) {
    message.error('Введите название')
    return
  }
  try {
    saving.value = true
    let category: Category
    if (editingId.value) {
      const { data } = await api.put<{ success: boolean; data: Category }>(
        `/categories/${editingId.value}`,
        { name: form.name, description: form.description },
      )
      category = data.data
      if (selectedFile.value) {
        const formData = new FormData()
        formData.append('image', selectedFile.value)
        await api.post(`/categories/${category._id}/image`, formData)
      }
    } else {
      const { data } = await api.post<{ success: boolean; data: Category }>('/categories', {
        name: form.name,
        description: form.description,
      })
      category = data.data
      if (selectedFile.value) {
        const formData = new FormData()
        formData.append('image', selectedFile.value)
        await api.post(`/categories/${category._id}/image`, formData)
      }
    }
    message.success(editingId.value ? 'Обновлено' : 'Создано')
    showModal.value = false
    load()
  } catch (e: any) {
    message.error(e.message || 'Ошибка сохранения')
  } finally {
    saving.value = false
  }
}

function deleteCategory(cat: Category) {
  if (!confirm(`Удалить "${cat.name}"?`)) return
  api
    .delete(`/categories/${cat._id}`)
    .then(() => {
      message.success('Удалено')
      load()
    })
    .catch((e: any) => message.error(e.message))
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
  width: 500px;
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

.hidden-input {
  display: none;
}

.image-upload-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-preview {
  width: 120px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.ellipsis-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
