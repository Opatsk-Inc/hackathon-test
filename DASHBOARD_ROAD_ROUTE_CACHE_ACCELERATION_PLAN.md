# План: прискорити перехід з прямої лінії на дорожній маршрут через кеш

## Проблема

Зараз після появи базової прямої лінії дорожній маршрут підтягується помітно довго.

Навіть якщо трек майже не змінився, відчуття ніби кожен раз робиться "холодний" запит.

## Що є зараз

Файл:

- [client/src/features/dashboard/hooks/useDashboardRoadRoutes.ts](client/src/features/dashboard/hooks/useDashboardRoadRoutes.ts)

Поточні параметри:

1. `staleTime: 15_000`
2. `gcTime: 5 * 60 * 1000`
3. `queryKey: ["tripRoadRoute", tripId, sig]`
4. fallback на `baseTrack`, поки road route вантажиться

Це нормально, але для UX потрібно агресивніше кешування і менше churn ключів.

## Root Causes повільного UX

1. Ключ кешу часто змінюється через `trackSignature`, навіть при незначних змінах.
2. Немає reuse попереднього результату для "схожого" треку.
3. Немає prefetch для trip, який скоро стане активним на карті.
4. Короткий `staleTime` змушує частіше оновлювати роут, ніж потрібно для візуального UX.

## Ціль

1. Показувати road route майже миттєво, якщо маршрут вже нещодавно обчислювався.
2. Мінімізувати нові запити для мікрозмін треку.
3. Не ламати актуальність маршруту.

## Стратегія кешу

### 1) Зробити сигнатуру треку стабільнішою

Файл:

- [client/src/features/dashboard/utils/routing.ts](client/src/features/dashboard/utils/routing.ts)

Зміни:

1. Грубіша квантизація в `pointKey` (наприклад `toFixed(3)` замість `toFixed(4)`).
2. Додати до сигнатури `track.length bucket` (щоб уникнути зайвих key-інвалідацій).
3. Після downsample + sanitize будувати сигнатуру лише від нормалізованого треку.

Ефект:

1. Менше "нових" cache keys для візуально того ж маршруту.

### 2) Підняти `staleTime` для road routes

Файл:

- [client/src/features/dashboard/hooks/useDashboardRoadRoutes.ts](client/src/features/dashboard/hooks/useDashboardRoadRoutes.ts)

Зміни:

1. `staleTime` збільшити до `60_000` або `90_000`.
2. `gcTime` збільшити до `15 * 60 * 1000`.

Ефект:

1. Роут частіше береться з кешу без повторного очікування.

### 3) Keep previous route during refetch

Файл:

- [client/src/features/dashboard/hooks/useDashboardRoadRoutes.ts](client/src/features/dashboard/hooks/useDashboardRoadRoutes.ts)

Зміни:

1. На новому ключі намагатися віддати останній успішний роут для tripId, поки новий fetch in-flight.
2. Якщо новий fetch не завершився — показувати cached road geometry, а не fallback straight line.

Ефект:

1. Зникає "миготіння" між road і straight.
2. Субʼєктивно маршрут майже миттєвий.

### 4) Локальний LRU кеш для маршрутизатора (додатково до React Query)

Файл:

- [client/src/features/dashboard/hooks/useDashboardRoadRoutes.ts](client/src/features/dashboard/hooks/useDashboardRoadRoutes.ts)

Зміни:

1. Додати in-memory `Map<string, LngLat[]>` з max size (наприклад 200).
2. Ключ: `routingUrl` або normalized signature.
3. Перед fetch перевіряти LRU, при hit — віддавати дані миттєво.

Ефект:

1. Дуже швидкий warm-path навіть при churn queryKey.

### 5) Prefetch активних trip

Файл:

- [client/src/features/dashboard/hooks/useDashboardRoadRoutes.ts](client/src/features/dashboard/hooks/useDashboardRoadRoutes.ts)

Зміни:

1. Prefetch для trip, які зʼявились в `baseTracks` і мають >=2 точки.
2. Запуск prefetch у низькому пріоритеті (idle frame).

Ефект:

1. Коли компонент рендерить маршрут, cache вже теплий.

### 6) Налаштування retry/timeout для UX

Файл:

- [client/src/features/dashboard/hooks/useDashboardRoadRoutes.ts](client/src/features/dashboard/hooks/useDashboardRoadRoutes.ts)

Зміни:

1. `retry: 1` залишити, але з коротким `retryDelay`.
2. Таймаут можна зменшити до 5-6с для уникнення довгого "очікування".
3. При timeout тримати останній cached road route.

Ефект:

1. Краще відчуття швидкості навіть при нестабільному routing API.

## Мінімальний набір для швидкого виграшу (v1)

1. `staleTime` -> `60_000`
2. `gcTime` -> `15m`
3. Стабільніша `trackSignature` (toFixed(3))
4. Відображати last successful road geometry під час refetch

## Acceptance Criteria

1. Після першого завантаження road route для trip повторне відображення відбувається майже миттєво.
2. Немає помітного повернення до straight line під час коротких refetch.
3. Кількість запитів до routing API зменшилась при дрібних змінах треку.
4. Немає регресій у побудові маршруту.

## QA Checklist

1. Відкрити дашборд, дочекатися road routes, перезайти на сторінку.
2. Перевірити, що road route зʼявляється швидше, ніж до змін.
3. Злегка змінити трек (1-2 точки) і перевірити reuse кешу.
4. Імітувати повільний інтернет і перевірити, що тримається last successful road route.
5. Перевірити, що straight fallback показується тільки коли реально нема кешу.
