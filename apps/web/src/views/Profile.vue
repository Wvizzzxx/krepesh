<template>
  <div class="profile-page">
    <div class="container">
      <h1>Профиль</h1>
      
      <div class="profile-card">
        <div class="profile-avatar-wrapper">
          <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" alt="Avatar" class="profile-avatar-img" />
          <div v-else class="profile-avatar">
            <span>{{ authStore.user?.name?.charAt(0) || 'U' }}</span>
          </div>
          
          <div class="avatar-upload">
            <input type="file" id="avatar-upload" accept="image/*" @change="onAvatarChange" class="hidden-input" />
            <label for="avatar-upload" class="upload-label">📷</label>
          </div>
        </div>
        
        <div class="profile-info">
          <div class="profile-edit-header">
            <h2 v-if="!isEditingName">{{ authStore.user?.name }}</h2>
            <input v-else v-model="editName" class="name-input" />
            <button @click="toggleEditName" class="edit-btn">
              {{ isEditingName ? '💾 Сохранить' : '✏️ Редактировать' }}
            </button>
          </div>
          
          <div class="profile-details">
            <div class="detail-group">
              <label>Email:</label>
              <div class="email-row">
                <p class="profile-email">{{ authStore.user?.email }}</p>
                <span v-if="authStore.user?.emailVerified" class="verified-badge">✅ Подтверждён</span>
                <span v-else class="unverified-badge">❌ Не подтверждён</span>
              </div>
            </div>
            
            <!-- Email Verification Section -->
            <div v-if="!authStore.user?.emailVerified" class="verify-section">
              <div v-if="!showCodeInput">
                <button class="btn btn-verify" @click="sendVerificationCode" :disabled="sendingCode">
                  {{ sendingCode ? 'Отправка кода...' : '📧 Подтвердить email' }}
                </button>
                <p class="verify-hint">Код подтверждения придёт на {{ authStore.user?.email }}</p>
              </div>
              <div v-else class="code-input-section">
                <p class="code-sent-msg">{{ sendStatus }}</p>
                <div class="code-row">
                  <input 
                    v-model="verificationCode" 
                    type="text" 
                    maxlength="6" 
                    placeholder="000000" 
                    class="code-input"
                    @input="onCodeInput"
                  />
                  <button class="btn btn-verify" @click="verifyEmail" :disabled="verificationCode.length !== 6 || verifying">
                    {{ verifying ? 'Проверка...' : '✅ Подтвердить' }}
                  </button>
                </div>
                <button class="btn-link" @click="sendVerificationCode" :disabled="cooldown > 0">
                  {{ cooldown > 0 ? `Повторить через ${cooldown}с` : 'Отправить код повторно' }}
                </button>
              </div>
              <p v-if="verifyError" class="verify-error">{{ verifyError }}</p>
            </div>

            <div class="detail-group">
              <label>Телефон:</label>
              <p v-if="!isEditingPhone">{{ authStore.user?.phone || 'Не указан' }}</p>
              <input v-else v-model="editPhone" class="phone-input" placeholder="+7 (XXX) XXX-XX-XX" />
              <button @click="toggleEditPhone" class="inline-edit-btn">
                {{ isEditingPhone ? '💾' : '✏️' }}
              </button>
            </div>
            
            <div class="detail-group">
              <label>Адрес доставки:</label>
              <p v-if="!isEditingAddress">{{ authStore.user?.address || 'Не указан' }}</p>
              <textarea v-else v-model="editAddress" class="address-input" placeholder="Введите ваш адрес"></textarea>
              <button @click="toggleEditAddress" class="inline-edit-btn">
                {{ isEditingAddress ? '💾' : '✏️' }}
              </button>
            </div>
            
            <div class="profile-role">
              <span class="role-badge" :class="authStore.user?.role">
                {{ authStore.user?.role === 'admin' ? 'Администратор' : 'Пользователь' }}
              </span>
            </div>
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useMessage } from 'naive-ui'
import api from '../api/client'

