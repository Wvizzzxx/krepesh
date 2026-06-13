<template>
  <div class="info-page">
    <section class="info-hero">
      <div class="container info-hero-inner">
        <div>
          <p class="eyebrow">Наш выбор брендов</p>
          <h1>Партнёры, которым доверяют крупные стройки</h1>
          <p>
            Поддерживаем постоянный ассортимент от лидеров рынка: оцинкованный, нержавеющий,
            высокопрочный крепеж с полным комплектом сертификатов.
          </p>
          <router-link to="/catalog" class="btn-primary">Перейти в каталог</router-link>
        </div>
         <div class="brand-grid">
           <div v-for="brand in brands" :key="brand.name" class="brand-card">
             <div class="brand-icon">
               <Icon :name="brand.iconName" size="3x" />
             </div>
             <h3>{{ brand.name }}</h3>
             <p>{{ brand.description }}</p>
           </div>
         </div>
      </div>
    </section>

    <section class="info-section">
      <div class="container">
        <h2>Сертификаты и стандарты</h2>
        <div class="info-grid">
          <div v-for="cert in standards" :key="cert.title" class="info-card">
            <p class="eyebrow">{{ cert.year }}</p>
            <h3>{{ cert.title }}</h3>
            <p>{{ cert.description }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const brands = [
  { icon: '🔩', iconName: 'bolt', name: 'TechFix', description: 'Стальной крепеж повышенной точности и прочности.' },
  {
    icon: '⚙️',
    iconName: 'cogs',
    name: 'IronCore',
    description: 'Коррозионно-устойчивые решения для фасадов и конструкций.',
  },
  {
    icon: '🛠️',
    iconName: 'tools',
    name: 'BuildPro',
    description: 'Комплекты для монтажных бригад с быстрой доставкой.',
  },
]

const standards = [
  { year: '2024', title: 'ISO 9001', description: 'Отдельные партии проходят тройной контроль.' },
  {
    year: '2023',
    title: 'ГОСТ ISO 14001',
    description: 'Экологически безопасное производство и упаковка.',
  },
  {
    year: '2022',
    title: 'DIN, EN стандарты',
    description: 'Полное соответствие международным спецификациям.',
  },
]
</script>

<style scoped>
.brand-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.brand-card {
  background: var(--white);
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.1);
  text-align: center;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.brand-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 25px 50px rgba(15, 23, 42, 0.15);
}

.brand-icon {
  font-size: 40px;
}

.info-section {
  padding: 60px 0;
}

.info-card {
  background: var(--gray-light);
  border-radius: 18px;
  padding: 24px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

/* ===== Tablet (768px - 1024px) ===== */
@media (min-width: 768px) and (max-width: 1024px) {
  .brand-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .brand-card {
    padding: 18px;
  }

  .brand-icon {
    font-size: 32px;
  }

  .info-section {
    padding: 36px 0;
  }

  .info-card {
    padding: 18px;
  }
}
</style>
