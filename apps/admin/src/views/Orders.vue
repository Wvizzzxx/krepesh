<template>
  <div class="admin-page">
    <h1 class="page-heading">Заказы</h1>
    <div class="table-container">
      <table class="data-table" v-if="orders.length">
        <thead>
          <tr>
            <th>№</th>
            <th>Клиент</th>
            <th>Сумма</th>
            <th>Статус</th>
            <th>Дата</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in orders" :key="o._id">
            <td><strong>#{{ o._id.slice(-6) }}</strong></td>
            <td>{{ o.userId?.name || o.userId?.email || '-' }}</td>
            <td><strong>{{ o.totalPrice }} ₽</strong></td>
            <td><span class="status-badge" :class="o.status">{{ statusLabel(o.status) }}</span></td>
            <td>{{ new Date(o.createdAt).toLocaleDateString('ru-RU') }}</td>
            <td>
              <router-link :to="`/orders/${o._id}`" class="btn btn-sm">Подробнее</router-link>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">Нет заказов</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../api/client'

const orders = ref<any[]>([])

const statusMap: Record<string, string> = {
  pending: 'Ожидает',
  confirmed: 'Подтверждён',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
}

function statusLabel(s: string): string {
  return statusMap[s] || s
}

async function load() {
  const { data } = await api.get('/admin/orders')
  orders.value = data.data || []
}

onMounted(load)
</script>

<style scoped>
.page-heading {
  font-size: 28px;
  margin-bottom: 24px;
}

.table-container {
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 14px 20px;
  background: var(--gray-light);
  font-weight: 600;
  font-size: 14px;
  color: var(--gray);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table td {
  padding: 14px 20px;
  border-top: 1px solid var(--gray-light);
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
}

.status-badge.pending { background: #fff7ed; color: #c2410c; }
.status-badge.confirmed { background: #eff6ff; color: #2563eb; }
.status-badge.shipped { background: #f0fdf4; color: #16a34a; }
.status-badge.delivered { background: #f0fdf4; color: #16a34a; }
.status-badge.cancelled { background: #fef2f2; color: #dc2626; }

.btn {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-decoration: none;
  font-size: 14px;
}

.btn-sm {
  padding: 6px 12px;
  background: var(--primary);
  color: var(--white);
}

.btn-sm:hover {
  background: var(--primary-hover);
}

.empty-state {
  padding: 60px;
  text-align: center;
  color: var(--gray);
}
</style>
