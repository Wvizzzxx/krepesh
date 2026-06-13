<template>
  <header class="header">
    <div class="header-top">
      <div class="container header-top-inner">
        <span>📍 Доставка по всей России</span>
        <span>📞 +7 (800) 123-45-67</span>
        <span>🕒 Пн-Пт 9:00-18:00</span>
      </div>
    </div>

    <div class="header-main">
      <div class="container header-main-inner">
         <router-link to="/" class="logo">
           <span class="logo-icon">⚙️</span>
           <span class="logo-text">КРЕПЁЖ</span>
         </router-link>
        <div class="search-box">
          <input
            type="text"
            placeholder="Поиск товаров..."
            v-model="searchQuery"
            @keyup.enter="doSearch"
          />
          <button @click="doSearch">🔍</button>
        </div>
        <div class="header-actions">
          <router-link to="/cart" class="cart-btn">
            <span class="cart-icon">🛒</span>
            <span class="cart-count" v-if="cartStore.itemCount">{{ cartStore.itemCount }}</span>
          </router-link>
          <template v-if="authStore.isLoggedIn">
            <router-link to="/profile" class="user-btn">{{ authStore.user?.name }}</router-link>
            <button @click="logout" class="logout-btn">Выйти</button>
          </template>
          <router-link v-else to="/login" class="login-btn">Войти</router-link>
        </div>
      </div>
    </div>

    <nav class="header-nav">
      <div class="container nav-inner">
        <ul class="nav-list">
          <li v-for="link in navLinks" :key="link.label">
            <router-link :to="link.to">{{ link.label }}</router-link>
          </li>
          <li v-if="authStore.isAdmin">
            <a href="http://localhost:3002" target="_blank">Админ-панель</a>
          </li>
        </ul>
        <router-link to="/promotions" class="nav-cta">🔥 Акции</router-link>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useCartStore } from '../../stores/cart'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const searchQuery = ref('')

const navLinks = [
  { label: 'Главная', to: '/' },
  { label: 'Каталог', to: '/catalog' },
  { label: 'О компании', to: '/about' },
  { label: 'Доставка', to: '/delivery' },
  { label: 'Контакты', to: '/contacts' },
  { label: 'Бренды', to: '/brands' },
  { label: 'Отзывы', to: '/reviews' },
  { label: 'Сертификаты', to: '/certificates' },
]

function doSearch() {
  if (searchQuery.value.trim()) {
    router.push({ path: '/catalog', query: { search: searchQuery.value } })
  }
}

function logout() {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.header {
  background: var(--white);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.header-top {
  background: var(--dark);
  color: var(--white);
  font-size: 13px;
  padding: 8px 0;
}

.header-top-inner {
  display: flex;
  gap: 24px;
}

.header-main {
  padding: 16px 0;
}

.header-main-inner {
  display: flex;
  align-items: center;
  gap: 32px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 24px;
  font-weight: 700;
  color: var(--primary);
}

.logo-icon {
  font-size: 32px;
}

.search-box {
  flex: 1;
  display: flex;
  border: 2px solid var(--gray-light);
  border-radius: 8px;
  overflow: hidden;
}

.search-box input {
  flex: 1;
  padding: 12px 16px;
  border: none;
  outline: none;
  font-size: 15px;
}

.search-box button {
  padding: 12px 20px;
  background: var(--primary);
  border: none;
  color: white;
  cursor: pointer;
}

.search-box button:hover {
  background: var(--primary-hover);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.cart-btn {
  position: relative;
  padding: 8px 12px;
  background: var(--gray-light);
  border-radius: 8px;
  font-size: 20px;
}

.cart-count {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--primary);
  color: white;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
}

.login-btn,
.user-btn,
.logout-btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}

.login-btn {
  background: var(--primary);
  color: white;
}

.login-btn:hover {
  background: var(--primary-hover);
}

.logout-btn {
  background: none;
  border: 1px solid var(--gray);
  color: var(--gray);
}

.logout-btn:hover {
  border-color: var(--dark);
  color: var(--dark);
}

.header-nav {
  background: #0f172a;
  padding: 0;
}

.nav-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.nav-list {
  display: flex;
  list-style: none;
  gap: 0;
}

.nav-list li a {
  display: block;
  padding: 14px 24px;
  color: var(--white);
  font-weight: 500;
  transition: background 0.2s;
}

.nav-list li a:hover,
.nav-list li a.router-link-active {
  background: var(--primary);
}

.nav-cta {
  padding: 10px 22px;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--primary), var(--primary-hover));
  color: #fff;
  font-weight: 600;
  box-shadow: 0 10px 25px rgba(255, 107, 0, 0.35);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.nav-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(255, 107, 0, 0.4);
}

/* ===== Tablet (768px - 1024px) ===== */
@media (min-width: 768px) and (max-width: 1024px) {
  .header-top-inner {
    justify-content: center;
    gap: 16px;
    font-size: 12px;
  }

  .header-main-inner {
    gap: 16px;
    flex-wrap: wrap;
  }

  .logo {
    font-size: 20px;
  }

  .logo-icon {
    font-size: 26px;
  }

  .search-box {
    order: 3;
    flex-basis: 100%;
  }

  .header-actions {
    gap: 10px;
    margin-left: auto;
  }

  .login-btn,
  .user-btn,
  .logout-btn {
    padding: 8px 14px;
    font-size: 13px;
  }

  .nav-list li a {
    padding: 12px 14px;
    font-size: 13px;
  }

  .nav-cta {
    padding: 8px 16px;
    font-size: 13px;
  }
}
</style>
