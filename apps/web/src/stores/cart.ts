import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const items = ref<any[]>(JSON.parse(localStorage.getItem('cart') || '[]'))

  const totalPrice = computed(() => items.value.reduce((sum, i) => sum + i.product.price * i.quantity, 0))
  const itemCount = computed(() => items.value.reduce((sum, i) => sum + i.quantity, 0))

  function save() {
    localStorage.setItem('cart', JSON.stringify(items.value))
  }

  function addItem(product: any, quantity = 1) {
    const existing = items.value.find(i => i.productId === product._id)
    if (existing) {
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

  return { items, totalPrice, itemCount, addItem, removeItem, updateQuantity, clear }
})