<template>
  <footer class="footer">
    <div class="footer-main">
      <div class="container footer-grid">
        <div class="footer-col">
          <h3>КРЕПЁЖ</h3>
          <p>
            Надежный поставщик крепежных изделий с 2010 года. Более 10 000 наименований продукции.
          </p>
        </div>
        <div class="footer-col">
          <h4>Каталог</h4>
          <ul>
            <li><router-link to="/catalog?category=bolty">Болты</router-link></li>
            <li><router-link to="/catalog?category=gayki">Гайки</router-link></li>
            <li><router-link to="/catalog?category=shurupy">Шурупы</router-link></li>
            <li><router-link to="/catalog?category=samorezy">Саморезы</router-link></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Информация</h4>
          <ul>
            <li><router-link to="/about">О компании</router-link></li>
            <li><router-link to="/delivery">Доставка</router-link></li>
            <li><router-link to="/contacts">Контакты</router-link></li>
            <li><router-link to="/promotions">Акции</router-link></li>
            <li><router-link to="/brands">Бренды</router-link></li>
            <li><router-link to="/reviews">Отзывы</router-link></li>
            <li><router-link to="/certificates">Сертификаты</router-link></li>
            <li><router-link to="/privacy">Политика конфиденциальности</router-link></li>
          </ul>
        </div>
         <div class="footer-col">
           <h4>Контакты</h4>
           <p><Icon name="map-marker-alt" /> г. Москва, ул. Промышленная, д. 1</p>
           <p><Icon name="phone" /> <a href="tel:+78001234567">+7 (800) 123-45-67</a></p>
           <p><Icon name="envelope" /> <a href="mailto:info@krepesh.ru">info@krepesh.ru</a></p>
         </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="container">
        <p>© 2024 Крепёж. Все права защищены. <router-link to="/privacy">Политика конфиденциальности</router-link></p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--dark);
  color: var(--white);
  margin-top: 60px;
}

.footer-main {
  padding: 48px 0 32px;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
}

.footer-col h3 {
  font-size: 24px;
  color: var(--primary);
  margin-bottom: 16px;
}

.footer-col h4 {
  font-size: 16px;
  margin-bottom: 16px;
  color: var(--white);
}

.footer-col p {
  color: #aaa;
  font-size: 14px;
  line-height: 1.8;
}

.footer-col ul {
  list-style: none;
}

.footer-col ul li {
  margin-bottom: 10px;
}

.footer-col ul li a {
  color: #aaa;
  font-size: 14px;
  transition: color 0.2s;
}

.footer-col ul li a:hover {
  color: var(--primary);
}

.footer-bottom {
  border-top: 1px solid #333;
  padding: 20px 0;
  text-align: center;
}

.footer-bottom p {
  color: #666;
  font-size: 14px;
}

/* ===== Tablet (768px - 1024px) ===== */
@media (min-width: 768px) and (max-width: 1024px) {
  .footer-main {
    padding: 36px 0 24px;
  }

  .footer-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 28px;
  }

  .footer-col h3 {
    font-size: 20px;
  }

  .footer-col h4 {
    font-size: 15px;
  }
}
</style>
