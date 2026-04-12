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
          <div v-for="item in cartStore.items" :key="item.productId" class="cart-item">
            <div class="item-image">🔩</div>
            <div class="item-info">
              <router-link :to="`/product/${item.productId}`" class="item-name">{{ item.product.name }}</router-link>
              <p class="item-price">{{ item.product.price }} ₽ за шт.</p>
            </div>
            <div class="item-quantity">
              <button @click="updateQuantity(item.productId, item.quantity - 1)">−</button>
              <span>{{ item.quantity }}</span>
              <button @click="updateQuantity(item.productId, item.quantity + 1)">+</button>
            </div>
            <div class="item-total">{{ item.product.price * item.quantity }} ₽</div>
            <button class="item-remove" @click="removeItem(item.productId)">✕</button>
          </div>
        </div>

        <div class="cart-summary">
          <h3>Итого</h3>
          <div class="summary-row">
            <span>Товаров:</span>
            <span>{{ cartStore.itemCount }} шт.</span>
          </div>
          <div class="summary-row total">
            <span>Сумма:</span>
            <span>{{ cartStore.totalPrice }} ₽</span>
          </div>
          <router-link to="/checkout" class="btn btn-primary btn-block">Оформить заказ</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '../stores/cart'

const cartStore = useCartStore()

function updateQuantity(productId: string, quantity: number) {
  cartStore.updateQuantity(productId, quantity)
}

function removeItem(productId: string) {
  cartStore.removeItem(productId)
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
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
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
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

.item-quantity span {
  width: 40px;
  text-align: center;
  font-weight: 600;
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
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
</style>