<template>
  <div class="admin-page">
    <h1 class="page-heading">Пользователи</h1>
    <div class="table-container">
      <table class="data-table" v-if="users.length">
        <thead>
          <tr>
            <th>Имя</th>
            <th>Email</th>
            <th>Роль</th>
            <th>Изменить роль</th>
            <th>Дата регистрации</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u._id">
            <td>{{ u.name }}</td>
            <td>{{ u.email }}</td>
            <td>
              <span class="role-badge" :class="u.role">
                {{ u.role === 'admin' ? 'Администратор' : 'Пользователь' }}
              </span>
            </td>
            <td>
              <select :value="u.role" class="form-input" @change="changeRole(u._id, ($event.target as HTMLSelectElement).value)">
                <option value="user">Пользователь</option>
                <option value="admin">Администратор</option>
              </select>
            </td>
            <td>{{ new Date(u.createdAt).toLocaleDateString('ru-RU') }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else class="empty-state">Нет пользователей</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import api from '../api/client'

const message = useMessage()
const users = ref<any[]>([])

async function load() {
  const { data } = await api.get('/admin/users')
  users.value = data.data || []
}

async function changeRole(userId: string, role: string) {
  try {
    await api.put(`/admin/users/${userId}/role`, { role })
    message.success('Роль обновлена')
    load()
  } catch (e: any) {
    message.error(e.message)
  }
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

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
}

.role-badge.admin {
  background: #fef2f2;
  color: #dc2626;
}

.role-badge.user {
  background: #eff6ff;
  color: #2563eb;
}

.form-input {
  padding: 8px 12px;
  border: 2px solid var(--gray-light);
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  min-width: 160px;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
}

.empty-state {
  padding: 60px;
  text-align: center;
  color: var(--gray);
}
</style>
