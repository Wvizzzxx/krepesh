<template>
  <div class="orders-page">
    <div class="container">
      <h1>Мои заказы</h1>

      <div v-if="loading" class="loading-state">Загрузка...</div>

      <div v-else-if="orders.length === 0" class="empty-orders">
        <div class="empty-icon">📦</div>
        <h2>Заказов пока нет</h2>
        <p>Оформите первый заказ в нашем каталоге</p>
        <router-link to="/catalog" class="btn btn-primary">Перейти в каталог</router-link>
      </div>

      <div v-else class="orders-list">
        <div v-for="order in orders" :key="order._id" class="order-card">
          <div class="order-header">
            <div class="order-number">Заказ #{{ order._id.slice(-6) }}</div>
            <div class="order-status" :class="order.status">{{ statusLabel(order.status) }}</div>
          </div>
          <div class="order-info">
            <p>Товаров: {{ order.items.length }} шт.</p>
            <p>Сумма: <strong>{{ order.totalPrice }} ₽</strong></p>
            <p>Дата: {{ new Date(order.createdAt).toLocaleDateString('ru-RU') }}</p>
          </div>
          <div class="order-items">
            <div v-for="item in order.items" :key="item.productId" class="order-item">
              <span>{{ item.productName }} × {{ item.quantity }}</span>
              <span>{{ item.price * item.quantity }} ₽</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import api from '../api/client'

interface OrderItem {
  productId: string
  productName: string
  price: number
  quantity: number
}

interface Order {
  _id: string
  items: OrderItem[]
  totalPrice: number
  status: string
  createdAt: string
}

const message = useMessage()
const orders = ref<Order[]>([])
const loading = ref(true)

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Ожидает',
    confirmed: 'Подтверждён',
    shipped: 'Отправлен',
    delivered: 'Доставлен',
    cancelled: 'Отменён',
  }
  return labels[status] || status
}

onMounted(async () => {
  try {
    const { data } = await api.get<{ success: boolean; data: Order[] }>('/orders')
    if (data.success) {
      orders.value = data.data || []
    }
  } catch (e: any) {
    message.error(e.message || 'Не удалось загрузить заказы')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.orders-page {
  padding: 40px 0;
}

.orders-page h1 {
  font-size: 32px;
  margin-bottom: 32px;
}

.loading-state {
  text-align: center;
  padding: 60px 0;
  color: var(--gray);
  font-size: 18px;
}

.empty-orders {
  text-align: center;
  padding: 80px 0;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 24px;
}

.empty-orders h2 {
  margin-bottom: 8px;
}

.empty-orders p {
  color: var(--gray);
  margin-bottom: 24px;
}

.orders-list {
  display: grid;
  gap: 24px;
}

.order-card {
  background: var(--white);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.3s;
}

.order-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--gray-light);
}

.order-number {
  font-size: 18px;
  font-weight: 600;
}

.order-status {
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}

.order-status.pending {
  background: #fff7ed;
  color: #c2410c;
}

.order-status.confirmed {
  background: #eff6ff;
  color: #2563eb;
}

.order-status.shipped {
  background: #f0fdf4;
  color: #16a34a;
}

.order-status.delivered {
  background: #f0fdf4;
  color: #16a34a;
}

.order-status.cancelled {
  background: #fef2f2;
  color: #dc2626;
}

.order-info {
  display: flex;
  gap: 32px;
  margin-bottom: 16px;
  color: var(--gray);
  font-size: 15px;
}

.order-info p {
  margin: 0;
}

.order-items {
  border-top: 1px solid var(--gray-light);
  padding-top: 16px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  color: var(--dark);
}

.btn {
  display: inline-block;
  padding: 12px 28px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-decoration: none;
}

.btn-primary {
  background: var(--primary);
  color: var(--white);
}

.btn-primary:hover {
  background: var(--primary-hover);
}
</style>
