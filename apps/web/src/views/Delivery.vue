<template>
  <div class="info-page">
    <div class="container">
      <h1>Доставка</h1>
      
      <div class="info-content">
        <div class="delivery-options">
          <div class="delivery-card">
            <div class="delivery-icon">🚚</div>
            <h3>Курьерская доставка</h3>
            <p>Доставка курьером до двери</p>
            <div class="delivery-details">
              <p><strong>Срок:</strong> 1-2 дня по Москве</p>
              <p><strong>Стоимость:</strong> от 300 ₽</p>
              <p><strong>Бесплатно:</strong> от 5 000 ₽</p>
            </div>
          </div>

          <div class="delivery-card">
            <div class="delivery-icon">📦</div>
            <h3>Самовывоз</h3>
            <p>Заберите заказ из нашего офиса</p>
            <div class="delivery-details">
              <p><strong>Срок:</strong> в день заказа</p>
              <p><strong>Стоимость:</strong> бесплатно</p>
              <p><strong>Адрес:</strong> ул. Промышленная, д. 1</p>
            </div>
          </div>

          <div class="delivery-card">
            <div class="delivery-icon">🚛</div>
            <h3>Транспортная компания</h3>
            <p>Доставка в регионы России</p>
            <div class="delivery-details">
              <p><strong>Срок:</strong> от 2 дней</p>
              <p><strong>Стоимость:</strong> по тарифам ТК</p>
              <p><strong>Оплата:</strong> при получении</p>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h2>Условия доставки</h2>
          <ul>
            <li>Бесплатная доставка курьером при заказе от 5 000 ₽</li>
            <li>Доставка осуществляется в рабочие дни с 9:00 до 18:00</li>
            <li>Возможна доставка в выходные дни по согласованию</li>
            <li>Оплата при получении наличными или картой</li>
          </ul>
        </div>

        <div class="info-section">
          <h2>География доставки</h2>
          <p>Мы доставляем товары по всей территории Российской Федерации. Основные направления:</p>
          <ul>
            <li>Москва и Московская область</li>
            <li>Санкт-Петербург и Ленинградская область</li>
            <li>Регионы России через транспортные компании</li>
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
  max-width: 1000px;
}

.delivery-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 48px;
}

.delivery-card {
  background: var(--white);
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  text-align: center;
}

.delivery-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.delivery-card h3 {
  font-size: 20px;
  margin-bottom: 8px;
}

.delivery-card > p {
  color: var(--gray);
  margin-bottom: 20px;
}

.delivery-details {
  text-align: left;
  padding-top: 16px;
  border-top: 1px solid var(--gray-light);
}

.delivery-details p {
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--gray);
}

.delivery-details strong {
  color: var(--dark);
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
  margin-bottom: 16px;
}

.info-section ul {
  color: var(--gray);
  line-height: 2;
  padding-left: 20px;
}
</style>