<template>
  <div class="home">
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-content">
          <h1>Крепежные изделия <span class="text-primary">оптом и в розницу</span></h1>
          <p>Более 10 000 наименований крепежа со склада в Москве. Доставка по всей России от 1 дня.</p>
          <router-link to="/catalog" class="btn btn-primary btn-lg">Перейти в каталог</router-link>
        </div>
        <div class="hero-image">
          <div class="hero-badge">
            <span class="badge-number">10 000+</span>
            <span class="badge-text">товаров</span>
          </div>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="container">
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🚚</div>
            <h3>Быстрая доставка</h3>
            <p>Доставка по Москве от 1 дня, по России от 2 дней</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">✓</div>
            <h3>Гарантия качества</h3>
            <p>Сертифицированная продукция от ведущих производителей</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💰</div>
            <h3>Лучшие цены</h3>
            <p>Прямые поставки с заводов, выгодные оптовые цены</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📞</div>
            <h3>Поддержка 24/7</h3>
            <p>Поможем подобрать крепеж и оформить заказ</p>
          </div>
        </div>
      </div>
    </section>

    <section class="categories-section">
      <div class="container">
        <h2 class="section-title">Популярные категории</h2>
        <div class="categories-grid">
          <router-link v-for="cat in categories" :key="cat._id" :to="`/catalog?categoryId=${cat._id}`" class="category-card">
            <div class="category-icon">🔩</div>
            <h3>{{ cat.name }}</h3>
            <p>{{ cat.description || 'Широкий ассортимент' }}</p>
          </router-link>
        </div>
      </div>
    </section>

    <section class="products-section">
      <div class="container">
        <h2 class="section-title">Новинки каталога</h2>
        <div class="products-grid">
          <div v-for="product in products" :key="product._id" class="product-card">
            <router-link :to="`/product/${product._id}`">
              <div class="product-image">
                <span class="product-emoji">🔩</span>
              </div>
              <div class="product-info">
                <h3>{{ product.name }}</h3>
                <p class="product-price">{{ product.price }} ₽</p>
                <button class="btn btn-primary btn-sm" @click.prevent="addToCart(product)">В корзину</button>
              </div>
            </router-link>
          </div>
        </div>
        <div class="section-footer">
          <router-link to="/catalog" class="btn btn-outline">Смотреть все товары</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import axios from 'axios'
import { useCartStore } from '../stores/cart'

const message = useMessage()
const cartStore = useCartStore()
const categories = ref<any[]>([])
const products = ref<any[]>([])

function addToCart(product: any) {
  cartStore.addItem(product, 1)
  message.success('Добавлено в корзину')
}

onMounted(async () => {
  const [catRes, prodRes] = await Promise.all([
    axios.get('/api/categories'),
    axios.get('/api/products?limit=8')
  ])
  if (catRes.data.success) categories.value = catRes.data.data
  if (prodRes.data.success) products.value = prodRes.data.data.items
})
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, var(--dark) 0%, #333 100%);
  color: var(--white);
  padding: 80px 0;
}

.hero-inner {
  display: flex;
  align-items: center;
  gap: 60px;
}

.hero-content {
  flex: 1;
}

.hero-content h1 {
  font-size: 48px;
  line-height: 1.2;
  margin-bottom: 20px;
}

.text-primary {
  color: var(--primary);
}

.hero-content p {
  font-size: 18px;
  color: #aaa;
  margin-bottom: 32px;
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: center;
}

.hero-badge {
  background: var(--primary);
  padding: 40px;
  border-radius: 50%;
  text-align: center;
}

.badge-number {
  display: block;
  font-size: 48px;
  font-weight: 700;
}

.badge-text {
  font-size: 18px;
}

.btn {
  display: inline-block;
  padding: 12px 28px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.btn-primary {
  background: var(--primary);
  color: var(--white);
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-outline {
  background: transparent;
  border-color: var(--primary);
  color: var(--primary);
}

.btn-outline:hover {
  background: var(--primary);
  color: var(--white);
}

.btn-lg {
  padding: 16px 36px;
  font-size: 18px;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 14px;
}

.features {
  padding: 60px 0;
  background: var(--gray-light);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.feature-card {
  background: var(--white);
  padding: 32px 24px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.feature-icon {
  font-size: 40px;
  margin-bottom: 16px;
}

.feature-card h3 {
  margin-bottom: 8px;
}

.feature-card p {
  color: var(--gray);
  font-size: 14px;
}

.section-title {
  text-align: center;
  font-size: 32px;
  margin-bottom: 40px;
}

.categories-section {
  padding: 60px 0;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.category-card {
  background: var(--gray-light);
  padding: 32px;
  border-radius: 12px;
  text-align: center;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.category-card:hover {
  border-color: var(--primary);
  transform: translateY(-4px);
}

.category-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.category-card h3 {
  margin-bottom: 8px;
}

.category-card p {
  color: var(--gray);
  font-size: 14px;
}

.products-section {
  padding: 60px 0;
  background: var(--gray-light);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.product-card {
  background: var(--white);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.product-card a {
  display: block;
}

.product-image {
  height: 200px;
  background: var(--gray-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-emoji {
  font-size: 80px;
}

.product-info {
  padding: 20px;
}

.product-info h3 {
  font-size: 16px;
  margin-bottom: 8px;
}

.product-price {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 12px;
}

.section-footer {
  text-align: center;
  margin-top: 40px;
}
</style>