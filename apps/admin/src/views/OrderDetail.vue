<template>
  <div class="admin-page" v-if="order._id">
    <div class="page-header">
      <h1 class="page-heading">Заказ #{{ order._id.slice(-6) }}</h1>
      <router-link to="/orders" class="btn">← Назад к заказам</router-link>
    </div>

    <div class="details-grid">
      <div class="detail-card">
        <h3>Информация о заказе</h3>
        <div class="detail-row">
          <span class="detail-label">Статус</span>
          <select v-model="order.status" class="form-input" @change="updateStatus">
            <option value="pending">Ожидает</option>
            <option value="confirmed">Подтверждён</option>
            <option value="shipped">Отправлен</option>
            <option value="delivered">Доставлен</option>
            <option value="cancelled">Отменён</option>
          </select>
        </div>
        <div class="detail-row">
          <span class="detail-label">Сумма</span>
          <span class="detail-value primary">{{ order.totalPrice }} ₽</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Дата</span>
          <span class="detail-value">{{ new Date(order.createdAt).toLocaleString('ru-RU') }}</span>
        </div>
      </div>

      <div class="detail-card">
        <h3>Данные доставки</h3>
        <div class="detail-row">
          <span class="detail-label">ФИО</span>
          <span class="detail-value">{{ order.shippingAddress?.fullName }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Телефон</span>
          <span class="detail-value">{{ order.shippingAddress?.phone }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Город</span>
          <span class="detail-value">{{ order.shippingAddress?.city }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Адрес</span>
          <span class="detail-value">{{ order.shippingAddress?.address }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Индекс</span>
          <span class="detail-value">{{ order.shippingAddress?.postalCode }}</span>
        </div>
      </div>
    </div>

    <div class="detail-card" style="margin-top: 24px">
      <h3>Товары</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Товар</th>
            <th>Цена</th>
            <th>Кол-во</th>
            <th>Сумма</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in order.items" :key="item.productId">
            <td>{{ item.productName }}</td>
            <td>{{ item.price }} ₽</td>
            <td>{{ item.quantity }}</td>
            <td>
              <strong>{{ item.price * item.quantity }} ₽</strong>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div v-else class="empty-state">Загрузка...</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMessage } from 'naive-ui'
import api from '../api/client'

const route = useRoute()
const message = useMessage()
const order = ref<any>({})

async function load() {
  const { data } = await api.get('/admin/orders')
  const found = data.data?.find((o: any) => o._id === route.params.id)
  if (found) order.value = found
  else message.error('Заказ не найден')
}

async function updateStatus() {
  try {
    await api.put(`/admin/orders/${order.value._id}/status`, { status: order.value.status })
    message.success('Статус обновлён')
  } catch (e: any) {
    message.error(e.message)
  }
}

onMounted(load)
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-heading {
  font-size: 28px;
  margin: 0;
}

.btn {
  display: inline-block;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid var(--gray-light);
  background: var(--white);
  font-size: 15px;
  text-decoration: none;
  color: var(--dark);
}

.btn:hover {
  border-color: var(--gray);
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.detail-card {
  background: var(--white);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  color: var(--dark);
}

.detail-card h3 {
  margin: 0 0 20px;
  font-size: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--gray-light);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
}

.detail-row:not(:last-child) {
  border-bottom: 1px solid var(--gray-light);
}

.detail-label {
  color: var(--gray);
  font-size: 14px;
}

.detail-value {
  font-weight: 500;
  color: var(--dark);
}

.detail-value.primary {
  color: var(--primary);
  font-size: 20px;
  font-weight: 700;
}

.form-input {
  color: var(--dark);
  background: var(--white);
  padding: 8px 12px;
  border: 2px solid var(--gray-light);
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 12px 16px;
  background: var(--gray-light);
  font-weight: 600;
  font-size: 14px;
  color: var(--gray);
}

.data-table td {
  padding: 12px 16px;
  border-top: 1px solid var(--gray-light);
  color: var(--dark);
}

.empty-state {
  padding: 60px;
  text-align: center;
  color: var(--gray);
}
</style>
