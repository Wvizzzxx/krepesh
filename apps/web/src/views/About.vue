<template>
  <div class="info-page">
    <div class="container">
      <h1>О компании</h1>
      
      <div class="info-content">
        <div class="info-section">
          <h2>Крепёж — надежный поставщик крепежных изделий</h2>
          <p>Компания «Крепёж» работает на рынке крепежных изделий с 2010 года. Мы являемся одним из ведущих поставщиков крепежа в России, предлагая более 10 000 наименований продукции.</p>
        </div>

        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">🏭</div>
            <h3>Собственный склад</h3>
            <p>Площадь склада 5 000 м² позволяет поддерживать широкий ассортимент на складе</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">📋</div>
            <h3>Сертификаты качества</h3>
            <p>Вся продукция сертифицирована и соответствует ГОСТ и международным стандартам</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🤝</div>
            <h3>Надежные партнеры</h3>
            <p>Работаем напрямую с ведущими российскими и зарубежными производителями</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🚚</div>
            <h3>Доставка по России</h3>
            <p>Быстрая доставка в любой регион России транспортными компаниями</p>
          </div>
        </div>

        <div class="info-section">
          <h2>Наши преимущества</h2>
          <ul>
            <li>Широкий ассортимент — более 10 000 позиций</li>
            <li>Конкурентные цены благодаря прямым поставкам</li>
            <li>Профессиональная консультация по выбору крепежа</li>
            <li>Гибкая система скидок для оптовых покупателей</li>
            <li>Быстрая обработка и отгрузка заказов</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.info-page {
  padding: 40px 0;
}

.info-page h1 {
  font-size: 36px;
  margin-bottom: 40px;
}

.info-content {
  max-width: 900px;
}

.info-section {
  margin-bottom: 48px;
}

.info-section h2 {
  font-size: 24px;
  margin-bottom: 16px;
  color: var(--dark);
}

.info-section p {
  color: var(--gray);
  line-height: 1.8;
  font-size: 16px;
}

.info-section ul {
  color: var(--gray);
  line-height: 2;
  padding-left: 20px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 48px;
}

.feature-item {
  background: var(--white);
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.feature-icon {
  font-size: 40px;
  margin-bottom: 16px;
}

.feature-item h3 {
  font-size: 18px;
  margin-bottom: 8px;
}

.feature-item p {
  color: var(--gray);
  font-size: 14px;
  line-height: 1.6;
}
</style>