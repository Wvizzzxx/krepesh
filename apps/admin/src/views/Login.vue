<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-logo">
        <span class="logo-icon">🔩</span>
        <span class="logo-text">КРЕПЁЖ</span>
      </div>
      <div class="login-card">
        <h1>Вход в админ-панель</h1>
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="email" required placeholder="admin@krepesh.ru" class="form-input">
          </div>
          <div class="form-group">
            <label>Пароль</label>
            <input type="password" v-model="password" required placeholder="••••••" class="form-input">
          </div>
          <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
            {{ loading ? 'Входим...' : 'Войти' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const message = useMessage()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)

async function handleLogin() {
  if (!email.value || !password.value) {
    message.error('Заполните все поля')
    return
  }
  try {
    loading.value = true
    await auth.login(email.value, password.value)
    message.success('Добро пожаловать!')
    router.push('/')
  } catch (e: any) {
    message.error(e.message || 'Ошибка входа')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: var(--gray-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-container {
  width: 100%;
  max-width: 420px;
  padding: 0 24px;
}

.login-logo {
  text-align: center;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.logo-icon {
  font-size: 48px;
}

.logo-text {
  font-size: 32px;
  font-weight: 700;
  color: var(--primary);
}

.login-card {
  background: var(--white);
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.login-card h1 {
  font-size: 24px;
  margin-bottom: 32px;
  text-align: center;
}

.login-form .form-group {
  margin-bottom: 20px;
}

.login-form label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--dark);
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--gray-light);
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
}

.btn {
  display: inline-block;
  padding: 14px 28px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 16px;
}

.btn-primary {
  background: var(--primary);
  color: var(--white);
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-block {
  display: block;
  width: 100%;
}
</style>
