<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <h1>Вход</h1>
        <p class="auth-subtitle">Войдите в свой аккаунт</p>
        
        <form @submit.prevent="login" class="auth-form">
          <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="email" placeholder="email@example.com" required>
          </div>
          <div class="form-group">
            <label>Пароль</label>
            <input type="password" v-model="password" placeholder="••••••" required>
          </div>
          <button type="submit" class="btn btn-primary btn-block">Войти</button>
        </form>

        <p class="auth-footer">
          Нет аккаунта? <router-link to="/register">Зарегистрироваться</router-link>
        </p>
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
const authStore = useAuthStore()
const email = ref('')
const password = ref('')

async function login() {
  const result = await authStore.login(email.value, password.value)
  if (result.success) {
    message.success('Добро пожаловать!')
    router.push('/')
  } else {
    message.error(result.error || 'Ошибка входа')
  }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gray-light);
  padding: 40px 0;
}

.auth-container {
  width: 100%;
  max-width: 420px;
}

.auth-card {
  background: var(--white);
  border-radius: 16px;
  padding: 48px 40px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.1);
}

.auth-card h1 {
  font-size: 28px;
  margin-bottom: 8px;
  text-align: center;
}

.auth-subtitle {
  color: var(--gray);
  text-align: center;
  margin-bottom: 32px;
}

.auth-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--dark);
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid var(--gray-light);
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-group input:focus {
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

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-block {
  display: block;
  width: 100%;
}

.auth-footer {
  text-align: center;
  color: var(--gray);
}

.auth-footer a {
  color: var(--primary);
  font-weight: 500;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>