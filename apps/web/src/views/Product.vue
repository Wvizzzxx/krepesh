<template>
  <div class="product-page" v-if="product">
    <div class="container">
      <div class="breadcrumb">
        <router-link to="/">Главная</router-link>
        <span>/</span>
        <router-link to="/catalog">Каталог</router-link>
        <span>/</span>
        <span>{{ product.name }}</span>
      </div>

      <section class="product-layout">
        <div class="product-gallery">
          <div class="main-image">
            <img :src="getProductImage(product)" :alt="product.name" class="product-photo" />
          </div>
          <div class="gallery-badge">Новые поступления</div>
        </div>

        <div class="product-info">
          <h1>{{ product.name }}</h1>
          <div class="price-block">
            <span v-if="product.discountPrice" class="product-price-old">{{ product.price }} ₽</span>
            <p class="product-price">{{ product.discountPrice || product.price }} ₽</p>
          </div>

          <div class="product-stock" :class="{ inStock: product.stock > 0 }">
            {{ product.stock > 0 ? `В наличии: ${product.stock} шт.` : 'Нет в наличии' }}
          </div>

          <p class="product-description">{{ product.description }}</p>

          <div
            class="product-specs"
            v-if="product.specifications && Object.keys(product.specifications).length"
          >
            <h3>Характеристики</h3>
            <table class="specs-table">
              <tr v-for="(value, key) in product.specifications" :key="key">
                <td>{{ key }}</td>
                <td>{{ value }}</td>
              </tr>
            </table>
          </div>

          <div class="product-actions" v-if="product.stock > 0">
            <div class="quantity-control">
              <button @click="quantity > 1 && quantity--">−</button>
              <input type="number" v-model.number="quantity" :min="1" :max="product.stock" class="qty-input" />
              <button @click="quantity < product.stock && quantity++">+</button>
            </div>
            <button class="btn btn-primary btn-lg" @click="addToCart">В корзину</button>
          </div>
         </div>
       </section>

       <!-- Отзывы о товаре -->
       <section class="product-reviews">
         <h2>Отзывы о товаре ({{ reviews.length }})</h2>
         
         <div class="reviews-list" v-if="reviews.length > 0">
           <div class="review-item" v-for="review in reviews" :key="review._id">
             <div class="review-header">
               <div class="review-rating">
                 <span v-for="i in 5" :key="i" class="star" :class="{ active: i <= review.rating }">★</span>
                 <span class="review-title">{{ review.title }}</span>
               </div>
               <div class="review-author">{{ review.userId.name }}</div>
             </div>
             <div class="review-content">
               <p>{{ review.comment }}</p>
               <div class="review-date">{{ formatDate(review.createdAt) }}</div>
             </div>
             <div class="admin-response" v-if="review.adminResponse">
               <div class="response-header">
                 <strong>Ответ от администрации:</strong>
                 <span class="response-date">{{ formatDate(review.adminRespondedAt) }}</span>
               </div>
               <p>{{ review.adminResponse }}</p>
             </div>
           </div>
         </div>
         <div class="no-reviews" v-else>
           <p>Пока нет отзывов о данном товаре</p>
         </div>

        <div class="add-review-form" v-if="isLoggedIn">
          <h3>Оставить отзыв</h3>
          <form @submit.prevent="submitReview">
            <div class="form-group">
              <label>Ваша оценка</label>
              <div class="rating-input">
                <span 
                  v-for="i in 5" 
                  :key="i" 
                  class="star" 
                  :class="{ active: i <= newReview.rating }" 
                  @click="newReview.rating = i"
                >★</span>
              </div>
            </div>
            <div class="form-group">
              <label>Заголовок отзыва</label>
              <input 
                type="text" 
                v-model="newReview.title" 
                class="form-input"
                placeholder="Кратко опишите впечатление от товара" 
                maxlength="100"
              />
            </div>
            <div class="form-group">
              <label>Текст отзыва</label>
              <textarea 
                v-model="newReview.comment" 
                class="form-textarea"
                placeholder="Подробно расскажите о товаре, его достоинствах и недостатках..." 
                rows="4"
                maxlength="1000"
              ></textarea>
            </div>
            <button type="submit" class="btn btn-primary" :disabled="!canSubmitReview">Отправить отзыв</button>
          </form>
        </div>
         <div v-else class="login-prompt">
           <p>Чтобы оставить отзыв, необходимо <router-link to="/login">войти в аккаунт</router-link></p>
         </div>
       </section>

       <section class="product-highlights">
         <div
           class="highlight-card"
           v-for="(item, index) in productHighlights"
           :key="item.title"
           :style="highlightAnimationStyle(index)"
         >
           <span class="highlight-icon">{{ item.icon }}</span>
           <div>
             <h3>{{ item.title }}</h3>
             <p>{{ item.description }}</p>
           </div>
         </div>
       </section>
     </div>
   </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMessage } from 'naive-ui'
