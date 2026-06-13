<template>
  <div class="home">
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-content">
          <p class="eyebrow">Поставщик №1</p>
          <h1>Крепежные изделия <span class="text-primary">оптом и в розницу</span></h1>
          <p>
            Более 10 000 наименований крепежа со склада в Москве. Доставка по всей России от 1 дня.
          </p>
          <router-link to="/catalog" class="btn btn-primary btn-lg">Перейти в каталог</router-link>
          <div class="hero-stats">
            <div v-for="stat in heroStats" :key="stat.label" class="hero-stat">
              <strong>{{ stat.value }}</strong>
              <span>{{ stat.label }}</span>
            </div>
          </div>
        </div>
        <div class="hero-image">
        <div class="hero-bubbles">
          <div class="hero-badge circle-card" style="position: static; margin-right: 20px;">
            <span class="badge-number">500+</span>
            <span class="badge-text">товаров</span>
          </div>
          <div class="hero-highlight circle-card" style="position: static;">
            <span class="highlight-text">Эксклюзивные<br />предложения</span>
            <span class="highlight-subtext">каждую неделю</span>
          </div>
        </div>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="container">
        <div class="features-grid">
          <div
            v-for="(feature, index) in featureCards"
            :key="feature.title"
            class="feature-card animate-card"
            :style="cardAnimationStyle(index)"
          >
            <div class="feature-icon">
              <img v-if="getFeatureIcon(feature.icon).startsWith('/uploads')" :src="getFeatureIcon(feature.icon)" :alt="feature.title" style="max-height: 56px; max-width: 56px; object-fit: contain;" />
              <Icon v-else :name="feature.icon" size="3x" />
            </div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="categories-section">
      <div class="container">
        <h2 class="section-title">Популярные категории</h2>
        <div class="categories-grid">
          <router-link
            v-for="(cat, index) in categories"
            :key="cat._id"
            :to="`/catalog?categoryId=${cat._id}`"
            class="category-card animate-card"
            :style="cardAnimationStyle(index)"
          >
            <div class="category-icon">
              <img v-if="getCategoryIcon(cat.name).startsWith('/uploads')" :src="getCategoryIcon(cat.name)" :alt="cat.name" style="height: 48px; width: 48px; object-fit: contain;" />
              <span v-else>{{ getCategoryIcon(cat.name) }}</span>
            </div>
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
          <div
            v-for="(product, index) in products"
            :key="product._id"
            class="product-card animate-card"
            :style="cardAnimationStyle(index)"
          >
            <router-link :to="`/product/${product._id}`">
              <div class="product-image">
                <img :src="getProductImage(product)" :alt="product.name" class="product-photo" />
              </div>
              <div class="product-info">
                <h3>{{ product.name }}</h3>
                <p class="product-price">{{ product.price }} ₽</p>
                <button class="btn btn-primary btn-sm" @click.prevent="addToCart(product)">
                  В корзину
                </button>
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
import { ref, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import api from '../api/client'
import { useCartStore } from '../stores/cart'

const message = useMessage()
const cartStore = useCartStore()
const heroStats = [
  { label: 'Партнёров по всей России', value: '1 250' },
  { label: 'Сертификатов в базе', value: '150+' },
  { label: 'Средний срок доставки', value: '48 ч' },
]
const featureCards = [
  {
    icon: 'truck',
    title: 'Быстрая доставка',
    description: 'Отгружаем с московского склада за 1 день.',
  },
  {
    icon: 'check-circle',
    title: 'Гарантия качества',
    description: 'Сертифицированная продукция от ведущих производителей.',
  },
  {
    icon: 'money',
    title: 'Лучшие цены',
    description: 'Оптовые скидки, кешбек и фиксированные тарифы.',
  },
  {
    icon: 'headset',
    title: 'Поддержка 24/7',
    description: 'Поможем подобрать крепеж и оформить логистику.',
  },
]
const categories = ref<any[]>([])
const products = ref<any[]>([])
const assets = ref<any[]>([])

// Map of assets by key for quick lookup
const assetMap = computed(() => {
  const map: Record<string, any> = {}
  for (const a of assets.value) {
    map[a.key] = a
  }
  return map
})

function cardAnimationStyle(index: number) {
  return { animationDelay: `${index * 0.08}s` }
}

// Get icon for feature card - use asset URL if uploaded, otherwise use FA icon name
function getFeatureIcon(iconName: string): string {
  // Map feature icon names to asset keys
  const keyMap: Record<string, string> = {
    'truck': 'home-delivery',
    'check-circle': 'home-quality',
    'money': 'home-prices',
    'headset': 'home-support',
  }
  const key = keyMap[iconName]
  if (key && assetMap.value[key]?.url) return assetMap.value[key].url
  return iconName // Return FA icon name as fallback
}

// Get emoji for category - use asset URL if uploaded, otherwise emoji from asset
function getCategoryEmoji(name: string): string {
  const value = name.toLowerCase()
  let key = 'category-bolts'
  if (value.includes('гайк')) key = 'category-nuts'
  else if (value.includes('шуруп') || value.includes('винт')) key = 'category-screws'
  else if (value.includes('саморез')) key = 'category-selftapping'

  const asset = assetMap.value[key]
  if (asset?.url) return asset.url // Return image URL
  return asset?.emoji || '🔩' // Return emoji or default
}

function svgPlaceholder(label: string, width = 620, height = 420): string {
  const safeLabel = label || 'Фото товара'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2f3745"/><stop offset="100%" stop-color="#131722"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><circle cx="${width / 2}" cy="${height / 2 - 20}" r="42" fill="#ff6b00" opacity="0.9"/><text x="50%" y="56%" text-anchor="middle" fill="#f8fafc" font-size="20" font-family="Arial, sans-serif">${safeLabel}</text><text x="50%" y="66%" text-anchor="middle" fill="#94a3b8" font-size="14" font-family="Arial, sans-serif">Замените на реальное фото</text></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function getCategoryIcon(name: string): string {
  return getCategoryEmoji(name)
}

function getProductImage(product: any): string {
  const source = product?.images?.[0] || product?.image
  if (source) return source
  // Use uploaded placeholder from assets
  const placeholder = assetMap.value['product-placeholder']
  if (placeholder?.url) return placeholder.url
  return svgPlaceholder(product?.name || 'Фото товара')
}

function addToCart(product: any) {
  cartStore.addItem(product, 1)
  message.success('Добавлено в корзину')
}

onMounted(async () => {
  const [catRes, prodRes, assetRes] = await Promise.all([
    api.get('/categories'),
    api.get('/products', { params: { limit: '8' } }),
    api.get('/assets').catch(() => ({ data: { data: [] } })),
  ])
  if (catRes.data.success) categories.value = catRes.data.data
  if (prodRes.data.success) products.value = prodRes.data.data.items
  if (assetRes.data.success) assets.value = assetRes.data.data
})
</script>

<style scoped>
.hero {
  background: linear-gradient(135deg, var(--dark) 0%, #333 100%);
  color: var(--white);
  padding: 80px 0;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,107,0,0.1) 0%, rgba(255,107,0,0) 70%);
  animation: rotate 20s linear infinite;
  z-index: 0;
}

