<template>
  <div class="catalog">
    <div class="container">
      <div class="catalog-header">
        <h1>Каталог товаров</h1>
        <p>{{ productsStore.pagination.total }} товаров найдено</p>
      </div>

      <div class="catalog-layout">
        <aside class="catalog-sidebar">
          <div class="filter-block">
            <h3>Категории</h3>
            <ul class="category-list">
              <li>
                <a
                  href="#"
                  @click.prevent="filterByCategory('')"
                  :class="{ active: !selectedCategory }"
                  >Все товары</a
                >
              </li>
              <li v-for="cat in productsStore.categories" :key="cat._id">
                <a
                  href="#"
                  @click.prevent="filterByCategory(cat._id)"
                  :class="{ active: selectedCategory === cat._id }"
                >
                  {{ cat.name }}
                </a>
              </li>
            </ul>
          </div>

          <div class="filter-block">
            <h3>Сортировка</h3>
            <select v-model="sortBy" @change="loadProducts" class="sort-select">
              <option value="createdAt">По новизне</option>
              <option value="price">По цене</option>
              <option value="name">По названию</option>
            </select>
          </div>

          <div class="filter-block">
            <h3>На странице</h3>
            <select v-model.number="limit" @change="changePage(1)" class="sort-select">
              <option :value="6">6</option>
              <option :value="12">12</option>
              <option :value="24">24</option>
              <option :value="48">48</option>
            </select>
          </div>
        </aside>

        <main class="catalog-main">
          <div class="search-bar">
            <input
              type="text"
              v-model="search"
              placeholder="Поиск товаров..."
              @input="debouncedSearch"
            />
          </div>

          <div v-if="productsStore.loading" class="loading-state">
            <n-spin size="large" />
          </div>

          <div v-else class="products-grid">
            <div
              v-for="(product, index) in productsStore.products"
              :key="product._id"
              class="product-card animate-card"
              :style="cardAnimationStyle(index)"
            >
              <router-link :to="`/product/${product._id}`" class="product-link">
                <div class="product-image">
                  <img :src="getProductImage(product)" :alt="product.name" class="product-photo" />
                </div>
                <div class="product-content">
                  <h3>{{ product.name }}</h3>
                  <p class="product-desc">{{ product.description }}</p>
                  <div class="product-rating" v-if="product.reviewCount > 0">
                    <span class="rating-text">Рейтинг: {{ product.averageRating.toFixed(1) }} ★ ({{ product.reviewCount }} отзыв{{ reviewWord(product.reviewCount) }})</span>
                  </div>
                <div class="product-bottom">
                    <span v-if="product.discountPrice" class="product-price-old">{{ product.price }} ₽</span>
                    <span class="product-price">{{ product.discountPrice || product.price }} ₽</span>
                    <div v-if="product.stock > 0" class="product-buy-row">
                      <input
                        type="number"
                        :value="getQty(product._id)"
                        @input="setQty(product._id, $event)"
                        :min="1"
                        :max="product.stock"
                        class="qty-input"
                      />
                      <button class="btn-add" @click.prevent="addToCart(product)">
                        В корзину
                      </button>
                    </div>
                    <span v-else class="out-of-stock">Нет в наличии</span>
                  </div>
                </div>
              </router-link>
            </div>
          </div>

          <div
            v-if="!productsStore.loading && productsStore.products.length === 0"
            class="empty-state"
          >
            <p>Товары не найдены</p>
          </div>

          <Pagination
            v-if="productsStore.pagination.totalPages > 1"
            :page="productsStore.pagination.page"
            :total-pages="productsStore.pagination.totalPages"
            @change="changePage"
          />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMessage, NSpin } from 'naive-ui'
import { useProductsStore } from '../stores/products'
import { useCartStore } from '../stores/cart'
import Pagination from '../components/Pagination.vue'
import api from '../api/client'

const route = useRoute()
const message = useMessage()
const productsStore = useProductsStore()
const cartStore = useCartStore()

const search = ref('')
const page = ref(1)
const limit = ref(12)
const selectedCategory = ref('')
const sortBy = ref('createdAt')
const sortOrder = ref<'asc' | 'desc'>('desc')

let searchTimeout: ReturnType<typeof setTimeout> | null = null

function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    loadProducts()
  }, 300)
}

function filterByCategory(catId: string) {
  selectedCategory.value = catId
  page.value = 1
  loadProducts()
}

