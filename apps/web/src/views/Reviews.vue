<template>
  <div class="info-page">
    <section class="info-hero">
      <div class="container info-hero-inner">
        <div>
          <p class="eyebrow">Отзывы клиентов</p>
          <h1>Нам доверяют фирмы по всей России</h1>
          <p>
            Получаем отклики от подрядчиков, монтажников и инженеров: отслеживаем честные отзывы и
            быстро реагируем на запросы по логистике.
          </p>
          <router-link to="/contacts" class="btn-primary">Связаться с нами</router-link>
        </div>
         <div class="testimonial">
           <div class="testimonial-icon">
             <Icon name="quote-left" size="2x" color="#ff6b00"/>
           </div>
           <p class="testimonial-quote">
             “Проходной объект был закрыт на неделю раньше — спасибо за скорость!”
           </p>
           <p class="testimonial-author">— ООО «СтройГарант», генеральный подрядчик</p>
         </div>
      </div>
    </section>

    <section class="info-section">
      <div class="container">
        <h2>Отзывы</h2>
        <div class="reviews-grid">
          <article v-for="feedback in feedbacks" :key="feedback.name" class="review-card">
            <div class="review-rating">
              <Icon name="star" v-for="n in 5" :key="n" :color="n <= Math.floor(feedback.rating) ? '#ffc107' : '#e4e5e6'" />
              <span class="review-stars">{{ feedback.rating }}</span>
            </div>
            <p class="review-text">{{ feedback.text }}</p>
            <p class="review-name">{{ feedback.name }}</p>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const feedbacks = [
  {
    rating: 5,
    text: 'Товары всегда свежие, упаковка без повреждений, доставляют быстро.',
    name: 'ООО «МеталПроект»',
  },
  {
    rating: 4.8,
    text: 'Порадовала автоматизация заказов и персональный менеджер.',
    name: 'ГК «СеверСтрой»',
  },
  {
    rating: 4.9,
    text: 'Цены конкурентные, предлагается нужный сертификат к каждому заказу.',
    name: 'Завод «Сильвер»',
  },
]
</script>

<style scoped>
.testimonial {
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.6), transparent 70%), rgba(15, 23, 42, 0.8);
  color: #fff;
  padding: 40px;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.5);
  animation: pulse 6s ease-in-out infinite;
}

.testimonial-quote {
  font-size: 20px;
  line-height: 1.6;
}

.testimonial-author {
  margin-top: 16px;
  font-weight: 500;
}

.reviews-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.review-card {
  background: var(--white);
  border-radius: 18px;
  padding: 24px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease;
}

.review-card:hover {
  transform: translateY(-6px);
}

.review-stars {
  font-weight: 700;
  color: var(--primary);
}

.review-text {
  color: var(--gray);
  margin: 16px 0;
}

.review-name {
  font-weight: 600;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

/* ===== Tablet (768px - 1024px) ===== */
@media (min-width: 768px) and (max-width: 1024px) {
  .testimonial {
    padding: 28px;
  }

  .testimonial-quote {
    font-size: 17px;
  }

  .reviews-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .review-card {
    padding: 18px;
  }
}
</style>
