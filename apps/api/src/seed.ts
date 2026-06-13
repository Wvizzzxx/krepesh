import 'dotenv/config'
import { connectDB, disconnectDB } from './db/connection'
import { User } from './models/User'
import { Category } from './models/Category'
import { Product } from './models/Product'
import { Asset } from './models/Asset'

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, '-').replace(/(^-|-$)/g, '')
}

async function seed(): Promise<void> {
  await connectDB()

  // Clear existing data
  await User.deleteMany({})
  await Category.deleteMany({})
  await Product.deleteMany({})

  // Drop old assets collection to migrate to new schema (with key, emoji, location fields)
  try {
    await Asset.collection.drop()
    console.log('Dropped old assets collection for schema migration')
  } catch {
    // Collection might not exist yet, that's fine
  }

  // Create users (passwords are hashed by the User model pre-save hook)
  const admin = await User.create({
    email: 'admin@krepesh.ru',
    password: 'admin123',
    name: 'Админ',
    role: 'admin',
  })

  const user = await User.create({
    email: 'user@test.ru',
    password: 'user123',
    name: 'Иван',
    role: 'user',
  })

  console.log(`Created users: ${admin.email}, ${user.email}`)

  // Create categories
  const categories = await Category.create([
    { name: 'Болты', slug: 'bolty', description: 'Болты различных типов и размеров', image: '/images/bolts.jpg' },
    { name: 'Гайки', slug: 'gayki', description: 'Гайки всех стандартов', image: '/images/nuts.jpg' },
    { name: 'Шурупы', slug: 'shurupy', description: 'Шурупы для дерева и металла', image: '/images/screws.jpg' },
    { name: 'Саморезы', slug: 'samorezy', description: 'Саморезы для любых задач', image: '/images/self-tapping.jpg' },
  ])

  console.log(`Created ${categories.length} categories`)

  // Create products with static images from the images/ folder
  const productsData = [
    { name: 'Болт М6x20', description: 'Болт с шестигранной головкой, оцинкованный', price: 5, categoryId: categories[0]._id, stock: 1000, specifications: { 'Диаметр': 'М6', 'Длина': '20мм', 'Материал': 'Сталь' }, images: ['/images/Болт М6х20.webp'] },
    { name: 'Болт М8x30', description: 'Болт с шестигранной головкой, оцинкованный', price: 8, categoryId: categories[0]._id, stock: 800, specifications: { 'Диаметр': 'М8', 'Длина': '30мм', 'Материал': 'Сталь' }, images: ['/images/Болт М8х30.webp'] },
    { name: 'Болт М10x40', description: 'Болт с шестигранной головкой, оцинкованный', price: 12, categoryId: categories[0]._id, stock: 500, specifications: { 'Диаметр': 'М10', 'Длина': '40мм', 'Материал': 'Сталь' }, images: ['/images/Болт М10х40.webp'] },
    { name: 'Гайка М6', description: 'Гайка шестигранная, оцинкованная', price: 2, categoryId: categories[1]._id, stock: 2000, specifications: { 'Диаметр': 'М6', 'Материал': 'Сталь' }, images: ['/images/Гайка М6.webp'] },
    { name: 'Гайка М8', description: 'Гайка шестигранная, оцинкованная', price: 3, categoryId: categories[1]._id, stock: 1500, specifications: { 'Диаметр': 'М8', 'Материал': 'Сталь' }, images: ['/images/Гайка М8.webp'] },
    { name: 'Гайка М10', description: 'Гайка шестигранная, оцинкованная', price: 4, categoryId: categories[1]._id, stock: 1000, specifications: { 'Диаметр': 'М10', 'Материал': 'Сталь' }, images: ['/images/Гайка М10.jpeg'] },
    { name: 'Шуруп 3.5x25', description: 'Шуруп по дереву, желтопассивированный', price: 1, categoryId: categories[2]._id, stock: 5000, specifications: { 'Диаметр': '3.5мм', 'Длина': '25мм' }, images: ['/images/Шуруп 3.5х25.jpg'] },
    { name: 'Шуруп 4x40', description: 'Шуруп по дереву, желтопассивированный', price: 2, categoryId: categories[2]._id, stock: 3000, specifications: { 'Диаметр': '4мм', 'Длина': '40мм' }, images: ['/images/Шуруп 4х40.webp'] },
    { name: 'Саморез 4.2x13', description: 'Саморез по металлу с прессшайбой', price: 3, categoryId: categories[3]._id, stock: 4000, specifications: { 'Диаметр': '4.2мм', 'Длина': '13мм' }, images: ['/images/Саморез 4.2х13.webp'] },
    { name: 'Саморез 4.8x25', description: 'Саморез по металлу с прессшайбой', price: 4, categoryId: categories[3]._id, stock: 2500, specifications: { 'Диаметр': '4.8мм', 'Длина': '25мм' }, images: ['/images/Саморез 4.8х25.webp'] },
  ]

  for (const p of productsData) {
    await Product.create({ ...p, slug: slugify(p.name) })
  }

  console.log(`Created ${productsData.length} products`)

  // Create assets - actual icons/emojis used on the site
  // These are the REAL icons that appear in the admin sidebar and on the website
  const assetsData = [
    // ===== Admin Sidebar Icons (emoji) =====
    { key: 'sidebar-logo', name: 'Логотип (сайт)', type: 'icon' as const, emoji: '🔩', location: 'sidebar', description: 'Иконка логотипа в шапке сайдбара' },
    { key: 'sidebar-dashboard', name: 'Дашборд', type: 'icon' as const, emoji: '📊', location: 'sidebar', description: 'Иконка раздела Дашборд' },
    { key: 'sidebar-products', name: 'Товары', type: 'icon' as const, emoji: '📦', location: 'sidebar', description: 'Иконка раздела Товары' },
    { key: 'sidebar-categories', name: 'Категории', type: 'icon' as const, emoji: '🏷️', location: 'sidebar', description: 'Иконка раздела Категории' },
    { key: 'sidebar-orders', name: 'Заказы', type: 'icon' as const, emoji: '🛒', location: 'sidebar', description: 'Иконка раздела Заказы' },
    { key: 'sidebar-users', name: 'Пользователи', type: 'icon' as const, emoji: '👥', location: 'sidebar', description: 'Иконка раздела Пользователи' },
    { key: 'sidebar-assets', name: 'Иконки и изображения', type: 'icon' as const, emoji: '🎨', location: 'sidebar', description: 'Иконка раздела Управление иконками' },
    { key: 'sidebar-logout', name: 'Выйти', type: 'icon' as const, emoji: '🚪', location: 'sidebar', description: 'Иконка кнопки Выход' },

    // ===== Home Page Feature Icons (Font Awesome via Icon component) =====
    { key: 'home-delivery', name: 'Быстрая доставка', type: 'icon' as const, emoji: '🚚', location: 'home', description: 'Иконка блока Быстрая доставка на главной' },
    { key: 'home-quality', name: 'Гарантия качества', type: 'icon' as const, emoji: '✅', location: 'home', description: 'Иконка блока Гарантия качества на главной' },
    { key: 'home-prices', name: 'Лучшие цены', type: 'icon' as const, emoji: '💰', location: 'home', description: 'Иконка блока Лучшие цены на главной' },
    { key: 'home-support', name: 'Поддержка 24/7', type: 'icon' as const, emoji: '🎧', location: 'home', description: 'Иконка блока Поддержка 24/7 на главной' },

    // ===== Home Page Category Emojis =====
    { key: 'category-bolts', name: 'Болты (эмодзи)', type: 'icon' as const, emoji: '🔩', location: 'categories', description: 'Эмодзи для категории Болты' },
    { key: 'category-nuts', name: 'Гайки (эмодзи)', type: 'icon' as const, emoji: '⚙️', location: 'categories', description: 'Эмодзи для категории Гайки' },
    { key: 'category-screws', name: 'Шурупы (эмодзи)', type: 'icon' as const, emoji: '🪛', location: 'categories', description: 'Эмодзи для категории Шурупы' },
    { key: 'category-selftapping', name: 'Саморезы (эмодзи)', type: 'icon' as const, emoji: '🔩', location: 'categories', description: 'Эмодзи для категории Саморезы' },

    // ===== Product Placeholder =====
    { key: 'product-placeholder', name: 'Заглушка товара', type: 'placeholder' as const, emoji: '📸', location: 'products', description: 'Заглушка для товаров без фотографии' },

    // ===== Certificate Placeholder (общая заглушка) =====
    { key: 'certificate-placeholder', name: 'Заглушка сертификата', type: 'placeholder' as const, emoji: '📋', location: 'certificates', description: 'Заглушка для сертификатов без изображения' },

    // ===== Site Photos: Сертификаты =====
    { key: 'cert-iso', name: 'ISO 9001 — Сертификат', type: 'placeholder' as const, emoji: '📋', location: 'site-photos', description: 'Изображение сертификата ISO 9001 на странице Сертификаты' },
    { key: 'cert-din', name: 'DIN EN 1090 — Сертификат', type: 'placeholder' as const, emoji: '📋', location: 'site-photos', description: 'Изображение сертификата DIN EN 1090 на странице Сертификаты' },
    { key: 'cert-gost', name: 'ГОСТ 1759 — Сертификат', type: 'placeholder' as const, emoji: '📋', location: 'site-photos', description: 'Изображение сертификата ГОСТ 1759 на странице Сертификаты' },
    { key: 'cert-preview-1', name: 'Скан-копия сертификата №1', type: 'placeholder' as const, emoji: '📄', location: 'site-photos', description: 'Превью скана сертификата соответствия №1' },
    { key: 'cert-preview-2', name: 'Скан-копия сертификата №2', type: 'placeholder' as const, emoji: '📄', location: 'site-photos', description: 'Превью скана сертификата соответствия №2' },
    { key: 'cert-preview-3', name: 'Протокол испытаний', type: 'placeholder' as const, emoji: '📄', location: 'site-photos', description: 'Превью протокола испытаний' },

    // ===== Site Photos: Главная страница =====
    { key: 'home-hero-bg', name: 'Фон главного баннера', type: 'placeholder' as const, emoji: '🖼️', location: 'site-photos', description: 'Фоновое изображение главного баннера на главной странице' },
    { key: 'home-about-img', name: 'Фото «О компании»', type: 'placeholder' as const, emoji: '🏭', location: 'site-photos', description: 'Фото для блока «О компании» на главной странице' },

    // ===== Site Photos: О компании =====
    { key: 'about-hero-bg', name: 'Фон баннера «О компании»', type: 'placeholder' as const, emoji: '🖼️', location: 'site-photos', description: 'Фоновое изображение баннера на странице О компании' },
    { key: 'about-team-img', name: 'Фото команды', type: 'placeholder' as const, emoji: '👥', location: 'site-photos', description: 'Фото для раздела команда на странице О компании' },
  ]

  for (const asset of assetsData) {
    await Asset.findOneAndUpdate(
      { key: asset.key },
      { ...asset, slug: slugify(asset.name) },
      { upsert: true, new: true }
    )
  }

  console.log(`Created ${assetsData.length} assets (icons & placeholders)`)
  console.log('✅ Seed completed successfully!')

  await disconnectDB()
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error)
  process.exit(1)
})