function changePage(newPage: number) {
  page.value = newPage
  loadProducts()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const qtyMap = ref<Record<string, number>>({})

function getQty(productId: string): number {
  return qtyMap.value[productId] || 1
}

function setQty(productId: string, event: Event) {
  const val = parseInt((event.target as HTMLInputElement).value) || 1
  qtyMap.value[productId] = Math.max(1, val)
}

function addToCart(product: any) {
  const qty = getQty(product._id)
  cartStore.addItem(product, qty)
  message.success(`Добавлено ${qty} шт. в корзину`)
  qtyMap.value[product._id] = 1
}

function cardAnimationStyle(index: number) {
  return { animationDelay: `${index * 0.07}s` }
}

function reviewWord(count: number): string {
  const lastTwo = count % 100
  const lastOne = count % 10
  if (lastTwo >= 11 && lastTwo <= 19) return 'ов'
  if (lastOne === 1) return ''
  if (lastOne >= 2 && lastOne <= 4) return 'а'
  return 'ов'
}

function svgPlaceholder(label: string, width = 560, height = 360): string {
  const safeLabel = label || 'Фото товара'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2f3745"/><stop offset="100%" stop-color="#111827"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="48%" text-anchor="middle" fill="#f8fafc" font-size="20" font-family="Arial, sans-serif">${safeLabel}</text><text x="50%" y="58%" text-anchor="middle" fill="#94a3b8" font-size="14" font-family="Arial, sans-serif">Замените на реальное фото</text></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

const assets = ref<any[]>([])
const assetMap = computed(() => {
  const map: Record<string, any> = {}
  for (const a of assets.value) map[a.key] = a
  return map
})

function getProductImage(product: any): string {
  const source = product?.images?.[0] || product?.image
  if (source) return source
  const placeholder = assetMap.value['product-placeholder']
  if (placeholder?.url) return placeholder.url
  return svgPlaceholder(product?.name || 'Фото товара')
}

async function loadProducts() {
  await productsStore.fetchProducts({
    page: page.value,
    limit: limit.value,
    search: search.value || undefined,
    categoryId: selectedCategory.value || undefined,
    sortBy: sortBy.value as any,
    sortOrder: sortOrder.value,
  })
}

onMounted(async () => {
  if (route.query.categoryId) selectedCategory.value = route.query.categoryId as string
  if (route.query.search) search.value = route.query.search as string

  const [, assetRes] = await Promise.all([
    productsStore.fetchCategories(),
    api.get('/assets').catch(() => ({ data: { data: [] } })),
  ])
  if (assetRes.data.success) assets.value = assetRes.data.data
  loadProducts()
})
</script>

<style scoped>
.catalog {
  padding: 40px 0;
}

.catalog-header {
  margin-bottom: 32px;
}

.catalog-header h1 {
  font-size: 32px;
  margin-bottom: 8px;
}

.catalog-header p {
  color: var(--gray);
}

.catalog-layout {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 40px;
}

.catalog-sidebar {
  position: sticky;
  top: 20px;
  height: fit-content;
}

.filter-block {
  background: var(--white);
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.filter-block h3 {
  font-size: 16px;
  margin-bottom: 16px;
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-list li {
  margin-bottom: 8px;
}

.category-list a {
  display: block;
  padding: 8px 12px;
  border-radius: 6px;
  color: var(--gray);
  transition: all 0.2s;
  text-decoration: none;
}

.category-list a:hover,
.category-list a.active {
  background: var(--primary);
  color: var(--white);
}

.sort-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.search-bar {
  margin-bottom: 24px;
}

.search-bar input {
  width: 100%;
  padding: 14px 20px;
  border: 2px solid var(--gray-light);
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.search-bar input:focus {
  outline: none;
  border-color: var(--primary);
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.animate-card {
  opacity: 0;
  transform: translateY(16px);
  animation: fadeUp 0.6s forwards;
  animation-timing-function: cubic-bezier(0.25, 0.8, 0.25, 1);
}

.product-card {
  background: var(--white);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.product-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.product-image {
  height: 180px;
  background: var(--gray-light);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.product-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-content {
  padding: 20px;
}

.product-content h3 {
  font-size: 16px;
  margin-bottom: 8px;
  line-height: 1.4;
}

.product-desc {
  color: var(--gray);
  font-size: 13px;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-rating {
  margin-bottom: 12px;
}

.rating-text {
  font-size: 13px;
  color: #e6a817;
  font-weight: 600;
}

.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.product-price {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
}

.product-price-old {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
  margin-right: 8px;
}

.out-of-stock {
  font-size: 12px;
  color: #999;
}

.btn-add {
  padding: 8px 16px;
  background: var(--primary);
  color: var(--white);
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-add:hover {
  background: var(--primary-hover);
}

.product-buy-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.qty-input {
  width: 50px;
  padding: 6px 4px;
  border: 1px solid var(--gray-light);
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  outline: none;
  -moz-appearance: textfield;
}

.qty-input:focus {
  border-color: var(--primary);
}

.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: var(--gray);
}

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===== Tablet (768px - 1024px) ===== */
@media (min-width: 768px) and (max-width: 1024px) {
  .catalog {
    padding: 24px 0;
  }

  .catalog-header h1 {
    font-size: 26px;
  }

  .catalog-layout {
    grid-template-columns: 200px 1fr;
    gap: 24px;
  }

  .filter-block {
    padding: 16px;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .product-image {
    height: 150px;
  }

  .product-content {
    padding: 14px;
  }

  .product-content h3 {
    font-size: 14px;
  }

  .product-price {
    font-size: 17px;
  }

  .product-bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .search-bar input {
    padding: 12px 16px;
    font-size: 14px;
  }
}
</style>
