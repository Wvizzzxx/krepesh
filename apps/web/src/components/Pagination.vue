<template>
  <div class="pagination">
    <button class="pagination-btn" :disabled="page === 1" @click="$emit('change', page - 1)">
      ← Назад
    </button>

    <div class="pagination-pages">
      <template v-for="p in visiblePages" :key="p">
        <button
          v-if="typeof p === 'number'"
          class="pagination-btn pagination-btn--page"
          :class="{ 'pagination-btn--active': p === page }"
          @click="$emit('change', p)"
        >
          {{ p }}
        </button>
        <span v-else class="pagination-ellipsis">...</span>
      </template>
    </div>

    <button class="pagination-btn" :disabled="page === totalPages" @click="$emit('change', page + 1)">
      Вперёд →
    </button>

    <span class="pagination-info">
      Страница {{ page }} из {{ totalPages }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  page: number
  totalPages: number
}>()

defineEmits<{
  change: [page: number]
}>()

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = props.totalPages
  const current = props.page

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
    return pages
  }

  pages.push(1)

  if (current > 3) pages.push('...')

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) pages.push(i)

  if (current < total - 2) pages.push('...')

  pages.push(total)
  return pages
})
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 40px;
  flex-wrap: wrap;
}

.pagination-btn {
  padding: 10px 16px;
  background: var(--white);
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  min-width: 40px;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--primary);
  color: var(--white);
  border-color: var(--primary);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-btn--page {
  padding: 10px 14px;
}

.pagination-btn--active {
  background: var(--primary);
  color: var(--white);
  border-color: var(--primary);
}

.pagination-ellipsis {
  padding: 0 4px;
  color: var(--gray);
}

.pagination-info {
  margin-left: 16px;
  color: var(--gray);
  font-size: 14px;
}

/* ===== Mobile ===== */
@media (max-width: 767px) {
  .pagination {
    gap: 4px;
    margin-top: 24px;
  }

  .pagination-btn {
    padding: 8px 10px;
    font-size: 12px;
    min-width: 32px;
  }

  .pagination-info {
    margin-left: 0;
    width: 100%;
    text-align: center;
    margin-top: 8px;
    font-size: 12px;
  }
}
</style>
