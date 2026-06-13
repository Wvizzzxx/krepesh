<template>
  <div class="admin-page">
    <div class="page-header">
      <h1 class="page-heading">Иконки и изображения</h1>
      <p class="page-subtitle">Управление иконками и заглушками, используемыми на сайте</p>
    </div>

    <!-- Search & Filter -->
    <div class="controls">
      <div class="search-box">
        <input v-model="searchQuery" type="text" placeholder="Поиск по названию..." class="search-input" />
      </div>
      <div class="filter-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="['filter-tab', { active: activeTab === tab.value }]"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <div class="table-container">
      <div v-if="loading" class="loading-state">Загрузка...</div>
      <div v-else-if="loadError" class="error-state">
        <p>Ошибка: {{ loadError }}</p>
        <button class="btn btn-primary" @click="load">Повторить</button>
      </div>
      <div v-else-if="filteredAssets.length" class="assets-grid">
        <div v-for="asset in filteredAssets" :key="asset._id" class="asset-card">
          <!-- Icon Preview -->
          <div class="asset-preview" :class="{ 'asset-preview--has-image': !!asset.url }">
            <img
              v-if="asset.url"
              :src="asset.url"
              :alt="asset.name"
              class="asset-img"
              @error="onImageError($event)"
            />
            <span v-else class="asset-emoji">{{ asset.emoji || '❓' }}</span>
          </div>

          <!-- Info -->
          <div class="asset-info">
            <div class="asset-name-row">
              <span class="asset-emoji-badge">{{ asset.emoji || '' }}</span>
              <h3>{{ asset.name }}</h3>
            </div>
            <p v-if="asset.description" class="description">{{ asset.description }}</p>
            <div class="asset-meta">
              <span class="badge badge--location">{{ getLocationLabel(asset.location) }}</span>
              <span v-if="asset.url" class="badge badge--custom">🖼️ Своё изображение</span>
              <span v-else class="badge badge--default">По умолчанию</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="asset-actions">
            <label class="btn-action btn-upload" :title="asset.url ? 'Заменить изображение' : 'Загрузить изображение'">
              <input type="file" accept="image/*" class="hidden-input" @change="uploadImage($event, asset)" />
              📷 {{ asset.url ? 'Заменить' : 'Загрузить' }}
            </label>
            <button
              v-if="asset.url"
              class="btn-action btn-remove"
              title="Убрать изображение (вернуть эмодзи)"
              @click="removeImage(asset)"
            >
              ✕ Убрать
            </button>
            <button class="btn-action btn-delete" title="Удалить" @click="deleteAsset(asset)">
              🗑️
            </button>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>Нет элементов</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import api from '../api/client'

interface Asset {
  _id: string
  key: string
  name: string
  slug: string
  type: 'icon' | 'placeholder'
  emoji?: string
  url: string
  description?: string
  location?: string
  width?: number
  height?: number
  createdAt: Date
  updatedAt: Date
}

const message = useMessage()

const assets = ref<Asset[]>([])
const loading = ref(true)
const loadError = ref('')
const searchQuery = ref('')
const activeTab = ref('all')

const tabs = [
  { value: 'all', label: 'Все' },
  { value: 'sidebar', label: '📐 Сайдбар' },
  { value: 'home', label: '🏠 Главная' },
  { value: 'categories', label: '📂 Категории' },
  { value: 'products', label: '📦 Товары' },
  { value: 'certificates', label: '📋 Сертификаты' },
]

const locationLabels: Record<string, string> = {
  sidebar: 'Сайдбар админки',
  home: 'Главная страница',
  categories: 'Категории',
  products: 'Товары',
  certificates: 'Сертификаты',
}

function getLocationLabel(location?: string): string {
  return locationLabels[location || ''] || location || 'Неизвестно'
}

const filteredAssets = computed(() => {
  let result = assets.value
  if (activeTab.value !== 'all') {
    result = result.filter(a => a.location === activeTab.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(a =>
      a.name.toLowerCase().includes(q) ||
      (a.description || '').toLowerCase().includes(q) ||
      (a.emoji || '').includes(q) ||
      (a.key || '').toLowerCase().includes(q)
    )
  }
  return result
})

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const response = await api.get('/assets')
    assets.value = response.data.data || []
  } catch (e: any) {
    loadError.value = e.message || 'Ошибка загрузки'
    message.error(loadError.value)
  } finally {
    loading.value = false
  }
}

function onImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
  // Show parent's emoji fallback
  const parent = img.parentElement
  if (parent) {
    const emojiSpan = parent.querySelector('.asset-emoji-fallback') as HTMLElement
    if (emojiSpan) emojiSpan.style.display = 'flex'
  }
}

async function uploadImage(event: Event, asset: Asset) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    message.error('Файл должен быть изображением')
    return
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    message.error('Размер файла не должен превышать 5 МБ')
    return
  }

  try {
    const formData = new FormData()
    formData.append('file', file)

    await api.post(`/assets/${asset._id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    message.success(`Изображение для "${asset.name}" загружено`)
    load()
  } catch (e: any) {
    message.error(e.message || 'Ошибка загрузки изображения')
  }

  // Reset input
  ;(event.target as HTMLInputElement).value = ''
}

async function removeImage(asset: Asset) {
  if (!confirm(`Убрать изображение для "${asset.name}"? Будет использоваться эмодзи: ${asset.emoji}`)) return

  try {
    await api.delete(`/assets/${asset._id}/image`)
    message.success(`Изображение убрано для "${asset.name}"`)
    load()
  } catch (e: any) {
    message.error(e.message || 'Ошибка удаления изображения')
  }
}

function deleteAsset(asset: Asset) {
  if (!confirm(`Удалить "${asset.name}"? Это может повлиять на отображение на сайте.`)) return
  api
    .delete(`/assets/${asset._id}`)
    .then(() => {
      message.success('Удалено')
      load()
    })
    .catch((e: any) => message.error(e.message))
}

onMounted(load)
</script>

<style scoped>
.admin-page {
  max-width: 1200px;
}

.page-header {
  margin-bottom: 24px;
}

.page-heading {
  font-size: 28px;
  margin: 0 0 4px 0;
}

.page-subtitle {
  margin: 0;
  color: var(--gray);
  font-size: 14px;
}

.controls {
  display: flex;
  gap: 24px;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid var(--gray-light);
  border-radius: 8px;
  font-size: 15px;
  box-sizing: border-box;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
}

.filter-tabs {
  display: flex;
  gap: 8px;
}

.filter-tab {
  padding: 8px 16px;
  border: 2px solid var(--gray-light);
  border-radius: 8px;
  background: var(--white);
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  white-space: nowrap;
}

.filter-tab:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.filter-tab.active {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--white);
}

.table-container {
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 24px;
}

.assets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

.asset-card {
  border: 2px solid var(--gray-light);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

.asset-card:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.asset-preview {
  width: 64px;
  height: 64px;
  background: var(--gray-light);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  transition: all 0.2s;
}

.asset-preview--has-image {
  background: var(--white);
  border: 2px solid var(--gray-light);
}

.asset-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
}

.asset-emoji {
  font-size: 32px;
  line-height: 1;
}

.asset-emoji-fallback {
  display: none;
  font-size: 32px;
  line-height: 1;
}

.asset-info {
  flex: 1;
  min-width: 0;
}

.asset-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.asset-emoji-badge {
  font-size: 18px;
}

.asset-info h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

.description {
  font-size: 12px;
  color: var(--gray);
  margin: 4px 0 8px;
  line-height: 1.3;
}

.asset-meta {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.badge--location {
  background: #e0e7ff;
  color: #3730a3;
}

.badge--custom {
  background: #d1fae5;
  color: #065f46;
}

.badge--default {
  background: var(--gray-light);
  color: var(--gray);
}

.asset-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid var(--gray-light);
  background: var(--white);
  white-space: nowrap;
}

.btn-action:hover {
  border-color: var(--primary);
}

.btn-upload {
  color: var(--primary);
}

.btn-upload:hover {
  background: #fff7ed;
}

.btn-remove {
  color: #dc2626;
}

.btn-remove:hover {
  background: #fef2f2;
  border-color: #dc2626;
}

.btn-delete {
  color: var(--gray);
}

.btn-delete:hover {
  background: #fef2f2;
  border-color: #dc2626;
  color: #dc2626;
}

.hidden-input {
  display: none;
}

.empty-state,
.loading-state {
  padding: 60px;
  text-align: center;
  color: var(--gray);
}

.error-state {
  padding: 60px;
  text-align: center;
}

.error-state p {
  color: #dc2626;
  margin-bottom: 16px;
}
</style>