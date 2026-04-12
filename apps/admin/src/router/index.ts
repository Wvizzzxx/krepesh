import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/login', component: () => import('../views/Login.vue') },
  {
    path: '/',
    component: () => import('../components/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', component: () => import('../views/Dashboard.vue') },
      { path: 'products', component: () => import('../views/Products.vue') },
      { path: 'categories', component: () => import('../views/Categories.vue') },
      { path: 'orders', component: () => import('../views/Orders.vue') },
      { path: 'orders/:id', component: () => import('../views/OrderDetail.vue') },
      { path: 'users', component: () => import('../views/Users.vue') },
    ],
  },
]

const router = createRouter({ history: createWebHistory(), routes })

let profileFetched = false

router.beforeEach(async (to) => {
  if (to.path === '/login') return

  const auth = useAuthStore()

  // Fetch profile once before checking auth
  if (!profileFetched && auth.token) {
    profileFetched = true
    await auth.fetchProfile()
  }

  if (!auth.isLoggedIn) return '/login'
  if (to.meta.requiresAdmin && !auth.isAdmin) return '/'
})

export default router
