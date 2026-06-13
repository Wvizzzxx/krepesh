const base = import.meta.env.BASE_URL || '/'

function img(name: string): string {
  return `${base}images/${name}`
}

export const mockCategories = [
  { _id: 'cat1', name: 'Болты', slug: 'bolty', description: 'Болты различных типов и размеров', image: img('Болт М6х20.webp') },
  { _id: 'cat2', name: 'Гайки', slug: 'gayki', description: 'Гайки всех стандартов', image: img('Гайка М6.webp') },
  { _id: 'cat3', name: 'Шурупы', slug: 'shurupy', description: 'Шурупы для дерева и металла', image: img('Шуруп 3.5х25.jpg') },
  { _id: 'cat4', name: 'Саморезы', slug: 'samorezy', description: 'Саморезы для любых задач', image: img('Саморез 4.2х13.webp') },
]

export const mockProducts = [
  { _id: 'p1', name: 'Болт М6x20', slug: 'bolt-m6x20', description: 'Болт с шестигранной головкой, оцинкованный', price: 5, categoryId: 'cat1', images: [img('Болт М6х20.webp')], stock: 1000, specifications: { 'Диаметр': 'М6', 'Длина': '20мм', 'Материал': 'Сталь' }, discountPrice: null, averageRating: 4.5, reviewCount: 12, createdAt: '2026-01-15T10:00:00Z', updatedAt: '2026-01-15T10:00:00Z' },
  { _id: 'p2', name: 'Болт М8x30', slug: 'bolt-m8x30', description: 'Болт с шестигранной головкой, оцинкованный', price: 8, categoryId: 'cat1', images: [img('Болт М8х30.webp')], stock: 800, specifications: { 'Диаметр': 'М8', 'Длина': '30мм', 'Материал': 'Сталь' }, discountPrice: null, averageRating: 4.7, reviewCount: 8, createdAt: '2026-01-16T10:00:00Z', updatedAt: '2026-01-16T10:00:00Z' },
  { _id: 'p3', name: 'Болт М10x40', slug: 'bolt-m10x40', description: 'Болт с шестигранной головкой, оцинкованный', price: 12, categoryId: 'cat1', images: [img('Болт М10х40.webp')], stock: 500, specifications: { 'Диаметр': 'М10', 'Длина': '40мм', 'Материал': 'Сталь' }, discountPrice: 10, averageRating: 4.3, reviewCount: 5, createdAt: '2026-01-17T10:00:00Z', updatedAt: '2026-01-17T10:00:00Z' },
  { _id: 'p4', name: 'Гайка М6', slug: 'gayka-m6', description: 'Гайка шестигранная, оцинкованная', price: 2, categoryId: 'cat2', images: [img('Гайка М6.webp')], stock: 2000, specifications: { 'Диаметр': 'М6', 'Материал': 'Сталь' }, discountPrice: null, averageRating: 4.8, reviewCount: 20, createdAt: '2026-01-18T10:00:00Z', updatedAt: '2026-01-18T10:00:00Z' },
  { _id: 'p5', name: 'Гайка М8', slug: 'gayka-m8', description: 'Гайка шестигранная, оцинкованная', price: 3, categoryId: 'cat2', images: [img('Гайка М8.webp')], stock: 1500, specifications: { 'Диаметр': 'М8', 'Материал': 'Сталь' }, discountPrice: null, averageRating: 4.6, reviewCount: 15, createdAt: '2026-01-19T10:00:00Z', updatedAt: '2026-01-19T10:00:00Z' },
  { _id: 'p6', name: 'Гайка М10', slug: 'gayka-m10', description: 'Гайка шестигранная, оцинкованная', price: 4, categoryId: 'cat2', images: [img('Гайка М10.jpeg')], stock: 1000, specifications: { 'Диаметр': 'М10', 'Материал': 'Сталь' }, discountPrice: null, averageRating: 4.4, reviewCount: 10, createdAt: '2026-01-20T10:00:00Z', updatedAt: '2026-01-20T10:00:00Z' },
  { _id: 'p7', name: 'Шуруп 3.5x25', slug: 'shurup-35x25', description: 'Шуруп по дереву, желтопассивированный', price: 1, categoryId: 'cat3', images: [img('Шуруп 3.5х25.jpg')], stock: 5000, specifications: { 'Диаметр': '3.5мм', 'Длина': '25мм' }, discountPrice: null, averageRating: 4.9, reviewCount: 25, createdAt: '2026-01-21T10:00:00Z', updatedAt: '2026-01-21T10:00:00Z' },
  { _id: 'p8', name: 'Шуруп 4x40', slug: 'shurup-4x40', description: 'Шуруп по дереву, желтопассивированный', price: 2, categoryId: 'cat3', images: [img('Шуруп 4х40.webp')], stock: 3000, specifications: { 'Диаметр': '4мм', 'Длина': '40мм' }, discountPrice: null, averageRating: 4.7, reviewCount: 18, createdAt: '2026-01-22T10:00:00Z', updatedAt: '2026-01-22T10:00:00Z' },
  { _id: 'p9', name: 'Саморез 4.2x13', slug: 'samorez-42x13', description: 'Саморез по металлу с прессшайбой', price: 3, categoryId: 'cat4', images: [img('Саморез 4.2х13.webp')], stock: 4000, specifications: { 'Диаметр': '4.2мм', 'Длина': '13мм' }, discountPrice: null, averageRating: 4.5, reviewCount: 14, createdAt: '2026-01-23T10:00:00Z', updatedAt: '2026-01-23T10:00:00Z' },
  { _id: 'p10', name: 'Саморез 4.8x25', slug: 'samorez-48x25', description: 'Саморез по металлу с прессшайбой', price: 4, categoryId: 'cat4', images: [img('Саморез 4.8х25.webp')], stock: 2500, specifications: { 'Диаметр': '4.8мм', 'Длина': '25мм' }, discountPrice: null, averageRating: 4.6, reviewCount: 11, createdAt: '2026-01-24T10:00:00Z', updatedAt: '2026-01-24T10:00:00Z' },
]

