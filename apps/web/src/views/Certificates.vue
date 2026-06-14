<template>
  <div class="info-page">
    <section class="info-hero certificates-hero">
      <div class="container info-hero-inner">
        <div>
          <p class="eyebrow">Сертифицированная продукция</p>
          <h1>Контроль качества и полная прозрачность</h1>
          <p>
            Все изделия проходят проверки на соответствие ГОСТ, DIN, ISO. Вы получите цифровые копии
            сертификатов вместе с заказом.
          </p>
          <router-link to="/contacts" class="btn-primary">Получить копию сертификата</router-link>
        </div>
        <div class="certificate-grid">
          <div
            v-for="certificate in certificates"
            :key="certificate.title"
            class="certificate-card"
          >
            <div class="certificate-image">
              <img :src="getAssetImage(certificate.assetKey)" :alt="certificate.title" />
            </div>
            <p class="certificate-type">{{ certificate.type }}</p>
            <h3>{{ certificate.title }}</h3>
            <p>{{ certificate.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="info-section gallery-section">
      <div class="container">
        <h2>Скан-копии сертификатов</h2>
        <div class="gallery-grid">
          <article v-for="item in certificatePreviews" :key="item.title" class="gallery-card">
            <img :src="getAssetImage(item.assetKey)" :alt="item.title" />
            <p>{{ item.title }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="info-section">
      <div class="container">
        <h2>Как мы подтверждаем качество</h2>
        <div class="steps-grid">
          <article v-for="step in steps" :key="step.title" class="step-card">
            <p class="eyebrow">{{ step.stage }}</p>
            <h3>{{ step.title }}</h3>
            <p>{{ step.description }}</p>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '../api/client'

const assets = ref<any[]>([])
const assetMap = computed(() => {
  const map: Record<string, any> = {}
  for (const a of assets.value) map[a.key] = a
  return map
})

const certificates = [
  {
    type: 'ISO 9001',
    title: 'Производственные процессы контролируются',
    description: 'Создаем документацию и отчеты по каждому этапу производства.',
    assetKey: 'cert-iso',
  },
  {
    type: 'DIN EN 1090',
    title: 'Сварные и несварные соединения',
    description: 'Подтвержденная механическая прочность и долговечность крепежа.',
    assetKey: 'cert-din',
  },
  {
    type: 'ГОСТ 1759',
    title: 'Оцинковка и антикоррозийная защита',
    description: 'Тестирование покрытия при экстремальных температурах.',
    assetKey: 'cert-gost',
  },
]

const certificatePreviews = [
  { title: 'Сертификат соответствия №1', assetKey: 'cert-preview-1' },
  { title: 'Сертификат соответствия №2', assetKey: 'cert-preview-2' },
  { title: 'Протокол испытаний', assetKey: 'cert-preview-3' },
]

const certImages: Record<string, string> = {
  'cert-iso': import.meta.env.BASE_URL + 'images/iso-photo.jpg',
  'cert-din': import.meta.env.BASE_URL + 'images/din_photo.jpg',
  'cert-gost': import.meta.env.BASE_URL + 'images/гост_фото.jpg',
  'cert-preview-1': import.meta.env.BASE_URL + 'images/iso-photo.jpg',
  'cert-preview-2': import.meta.env.BASE_URL + 'images/din_photo.jpg',
  'cert-preview-3': import.meta.env.BASE_URL + 'images/гост_фото.jpg',
}

function svgPlaceholder(label: string, width = 900, height = 620): string {
  const safeLabel = label || 'Фото сертификата'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#1f2937"/><stop offset="100%" stop-color="#111827"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><rect x="12%" y="10%" width="76%" height="80%" rx="16" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)"/><text x="50%" y="52%" text-anchor="middle" fill="#f8fafc" font-size="28" font-family="Arial, sans-serif">${safeLabel}</text><text x="50%" y="60%" text-anchor="middle" fill="#94a3b8" font-size="18" font-family="Arial, sans-serif">Замените на реальный скан</text></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function getAssetImage(assetKey: string, width = 900, height = 620): string {
  if (certImages[assetKey]) return certImages[assetKey]
  const asset = assetMap.value[assetKey]
  if (asset?.url) return asset.url
  return svgPlaceholder(asset?.name || assetKey, width, height)
}

const steps = [
  {
    stage: '1',
    title: 'Выбор сырья',
    description: 'Только сертифицированная сталь и сплавы с трассировкой партий.',
  },
  {
    stage: '2',
    title: 'Производственный контроль',
    description: 'Промежуточные испытания и проверка размеров после каждой смены.',
  },
  {
    stage: '3',
    title: 'Лабораторные отчеты',
    description: 'Проводим анализ на твердость, износ и сдвиг.',
  },
  {
    stage: '4',
    title: 'Сертификаты и отчёты',
    description: 'Документы доступны в личном кабинете и при получении товара.',
  },
]

onMounted(async () => {
  const assetRes = await api.get('/assets').catch(() => ({ data: { data: [] } }))
  if (assetRes.data.success) assets.value = assetRes.data.data
})
</script>

<style scoped>
.certificate-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 32px;
}

.info-page {
  padding-bottom: 80px;
}

.info-hero {
  padding: 72px 0;
}

.info-hero-inner {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: 32px;
  align-items: start;
}

.eyebrow {
  letter-spacing: 2px;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 8px;
}

.btn-primary {
  margin-top: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: #fff;
  padding: 12px 20px;
  border-radius: 999px;
  font-weight: 600;
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.certificate-card {
  background: var(--white);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.certificate-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

.certificate-image {
  margin-bottom: 16px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.certificate-image img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.certificate-type {
  font-size: 13px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--primary);
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

.gallery-section {
  background: var(--white);
}

.gallery-grid {
  margin-top: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}

.gallery-card {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
  transition: all 0.3s ease;
  height: 100%;
}
.gallery-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.gallery-card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  display: block;
}

.gallery-card p {
  margin: 0;
  padding: 12px 14px;
  font-weight: 500;
}

.step-card {
  background: var(--gray-light);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(0, 0, 0, 0.07);
  transition: all 0.3s ease;
  height: 100%;
}
.step-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.step-card .eyebrow {
  color: var(--primary);
  margin-bottom: 10px;
}

.certificates-hero {
  background: linear-gradient(135deg, #0f172a, #1e1b4b);
  color: #fff;
}

.certificates-hero h1 {
  font-size: 44px;
}

.certificates-hero p {
  color: rgba(255, 255, 255, 0.8);
}

.info-section {
  padding: 56px 0;
}

/* ===== Tablet (768px - 1024px) ===== */
@media (min-width: 768px) and (max-width: 1024px) {
  .info-hero {
    padding: 48px 0;
  }

  .info-hero-inner {
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  .certificates-hero h1 {
    font-size: 32px;
  }

  .certificate-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-top: 20px;
  }

  .certificate-image img {
    height: 150px;
  }

  .steps-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .step-card {
    padding: 18px;
  }

  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .gallery-card img {
    height: 150px;
  }

  .info-section {
    padding: 36px 0;
  }

  .info-page {
    padding-bottom: 48px;
  }
}

@media (max-width: 767px) {
  .info-hero-inner {
    grid-template-columns: 1fr;
  }

  .certificate-grid {
    margin-top: 12px;
  }
}
</style>