<template>
  <div class="cart-page">
    <div class="container">
      <h1>Корзина</h1>

      <div v-if="cartStore.items.length === 0" class="empty-cart">
        <div class="empty-icon">🛒</div>
        <h2>Корзина пуста</h2>
        <p>Добавьте товары из каталога</p>
        <router-link to="/catalog" class="btn btn-primary">Перейти в каталог</router-link>
      </div>

      <div v-else class="cart-layout">
        <div class="cart-items">
          <div v-for="item in validItems" :key="item.productId" class="cart-item">
            <div class="item-image">
              <img :src="getItemImage(item)" :alt="getProductName(item)" />
            </div>
            <div class="item-info">
              <router-link :to="`/product/${item.productId}`" class="item-name">{{
                getProductName(item)
              }}</router-link>
              <p class="item-price">{{ formatPrice(getProductPrice(item)) }} ₽ за шт.</p>
            </div>
            <div class="item-quantity">
              <button @click="updateQuantity(item.productId, item.quantity - 1)">−</button>
              <input
                type="number"
                class="quantity-input"
                :value="item.quantity"
                min="1"
                @change="onQuantityInput($event, item.productId)"
                @keydown.enter="($event.target as HTMLInputElement).blur()"
              />
              <button @click="updateQuantity(item.productId, item.quantity + 1)">+</button>
            </div>
            <div class="item-total">{{ formatPrice(getProductPrice(item) * item.quantity) }} ₽</div>
            <button class="item-remove" @click="removeItem(item.productId)">✕</button>
          </div>
        </div>

        <div class="cart-summary">
          <h3>Итого</h3>
          <div class="summary-row">
            <span>Товаров:</span>
            <span>{{ cartStore.itemCount }} шт.</span>
          </div>
          <div class="summary-row">
            <span>Сумма товаров:</span>
            <span>{{ formatPrice(cartStore.subtotal) }} ₽</span>
          </div>
          <div class="summary-row">
            <span>Доставка:</span>
            <span v-if="!cartStore.deliveryAvailable" class="pickup-only">Только самовывоз</span>
            <span v-else-if="cartStore.deliveryCost === 0" class="free-delivery">Бесплатно</span>
            <span v-else>{{ cartStore.deliveryCost }} ₽</span>
          </div>
          <div v-if="!cartStore.deliveryAvailable" class="delivery-hint warning">
            📦 Доставка недоступна для заказов менее 200 ₽. Доступен только самовывоз.
          </div>
          <div v-else-if="cartStore.subtotal < 10000" class="delivery-hint">
            💡 До бесплатной доставки осталось {{ formatPrice(10000 - cartStore.subtotal) }} ₽
          </div>
          <div class="summary-row total">
            <span>Итого:</span>
            <span>{{ formatPrice(cartStore.totalPrice) }} ₽</span>
          </div>
          <router-link to="/checkout" class="btn btn-primary btn-block">Оформить заказ</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCartStore } from '../stores/cart'

const cartStore = useCartStore()

const validItems = computed(() => {
  return cartStore.items.filter(item => item && item.product && item.product._id)
})

function formatPrice(price: number): string {
  return Number(price).toLocaleString('ru-RU')
}

function getProductName(item: any): string {
  return item?.product?.name || 'Товар'
}

function getProductPrice(item: any): number {
  return item?.product?.discountPrice || item?.product?.price || 0
}

function updateQuantity(productId: string, quantity: number) {
  cartStore.updateQuantity(productId, quantity)
}

function onQuantityInput(event: Event, productId: string) {
  const input = event.target as HTMLInputElement
  const value = parseInt(input.value, 10)
  if (!isNaN(value) && value >= 1) {
    cartStore.updateQuantity(productId, value)
  } else {
    // Возвращаем отображаемое значение к текущему количеству
    const item = cartStore.items.find(i => i.productId === productId)
    if (item) {
      input.value = String(item.quantity)
    }
  }
}

function removeItem(productId: string) {
  cartStore.removeItem(productId)
}