.hero-inner {
  display: flex;
  align-items: center;
  gap: 60px;
  position: relative;
  z-index: 1;
}

.hero-content {
  flex: 1;
}

.hero-content h1 {
  font-size: 48px;
  line-height: 1.2;
  margin-bottom: 20px;
  animation: fadeInUp 0.8s ease-out;
}

.text-primary {
  color: var(--primary);
}

.hero-content p {
  font-size: 18px;
  color: #aaa;
  margin-bottom: 32px;
  animation: fadeInUp 0.8s ease-out 0.2s both;
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-bubbles {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
  flex-wrap: wrap;
}

.circle-card {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 16px;
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.circle-card:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 30px rgba(255, 107, 0, 0.3);
}

.hero-stats {
  display: flex;
  gap: 18px;
  margin-top: 28px;
  flex-wrap: wrap;
  animation: fadeInUp 0.8s ease-out 0.4s both;
}

.hero-stat {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 10px 18px;
  border-radius: 12px;
  min-width: 120px;
}

.hero-stat strong {
  display: block;
  font-size: 18px;
}

.hero-highlight {
  background: rgba(255, 107, 0, 0.2);
  border: 1px solid rgba(255, 107, 0, 0.4);
  color: #fff;
  font-weight: 600;
  line-height: 1.4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.highlight-text {
  font-size: 16px;
  line-height: 1.3;
}

.highlight-subtext {
  font-size: 12px;
  opacity: 0.9;
  margin-top: 4px;
}

.hero-badge {
  background: var(--primary);
  box-shadow: 0 12px 30px rgba(255, 107, 0, 0.4);
}

.badge-number {
  display: block;
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 5px;
}

.badge-text {
  font-size: 14px;
}

.btn {
  display: inline-block;
  padding: 12px 28px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
  animation: fadeInUp 0.8s ease-out 0.6s both;
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
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
  position: relative;
  overflow: hidden;
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(255,107,0,0.1) 0%, rgba(255,107,0,0) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.category-card:hover::before {
  opacity: 1;
}

.category-card:hover {
  border-color: var(--primary);
  transform: translateY(-4px);
}

.category-icon {
  font-size: 48px;
  margin-bottom: 16px;
  line-height: 1;
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
  position: relative;
  overflow: visible;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
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
  overflow: hidden;
}

.product-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

@keyframes fadeUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ===== Tablet (768px - 1024px) ===== */
@media (min-width: 768px) and (max-width: 1024px) {
  .hero {
    padding: 50px 0;
  }

  .hero-inner {
    gap: 30px;
  }

  .hero-content h1 {
    font-size: 36px;
  }

  .hero-content p {
    font-size: 16px;
  }

  .hero-bubbles {
    gap: 20px;
  }

  .circle-card {
    width: 140px;
    height: 140px;
  }

  .badge-number {
    font-size: 26px;
  }

  .highlight-text {
    font-size: 14px;
  }

  .hero-stats {
    gap: 12px;
  }

  .hero-stat {
    padding: 8px 14px;
    min-width: 100px;
  }

  .hero-stat strong {
    font-size: 16px;
  }

  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .feature-card {
    padding: 24px 18px;
  }

  .section-title {
    font-size: 26px;
    margin-bottom: 30px;
  }

  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .category-card {
    padding: 24px;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .product-image {
    height: 160px;
  }

  .btn-lg {
    padding: 14px 28px;
    font-size: 16px;
  }
}
</style>