const router = useRouter()
const authStore = useAuthStore()
const message = useMessage()

const isEditingName = ref(false)
const isEditingPhone = ref(false)
const isEditingAddress = ref(false)
const editName = ref('')
const editPhone = ref('')
const editAddress = ref('')

// Email verification
const showCodeInput = ref(false)
const verificationCode = ref('')
const sendingCode = ref(false)
const verifying = ref(false)
const verifyError = ref('')
const sendStatus = ref('')
const cooldown = ref(0)
let cooldownInterval: ReturnType<typeof setInterval> | null = null

function logout() {
  authStore.logout()
  router.push('/')
}

function toggleEditName() {
  if (isEditingName.value) {
    if (editName.value.trim()) {
      updateProfile({ name: editName.value.trim() })
    } else {
      message.warning('Имя не может быть пустым')
    }
  } else {
    editName.value = authStore.user?.name || ''
  }
  isEditingName.value = !isEditingName.value
}

function toggleEditPhone() {
  if (isEditingPhone.value) {
    updateProfile({ phone: editPhone.value.trim() })
  } else {
    editPhone.value = authStore.user?.phone || ''
  }
  isEditingPhone.value = !isEditingPhone.value
}

function toggleEditAddress() {
  if (isEditingAddress.value) {
    updateProfile({ address: editAddress.value.trim() })
  } else {
    editAddress.value = authStore.user?.address || ''
  }
  isEditingAddress.value = !isEditingAddress.value
}

async function updateProfile(updates: Partial<any>) {
  try {
    const response = await api.put('/auth/profile', updates)
    if (response.data.success) {
      authStore.updateUser(response.data.data)
      message.success('Профиль обновлен')
    }
  } catch (e: any) {
    message.error(e.response?.data?.message || 'Ошибка при обновлении профиля')
  }
}

// Email verification functions
async function sendVerificationCode() {
  sendingCode.value = true
  verifyError.value = ''
  sendStatus.value = 'Отправка кода...'
  showCodeInput.value = true
  try {
    const res = await api.post('/auth/send-verification')
    if (res.data.success) {
      if (res.data.message === 'Email already verified') {
        authStore.updateUser({ emailVerified: true } as any)
        showCodeInput.value = false
        message.success('Email уже подтверждён')
        return
      }
      sendStatus.value = res.data.data.message || 'Код отправлен на email'
      startCooldown()
      message.success('Код подтверждения отправлен!')
    }
  } catch (e: any) {
    verifyError.value = e.response?.data?.error || 'Ошибка отправки кода'
    showCodeInput.value = false
  } finally {
    sendingCode.value = false
  }
}

function onCodeInput() {
  verificationCode.value = verificationCode.value.replace(/\D/g, '')
}

async function verifyEmail() {
  if (verificationCode.value.length !== 6) return
  verifying.value = true
  verifyError.value = ''
  try {
    const res = await api.post('/auth/verify-email', { code: verificationCode.value })
    if (res.data.success) {
      authStore.updateUser(res.data.data as any)
      showCodeInput.value = false
      verificationCode.value = ''
      message.success('✅ Email успешно подтверждён!')
    }
  } catch (e: any) {
    verifyError.value = e.response?.data?.error || 'Ошибка верификации'
  } finally {
    verifying.value = false
  }
}

function startCooldown() {
  cooldown.value = 60
  if (cooldownInterval) clearInterval(cooldownInterval)
  cooldownInterval = setInterval(() => {
    cooldown.value--
    if (cooldown.value <= 0) {
      if (cooldownInterval) clearInterval(cooldownInterval)
    }
  }, 1000)
}

onUnmounted(() => {
  if (cooldownInterval) clearInterval(cooldownInterval)
})