function svgPlaceholder(label: string, width = 320, height = 320): string {
  const safeLabel = label || 'Фото товара'
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2f3745"/><stop offset="100%" stop-color="#111827"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="48%" text-anchor="middle" fill="#f8fafc" font-size="16" font-family="Arial, sans-serif">${safeLabel}</text><text x="50%" y="58%" text-anchor="middle" fill="#94a3b8" font-size="12" font-family="Arial, sans-serif">Замените на реальное фото</text></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function getItemImage(item: any): string {
  const source = item?.product?.images?.[0] || item?.product?.image
  if (source) return source
  return svgPlaceholder(getProductName(item))
}
</script>

<style scoped>
.cart-page {
  padding: 40px 0;
}

.cart-page h1 {
  font-size: 32px;
  margin-bottom: 32px;
}

.empty-cart {
  text-align: center;
  padding: 80px 0;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 24px;
}

.empty-cart h2 {
  margin-bottom: 8px;
}

.empty-cart p {
  color: var(--gray);
  margin-bottom: 24px;
}

.cart-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 40px;
}

.cart-items {
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.cart-item {
  display: grid;
  grid-template-columns: 80px 1fr auto auto auto auto;
  align-items: center;
  gap: 20px;
  padding: 20px;
  border-bottom: 1px solid var(--gray-light);
}

.cart-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 80px;
  height: 80px;
  background: var(--gray-light);
  border-radius: 8px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-name {
  font-weight: 600;
  color: var(--dark);
}

.item-name:hover {
  color: var(--primary);
}

.item-price {
  color: var(--gray);
  font-size: 14px;
  margin-top: 4px;
}

.item-quantity {
  display: flex;
  align-items: center;
  border: 1px solid var(--gray-light);
  border-radius: 6px;
}

.item-quantity button {
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.item-quantity button:hover {
  background: var(--gray-light);
}

.item-quantity .quantity-input {
  width: 48px;
  height: 32px;
  text-align: center;
  font-weight: 600;
  border: none;
  background: none;
  font-size: 14px;
  -moz-appearance: textfield;
  outline: none;
}

.item-quantity .quantity-input::-webkit-outer-spin-button,
.item-quantity .quantity-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.item-quantity .quantity-input:focus {
  background: var(--gray-light);
  border-radius: 4px;
}

.item-total {
  font-weight: 700;
  color: var(--primary);
  min-width: 80px;
  text-align: right;
}

.item-remove {
  background: none;
  border: none;
  color: var(--gray);
  cursor: pointer;
  font-size: 18px;
  padding: 8px;
}

.item-remove:hover {
  color: var(--error);
}

.cart-summary {
  background: var(--white);
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  height: fit-content;
  position: sticky;
  top: 20px;
}

.cart-summary h3 {
  font-size: 20px;
  margin-bottom: 24px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  color: var(--gray);
}

.summary-row.total {
  font-size: 20px;
  font-weight: 700;
  color: var(--dark);
  margin: 20px 0;
  padding-top: 16px;
  border-top: 1px solid var(--gray-light);
}

.free-delivery {
  color: #10b981;
  font-weight: 600;
}

.pickup-only {
  color: #f59e0b;
  font-weight: 600;
}

.delivery-hint {
  background: #fffbeb;
  color: #92400e;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 16px;
  text-align: center;
}

.delivery-hint.warning {
  background: #fef2f2;
  color: #991b1b;
}

.btn {
  display: inline-block;
  padding: 12px 28px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-align: center;
}

.btn-primary {
  background: var(--primary);
  color: var(--white);
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-block {
  display: block;
  width: 100%;
  padding: 16px;
  font-size: 16px;
}

/* ===== Tablet (768px - 1024px) ===== */
@media (min-width: 768px) and (max-width: 1024px) {
  .cart-page {
    padding: 24px 0;
  }

  .cart-page h1 {
    font-size: 26px;
    margin-bottom: 24px;
  }

  .cart-layout {
    grid-template-columns: 1fr 280px;
    gap: 24px;
  }

  .cart-item {
    grid-template-columns: 70px 1fr auto auto auto;
    gap: 14px;
    padding: 16px;
  }

  .item-image {
    width: 70px;
    height: 70px;
  }

  .item-total {
    min-width: 70px;
    font-size: 14px;
  }

  .cart-summary {
    padding: 24px;
  }

  .cart-summary h3 {
    font-size: 18px;
  }
}
</style>