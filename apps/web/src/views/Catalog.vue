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
                <a href="#" @click.prevent="filterByCategory('')" :class="{ active: !selectedCategory }">Все товары</a>
              </li>
              <li v-for="cat in productsStore.categories" :key="cat._id">
                <a href="#" @click.prevent="filterByCategory(cat._id)" :class="{ active: selectedCategory === cat._id }">
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
            <input type="text" v-model="search" placeholder="Поиск товаров..." @input="debouncedSearch">
          </div>

          <div v-if="productsStore.loading" class="loading-state">
            <n-spin size="large" />
          </div>

          <div v-else class="products-grid">
            <div v-for="product in productsStore.products" :key="product._id" class="product-card">
              <router-link :to="`/product/${product._id}`" class="product-link">
                <div class="product-image">
                  <span class="product-emoji">🔩</span>
                </div>
                <div class="product-content">
                  <h3>{{ product.name }}</h3>
                  <p class="product-desc">{{ product.description }}</p>
                  <div class="product-bottom">
                    <span class="product-price">{{ product.price }} ₽</span>
                    <span v-if="product.stock === 0" class="out-of-stock">Нет в наличии</span>
                    <button v-else class="btn-add" @click.prevent="addToCart(product)">В корзину</button>
                  </div>
                </div>
              </router-link>
            </div>
          </div>

          <div v-if="!productsStore.loading && productsStore.products.length === 0" class="empty-state">
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
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMessage, NSpin } from 'naive-ui'
import { useProductsStore } from '../stores/products'
import { useCartStore } from '../stores/cart'
import Pagination from '../components/Pagination.vue'

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

function addToCart(product: any) {
  cartStore.addItem(product, 1)
  message.success('Добавлено в корзину')
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

  await productsStore.fetchCategories()
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
}

.product-emoji {
  font-size: 64px;
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

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: var(--gray);
}
</style>
