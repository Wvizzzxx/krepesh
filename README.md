# Крепёж — Интернет-магазин крепежных изделий

## Структура проекта

```
krepesh/
├── apps/
│   ├── api/              # Fastify API сервер (порт 3001)
│   │   ├── src/
│   │   │   ├── config/       # Конфигурация приложения
│   │   │   ├── controllers/  # Контроллеры (routes + logic)
│   │   │   ├── db/           # Подключение к БД
│   │   │   ├── middleware/   # Auth middleware
│   │   │   ├── models/       # Mongoose модели
│   │   │   ├── plugins/      # Fastify плагины (auth, error handler, upload)
│   │   │   ├── utils/        # Утилиты (slugify)
│   │   │   ├── validators/   # Zod валидация схем
│   │   │   ├── uploads/      # Загруженные файлы (статический контент)
│   │   │   ├── index.ts      # Точка входа
│   │   │   └── seed.ts       # Скрипт заполнения БД
│   │   ├── .env.example
│   │   └── .eslintrc.json
│   ├── web/              # Клиентский фронтенд Vue 3 (порт 3000)
│   │   ├── src/
│   │   │   ├── api/          # API клиент и функции
│   │   │   ├── components/   # Переиспользуемые компоненты (Pagination)
│   │   │   ├── router/       # Vue Router
│   │   │   ├── stores/       # Pinia stores (auth, cart, products)
│   │   │   └── views/        # Страницы (Catalog, Checkout, Orders...)
│   │   └── .eslintrc.json
│   └── admin/            # Админ-панель Vue 3 (порт 3002)
│       ├── src/
│       │   ├── api/          # API клиент с interceptors
│       │   ├── components/   # AdminLayout
│       │   ├── stores/       # Auth store
│       │   ├── router/       # Роутер с защитой маршрутов
│       │   └── views/        # Dashboard, Products, Categories, Orders, Users
│       └── ...
├── packages/
│   └── types/            # Общие TypeScript типы
├── .prettierrc
├── .prettierignore
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Запуск проекта

### Требования
- Node.js 18+
- MongoDB (локально на порту 27017)
- pnpm

### Установка

```bash
# Установить зависимости
pnpm install

# Собрать пакет types
pnpm --filter @krepesh/types build

# Заполнить БД тестовыми данными
pnpm seed
```

> **Примечание:** Ошибки TypeScript в IDE исчезнут после установки зависимостей (`pnpm install`).

### Запуск

```bash
# Запустить всё сразу (в отдельных окнах)
start-all.bat  # Windows
# или
pnpm dev       # Все сервисы в текущей консоли

# Или по отдельности:
# API сервер (порт 3001)
pnpm dev:api

# Клиентский фронтенд (порт 3000)
pnpm dev:web

# Админ-панель (порт 3002)
pnpm dev:admin
```

> ⚠️ **Важно:** Порты теперь зафиксированы и не будут меняться!
> - API: **3001**
> - Web: **3000**  
> - Admin: **3002**
> 
> Если порт занят, приложение не запустится. Освободите порт или убейте процесс.
> Подробная инструкция в [PORTS.md](./PORTS.md)

## Доступ

| Приложение | URL | Описание |
|------------|-----|----------|
| **Клиент** | http://localhost:3000 | Интернет-магазин |
| **Админ-панель** | http://localhost:3002 | Управление товарами, заказами, пользователями |
| **API** | http://localhost:3001 | REST API |

## Тестовые аккаунты

### 🔑 Администратор (для обоих приложений):
- **Логин:** `admin@krepesh.ru`
- **Пароль:** `admin123`

### Обычный пользователь (только клиент):
- **Логин:** `user@test.ru`
- **Пароль:** `user123`

---

## API эндпоинты

### Аутентификация
- `POST /api/auth/register` — регистрация
- `POST /api/auth/login` — вход
- `GET /api/auth/profile` — профиль

### Продукты
- `GET /api/products` — список (с фильтрацией, сортировкой, пагинацией)
- `GET /api/products/:id` — детали
- `POST /api/products` — создание (админ)
- `PUT /api/products/:id` — обновление (админ)
- `DELETE /api/products/:id` — удаление (админ)
- `POST /api/products/:id/images` — загрузка изображений (админ, multipart)
- `DELETE /api/products/:id/images` — удаление изображения (админ)

### Категории
- `GET /api/categories` — список
- `GET /api/categories/:id` — детали
- `POST /api/categories` — создание (админ)
- `PUT /api/categories/:id` — обновление (админ)
- `DELETE /api/categories/:id` — удаление (админ)
- `POST /api/categories/:id/image` — загрузка изображения (админ, multipart)

### Заказы
- `GET /api/orders` — заказы пользователя
- `GET /api/orders/:id` — детали заказа
- `POST /api/orders` — создание заказа
- `GET /api/admin/orders` — все заказы (админ)
- `PUT /api/admin/orders/:id/status` — изменение статуса (админ)

### Пользователи
- `GET /api/admin/users` — список (админ)
- `PUT /api/admin/users/:id/role` — изменение роли (админ)

---

## 🛠️ Реализованные улучшения

| Категория | Улучшение |
|-----------|-----------|
| **Архитектура** | API разделён на модули: controllers, models, middleware, validators, plugins |
| **Типизация** | Включён `strict: true` в TypeScript, все типы проверены |
| **Валидация** | Все API запросы валидируются через Zod схемы |
| **Обработка ошибок** | Глобальный error handler (Mongoose validation, CastError, duplicate key) |
| **Безопасность** | Пароли хешируются через bcrypt (pre-save hook), JWT авторизация |
| **Производительность** | Индексы MongoDB на часто используемых полях |
| **Код-стиль** | ESLint + Prettier конфигурация |
| **API клиент** | Централизованный axios клиент с interceptors |
| **State management** | Products, Auth, Cart stores |
| **Пагинация** | Переиспользуемый Pagination компонент |
| **Загрузка файлов** | Multer — загрузка изображений товаров и категорий через `<input type="file">` |
| **Отдельная админка** | Полноценная админ-панель на порту 3002 с CRUD для товаров, категорий, заказов, пользователей |
| **Оформление заказа** | Исправлен Checkout: авторизация, обработка ошибок, состояние загрузки |
| **Статические файлы** | Загруженные изображения раздаются через `/uploads/` |
| **Конфигурация** | `.env.example` с документацией всех переменных |
| **Graceful shutdown** | Корректное завершение работы по SIGINT/SIGTERM |

---

## Переменные окружения (API)

Скопируйте `.env.example` в `.env` и настройте:

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `PORT` | Порт API сервера | `3001` |
| `HOST` | Хост API сервера | `0.0.0.0` |
| `NODE_ENV` | Окружение | `development` |
| `MONGODB_URI` | Строка подключения к MongoDB | `mongodb://localhost:27017/krepesh` |
| `JWT_SECRET` | **Секретный ключ JWT** — измените в production! | `change-this-to-a-strong-secret-key` |
| `CORS_ORIGIN` | Разрешённые источники CORS | `true` (все) |

> ⚠️ **Важно:** Обязательно измените `JWT_SECRET` в production! Сгенерируйте с помощью:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```
