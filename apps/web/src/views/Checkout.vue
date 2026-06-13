<template>
  <div class="checkout-page">
    <div class="container">
      <h1>Оформление заказа</h1>

      <div v-if="!authStore.isLoggedIn" class="auth-required">
        <div class="auth-required-card">
          <div class="auth-required-icon">🔒</div>
          <h2>Требуется авторизация</h2>
          <p>Для оформления заказа необходимо войти в систему</p>
          <button class="btn btn-primary" @click="$router.push('/login')">Войти</button>
        </div>
      </div>

      <div v-else-if="cartStore.items.length === 0" class="empty-cart">
        <div class="empty-cart-card">
          <div class="empty-cart-icon">🛒</div>
          <h2>Корзина пуста</h2>
          <p>Добавьте товары из каталога</p>
          <button class="btn btn-primary" @click="$router.push('/catalog')">Перейти в каталог</button>
        </div>
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

            <button type="submit" class="btn btn-primary btn-block" :disabled="submitting">
              {{ submitting ? 'Оформляем...' : 'Подтвердить заказ' }}
            </button>
          </form>
        </div>

        <div class="order-summary-card">
          <h3>Ваш заказ</h3>
          <div class="order-items">
            <div v-for="item in validItems" :key="item.productId" class="order-item">
              <div class="item-info">
                <span class="item-name">{{ item.product?.name || 'Товар' }}</span>
                <span class="item-qty">× {{ item.quantity }}</span>
              </div>
              <span class="item-price">{{ formatPrice((item.product?.discountPrice || item.product?.price || 0) * item.quantity) }} ₽</span>
            </div>
          </div>
          <div class="delivery-row">
            <span>Доставка:</span>
            <span v-if="!cartStore.deliveryAvailable" class="pickup-only">Только самовывоз</span>
            <span v-else-if="cartStore.deliveryCost === 0" class="free-delivery">Бесплатно</span>
            <span v-else>{{ cartStore.deliveryCost }} ₽</span>
          </div>
          <div v-if="!cartStore.deliveryAvailable" class="delivery-hint warning">
            📦 Доставка недоступна для заказов менее 200 ₽. Доступен только самовывоз.
          </div>
          <div v-else-if="cartStore.subtotal < 10000" class="delivery-hint">
            💡 До бесплатной доставки осталось {{ formatPrice(10000 - cartStore.subtotal) }} ₽
          </div>
          <div class="order-total">
            <span>Итого:</span>
            <span class="total-price">{{ formatPrice(cartStore.totalPrice) }} ₽</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
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

const validItems = computed(() => {
  return cartStore.items.filter(item => item && item.product && item.product._id)
})

function formatPrice(price: number): string {
  return Number(price).toLocaleString('ru-RU')
}

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
      deliveryCost: cartStore.deliveryCost,
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

.auth-required-card,
.empty-cart-card {
  text-align: center;
  padding: 60px 40px;
  background: var(--white);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.auth-required-icon,
.empty-cart-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.auth-required-card h2,
.empty-cart-card h2 {
  font-size: 24px;
  margin-bottom: 12px;
  color: var(--dark);
}

.auth-required-card p,
.empty-cart-card p {
  color: var(--gray);
  margin-bottom: 24px;
  font-size: 16px;
}

.auth-required-card .btn,
.empty-cart-card .btn {
  display: inline-block;
  padding: 14px 32px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-decoration: none;
  text-align: center;
}

.btn {
  display: inline-block;
  padding: 12px 28px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 16px;
  text-align: center;
  text-decoration: none;
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
  padding: 16px;
  font-size: 16px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

.delivery-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  color: var(--gray);
  border-top: 1px solid var(--gray-light);
}

.free-delivery {
  color: #10b981;
  font-weight: 600;
}

.pickup-only {
  color: #f59e0b;
  font-weight: 600;
}

.delivery-hint.warning {
  background: #fef2f2;
  color: #991b1b;
}

.delivery-hint {
  background: #fffbeb;
  color: #92400e;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 12px;
  text-align: center;
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

/* ===== Tablet (768px - 1024px) ===== */
@media (min-width: 768px) and (max-width: 1024px) {
  .checkout-page {
    padding: 24px 0;
  }

  .checkout-page h1 {
    font-size: 26px;
    margin-bottom: 24px;
  }

  .checkout-layout {
    grid-template-columns: 1fr 320px;
    gap: 24px;
  }

  .checkout-form-section {
    padding: 24px;
  }

  .checkout-form-section h2 {
    font-size: 20px;
  }

  .form-row {
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .order-summary-card {
    padding: 20px;
  }

  .total-price {
    font-size: 20px;
  }
}
</style>