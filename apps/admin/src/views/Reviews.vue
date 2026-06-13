<template>
  <div class="admin-page">
    <div class="page-header">
      <h1 class="page-heading">Отзывы</h1>
      <p class="page-subtitle">Модерация и управление отзывами покупателей</p>
    </div>

    <div class="controls">
      <div class="filter-tabs">
        <button :class="['filter-tab', { active: filter === 'all' }]" @click="filter = 'all'">Все</button>
        <button :class="['filter-tab', { active: filter === 'pending' }]" @click="filter = 'pending'">
          ⏳ На модерации
        </button>
        <button :class="['filter-tab', { active: filter === 'approved' }]" @click="filter = 'approved'">
          ✅ Одобренные
        </button>
        <button :class="['filter-tab', { active: filter === 'rejected' }]" @click="filter = 'rejected'">
          ❌ Отклонённые
        </button>
      </div>
    </div>

    <div class="table-container">
      <div v-if="loading" class="loading-state">Загрузка...</div>
      <div v-else-if="filteredReviews.length === 0" class="empty-state">
        <p>Нет отзывов</p>
      </div>
      <div v-else class="reviews-list">
        <div v-for="review in filteredReviews" :key="review._id" class="review-card">
          <div class="review-top">
            <div class="review-meta">
              <div class="review-rating">
                <span v-for="i in 5" :key="i" class="star" :class="{ active: i <= review.rating }">★</span>
              </div>
              <span class="review-product">📦 {{ review.productId?.name || 'Товар удалён' }}</span>
              <span class="review-author">👤 {{ review.userId?.name || 'Аноним' }} ({{ review.userId?.email || '' }})</span>
            </div>
            <span class="badge" :class="review.isApproved ? 'badge--approved' : 'badge--pending'">
              {{ review.isApproved ? 'Одобрен' : 'На модерации' }}
            </span>
          </div>

          <h3 class="review-title">{{ review.title }}</h3>
          <p class="review-comment">{{ review.comment }}</p>
          <span class="review-date">{{ formatDate(review.createdAt) }}</span>

          <!-- Ответ администратора -->
          <div v-if="review.adminResponse" class="admin-response">
            <strong>Ответ:</strong> {{ review.adminResponse }}
          </div>

          <div class="review-actions">
            <button
              v-if="!review.isApproved"
              class="btn-action btn-approve"
              @click="approveReview(review._id)"
            >
              ✅ Одобрить
            </button>
            <button
              v-if="review.isApproved"
              class="btn-action btn-reject"
              @click="rejectReview(review._id)"
            >
              ❌ Отклонить
            </button>
            <button class="btn-action btn-respond" @click="openRespondModal(review)">
              💬 Ответить
            </button>
            <button class="btn-action btn-delete" @click="deleteReview(review._id)">
              🗑️ Удалить
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно ответа -->
    <div v-if="respondModal.show" class="modal-overlay" @click.self="respondModal.show = false">
      <div class="modal">
        <h3>Ответ на отзыв</h3>
        <p class="modal-review-title">«{{ respondModal.review?.title }}»</p>
        <textarea v-model="respondModal.text" rows="4" placeholder="Введите ответ..."></textarea>
        <div class="modal-actions">
          <button class="btn-action" @click="respondModal.show = false">Отмена</button>
          <button class="btn-action btn-approve" @click="submitResponse">Отправить ответ</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import api from '../api/client'

interface Review {
  _id: string
  productId: { _id: string; name: string } | null
  userId: { _id: string; name: string; email: string } | null
  rating: number
  title: string
  comment: string
  isApproved: boolean
  adminResponse?: string
  adminRespondedAt?: string
  createdAt: string
}

const message = useMessage()
const reviews = ref<Review[]>([])
const loading = ref(true)
const filter = ref('all')

const respondModal = ref({
  show: false,
  review: null as Review | null,
  text: '',
})

