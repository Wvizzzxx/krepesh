import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref<any[]>([])

  // Загружаем корзину из localStorage с очисткой битых записей
  function loadCart() {
    try {
      const raw = localStorage.getItem('cart')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          items.value = parsed.filter(
            (item: any) => item && item.productId && item.product && item.product._id && item.product.price > 0
          )
          if (items.value.length !== parsed.length) {
            save()
          }
        } else {
          items.value = []
        }
      }
    } catch {
      items.value = []
    }
  }

  loadCart()

  function getEffectivePrice(product: any): number {
    return product?.discountPrice || product?.price || 0
  }

  const subtotal = computed(() =>
    items.value.reduce((sum, i) => {
      const price = getEffectivePrice(i.product)
      return sum + price * i.quantity
    }, 0)
  )

  // Доступна ли доставка (от 200₽ суммы заказа)
  const deliveryAvailable = computed(() => subtotal.value >= 200)

  // Расчёт стоимости доставки
  const deliveryCost = computed(() => {
    const sum = subtotal.value
    if (sum < 200) return 0            // Только самовывоз
    if (sum >= 10000) return 0         // Бесплатно
    if (sum >= 5000) return 200        // 200₽ минимум
    if (sum >= 2000) return 390        // 390₽
    if (sum >= 500) return 590         // 590₽
    return 990                           // 990₽ для заказов 200-500₽
  })

  const totalPrice = computed(() => subtotal.value + deliveryCost.value)

  const itemCount = computed(() =>
    items.value.reduce((sum, i) => sum + i.quantity, 0)
  )

  function save() {
    localStorage.setItem('cart', JSON.stringify(items.value))
  }

  function addItem(product: any, quantity = 1) {
    if (!product || !product._id) return

    const existing = items.value.find(i => i.productId === product._id)
    if (existing) {
      existing.product = product
      existing.quantity += quantity
    } else {
      items.value.push({ productId: product._id, product, quantity })
    }
    save()
  }

  function removeItem(productId: string) {
    items.value = items.value.filter(i => i.productId !== productId)
    save()
  }

  function updateQuantity(productId: string, quantity: number) {
    const item = items.value.find(i => i.productId === productId)
    if (item) {
      item.quantity = quantity
      if (item.quantity <= 0) removeItem(productId)
      else save()
    }
  }

  function clear() {
    items.value = []
    save()
  }

  return { items, subtotal, deliveryAvailable, deliveryCost, totalPrice, itemCount, addItem, removeItem, updateQuantity, clear }
})