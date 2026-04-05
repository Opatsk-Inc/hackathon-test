# LevTrans

Платформа для управління транспортною логістикою з алгоритмом пріоритизації ресурсів у реальному часі.

**Проблема:** Транспортно-логістичні компанії зазнають збитків через неефективний розподіл ресурсів та неможливість миттєво перерахувати обсяги поставок при стрімкій зміні попиту.

**Рішення:** Єдина платформа, яка координує склади та точки доставки, автоматично розподіляє ресурси за пріоритетом потреби та дозволяє перехоплювати вантажі в дорозі для екстреного перерозподілу.

## Demo

| | URL |
|---|---|
| Frontend | https://levtrans.notfounds.dev |
| API (Swagger) | https://api.levtrans.notfounds.dev/api |

**Тестові акаунти:**

| Роль | Email | Пароль |
|---|---|---|
| Диспетчер | `dispatcher@test.com` | `password123` |
| Менеджер складу | `manager@test.com` | `password123` |

---

## Tech Stack

### Client
- **React 19** + TypeScript 5.9
- **Vite 7** — збірка та dev-сервер
- **TailwindCSS 4** + **Shadcn UI** (Radix) — UI-компоненти
- **TanStack React Query 5** — серверний стейт
- **TanStack React Table 8** — таблиці
- **MapLibreGL 5** — інтерактивна карта з маршрутами та GPS-трекінгом
- **React Router 7** — маршрутизація

### Server
- **NestJS 11** + TypeScript
- **Prisma 7** ORM + **PostgreSQL 16**
- **Passport.js** + **JWT** — аутентифікація
- **Swagger** — автодокументація API
- **Helmet** — HTTP security headers
- **class-validator** — валідація DTO

### Infrastructure
- **Docker Compose** — PostgreSQL, Redis, Server, Client (Nginx)
- Multi-stage Docker builds (Node 22 Alpine + Nginx 1.27)

---

## Архітектура та ролі

Система побудована навколо трьох ролей:

### 1. Диспетчер (Dispatcher)
Центр управління логістикою. Бачить усі склади, замовлення, водіїв на карті в реальному часі. Затверджує замовлення — система автоматично знаходить склад з найбільшим залишком потрібного ресурсу, резервує товар та створює рейс з magic-посиланням для водія.

### 2. Менеджер складу (Warehouse Manager)
Керує інвентарем свого складу. Може створювати замовлення на ресурси з інших складів, проводити інвентаризацію (коригувати залишки), відстежувати вхідні/вихідні замовлення.

### 3. Водій (Driver — Magic Link)
Не потребує реєстрації. Отримує одноразове посилання на рейс. Бачить що везе, куди, маршрут. Натискає "Почати" — система трекає GPS кожні 10 секунд. Має кнопку SOS для екстрених ситуацій.

### Концепт: Склад = Точка доставки
Кожен склад може як віддавати, так і приймати ресурси. Немає окремої сутності "клієнт" — будь-який склад може замовити ресурси з іншого складу.

---

## Ключові функції

- **Алгоритм пріоритизації** — автоматичний підбір складу-постачальника за наявністю ресурсу (greedy: обирає склад з найбільшим запасом)
- **Резервування товару** — при затвердженні замовлення товар переходить у статус "зарезервовано", щоб уникнути подвійного розподілу
- **Real-time карта** — MapLibreGL з маркерами складів, позиціями водіїв, маршрутами та анімацією
- **Magic Link для водіїв** — безреєстраційний доступ через унікальний токен
- **GPS-трекінг** — автоматична відправка координат кожні 10 сек під час рейсу
- **SOS-система** — водій сигналізує про проблему, маркер блокується на карті, диспетчер вирішує ситуацію (скасування рейсу, повернення ресурсів у пул)
- **Адаптивний інтерфейс** — desktop sidebar + mobile bottom navigation для менеджерів складу

---

## Запуск проєкту

### Вимоги
- Docker & Docker Compose
- Node.js 22+ (для локальної розробки)
- npm

### Швидкий старт (Docker)

```bash
git clone https://github.com/Opatsk-Inc/hackathon-test.git
cd hackathon-test
```

Створіть файл `.env` в корені проєкту:

```env
POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_DB=
PORT=
JWT_SECRET=
EXPIRATION_TIME=
VITE_API_URL=
```

Запуск:

```bash
docker compose up --build
```

Сервіси:
- **Client** — http://localhost:3000
- **Server** — http://localhost:1488
- **Swagger** — http://localhost:1488/api

### Seed (тестові дані)

Після запуску контейнерів, для заповнення бази тестовими даними:

```bash
docker compose exec server npx prisma db seed
```

Це створить: 5 складів (Київ, Львів, Одеса, Дніпро, Харків), 10 ресурсів, інвентар, замовлення та тестових користувачів.

### Локальна розробка

**Server:**
```bash
cd server
npm install
npx prisma generate
npx prisma migrate deploy
npx prisma db seed    # опційно
npm run start:dev
```

