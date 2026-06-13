<template>
  <div class="info-page">
    <div class="container">
      <h1>Контакты</h1>
      
      <div class="contacts-layout">
         <div class="contacts-info">
           <div class="contact-block">
             <h3><Icon name="map-marker-alt" color="#ff6b00" /> Адрес</h3>
             <p>123456, г. Москва</p>
             <p>ул. Промышленная, д. 1, стр. 2</p>
           </div>

           <div class="contact-block">
             <h3><Icon name="phone" color="#ff6b00" /> Телефон</h3>
             <p>+7 (800) 123-45-67</p>
             <p>+7 (495) 123-45-67</p>
           </div>

           <div class="contact-block">
             <h3><Icon name="envelope" color="#ff6b00" /> Email</h3>
             <p>info@krepesh.ru</p>
             <p>zakaz@krepesh.ru</p>
           </div>

           <div class="contact-block">
             <h3><Icon name="clock" color="#ff6b00" /> Время работы</h3>
             <p>Пн-Пт: 9:00 — 18:00</p>
             <p>Сб-Вс: Выходной</p>
           </div>
         </div>

        <div class="contacts-form">
          <h2>Напишите нам</h2>
          <form @submit.prevent="sendMessage">
            <div class="form-group">
              <label>Имя</label>
              <input type="text" v-model="form.name" required>
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" v-model="form.email" required>
            </div>
            <div class="form-group">
              <label>Сообщение</label>
              <textarea v-model="form.message" rows="5" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary">Отправить</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useMessage } from 'naive-ui'

const message = useMessage()
const form = reactive({ name: '', email: '', message: '' })

function sendMessage() {
  message.success('Сообщение отправлено! Мы свяжемся с вами.')
  form.name = ''
  form.email = ''
  form.message = ''
}
</script>

<style scoped>
.info-page {
  padding: 40px 0;
}

.info-page h1 {
  font-size: 36px;
  margin-bottom: 40px;
}

.contacts-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
}

.contacts-info {
  display: grid;
  gap: 32px;
}

.contact-block {
  background: var(--white);
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.contact-block h3 {
  font-size: 18px;
  margin-bottom: 12px;
}

.contact-block p {
  color: var(--gray);
  line-height: 1.6;
}

.contacts-form h2 {
  font-size: 24px;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--gray-light);
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.form-group textarea {
  resize: vertical;
  font-family: inherit;
}

.btn {
  display: inline-block;
  padding: 14px 28px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  font-size: 16px;
}

.btn-primary {
  background: var(--primary);
  color: var(--white);
}

.btn-primary:hover {
  background: var(--primary-hover);
}

/* ===== Tablet (768px - 1024px) ===== */
@media (min-width: 768px) and (max-width: 1024px) {
  .info-page {
    padding: 24px 0;
  }

  .info-page h1 {
    font-size: 28px;
    margin-bottom: 28px;
  }

  .contacts-layout {
    grid-template-columns: 1fr 1fr;
    gap: 30px;
  }

  .contact-block {
    padding: 18px;
  }

  .contact-block h3 {
    font-size: 16px;
  }

  .contacts-form h2 {
    font-size: 20px;
  }
}
</style>