<template>
  <div class="admin-page">
    <div class="page-header">
      <h1 class="page-heading">📧 Настройки Email (Яндекс)</h1>
      <p class="page-subtitle">Настройка SMTP для отправки писем подтверждения через Яндекс почту</p>
    </div>

    <div class="settings-card">
      <div v-if="loading" class="loading-state">Загрузка...</div>
      
      <div v-else>
        <div class="info-box">
          <h3>Как настроить Яндекс почту</h3>
          <ol>
            <li>Зайдите в настройки Яндекс почты → <strong>Пароли приложений</strong></li>
            <li>Создайте новый пароль приложения (название: "КРЕПЁЖ")</li>
            <li>Скопируйте полученный пароль</li>
            <li>Введите ваш email Яндекса и пароль приложения ниже</li>
            <li>Нажмите "Сохранить" и "Тестовое письмо" для проверки</li>
          </ol>
          <p class="info-link">
            <a href="https://passport.yandex.ru/profile/security/application-passwords" target="_blank">
              🔗 Перейти к паролям приложений Яндекса
            </a>
          </p>
        </div>

        <div v-if="configured" class="status-ok">
          ✅ SMTP настроен ({{ settings.email }})
        </div>

        <form @submit.prevent="save" class="settings-form">
          <div class="form-group">
            <label>Email Яндекса</label>
            <input v-model="settings.email" type="email" placeholder="your-email@yandex.ru" class="form-input" />
          </div>
          <div class="form-group">
            <label>Пароль приложения</label>
            <input v-model="settings.appPassword" type="password" placeholder="xxxxxxxxxxxxxxxx" class="form-input" />
            <p class="form-hint">Пароль приложения, а НЕ обычный пароль от Яндекса</p>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Сохранение...' : '💾 Сохранить' }}
            </button>
            <button type="button" class="btn btn-test" @click="testEmail" :disabled="testing || !configured">
              {{ testing ? 'Отправка...' : '📨 Тестовое письмо' }}
            </button>
          </div>

          <div v-if="status" class="status-message" :class="status.type">
            {{ status.text }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import api from '../api/client'

const message = useMessage()

const settings = ref({ email: '', appPassword: '' })
const configured = ref(false)
const loading = ref(true)
const saving = ref(false)
const testing = ref(false)
const status = ref<{ type: 'success' | 'error'; text: string } | null>(null)

async function load() {
  loading.value = true
  try {
    const res = await api.get('/settings/smtp')
    if (res.data.success) {
      settings.value.email = res.data.data.email || ''
      configured.value = res.data.data.configured
    }
  } catch (e: any) {
    message.error('Ошибка загрузки настроек')
  } finally {
    loading.value = false
  }
}

async function save() {
  saving.value = true
  status.value = null
  try {
    await api.put('/settings/smtp', settings.value)
    status.value = { type: 'success', text: '✅ Настройки сохранены!' }
    configured.value = true
    message.success('Настройки сохранены')
  } catch (e: any) {
    status.value = { type: 'error', text: '❌ Ошибка сохранения' }
    message.error('Ошибка сохранения')
  } finally {
    saving.value = false
  }
}

async function testEmail() {
  testing.value = true
  status.value = null
  try {
    const res = await api.post('/settings/smtp/test')
    if (res.data.success) {
      status.value = { type: 'success', text: '✅ ' + res.data.message }
      message.success(res.data.message)
    }
  } catch (e: any) {
    status.value = { type: 'error', text: '❌ ' + (e.response?.data?.error || 'Ошибка отправки') }
    message.error(e.response?.data?.error || 'Ошибка отправки')
  } finally {
    testing.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.admin-page { max-width: 800px; }
.page-header { margin-bottom: 24px; }
.page-heading { font-size: 28px; margin: 0 0 4px; }
.page-subtitle { margin: 0; color: var(--gray); font-size: 14px; }

.settings-card {
  background: var(--white);
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.info-box {
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.info-box h3 { margin: 0 0 12px; font-size: 16px; color: #1e40af; }
.info-box ol { margin: 0; padding-left: 20px; }
.info-box li { margin-bottom: 8px; font-size: 14px; line-height: 1.5; }

.info-link { margin-top: 12px; margin-bottom: 0; }
.info-link a { color: #2563eb; font-weight: 500; text-decoration: none; }
.info-link a:hover { text-decoration: underline; }

.status-ok {
  background: #d1fae5;
  color: #065f46;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  margin-bottom: 20px;
}

.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-weight: 600; margin-bottom: 6px; }
.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--gray-light);
  border-radius: 8px;
  font-size: 15px;
  box-sizing: border-box;
}
.form-input:focus { outline: none; border-color: var(--primary); }
.form-hint { margin: 4px 0 0; font-size: 12px; color: var(--gray); }

.form-actions { display: flex; gap: 12px; margin-top: 24px; }

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  font-size: 15px;
  transition: all 0.2s;
}
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-primary { background: var(--primary); color: white; }
.btn-primary:hover:not(:disabled) { background: var(--primary-hover); }
.btn-test { background: #10b981; color: white; }
.btn-test:hover:not(:disabled) { background: #059669; }

.status-message {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
}
.status-message.success { background: #d1fae5; color: #065f46; }
.status-message.error { background: #fef2f2; color: #991b1b; }

.loading-state { padding: 40px; text-align: center; color: var(--gray); }
</style>