async function onAvatarChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  
  if (!file.type.match('image.*')) {
    message.error('Пожалуйста, выберите изображение')
    return
  }
  
  const formData = new FormData()
  formData.append('avatar', file)
  
  try {
    const token = localStorage.getItem('token')
    const response = await api.post('/auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.data.success) {
      authStore.updateUser(response.data.data)
      message.success('Аватар обновлен')
    }
  } catch (e: any) {
    message.error(e.response?.data?.message || 'Ошибка при загрузке аватара')
  }
}

onMounted(() => {
  authStore.fetchProfile()
})
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
  align-items: flex-start;
  gap: 24px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  margin-bottom: 40px;
}

.profile-avatar-wrapper {
  position: relative;
  display: inline-block;
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

.profile-avatar-img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--gray-light);
}

.avatar-upload {
  position: absolute;
  bottom: 0;
  right: 0;
  background: var(--white);
  border-radius: 50%;
  padding: 4px;
  border: 2px solid var(--gray-light);
}

.upload-label {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  transition: background 0.2s;
}

.upload-label:hover {
  background: var(--gray-light);
}

.hidden-input {
  display: none;
}

.profile-info {
  flex: 1;
}

.profile-edit-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.profile-edit-header h2 {
  font-size: 28px;
  margin: 0;
}

.name-input {
  font-size: 28px;
  padding: 8px 12px;
  border: 2px solid var(--gray-light);
  border-radius: 8px;
  width: 300px;
}

.edit-btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.inline-edit-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  margin-left: 8px;
  padding: 4px;
  border-radius: 4px;
}

.inline-edit-btn:hover {
  background: var(--gray-light);
}

.detail-group {
  margin-bottom: 16px;
}

.detail-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--dark);
}

.detail-group p {
  margin: 0;
  color: var(--gray);
}

.email-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.verified-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #d1fae5;
  color: #065f46;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.unverified-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #fef2f2;
  color: #991b1b;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.verify-section {
  margin: 16px 0 20px;
  padding: 20px;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
}

.btn-verify {
  padding: 10px 20px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-verify:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-verify:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.verify-hint {
  margin-top: 8px;
  font-size: 13px;
  color: var(--gray);
}

.code-sent-msg {
  margin-bottom: 12px;
  font-size: 14px;
  color: #065f46;
  font-weight: 500;
}

.code-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.code-input {
  width: 160px;
  padding: 12px 16px;
  border: 2px solid var(--gray-light);
  border-radius: 8px;
  font-size: 24px;
  text-align: center;
  letter-spacing: 8px;
  font-weight: 700;
  font-family: monospace;
}

.code-input:focus {
  outline: none;
  border-color: #2563eb;
}

.btn-link {
  background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
  font-size: 13px;
  margin-top: 8px;
  padding: 4px 0;
}

.btn-link:disabled {
  color: var(--gray);
  cursor: not-allowed;
}

.verify-error {
  margin-top: 10px;
  color: #dc2626;
  font-size: 14px;
  font-weight: 500;
}

.phone-input, .address-input {
  width: 100%;
  padding: 8px 12px;
  border: 2px solid var(--gray-light);
  border-radius: 8px;
  margin-top: 4px;
  box-sizing: border-box;
}

.address-input {
  min-height: 60px;
  resize: vertical;
}

.profile-email {
  color: var(--gray);
  margin: 0;
}

.role-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  margin-top: 12px;
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

/* ===== Tablet (768px - 1024px) ===== */
@media (min-width: 768px) and (max-width: 1024px) {
  .profile-page {
    padding: 24px 0;
  }

  .profile-page h1 {
    font-size: 26px;
    margin-bottom: 24px;
  }

  .profile-card {
    padding: 28px;
    gap: 20px;
  }

  .profile-avatar,
  .profile-avatar-img {
    width: 80px;
    height: 80px;
    font-size: 32px;
  }

  .profile-edit-header h2 {
    font-size: 22px;
  }

  .name-input {
    font-size: 22px;
    width: 240px;
  }

  .profile-actions {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  .action-card {
    padding: 18px;
  }

  .action-icon {
    font-size: 36px;
  }

  .action-card h3 {
    font-size: 16px;
  }
}
</style>