const filteredReviews = computed(() => {
  if (filter.value === 'all') return reviews.value
  if (filter.value === 'pending') return reviews.value.filter(r => !r.isApproved)
  if (filter.value === 'approved') return reviews.value.filter(r => r.isApproved)
  return reviews.value
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' })
}

async function load() {
  loading.value = true
  try {
    const { data } = await api.get('/admin/reviews')
    reviews.value = data.data || []
  } catch (e: any) {
    message.error(e.message || 'Ошибка загрузки')
  } finally {
    loading.value = false
  }
}

async function approveReview(id: string) {
  try {
    await api.patch(`/admin/reviews/${id}/status`, { isApproved: true })
    message.success('Отзыв одобрен')
    load()
  } catch (e: any) {
    message.error(e.message || 'Ошибка')
  }
}

async function rejectReview(id: string) {
  try {
    await api.patch(`/admin/reviews/${id}/status`, { isApproved: false })
    message.success('Отзыв отклонён')
    load()
  } catch (e: any) {
    message.error(e.message || 'Ошибка')
  }
}

async function deleteReview(id: string) {
  if (!confirm('Удалить отзыв?')) return
  try {
    await api.delete(`/admin/reviews/${id}`)
    message.success('Отзыв удалён')
    load()
  } catch (e: any) {
    message.error(e.message || 'Ошибка')
  }
}

function openRespondModal(review: Review) {
  respondModal.value = { show: true, review, text: review.adminResponse || '' }
}

async function submitResponse() {
  if (!respondModal.value.review || !respondModal.value.text.trim()) return
  try {
    await api.post(`/admin/reviews/${respondModal.value.review._id}/respond`, {
      response: respondModal.value.text,
    })
    message.success('Ответ отправлен')
    respondModal.value.show = false
    load()
  } catch (e: any) {
    message.error(e.message || 'Ошибка')
  }
}

onMounted(load)
</script>

<style scoped>
.admin-page { max-width: 1000px; }
.page-header { margin-bottom: 24px; }
.page-heading { font-size: 28px; margin: 0 0 4px; }
.page-subtitle { margin: 0; color: var(--gray); font-size: 14px; }
.controls { margin-bottom: 24px; }
.filter-tabs { display: flex; gap: 8px; }
.filter-tab { padding: 8px 16px; border: 2px solid var(--gray-light); border-radius: 8px; background: var(--white); cursor: pointer; font-weight: 500; transition: all 0.2s; }
.filter-tab:hover { border-color: var(--primary); color: var(--primary); }
.filter-tab.active { background: var(--primary); border-color: var(--primary); color: var(--white); }
.table-container { background: var(--white); border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); padding: 24px; }

.review-card { border: 1px solid var(--gray-light); border-radius: 12px; padding: 20px; margin-bottom: 16px; }
.review-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; gap: 10px; }
.review-meta { display: flex; flex-direction: column; gap: 6px; }
.review-rating { display: flex; gap: 2px; }
.star { font-size: 18px; color: #ddd; }
.star.active { color: #ffd700; }
.review-product { font-size: 13px; color: var(--gray); }
.review-author { font-size: 13px; color: var(--gray); }
.review-title { font-size: 16px; margin: 0 0 8px; }
.review-comment { color: #555; margin: 0 0 8px; line-height: 1.6; }
.review-date { font-size: 12px; color: var(--gray); }
.badge { padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; }
.badge--approved { background: #d1fae5; color: #065f46; }
.badge--pending { background: #fef3c7; color: #92400e; }
.admin-response { margin-top: 12px; padding: 12px; background: #f8f9fa; border-left: 3px solid var(--primary); border-radius: 6px; font-size: 14px; }
.review-actions { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
.btn-action { display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; border: 1px solid var(--gray-light); background: var(--white); transition: all 0.2s; }
.btn-action:hover { border-color: var(--primary); }
.btn-approve { color: #059669; }
.btn-approve:hover { background: #ecfdf5; border-color: #059669; }
.btn-reject { color: #dc2626; }
.btn-reject:hover { background: #fef2f2; border-color: #dc2626; }
.btn-respond { color: #2563eb; }
.btn-respond:hover { background: #eff6ff; border-color: #2563eb; }
.btn-delete { color: var(--gray); }
.btn-delete:hover { background: #fef2f2; border-color: #dc2626; color: #dc2626; }
.empty-state, .loading-state { padding: 60px; text-align: center; color: var(--gray); }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: var(--white); border-radius: 12px; padding: 24px; width: 500px; max-width: 90vw; }
.modal h3 { margin: 0 0 8px; }
.modal-review-title { color: var(--gray); margin: 0 0 16px; font-size: 14px; }
.modal textarea { width: 100%; padding: 12px; border: 2px solid var(--gray-light); border-radius: 8px; font-size: 14px; box-sizing: border-box; }
.modal textarea:focus { outline: none; border-color: var(--primary); }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 16px; }
</style>