**Client:**
```bash
cd client
npm install
npm run dev
```

Vite dev-сервер проксює `/api` та `/auth` на `http://localhost:1488`.

---

## Змінні оточення

| Змінна | Опис |
|---|---|
| `POSTGRES_USER` | Користувач PostgreSQL |
| `POSTGRES_PASSWORD` | Пароль PostgreSQL |
| `POSTGRES_DB` | Назва бази даних |
| `DATABASE_URL` | Connection string (автогенерується в docker-compose) |
| `PORT` | Порт сервера |
| `JWT_SECRET` | Секрет для підпису JWT-токенів |
| `EXPIRATION_TIME` | Час життя JWT в секундах |
| `VITE_API_URL` | URL API для фронтенду (build-time) |

---

## Структура проєкту

```
hackathon-test/
├── client/                          # React SPA
│   ├── src/
│   │   ├── components/ui/           # Shadcn UI компоненти (badge, button, card, map, table...)
│   │   ├── features/                # Feature-модулі
│   │   │   ├── dashboard/           # Карта, трекінг рейсів
│   │   │   ├── dispatcher-layout/   # Layout диспетчера
│   │   │   ├── driver-magic-link/   # Інтерфейс водія
│   │   │   ├── drivers/             # Управління водіями
│   │   │   ├── manager-layout/      # Layout менеджера (desktop + mobile)
│   │   │   ├── orders/              # Замовлення
│   │   │   ├── requests/            # Вхідні запити
│   │   │   ├── trips/               # Рейси
│   │   │   └── warehouses/          # Склади та інвентар
│   │   ├── pages/                   # Сторінки (роутинг)
│   │   │   ├── auth/                # Login, SignUp
│   │   │   ├── dispatcher/          # Dashboard, Orders, Warehouses, Requests, Drivers
│   │   │   ├── driver/              # DriverPage (magic link)
│   │   │   └── manager/             # Resources, Orders, Inventory, Replenish
│   │   ├── shared/api/              # HTTP-клієнт, JWT auth helpers
│   │   └── lib/                     # Утиліти, хуки, типи
│   ├── Dockerfile
│   └── package.json
│
├── server/                          # NestJS API
│   ├── src/
│   │   ├── auth/                    # JWT аутентифікація (signup, login, strategy)
│   │   ├── user/                    # Профіль користувача
│   │   ├── warehouse/               # Модуль менеджера складу
│   │   ├── dispatcher/              # Модуль диспетчера
│   │   ├── driver/                  # Модуль водія (magic token)
│   │   ├── common/                  # Guards, decorators
│   │   └── prisma/                  # Prisma service
│   ├── prisma/
│   │   ├── schema.prisma            # Схема БД
│   │   ├── seed.ts                  # Тестові дані
│   │   └── migrations/              # Міграції
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
└── .env
```

---

## Схема бази даних

### Моделі

**User** — користувач системи
| Поле | Тип | Опис |
|---|---|---|
| id | Int (PK) | Автоінкремент |
| email | String (unique) | Email для логіну |
| passwordHash | String | Bcrypt хеш |
| firstName, lastName | String? | Ім'я (опційно) |
| role | Enum | `WAREHOUSE_MANAGER` \| `DISPATCHER` |
| warehouseId | String? (FK) | Прив'язка до складу |

**Warehouse** — склад / точка доставки
| Поле | Тип | Опис |
|---|---|---|
| id | UUID (PK) | |
| name | String | Назва складу |
| address | String? | Адреса |
| lat, lng | Float | Координати |

**Resource** — тип ресурсу
| Поле | Тип | Опис |
|---|---|---|
| id | UUID (PK) | |
| name | String | Назва (Питна вода, Генератор, тощо) |
| category | String? | Категорія (Food & Water, Medical, Power...) |

**Inventory** — залишки на складі (unique: warehouseId + resourceId)
| Поле | Тип | Опис |
|---|---|---|
| quantityAvailable | Int | Доступна кількість |
| quantityReserved | Int | Зарезервовано для активних замовлень |

**Order** — замовлення на переміщення ресурсу
| Поле | Тип | Опис |
|---|---|---|
| id | UUID (PK) | |
| quantity | Int | Кількість одиниць |
| priority | Enum | `NORMAL` \| `HIGH` \| `CRITICAL` |
| status | Enum | `PENDING` → `APPROVED` → `PACKED` → `IN_TRANSIT` → `DELIVERED` |
| requesterId | FK | Склад-замовник |
| providerId | FK? | Склад-постачальник (заповнюється при approve) |
| resourceId | FK | Ресурс |

**Trip** — рейс доставки (1:1 з Order)
| Поле | Тип | Опис |
|---|---|---|
| id | UUID (PK) | |
| magicToken | UUID (unique) | Токен для доступу водія |
| status | Enum | `PENDING` → `EN_ROUTE` → `DELIVERED` \| `SOS` |
| driverName | String? | Ім'я водія |
| currentLat, currentLng | Float? | Поточні координати |