import api from '../api/client'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const message = useMessage()
const cartStore = useCartStore()
const authStore = useAuthStore()
const product = ref<any>(null)
const quantity = ref(1)
const reviews = ref([])
const newReview = ref({
  rating: 0,
  title: '',
  comment: ''
})
const assets = ref<any[]>([])

const assetMap = computed(() => {
  const map: Record<string, any> = {}
  for (const a of assets.value) map[a.key] = a
  return map
})

const productHighlights = [
  {
    icon: '🚚',
    title: 'Доставка 48 ч',
    description: 'Оптимизированная логистика из Москвы и регионов.',
  },
  {
    icon: '🧪',
    title: 'Контроль качества',
    description: 'Каждой партии присваивается номер и отчет.',
  },
  {
    icon: '🛠️',
    title: 'Техническая поддержка',
    description: 'Инженеры подберут крепеж под ваш проект.',
  },
]

function highlightAnimationStyle(index: number) {
  return { animationDelay: `${index * 0.08}s` }
}

function svgPlaceholder(label: string, width = 820, height = 620): string {
  const safeLabel = label || 'Фото товара'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2f3745"/><stop offset="100%" stop-color="#111827"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="50%" text-anchor="middle" fill="#f8fafc" font-size="26" font-family="Arial, sans-serif">${safeLabel}</text><text x="50%" y="58%" text-anchor="middle" fill="#94a3b8" font-size="16" font-family="Arial, sans-serif">Замените на реальное фото</text></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function getProductImage(item: any): string {
  const source = item?.images?.[0] || item?.image
  if (source) return source
  const placeholder = assetMap.value['product-placeholder']
  if (placeholder?.url) return placeholder.url
  return svgPlaceholder(item?.name || 'Фото товара')
}

function addToCart() {
  cartStore.addItem(product.value, quantity.value)
  message.success(`Добавлено ${quantity.value} шт. в корзину`)
}


function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const isLoggedIn = computed(() => authStore.isLoggedIn)

const canSubmitReview = computed(() => {
  return newReview.value.rating > 0 && 
         newReview.value.title.trim().length > 0 && 
         newReview.value.comment.trim().length > 0
})

async function submitReview() {
  if (!canSubmitReview.value) {
    message.warning('Пожалуйста, заполните все поля отзыва')
    return
  }

  try {
    const response = await api.post('/reviews', {
      productId: product.value._id,
      rating: newReview.value.rating,
      title: newReview.value.title,
      comment: newReview.value.comment
    })

    if (response.data.success) {
      message.success('Отзыв успешно отправлен на модерацию')
      newReview.value = { rating: 0, title: '', comment: '' }
      await loadReviews()
    } else {
      message.error(response.data.message || 'Ошибка при отправке отзыва')
    }
  } catch (error: any) {
    message.error(error.message || 'Ошибка при отправке отзыва')
  }
}

async function loadReviews() {
  try {
    const response = await api.get(`/products/${route.params.id}/reviews`)
    if (response.data.success) {
      reviews.value = response.data.data
    }
  } catch (error) {
    console.error('Ошибка при загрузке отзывов', error)
  }
}

