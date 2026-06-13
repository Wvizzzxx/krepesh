import 'dotenv/config'
import { connectDB, disconnectDB } from './db/connection'
import { Asset } from './models/Asset'

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-яёa-z0-9]+/gi, '-').replace(/(^-|-$)/g, '')
}

async function migrate(): Promise<void> {
  await connectDB()

  const sitePhotos = [
    { key: 'cert-iso', name: 'ISO 9001 — Сертификат', type: 'placeholder' as const, emoji: '📋', location: 'site-photos', description: 'Изображение сертификата ISO 9001 на странице Сертификаты' },
    { key: 'cert-din', name: 'DIN EN 1090 — Сертификат', type: 'placeholder' as const, emoji: '📋', location: 'site-photos', description: 'Изображение сертификата DIN EN 1090 на странице Сертификаты' },
    { key: 'cert-gost', name: 'ГОСТ 1759 — Сертификат', type: 'placeholder' as const, emoji: '📋', location: 'site-photos', description: 'Изображение сертификата ГОСТ 1759 на странице Сертификаты' },
    { key: 'cert-preview-1', name: 'Скан-копия сертификата №1', type: 'placeholder' as const, emoji: '📄', location: 'site-photos', description: 'Превью скана сертификата соответствия №1' },
    { key: 'cert-preview-2', name: 'Скан-копия сертификата №2', type: 'placeholder' as const, emoji: '📄', location: 'site-photos', description: 'Превью скана сертификата соответствия №2' },
    { key: 'cert-preview-3', name: 'Протокол испытаний', type: 'placeholder' as const, emoji: '📄', location: 'site-photos', description: 'Превью протокола испытаний' },
    { key: 'home-hero-bg', name: 'Фон главного баннера', type: 'placeholder' as const, emoji: '🖼️', location: 'site-photos', description: 'Фоновое изображение главного баннера на главной странице' },
    { key: 'home-about-img', name: 'Фото «О компании»', type: 'placeholder' as const, emoji: '🏭', location: 'site-photos', description: 'Фото для блока «О компании» на главной странице' },
    { key: 'about-hero-bg', name: 'Фон баннера «О компании»', type: 'placeholder' as const, emoji: '🖼️', location: 'site-photos', description: 'Фоновое изображение баннера на странице О компании' },
    { key: 'about-team-img', name: 'Фото команды', type: 'placeholder' as const, emoji: '👥', location: 'site-photos', description: 'Фото для раздела команда на странице О компании' },
  ]

  for (const asset of sitePhotos) {
    await Asset.findOneAndUpdate(
      { key: asset.key },
      { ...asset, slug: slugify(asset.name) },
      { upsert: true, new: true }
    )
    console.log(`✓ ${asset.key}`)
  }

  console.log(`\n✅ Миграция завершена. Создано/обновлено ${sitePhotos.length} фото сайта.`)
  await disconnectDB()
}

migrate().catch((error) => {
  console.error('❌ Миграция не удалась:', error)
  process.exit(1)
})