**TripPoint** — GPS-точка маршруту
| Поле | Тип | Опис |
|---|---|---|
| tripId | FK | Рейс |
| lat, lng | Float | Координати |
| createdAt | DateTime | Час фіксації |

### Зв'язки

```
User N:1 Warehouse
Inventory N:1 Warehouse + N:1 Resource
Order N:1 Requester(Warehouse) + N:1 Provider(Warehouse) + N:1 Resource
Trip 1:1 Order
TripPoint N:1 Trip (cascade delete)
```

---

## API Endpoints

Повна документація доступна у Swagger: `/api`

### Auth (`/auth`)
| Метод | Шлях | Опис |
|---|---|---|
| POST | `/auth/signup` | Реєстрація (email, password, role, warehouseId?) |
| POST | `/auth/login` | Логін → JWT токен |
| GET | `/auth/me` | Поточний користувач |

### Dispatcher (`/api`) — роль: DISPATCHER
| Метод | Шлях | Опис |
|---|---|---|
| GET | `/api/warehouses` | Всі склади з інвентарем |
| GET | `/api/inventory/global` | Глобальний залишок по ресурсах |
| GET | `/api/orders` | Всі замовлення |
| PATCH | `/api/orders/:id/approve` | Затвердити замовлення (auto: підбір складу, резерв, створення рейсу) |
| GET | `/api/trips/active` | Активні рейси (PENDING, EN_ROUTE, SOS) |
| PATCH | `/api/trips/:id/resolve-sos` | Вирішити SOS (скасування, повернення ресурсів) |
| GET | `/api/trips/:id/track` | GPS-трек рейсу |

### Warehouse Manager (`/api`) — роль: WAREHOUSE_MANAGER
| Метод | Шлях | Опис |
|---|---|---|
| GET | `/api/inventory/my` | Інвентар мого складу |
| POST | `/api/inventory/my/adjust` | Коригування залишків (інвентаризація) |
| POST | `/api/orders` | Створити замовлення (quantity, resourceId, priority) |
| GET | `/api/orders/my` | Мої замовлення (вхідні + вихідні) |
| PATCH | `/api/orders/:id/pack` | Позначити як запаковано |

### Driver (`/api/driver`) — без аутентифікації (magic token)
| Метод | Шлях | Опис |
|---|---|---|
| GET | `/:magicToken` | Інформація про рейс |
| PATCH | `/:magicToken/start` | Почати рейс |
| POST | `/:magicToken/gps` | Оновити GPS-координати |
| PATCH | `/:magicToken/sos` | Сигнал SOS |
| PATCH | `/:magicToken/finish` | Завершити доставку |

### User (`/users`)
| Метод | Шлях | Опис |
|---|---|---|
| PUT | `/users/:id` | Оновити профіль (firstName, lastName) |

---

## Життєвий цикл замовлення

```
Менеджер створює замовлення (PENDING)
       ↓
Диспетчер затверджує (APPROVED)
  → Автопідбір складу-постачальника
  → Резервування товару (available → reserved)
  → Створення рейсу + magic link
       ↓
Менеджер складу пакує (PACKED)
       ↓
Водій починає рейс (IN_TRANSIT / EN_ROUTE)
  → GPS-трекінг кожні 10 сек
  → reserved -= qty (списання зі складу)
       ↓
Водій завершує (DELIVERED)
  → available += qty (зарахування на склад-замовник)

--- SOS сценарій ---
Водій натискає SOS → маркер червоний на карті
Диспетчер "Resolve SOS" → рейс скасовано, ресурси повернуто в пул
```

---

## Scripts

### Server
```bash
npm run start:dev     # Розробка (watch mode)
npm run start:prod    # Продакшн
npm run build         # Збірка
npm run lint          # ESLint
```

### Client
```bash
npm run dev           # Vite dev server
npm run build         # TypeScript check + збірка
npm run lint          # ESLint
npm run typecheck     # Перевірка типів
npm run preview       # Прев'ю збірки
```

---

## Маршрути фронтенду

| Шлях | Сторінка | Доступ |
|---|---|---|
| `/` | Логін | Публічний |
| `/signup` | Реєстрація | Публічний |
| `/dispatcher` | Дашборд з картою | DISPATCHER |
| `/dispatcher/orders` | Замовлення | DISPATCHER |
| `/dispatcher/warehouses` | Склади | DISPATCHER |
| `/dispatcher/requests` | Вхідні запити | DISPATCHER |
| `/dispatcher/drivers` | Водії / рейси | DISPATCHER |
| `/manager` | Ресурси складу | WAREHOUSE_MANAGER |
| `/manager/orders` | Замовлення | WAREHOUSE_MANAGER |
| `/manager/replenish` | Поповнення ресурсів | WAREHOUSE_MANAGER |
| `/manager/inventory` | Інвентаризація | WAREHOUSE_MANAGER |
| `/driver/:magicToken` | Інтерфейс водія | Magic Link (без авторизації) |
