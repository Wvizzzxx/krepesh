<template>
  <div class="info-page">
    <section class="info-hero">
      <div class="container info-hero-inner">
        <div>
          <p class="eyebrow">Специальные предложения</p>
          <h1>Акции и оптовые скидки на крепеж</h1>
          <p>
            Собираем лучшие предложения от заводов-партнёров, наценку держим минимальной, поэтому вы
            экономите до 30%.
          </p>
          <router-link to="/catalog" class="btn-primary">Смотреть товары со скидкой</router-link>
        </div>
        <div class="info-hero-card">
          <p class="card-label">Текущая акция</p>
          <h2>Скидка 20% на болты М10</h2>
          <p>Действует до конца месяца. Применяется автоматически при заказе от 200 шт.</p>
          <div class="countdown">Акция заканчивается за <strong>4 дня</strong></div>
        </div>
      </div>
    </section>

    <section class="info-section">
      <div class="container">
        <h2>Почему стоит подписаться</h2>
        <div class="info-grid">
          <div v-for="promo in promotions" :key="promo.title" class="info-card">
            <div class="info-card-icon">{{ promo.icon }}</div>
            <h3>{{ promo.title }}</h3>
            <p>{{ promo.description }}</p>
            <router-link :to="promo.link" class="btn-outline">Подробнее</router-link>
          </div>
        </div>
      </div>
    </section>

    <section class="info-section info-highlight">
      <div class="container">
        <h2>Новые подборки</h2>
        <div class="highlight-grid">
          <div v-for="item in highlightSets" :key="item.title" class="highlight-card">
            <p class="eyebrow">{{ item.tag }}</p>
            <h3>{{ item.title }}</h3>
            <p>{{ item.summary }}</p>
            <button class="btn-outline">Подробнее</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const promotions = [
  {
    icon: '🚚',
    title: 'Быстрая доставка акций',
    description: 'Специальные партии отгружаем моментально.',
    link: '/catalog?sortBy=createdAt',
  },
  {
    icon: '💸',
    title: 'Фиксированные цены',
    description: 'Цены не меняются в течение недели после утверждения.',
    link: '/catalog?categoryId=discount',
  },
  {
    icon: '⭐',
    title: 'Качество под контролем',
    description: 'Каждая акция проходит контроль качества на складе.',
    link: '/catalog?categoryId=premium',
  },
]

const highlightSets = [
  {
    tag: 'Опт по России',
    title: 'Сборные контейнеры',
    summary: 'Экономим на логистике, формируем сборные партии под ваш заказ.',
  },
  {
    tag: 'Локальные склады',
    title: 'Скидки на отгруженные остатки',
    summary: 'Выгрузка из локальных складов с минимальной наценкой.',
  },
  {
    tag: 'Премиум',
    title: 'Промо-комплекты',
    summary: 'Собираем комплекты для популярных задач крепления.',
  },
]
</script>

<style scoped>
.info-page {
  padding-bottom: 80px;
}

.info-hero {
  background: linear-gradient(135deg, #111827, #1f2937);
  color: #fff;
  padding: 80px 0;
}

.info-hero-inner {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  align-items: center;
}

.info-hero h1 {
  font-size: 42px;
  margin-bottom: 16px;
}

.info-hero p {
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 16px;
}

.info-hero-card {
  background: rgba(255, 255, 255, 0.06);
  padding: 32px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.6);
  animation: floatCard 8s ease-in-out infinite;
}

.card-label {
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 12px;
  color: #e0e7ff;
  margin-bottom: 12px;
}

.countdown {
  margin-top: 20px;
  font-weight: 600;
}

.info-section {
  padding: 60px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
}

.info-card {
  background: var(--white);
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 15px 35px rgba(15, 23, 42, 0.1);
  transition: transform 0.3s ease;
}

.info-card:hover {
  transform: translateY(-6px);
}

.info-card-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.info-highlight .highlight-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.highlight-card {
  background: var(--gray-light);
  border-radius: 18px;
  padding: 24px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
}

.highlight-card:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.btn-outline,
.btn-primary {
  border-radius: 999px;
  padding: 12px 32px;
}

@keyframes floatCard {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* ===== Tablet (768px - 1024px) ===== */
@media (min-width: 768px) and (max-width: 1024px) {
  .info-page {
    padding-bottom: 48px;
  }

  .info-hero {
    padding: 48px 0;
  }

  .info-hero h1 {
    font-size: 30px;
  }

  .info-hero-card {
    padding: 24px;
  }

  .info-section {
    padding: 36px 0;
  }

  .info-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .info-card {
    padding: 18px;
  }

  .highlight-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .highlight-card {
    padding: 18px;
  }
}
</style>
