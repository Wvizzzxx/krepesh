<template>
  <div class="checkout-page">
    <div class="container">
      <h1>Оформление заказа</h1>

      <div v-if="!authStore.isLoggedIn" class="auth-required">
        <n-result status="401" title="Требуется авторизация" description="Для оформления заказа необходимо войти в систему">
          <template #footer>
            <n-button type="primary" @click="$router.push('/login')">Войти</n-button>
          </template>
        </n-result>
      </div>

      <div v-else-if="cartStore.items.length === 0" class="empty-cart">
        <n-result status="info" title="Корзина пуста" description="Добавьте товары из каталога">
          <template #footer>
            <n-button type="primary" @click="$router.push('/catalog')">Перейти в каталог</n-button>
          </template>
        </n-result>
      </div>

      <div v-else class="checkout-layout">
        <div class="checkout-form-section">
          <h2>Данные доставки</h2>
          <form @submit.prevent="submitOrder">
            <div class="form-row">
              <div class="form-group">
                <label>ФИО</label>
                <input type="text" v-model="form.fullName" required placeholder="Иванов Иван Иванович">
              </div>
              <div class="form-group">
                <label>Телефон</label>
                <input type="tel" v-model="form.phone" required placeholder="+7 (999) 123-45-67">
              </div>
            </div>
            <div class="form-group">
              <label>Город</label>
              <input type="text" v-model="form.city" required placeholder="Москва">
            </div>
            <div class="form-group">
              <label>Адрес</label>
              <textarea v-model="form.address" required placeholder="ул. Примерная, д. 1, кв. 1" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label>Индекс</label>
              <input type="text" v-model="form.postalCode" required placeholder="123456">
            </div>

            <n-button type="primary" size="large" block :loading="submitting" :disabled="submitting" @click="submitOrder">
              {{ submitting ? 'Оформляем...' : 'Подтвердить заказ' }}
            </n-button>
          </form>
        </div>

        <div class="order-summary-card">
          <h3>Ваш заказ</h3>
          <div class="order-items">
            <div v-for="item in cartStore.items" :key="item.productId" class="order-item">
              <div class="item-info">
                <span class="item-name">{{ item.product.name }}</span>
                <span class="item-qty">× {{ item.quantity }}</span>
              </div>
              <span class="item-price">{{ item.product.price * item.quantity }} ₽</span>
            </div>
          </div>
          <div class="order-total">
            <span>Итого:</span>
            <span class="total-price">{{ cartStore.totalPrice }} ₽</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'
import api from '../api/client'

const router = useRouter()
const message = useMessage()
const cartStore = useCartStore()
const authStore = useAuthStore()

const submitting = ref(false)
const form = reactive({
  fullName: '',
  phone: '',
  city: '',
  address: '',
  postalCode: '',
})

async function submitOrder() {
  if (!authStore.isLoggedIn) {
    message.error('Необходимо авторизоваться')
    router.push('/login')
    return
  }

  if (cartStore.items.length === 0) {
    message.error('Корзина пуста')
    return
  }

  const items = cartStore.items.map(i => ({
    productId: i.productId,
    quantity: i.quantity,
  }))

  try {
    submitting.value = true

    const { data } = await api.post<{ success: boolean; data: unknown }>('/orders', {
      items,
      shippingAddress: form,
    })

    if (data.success) {
      cartStore.clear()
      message.success('Заказ успешно оформлен!')
      router.push('/orders')
    }
  } catch (error: any) {
    const errorMsg = error.message || 'Не удалось оформить заказ'
    message.error(errorMsg)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.checkout-page {
  padding: 40px 0;
}

.checkout-page h1 {
  font-size: 32px;
  margin-bottom: 32px;
}

.auth-required,
.empty-cart {
  max-width: 600px;
  margin: 0 auto;
}

.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 40px;
  align-items: start;
}

.checkout-form-section {
  background: var(--white);
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.checkout-form-section h2 {
  font-size: 24px;
  margin-bottom: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--gray-light);
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.order-summary-card {
  background: var(--white);
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 20px;
}

.order-summary-card h3 {
  font-size: 18px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--gray-light);
}

.order-items {
  margin-bottom: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--gray-light);
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-weight: 500;
  font-size: 14px;
}

.item-qty {
  font-size: 13px;
  color: var(--gray);
}

.item-price {
  font-weight: 600;
  color: var(--primary);
  white-space: nowrap;
}

.order-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 2px solid var(--gray-light);
}

.total-price {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary);
}
</style>
