<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <router-link to="/" class="sidebar-logo">
        <span class="logo-icon">🔩</span>
        <span class="logo-text">КРЕПЁЖ</span>
      </router-link>
      <nav class="sidebar-nav">
        <router-link
          to="/"
          class="nav-item"
          :class="{ active: currentPath === '' || currentPath === '/' }"
        >
          <span class="nav-icon">📊</span> Дашборд
        </router-link>
        <router-link
          to="/products"
          class="nav-item"
          :class="{ active: currentPath === '/products' }"
        >
          <span class="nav-icon">📦</span> Товары
        </router-link>
        <router-link
          to="/categories"
          class="nav-item"
          :class="{ active: currentPath === '/categories' }"
        >
          <span class="nav-icon">🏷️</span> Категории
        </router-link>
        <router-link to="/orders" class="nav-item" :class="{ active: currentPath === '/orders' }">
          <span class="nav-icon">🛒</span> Заказы
        </router-link>
        <router-link to="/users" class="nav-item" :class="{ active: currentPath === '/users' }">
          <span class="nav-icon">👥</span> Пользователи
        </router-link>
        <router-link to="/reviews" class="nav-item" :class="{ active: currentPath === '/reviews' }">
          <span class="nav-icon">⭐</span> Отзывы
        </router-link>
        <router-link to="/assets" class="nav-item" :class="{ active: currentPath === '/assets' }">
          <span class="nav-icon">🎨</span> Иконки и изображения
        </router-link>
        <router-link to="/site-photos" class="nav-item" :class="{ active: currentPath === '/site-photos' }">
          <span class="nav-icon">🖼️</span> Фото сайта
        </router-link>
        <router-link to="/email-settings" class="nav-item" :class="{ active: currentPath === '/email-settings' }">
          <span class="nav-icon">📧</span> Настройки Email
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <button @click="logout" class="logout-btn"><span class="nav-icon">🚪</span> Выйти</button>
      </div>
    </aside>
    <main class="admin-main">
      <header class="admin-header">
        <h2 class="page-title">{{ pageTitle }}</h2>
        <div class="admin-user-info">
          <div class="user-avatar">{{ auth.user?.name?.charAt(0) || 'A' }}</div>
          <span class="user-name">{{ auth.user?.name }}</span>
        </div>
      </header>
      <div class="admin-content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const currentPath = computed(() => (route.path === '/' ? '' : route.path))

function logout() {
  auth.logout()
  router.push('/login')
}

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '': 'Дашборд',
    '/products': 'Товары',
    '/categories': 'Категории',
    '/orders': 'Заказы',
    '/users': 'Пользователи',
    '/reviews': 'Отзывы',
    '/assets': 'Иконки и изображения',
    '/site-photos': 'Фото сайта',
    '/email-settings': 'Настройки Email',
  }
  const detailMatch = route.path.match(/^\/orders\/(.+)/)
  if (detailMatch) return 'Детали заказа'
  return titles[route.path] || 'Админ-панель'
})
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background: transparent;
}

.admin-sidebar {
  width: 260px;
  background: var(--surface);
  border-right: 1px solid var(--gray-light);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px;
  border-bottom: 1px solid var(--gray-light);
  text-decoration: none;
  color: var(--dark);
}

.logo-icon {
  font-size: 32px;
}

.logo-text {
  font-size: 22px;
  font-weight: 700;
}

.sidebar-nav {
  flex: 1;
  padding: 16px 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  color: var(--text);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
  margin-bottom: 6px;
}

.nav-item:hover {
  background: var(--surface-strong);
}

.nav-item.active {
  background: linear-gradient(135deg, var(--primary), var(--primary-hover));
  color: var(--white);
}

.nav-icon {
  font-size: 18px;
}

.sidebar-footer {
  padding: 16px 12px;
  border-top: 1px solid var(--gray-light);
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--gray-light);
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
  color: var(--dark);
  transition: all 0.2s;
  background: var(--white);
}

.logout-btn:hover {
  color: var(--error);
  border-color: rgba(220, 38, 38, 0.35);
}

.admin-main {
  flex: 1;
  background: transparent;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.admin-header {
  background: var(--surface);
  padding: 20px 32px;
  border-bottom: 1px solid var(--gray-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.05);
}

.page-title {
  font-size: 24px;
  margin: 0;
}

.admin-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary), var(--primary-hover));
  color: #fff;
  font-weight: 700;
  font-size: 18px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.4);
}

.user-name {
  font-weight: 500;
}

.admin-content {
  flex: 1;
  padding: 32px;
  background: transparent;
}
</style>
