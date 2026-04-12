import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  { path: '/catalog', name: 'Catalog', component: () => import('../views/Catalog.vue') },
  { path: '/product/:id', name: 'Product', component: () => import('../views/Product.vue') },
  { path: '/cart', name: 'Cart', component: () => import('../views/Cart.vue') },
  { path: '/checkout', name: 'Checkout', component: () => import('../views/Checkout.vue') },
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
  { path: '/register', name: 'Register', component: () => import('../views/Register.vue') },
  { path: '/profile', name: 'Profile', component: () => import('../views/Profile.vue') },
  { path: '/orders', name: 'Orders', component: () => import('../views/Orders.vue') },
  { path: '/about', name: 'About', component: () => import('../views/About.vue') },
  { path: '/contacts', name: 'Contacts', component: () => import('../views/Contacts.vue') },
  { path: '/delivery', name: 'Delivery', component: () => import('../views/Delivery.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore()

  // Дожидаемся загрузки профиля если есть токен
  if (auth.token && !auth.user) {
    await auth.fetchProfile()
  }

  next()
})

export default router
