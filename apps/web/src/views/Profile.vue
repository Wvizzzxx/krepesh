<template>
  <div class="profile-page">
    <div class="container">
      <h1>Профиль</h1>
      
      <div class="profile-card">
        <div class="profile-avatar">
          <span>{{ authStore.user?.name?.charAt(0) || 'U' }}</span>
        </div>
        <div class="profile-info">
          <h2>{{ authStore.user?.name }}</h2>
          <p class="profile-email">{{ authStore.user?.email }}</p>
          <div class="profile-role">
            <span class="role-badge" :class="authStore.user?.role">
              {{ authStore.user?.role === 'admin' ? 'Администратор' : 'Пользователь' }}
            </span>
          </div>
        </div>
      </div>

      <div class="profile-actions">
        <router-link to="/orders" class="action-card">
          <div class="action-icon">📦</div>
          <h3>Мои заказы</h3>
          <p>История заказов</p>
        </router-link>
        
        <a v-if="authStore.isAdmin" href="http://localhost:3002" target="_blank" class="action-card">
          <div class="action-icon">⚙️</div>
          <h3>Админ-панель</h3>
          <p>Управление сайтом</p>
        </a>
        
        <button @click="logout" class="action-card logout">
          <div class="action-icon">🚪</div>
          <h3>Выйти</h3>
          <p>Выйти из аккаунта</p>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function logout() {
  authStore.logout()
  router.push('/')
}
</script>

<style scoped>
.profile-page {
  padding: 40px 0;
}

.profile-page h1 {
  font-size: 32px;
  margin-bottom: 32px;
}

.profile-card {
  background: var(--white);
  border-radius: 16px;
  padding: 40px;
  display: flex;
  align-items: center;
  gap: 24px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  margin-bottom: 40px;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: 700;
  color: var(--white);
}

.profile-info h2 {
  font-size: 28px;
  margin-bottom: 8px;
}

.profile-email {
  color: var(--gray);
  margin-bottom: 12px;
}

.role-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.role-badge.admin {
  background: var(--primary);
  color: var(--white);
}

.role-badge.user {
  background: var(--gray-light);
  color: var(--dark);
}

.profile-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.action-card {
  background: var(--white);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: all 0.3s;
  cursor: pointer;
  border: none;
  text-decoration: none;
  color: inherit;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.action-card.logout:hover {
  box-shadow: 0 8px 24px rgba(220, 38, 38, 0.2);
}

.action-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.action-card h3 {
  font-size: 18px;
  margin-bottom: 8px;
}

.action-card p {
  color: var(--gray);
  font-size: 14px;
}
</style>