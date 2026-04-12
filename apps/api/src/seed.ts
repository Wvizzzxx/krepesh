import 'dotenv/config'
import { connectDB, disconnectDB } from './db/connection'
import { User } from './models/User'
import { Category } from './models/Category'
import { Product } from './models/Product'

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9а-яё]+/gi, '-').replace(/(^-|-$)/g, '')
}

async function seed(): Promise<void> {
  await connectDB()

  // Clear existing data
  await User.deleteMany({})
  await Category.deleteMany({})
  await Product.deleteMany({})

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

  // Create products
  const productsData = [
    { name: 'Болт М6x20', description: 'Болт с шестигранной головкой, оцинкованный', price: 5, categoryId: categories[0]._id, stock: 1000, specifications: { 'Диаметр': 'М6', 'Длина': '20мм', 'Материал': 'Сталь' } },
    { name: 'Болт М8x30', description: 'Болт с шестигранной головкой, оцинкованный', price: 8, categoryId: categories[0]._id, stock: 800, specifications: { 'Диаметр': 'М8', 'Длина': '30мм', 'Материал': 'Сталь' } },
    { name: 'Болт М10x40', description: 'Болт с шестигранной головкой, оцинкованный', price: 12, categoryId: categories[0]._id, stock: 500, specifications: { 'Диаметр': 'М10', 'Длина': '40мм', 'Материал': 'Сталь' } },
    { name: 'Гайка М6', description: 'Гайка шестигранная, оцинкованная', price: 2, categoryId: categories[1]._id, stock: 2000, specifications: { 'Диаметр': 'М6', 'Материал': 'Сталь' } },
    { name: 'Гайка М8', description: 'Гайка шестигранная, оцинкованная', price: 3, categoryId: categories[1]._id, stock: 1500, specifications: { 'Диаметр': 'М8', 'Материал': 'Сталь' } },
    { name: 'Гайка М10', description: 'Гайка шестигранная, оцинкованная', price: 4, categoryId: categories[1]._id, stock: 1000, specifications: { 'Диаметр': 'М10', 'Материал': 'Сталь' } },
    { name: 'Шуруп 3.5x25', description: 'Шуруп по дереву, желтопассивированный', price: 1, categoryId: categories[2]._id, stock: 5000, specifications: { 'Диаметр': '3.5мм', 'Длина': '25мм' } },
    { name: 'Шуруп 4x40', description: 'Шуруп по дереву, желтопассивированный', price: 2, categoryId: categories[2]._id, stock: 3000, specifications: { 'Диаметр': '4мм', 'Длина': '40мм' } },
    { name: 'Саморез 4.2x13', description: 'Саморез по металлу с прессшайбой', price: 3, categoryId: categories[3]._id, stock: 4000, specifications: { 'Диаметр': '4.2мм', 'Длина': '13мм' } },
    { name: 'Саморез 4.8x25', description: 'Саморез по металлу с прессшайбой', price: 4, categoryId: categories[3]._id, stock: 2500, specifications: { 'Диаметр': '4.8мм', 'Длина': '25мм' } },
  ]

  for (const p of productsData) {
    await Product.create({ ...p, slug: slugify(p.name), images: [] })
  }

  console.log(`Created ${productsData.length} products`)
  console.log('✅ Seed completed successfully!')

  await disconnectDB()
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error)
  process.exit(1)
})
