<template>
  <div class="product-page" v-if="product">
    <div class="container">
      <div class="breadcrumb">
        <router-link to="/">Главная</router-link>
        <span>/</span>
        <router-link to="/catalog">Каталог</router-link>
        <span>/</span>
        <span>{{ product.name }}</span>
      </div>

      <div class="product-layout">
        <div class="product-gallery">
          <div class="main-image">
            <span class="product-emoji">🔩</span>
          </div>
        </div>

        <div class="product-info">
          <h1>{{ product.name }}</h1>
          <p class="product-price">{{ product.price }} ₽</p>
          
          <div class="product-stock" :class="{inStock: product.stock > 0}">
            {{ product.stock > 0 ? `В наличии: ${product.stock} шт.` : 'Нет в наличии' }}
          </div>

          <p class="product-description">{{ product.description }}</p>

          <div class="product-specs" v-if="product.specifications && Object.keys(product.specifications).length">
            <h3>Характеристики</h3>
            <table class="specs-table">
              <tr v-for="(value, key) in product.specifications" :key="key">
                <td>{{ key }}</td>
                <td>{{ value }}</td>
              </tr>
            </table>
          </div>

          <div class="product-actions" v-if="product.stock > 0">
            <div class="quantity-control">
              <button @click="quantity > 1 && quantity--">−</button>
              <span>{{ quantity }}</span>
              <button @click="quantity < product.stock && quantity++">+</button>
            </div>
            <button class="btn btn-primary btn-lg" @click="addToCart">Добавить в корзину</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMessage } from 'naive-ui'
import axios from 'axios'
import { useCartStore } from '../stores/cart'

const route = useRoute()
const message = useMessage()
const cartStore = useCartStore()
const product = ref<any>(null)
const quantity = ref(1)

function addToCart() {
  cartStore.addItem(product.value, quantity.value)
  message.success(`Добавлено ${quantity.value} шт. в корзину`)
}

onMounted(async () => {
  const { data } = await axios.get(`/api/products/${route.params.id}`)
  if (data.success) product.value = data.data
})
</script>

<style scoped>
.product-page {
  padding: 40px 0;
}

.breadcrumb {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  font-size: 14px;
  color: var(--gray);
}

.breadcrumb a {
  color: var(--gray);
}

.breadcrumb a:hover {
  color: var(--primary);
}

.product-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
}

.product-gallery {
  position: sticky;
  top: 20px;
  height: fit-content;
}

.main-image {
  background: var(--gray-light);
  border-radius: 16px;
  padding: 60px;
  text-align: center;
}

.product-emoji {
  font-size: 200px;
}

.product-info h1 {
  font-size: 32px;
  margin-bottom: 16px;
}

.product-price {
  font-size: 36px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 16px;
}

.product-stock {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 24px;
  background: #fff0f0;
  color: var(--error);
}

.product-stock.inStock {
  background: #f0fff0;
  color: var(--success);
}

.product-description {
  color: var(--gray);
  line-height: 1.8;
  margin-bottom: 32px;
}

.product-specs {
  margin-bottom: 32px;
}

.product-specs h3 {
  font-size: 18px;
  margin-bottom: 16px;
}

.specs-table {
  width: 100%;
  border-collapse: collapse;
}

.specs-table tr {
  border-bottom: 1px solid var(--gray-light);
}

.specs-table td {
  padding: 12px 0;
}

.specs-table td:first-child {
  color: var(--gray);
  width: 40%;
}

.product-actions {
  display: flex;
  gap: 20px;
  align-items: center;
}

.quantity-control {
  display: flex;
  align-items: center;
  border: 2px solid var(--gray-light);
  border-radius: 8px;
  overflow: hidden;
}

.quantity-control button {
  width: 44px;
  height: 44px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.quantity-control button:hover {
  background: var(--gray-light);
}

.quantity-control span {
  width: 50px;
  text-align: center;
  font-weight: 600;
}

.btn {
  display: inline-block;
  padding: 12px 28px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: var(--primary);
  color: var(--white);
}

.btn-primary:hover {
  background: var(--primary-hover);
}

.btn-lg {
  padding: 16px 36px;
  font-size: 16px;
}
</style>