export const mockAssets = [
  { _id: 'a1', key: 'product-placeholder', name: 'Заглушка товара', type: 'placeholder', emoji: '📸', location: 'products', description: 'Заглушка для товаров без фотографии', slug: 'zaglushka-tovara' },
  { _id: 'a2', key: 'category-bolts', name: 'Болты', type: 'icon', emoji: '🔩', location: 'categories', description: 'Эмодзи для категории Болты', slug: 'bolty' },
  { _id: 'a3', key: 'category-nuts', name: 'Гайки', type: 'icon', emoji: '⚙️', location: 'categories', description: 'Эмодзи для категории Гайки', slug: 'gayki' },
  { _id: 'a4', key: 'category-screws', name: 'Шурупы', type: 'icon', emoji: '🪛', location: 'categories', description: 'Эмодзи для категории Шурупы', slug: 'shurupy' },
  { _id: 'a5', key: 'category-selftapping', name: 'Саморезы', type: 'icon', emoji: '🔩', location: 'categories', description: 'Эмодзи для категории Саморезы', slug: 'samorezy' },
  { _id: 'a6', key: 'home-delivery', name: 'Быстрая доставка', type: 'icon', emoji: '🚚', location: 'home', description: 'Иконка блока Быстрая доставка', slug: 'bystroj-dostavka' },
  { _id: 'a7', key: 'home-quality', name: 'Гарантия качества', type: 'icon', emoji: '✅', location: 'home', description: 'Иконка блока Гарантия качества', slug: 'garantiya-kachestva' },
  { _id: 'a8', key: 'home-prices', name: 'Лучшие цены', type: 'icon', emoji: '💰', location: 'home', description: 'Иконка блока Лучшие цены', slug: 'luchshie-ceny' },
  { _id: 'a9', key: 'home-support', name: 'Поддержка 24/7', type: 'icon', emoji: '🎧', location: 'home', description: 'Иконка блока Поддержка 24/7', slug: 'podderzhka-24-7' },
  { _id: 'a10', key: 'sidebar-logo', name: 'Логотип', type: 'icon', emoji: '🔩', location: 'sidebar', description: 'Иконка логотипа', slug: 'logotip' },
]

export const mockUser = {
  _id: 'u1',
  email: 'demo@krepesh.ru',
  name: 'Демо пользователь',
  role: 'user',
  createdAt: '2026-01-01T00:00:00Z',
}

export function getProductsWithCategories() {
  return mockProducts.map(p => ({
    ...p,
    categoryId: mockCategories.find(c => c._id === p.categoryId) || mockCategories[0],
  }))
}

export function getProductById(id: string) {
  const product = mockProducts.find(p => p._id === id)
  if (!product) return null
  return {
    ...product,
    categoryId: mockCategories.find(c => c._id === product.categoryId) || mockCategories[0],
  }
}