onMounted(async () => {
  const [{ data }, assetRes] = await Promise.all([
    api.get(`/products/${route.params.id}`),
    api.get('/assets').catch(() => ({ data: { data: [] } })),
  ])
  if (assetRes.data.success) assets.value = assetRes.data.data
  if (data.success) product.value = data.data
  
  await loadReviews()
})
</script>

<style scoped>
.product-page {
  padding: 40px 0;
}

.breadcrumb {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  font-size: 14px;
  color: var(--gray);
}

.breadcrumb a {
  color: var(--gray);
}

.breadcrumb a:hover {
  color: var(--primary);
}

.product-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
}

.product-gallery {
  position: sticky;
  top: 20px;
  height: fit-content;
}

.main-image {
  background: var(--gray-light);
  border-radius: 16px;
  overflow: hidden;
  min-height: 520px;
}

.product-photo {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.product-info h1 {
  font-size: 32px;
  margin-bottom: 16px;
}

.product-price {
  font-size: 36px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 16px;
  margin-top: 4px;
}

.price-block {
  margin-bottom: 16px;
}

.product-price-old {
  font-size: 20px;
  color: #999;
  text-decoration: line-through;
  display: block;
}

.product-stock {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 24px;
  background: #fff0f0;
  color: var(--error);
}

.product-stock.inStock {
  background: #f0fff0;
  color: var(--success);
}

.product-description {
  color: var(--gray);
  line-height: 1.8;
  margin-bottom: 32px;
}

.product-specs {
  margin-bottom: 32px;
}

.product-specs h3 {
  font-size: 18px;
  margin-bottom: 16px;
}

.specs-table {
  width: 100%;
  border-collapse: collapse;
}

.specs-table tr {
  border-bottom: 1px solid var(--gray-light);
}

.specs-table td {
  padding: 12px 0;
}

.specs-table td:first-child {
  color: var(--gray);
  width: 40%;
}

.product-actions {
  display: flex;
  gap: 20px;
  align-items: center;
}

.quantity-control {
  display: flex;
  align-items: center;
  border: 2px solid var(--gray-light);
  border-radius: 8px;
  overflow: hidden;
}

.quantity-control button {
  width: 44px;
  height: 44px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.quantity-control button:hover {
  background: var(--gray-light);
}

.qty-input {
  width: 50px;
  text-align: center;
  font-weight: 600;
  border: none;
  font-size: 16px;
  outline: none;
  -moz-appearance: textfield;
}

.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.btn-buy {
  background: #059669;
  color: var(--white);
}

.btn-buy:hover {
  background: #047857;
}

.btn {
  display: inline-block;
  padding: 12px 28px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: var(--primary);
  color: var(--white);
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-lg {
  padding: 16px 36px;
  font-size: 16px;
}

.product-highlights {
  margin-top: 40px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
}

.highlight-card {
  display: flex;
  gap: 18px;
  align-items: center;
  border-radius: 14px;
  padding: 24px;
  background: var(--gray-light);
  box-shadow: 0 15px 35px rgba(15, 23, 42, 0.1);
  opacity: 0;
  transform: translateY(16px);
  animation: fadeUp 0.5s forwards;
  animation-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);
}

.highlight-icon {
  font-size: 32px;
}

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.add-review-form {
  margin-top: 30px;
  padding: 25px;
  background: var(--gray-light);
  border-radius: 12px;
}

.add-review-form h3 {
  margin-bottom: 20px;
  font-size: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: var(--dark);
}

.form-input {
  width: 100%;
  padding: 12px 16px;
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

.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--gray-light);
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;
  box-sizing: border-box;
  resize: vertical;
  min-height: 100px;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.rating-input {
  display: flex;
  gap: 4px;
}

.star {
  font-size: 28px;
  cursor: pointer;
  color: #ddd;
  transition: color 0.2s;
}

.star.active,
.star:hover {
  color: #ffd700;
}

.product-reviews {
  margin-top: 40px;
}

.reviews-list {
  margin-top: 20px;
}

.review-item {
  padding: 20px;
  border: 1px solid var(--gray-light);
  border-radius: 12px;
  margin-bottom: 20px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  flex-wrap: wrap;
  gap: 10px;
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 8px;
}

.review-rating .star {
  font-size: 18px;
  color: #ddd;
}

.review-rating .star.active {
  color: #ffd700;
}

.review-title {
  font-weight: 600;
}

.review-author {
  font-weight: 600;
  color: var(--gray);
}

.review-content {
  margin-bottom: 15px;
}

.review-date {
  font-size: 13px;
  color: var(--gray);
  margin-top: 5px;
}

.admin-response {
  margin-top: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid var(--primary);
}

.response-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
  flex-wrap: wrap;
  gap: 10px;
}

.response-date {
  color: var(--gray);
}

.no-reviews {
  margin-top: 20px;
  padding: 20px;
  text-align: center;
  color: var(--gray);
  background: var(--gray-light);
  border-radius: 8px;
}

.login-prompt {
  margin-top: 20px;
  padding: 20px;
  text-align: center;
  background: var(--gray-light);
  border-radius: 8px;
}

.login-prompt a {
  color: var(--primary);
  font-weight: 600;
}

/* ===== Mobile (< 768px) ===== */
@media (max-width: 767px) {
  .product-page {
    padding: 20px 0;
  }

  .breadcrumb {
    margin-bottom: 16px;
    font-size: 12px;
    flex-wrap: wrap;
  }

  .product-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .product-gallery {
    position: static;
  }

  .main-image {
    min-height: 280px;
  }

  .product-info h1 {
    font-size: 22px;
    margin-bottom: 12px;
  }

  .product-price {
    font-size: 26px;
    margin-bottom: 12px;
  }

  .product-stock {
    padding: 6px 12px;
    font-size: 12px;
    margin-bottom: 16px;
  }

  .product-description {
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 20px;
  }

  .product-specs h3 {
    font-size: 16px;
    margin-bottom: 12px;
  }

  .specs-table td {
    padding: 8px 0;
    font-size: 14px;
  }

  .product-actions {
    flex-direction: column;
    gap: 12px;
  }

  .quantity-control button {
    width: 38px;
    height: 38px;
    font-size: 18px;
  }

  .qty-input {
    width: 44px;
    font-size: 15px;
  }

  .btn {
    padding: 10px 20px;
    font-size: 14px;
  }

  .btn-lg {
    padding: 12px 24px;
    font-size: 15px;
    width: 100%;
    text-align: center;
  }

  .product-highlights {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-top: 24px;
  }

  .highlight-card {
    padding: 16px;
    gap: 12px;
  }

  .highlight-icon {
    font-size: 24px;
  }

  .product-reviews {
    margin-top: 24px;
  }

  .review-item {
    padding: 14px;
  }

  .review-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .add-review-form {
    padding: 16px;
    margin-top: 20px;
  }

  .add-review-form h3 {
    font-size: 17px;
  }

  .form-input,
  .form-textarea {
    padding: 10px 12px;
    font-size: 14px;
  }

  .star {
    font-size: 24px;
  }
}

/* ===== Tablet (768px - 1024px) ===== */
@media (min-width: 768px) and (max-width: 1024px) {
  .product-page {
    padding: 24px 0;
  }

  .breadcrumb {
    margin-bottom: 20px;
    font-size: 13px;
  }

  .product-layout {
    grid-template-columns: 1fr 1fr;
    gap: 30px;
  }

  .main-image {
    min-height: 380px;
  }

  .product-info h1 {
    font-size: 26px;
    margin-bottom: 12px;
  }

  .product-price {
    font-size: 28px;
  }

  .product-description {
    font-size: 14px;
    margin-bottom: 24px;
  }

  .product-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }

  .btn-lg {
    padding: 14px 28px;
    font-size: 15px;
    width: 100%;
    text-align: center;
  }

  .product-highlights {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .highlight-card {
    padding: 18px;
    gap: 12px;
  }

  .highlight-icon {
    font-size: 26px;
  }

  .review-item {
    padding: 16px;
  }

  .add-review-form {
    padding: 20px;
  }
}
</style>