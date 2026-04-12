<template>
  <div>
    <h1 class="page-heading">Дашборд</h1>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">📦</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.products }}</div>
          <div class="stat-label">Товаров</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🏷️</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.categories }}</div>
          <div class="stat-label">Категорий</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🛒</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.orders }}</div>
          <div class="stat-label">Заказов</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.users }}</div>
          <div class="stat-label">Пользователей</div>
        </div>
      </div>
    </div>
    <div class="quick-links">
      <router-link to="/products" class="quick-link-card">
        <span class="quick-link-icon">📦</span>
        <span>Управление товарами</span>
      </router-link>
      <router-link to="/categories" class="quick-link-card">
        <span class="quick-link-icon">🏷️</span>
        <span>Управление категориями</span>
      </router-link>
      <router-link to="/orders" class="quick-link-card">
        <span class="quick-link-icon">🛒</span>
        <span>Управление заказами</span>
      </router-link>
      <router-link to="/users" class="quick-link-card">
        <span class="quick-link-icon">👥</span>
        <span>Управление пользователями</span>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../api/client'

const stats = ref({ products: 0, categories: 0, orders: 0, users: 0 })

onMounted(async () => {
  try {
    const [p, c, o, u] = await Promise.all([
      api.get('/products?limit=1'),
      api.get('/categories'),
      api.get('/admin/orders'),
      api.get('/admin/users'),
    ])
    stats.value = {
      products: p.data.data?.total || 0,
      categories: c.data.data?.length || 0,
      orders: o.data.data?.length || 0,
      users: u.data.data?.length || 0,
    }
  } catch { /* ignore */ }
})
</script>

<style scoped>
.page-heading {
  font-size: 28px;
  margin-bottom: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--white);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stat-icon {
  font-size: 40px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--primary);
}

.stat-label {
  color: var(--gray);
  font-size: 14px;
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.quick-link-card {
  background: var(--white);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  text-decoration: none;
  color: var(--dark);
  font-weight: 500;
  transition: all 0.2s;
}

.quick-link-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.quick-link-icon {
  font-size: 28px;
}
</style>
