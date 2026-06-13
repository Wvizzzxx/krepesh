<template>
  <div class="admin-page">
    <div class="page-header">
      <h1 class="page-heading">Фото сайта</h1>
      <p class="page-subtitle">Управление изображениями на страницах сайта — загружайте реальные фото вместо заглушек</p>
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
      <div v-else-if="filteredAssets.length" class="photos-grid">
        <div v-for="asset in filteredAssets" :key="asset._id" class="photo-card">
          <!-- Image Preview -->
          <div class="photo-preview" :class="{ 'has-image': !!asset.url }">
            <img
              v-if="asset.url"
              :src="asset.url"
              :alt="asset.name"
              class="photo-img"
              @error="onImageError($event)"
            />
            <div v-else class="photo-placeholder">
              <span class="placeholder-emoji">{{ asset.emoji || '🖼️' }}</span>
              <span class="placeholder-text">Нет фото</span>
            </div>
          </div>

          <!-- Info -->
          <div class="photo-info">
            <h3>{{ asset.name }}</h3>
            <p v-if="asset.description" class="description">{{ asset.description }}</p>
            <div class="photo-meta">
              <span class="badge" :class="asset.url ? 'badge--custom' : 'badge--default'">
                {{ asset.url ? '✅ Загружено' : '⚠️ Заглушка' }}
              </span>
              <span class="badge badge--location">{{ getPageLabel(asset.key) }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="photo-actions">
            <label class="btn-action btn-upload" :title="asset.url ? 'Заменить фото' : 'Загрузить фото'">
              <input type="file" accept="image/*" class="hidden-input" @change="uploadImage($event, asset)" />
              📷 {{ asset.url ? 'Заменить' : 'Загрузить' }}
            </label>
            <button
              v-if="asset.url"
              class="btn-action btn-remove"
              title="Убрать фото (вернуть заглушку)"
              @click="removeImage(asset)"
            >
              ✕ Убрать
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
  { value: 'certificates', label: '📋 Сертификаты' },
  { value: 'home', label: '🏠 Главная' },
  { value: 'about', label: '🏢 О компании' },
  { value: 'products', label: '📦 Товары' },
]

const pageLabels: Record<string, string> = {
  'cert-iso': 'Сертификаты',
  'cert-din': 'Сертификаты',
  'cert-gost': 'Сертификаты',
  'cert-preview-1': 'Сертификаты',
  'cert-preview-2': 'Сертификаты',
  'cert-preview-3': 'Сертификаты',
  'home-hero-bg': 'Главная',
  'home-about-img': 'Главная',
  'about-hero-bg': 'О компании',
  'about-team-img': 'О компании',
  'product-placeholder': 'Товары',
  'certificate-placeholder': 'Сертификаты',
}

function getPageLabel(key: string): string {
  return pageLabels[key] || 'Сайт'
}

// Фильтрация по страницам
function getAssetPageGroup(asset: Asset): string {
  const key = asset.key
  if (key.startsWith('cert-')) return 'certificates'
  if (key.startsWith('home-')) return 'home'
  if (key.startsWith('about-')) return 'about'
  if (key.startsWith('product-')) return 'products'
  return 'other'
}

const filteredAssets = computed(() => {
  let result = assets.value
  if (activeTab.value !== 'all') {
    result = result.filter(a => getAssetPageGroup(a) === activeTab.value)
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(a =>
      a.name.toLowerCase().includes(q) ||
      (a.description || '').toLowerCase().includes(q) ||
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
    const allAssets = response.data.data || []
    // Показываем только placeholder-ы (фото/заглушки), не иконки
    assets.value = allAssets.filter((a: Asset) => a.type === 'placeholder')
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
}

async function uploadImage(event: Event, asset: Asset) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  if (!file.type.startsWith('image/')) {
    message.error('Файл должен быть изображением')
    return
  }

  if (file.size > 10 * 1024 * 1024) {
    message.error('Размер файла не должен превышать 10 МБ')
    return
  }

  try {
    const formData = new FormData()
    formData.append('file', file)

    await api.post(`/assets/${asset._id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    message.success(`Фото для "${asset.name}" загружено`)
    load()
  } catch (e: any) {
    message.error(e.message || 'Ошибка загрузки фото')
  }

  ;(event.target as HTMLInputElement).value = ''
}

async function removeImage(asset: Asset) {
  if (!confirm(`Убрать фото для "${asset.name}"? Будет использоваться заглушка.`)) return

  try {
    await api.delete(`/assets/${asset._id}/image`)
    message.success(`Фото убрано для "${asset.name}"`)
    load()
  } catch (e: any) {
    message.error(e.message || 'Ошибка удаления фото')
  }
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

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
}

.photo-card {
  border: 2px solid var(--gray-light);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s;
}

.photo-card:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.photo-preview {
  width: 100%;
  height: 200px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.photo-preview.has-image {
  background: #0f172a;
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.placeholder-emoji {
  font-size: 48px;
}

.placeholder-text {
  color: #94a3b8;
  font-size: 14px;
}

.photo-info {
  padding: 16px;
}

.photo-info h3 {
  margin: 0 0 6px 0;
  font-size: 15px;
  font-weight: 600;
}

.description {
  font-size: 12px;
  color: var(--gray);
  margin: 0 0 10px;
  line-height: 1.4;
}

.photo-meta {
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

.badge--custom {
  background: #d1fae5;
  color: #065f46;
}

.badge--default {
  background: #fef3c7;
  color: #92400e;
}

.badge--location {
  background: #e0e7ff;
  color: #3730a3;
}

.photo-actions {
  display: flex;
  gap: 8px;
  padding: 0 16px 16px;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 13px;
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