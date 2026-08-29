# ED Project Architecture Guide

## Evolutionary Design как самостоятельный паттерн проектирования frontend-проектов

> Этот документ описывает **ED (Evolutionary Design)** как самостоятельный практический паттерн организации проекта. Он не привязан к конкретной предметной области, продукту или репозиторию.
>
> Пример реализации ниже ориентирован на **Next.js + TypeScript**, но сами архитектурные принципы применимы и к другим frontend-стекам.

---

## 1. Что такое ED

**Evolutionary Design** — это подход к проектированию, при котором структура проекта строится вокруг **устойчивых границ ответственности**, а не вокруг технических типов файлов.

Главная задача ED — сделать так, чтобы проект можно было развивать без постоянного архитектурного "расползания":

- маршруты не превращались в место хранения бизнес-логики;
- переиспользуемый код не превращался в свалку;
- функциональные модули не связывались между собой хаотичными импортами;
- инфраструктура не протекала во все слои приложения;
- изменение одной функциональности не заставляло переписывать соседние части проекта.

ED не требует заранее придумать идеальную архитектуру на годы вперёд. Наоборот, структура должна **эволюционировать вместе с системой**, но при этом сохранять чёткие архитектурные границы.

---

# 2. Главная идея: структура строится вокруг ответственности

Вместо мышления:

```text
components/
hooks/
utils/
api/
services/
store/
```

ED предлагает мыслить уровнями ответственности:

```text
app/
features/
services/
shared/
```

Каждый уровень отвечает на отдельный вопрос.

| Уровень    | Главный вопрос                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------- |
| `app`      | Как приложение подключает функциональность к маршрутам и runtime?                                   |
| `features` | Какую пользовательскую/бизнес-функцию система умеет выполнять?                                      |
| `services` | Какие самостоятельные инфраструктурные или бизнес-сервисы используются несколькими частями системы? |
| `shared`   | Что является действительно общим и не принадлежит конкретной функциональности?                      |

Важнейший принцип:

> **Каталог должен отражать архитектурную ответственность, а не тип исходного файла.**

Например, `useSomething.ts` не обязан находиться в `hooks/` только потому, что это hook. Если hook относится к конкретной feature, он должен жить внутри этой feature.

---

# 3. Базовая структура проекта

Для Next.js-приложения базовый ED-шаблон:

```text
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── ...routes/
│
├── features/
│   ├── feature-a/
│   │   ├── index.ts
│   │   ├── _api.ts
│   │   ├── ui/
│   │   ├── model/
│   │   └── lib/
│   │
│   └── feature-b/
│       ├── index.ts
│       ├── _api.ts
│       ├── ui/
│       ├── model/
│       └── lib/
│
├── services/
│   ├── service-a/
│   │   ├── index.ts
│   │   └── ...
│   └── service-b/
│       ├── index.ts
│       └── ...
│
└── shared/
    ├── ui/
    ├── lib/
    ├── api/
    ├── config/
    └── domain/
```

При необходимости уровни могут быть расширены, но **новый каталог не должен появляться только ради удобства раскладки файлов**.

---

# 4. Уровень `app`

## 4.1 Назначение

`app` — это внешний слой приложения.

В Next.js он соответствует App Router и отвечает прежде всего за:

- маршрутизацию;
- layout;
- loading/error/not-found boundaries;
- route-level composition;
- глобальные provider'ы;
- подключение страниц к функциональным модулям.

Эталонный принцип:

> **`app` знает о том, какие функции нужно показать на маршруте, но не должен содержать реализацию самих функций.**

---

## 4.2 Что допустимо в `app`

```text
app/
├── layout.tsx
├── providers.tsx
├── page.tsx
├── dashboard/
│   └── page.tsx
└── settings/
    ├── page.tsx
    └── users/
        └── page.tsx
```

Страница должна быть максимально тонким composition layer:

```tsx
import { DashboardFeature } from '@/features/dashboard';

export default function DashboardPage() {
  return <DashboardFeature />;
}
```

---

## 4.3 Что нельзя складывать в `app`

Не следует превращать `app` в:

```text
app/
├── hooks/
├── utils/
├── api/
├── components/
├── business-logic/
└── stores/
```

Также не следует помещать сюда сложную бизнес-логику:

```tsx
export default function Page() {
  // плохой вариант:
  // запросы + преобразование данных + бизнес-правила + UI
}
```

`app` — это **точка сборки**, а не место реализации домена.

---

# 5. Уровень `features`

## 5.1 Что такое feature

`feature` — самостоятельный кусок функциональности, который имеет законченный пользовательский или бизнес-смысл.

Хороший тест:

> Если функциональность можно назвать отдельным действием, сценарием или возможностью системы, вероятно, это feature.

Примеры абстрактно:

```text
features/
├── authentication/
├── profile-editing/
├── order-creation/
├── search/
├── filtering/
├── notifications/
└── file-upload/
```

Название feature должно отражать **возможность/сценарий**, а не технический тип файлов.

---

## 5.2 Внутренняя структура feature

Минимальная feature может содержать только один файл:

```text
features/search/
└── index.ts
```

Если функциональность становится сложнее:

```text
features/search/
├── index.ts
├── _api.ts
├── ui/
│   ├── search-form.tsx
│   └── search-results.tsx
├── model/
│   ├── use-search.ts
│   └── search-store.ts
└── lib/
    └── normalize-query.ts
```

Главное правило:

> **Внутри feature группируются все детали конкретной функциональности.**

---

# 6. Подкаталог `ui` внутри feature

`ui` содержит UI, который имеет смысл именно в контексте данной feature.

Например:

```text
features/order-creation/ui/
├── order-form.tsx
├── order-items.tsx
└── submit-order-button.tsx
```

Если компонент знает о бизнес-смысле feature, он не является глобальным shared-компонентом.

### Правильная граница

```text
shared/ui/button.tsx
```

может быть использована в любом месте.

```text
features/order-creation/ui/order-form.tsx
```

используется для реализации конкретной функциональности.

---

# 7. Подкаталог `model` внутри feature

`model` содержит состояние и поведение feature:

- hooks;
- feature stores;
- selectors;
- state machines;
- client-side state;
- orchestration конкретного use case.

Например:

```text
features/search/model/
├── use-search.ts
├── search-store.ts
└── selectors.ts
```

Ключевой критерий:

> Если код описывает состояние или поведение **конкретной feature**, он принадлежит её `model`, а не глобальному `shared/hooks` или `shared/store`.

---

# 8. Подкаталог `lib` внутри feature

`lib` применяется для локальных вспомогательных функций, которые относятся к конкретной feature.

```text
features/search/lib/
├── normalize-query.ts
├── build-search-params.ts
└── sort-results.ts
```

Если функция нужна только `search` — она должна находиться внутри `search`.

Только после появления реальной общей потребности её следует переносить в `shared/lib`.

---

# 9. `_api.ts` и приватные файлы

В эталонной структуре ED допускается размещение внутренней API-логики в feature, например:

```text
features/auth/_api.ts
```

Префикс `_` может использоваться как сигнал:

> Это внутренний implementation detail модуля, не являющийся частью его публичного API.

Например:

```text
features/profile/
├── index.ts
├── _api.ts
├── model/
└── ui/
```

Публичные потребители импортируют feature через:

```ts
import { ProfileFeature } from '@/features/profile';
```

а не через:

```ts
import { internalFunction } from '@/features/profile/_api';
```

---

# 10. `index.ts` как публичная граница

`index.ts` рекомендуется использовать как публичный API модуля.

Пример:

```text
features/auth/
├── index.ts
├── _api.ts
├── ui/
└── model/
```

`index.ts`:

```ts
export { LoginForm } from './ui/login-form';
export { useSession } from './model/use-session';
```

Внешнему коду не нужно знать внутреннюю структуру feature.

### Хорошо

```ts
import { LoginForm } from '@/features/auth';
```

### Плохо

```ts
import { LoginForm } from '@/features/auth/ui/login-form';
```

Второй вариант связывает внешний код с внутренней структурой модуля и затрудняет рефакторинг.

---

# 11. Изоляция features

Feature должна быть максимально самостоятельной.

Базовое правило зависимостей:

```text
feature A  ──X──> feature B
```

Прямые зависимости между features по умолчанию не допускаются.

Вместо этого используются:

```text
feature A ──> shared
feature B ──> shared

feature A ──> service
feature B ──> service
```

или композиция на уровне `app`:

```text
app
 ├── feature A
 └── feature B
```

### Почему это важно

Если десятки features начинают импортировать друг друга, появляется скрытый dependency graph:

```text
A -> B -> C -> A
```

В результате:

- сложно понять владельца логики;
- появляются циклические зависимости;
- тестирование становится сложнее;
- изменение одной feature начинает ломать другие.

ED стремится удерживать features как **самостоятельные эволюционные блоки**.

---

# 12. Когда feature может зависеть от другой feature

Прямую связь можно рассматривать только как исключение, когда зависимость действительно отражает устойчивую архитектурную связь, а не случайное переиспользование компонента.

Перед таким импортом необходимо проверить:

1. Не является ли общий код на самом деле `shared`?
2. Не является ли общая бизнес-операция `service`?
3. Можно ли выполнить композицию на уровне `app`?
4. Не ошибочно ли определена граница feature?

В большинстве случаев правильным решением будет **перестроить границу**, а не разрешать цепочку взаимных зависимостей.

---

# 13. Уровень `services`

## 13.1 Назначение

`services` — это самостоятельные сервисы, которые:

- имеют собственную ответственность;
- могут использоваться несколькими features;
- не принадлежат одной конкретной feature;
- не являются простыми utility-функциями.

Примеры:

```text
services/
├── session/
├── notification/
├── analytics/
└── storage/
```

---

## 13.2 Чем service отличается от feature

### Feature

Отвечает на вопрос:

> Какую функциональность получает пользователь/система?

### Service

Отвечает на вопрос:

> Какой самостоятельный механизм предоставляет возможность другим частям системы?

Например:

```text
features/
└── registration/
```

может использовать:

```text
services/
└── notification/
```

При этом notification не знает, какая feature его вызвала.

---

## 13.3 Service не должен зависеть от feature

Правило:

```text
feature ──> service
service ──X──> feature
```

Иначе service перестаёт быть независимым.

---

# 14. Уровень `shared`

`shared` — это фундамент проекта.

Он содержит только то, что действительно является общим и не принадлежит одной feature.

Типичный состав:

```text
shared/
├── ui/
├── lib/
├── api/
├── config/
└── domain/
```

---

# 15. `shared/ui`

Здесь находятся универсальные UI-примитивы:

```text
shared/ui/
├── button.tsx
├── input.tsx
├── dialog.tsx
├── card.tsx
└── table.tsx
```

Компонент подходит для `shared/ui`, если его можно использовать в нескольких независимых features **без внесения в него бизнес-логики конкретной feature**.

### Хорошо

```tsx
<Button>Save</Button>
```

### Плохо

```tsx
<OrderCheckoutButton />
```

Если компонент знает про `Order`, `Checkout`, `Profile`, `Calendar` и т.п., скорее всего он принадлежит feature.

---

# 16. `shared/lib`

Сюда попадают действительно универсальные функции:

```text
shared/lib/
├── date.ts
├── logger.ts
├── format.ts
├── utils.ts
└── validation.ts
```

Но `shared/lib` не должен превращаться в мусорную корзину.

Запрещённый подход:

```text
shared/lib/
├── do-everything.ts
├── business.ts
├── order-utils.ts
├── user-utils.ts
└── random.ts
```

Если утилита знает предметную область, она обычно должна быть ближе к этой области.

---

# 17. `shared/api`

`shared/api` подходит для действительно общей инфраструктуры доступа к API:

```text
shared/api/
├── http-client.ts
├── request.ts
├── errors.ts
└── generated-types.ts
```

Но конкретный запрос, относящийся к одной feature, не следует автоматически помещать в `shared/api`.

Например:

```text
features/search/_api.ts
```

часто лучше, чем:

```text
shared/api/search.ts
```

если этот API используется только feature `search`.

---

# 18. `shared/config`

Сюда относятся конфигурационные значения и технические настройки, общие для приложения:

```text
shared/config/
├── env.ts
├── routes.ts
├── constants.ts
└── feature-flags.ts
```

Важно различать:

```text
shared/config/routes.ts
```

и:

```text
features/order/lib/build-order-route.ts
```

Первый вариант — глобальная конфигурация.

Второй — feature-specific поведение.

---

# 19. `shared/domain`

`shared/domain` подходит для доменных понятий, которые реально используются независимо несколькими модулями.

Например:

```text
shared/domain/
├── user.ts
├── session.ts
├── money.ts
└── pagination.ts
```

Но сюда нельзя складывать все типы проекта просто потому, что это `type` или `interface`.

Правило:

> **Тип принадлежит тому уровню, чью ответственность он описывает.**

---

# 20. Где должны находиться типы

Вместо общего:

```text
shared/types/
```

лучше определить владельца типа.

### Feature-specific type

```text
features/search/model/types.ts
```

### Service-specific type

```text
services/session/_types.ts
```

### Global domain type

```text
shared/domain/user.ts
```

### API contract

```text
shared/api/generated-types.ts
```

или рядом с конкретной feature, если контракт локальный.

Главное правило — **не создавать глобальную папку `types` как автоматическое место для всего подряд**.

---

# 21. Матрица зависимостей

Рекомендуемая направленность:

```text
                 ┌──────────────┐
                 │     app      │
                 └──────┬───────┘
                        ↓
                 ┌──────────────┐
                 │   features   │
                 └──────┬───────┘
                        ↓
                 ┌──────────────┐
                 │   services   │
                 └──────┬───────┘
                        ↓
                 ┌──────────────┐
                 │    shared    │
                 └──────────────┘
```

Упрощённое правило:

| Откуда     | Куда можно                                     |
| ---------- | ---------------------------------------------- |
| `app`      | `features`, `services`, `shared`               |
| `features` | `services`, `shared`                           |
| `services` | `shared`                                       |
| `shared`   | только `shared`-уровень или внешние библиотеки |

Не рекомендуется:

```text
shared -> feature
shared -> service
service -> feature
feature A -> feature B
```

И особенно опасны циклы:

```text
A -> B -> C -> A
```

---

# 22. Очень важное правило `shared`

`shared` должен оставаться максимально "тупым".

Он **не должен знать** о существовании:

```text
features/*
services/*
```

Например, это архитектурная ошибка:

```ts
// shared/lib/something.ts
import { useOrder } from '@/features/order';
```

`shared` должен быть фундаментом, а фундамент не может зависеть от домов, построенных на нём.

---

# 23. Как принимать решение, куда положить новый файл

Используй следующий алгоритм.

### Шаг 1. Это route или Next.js infrastructure?

Да → `app`.

---

### Шаг 2. Это часть конкретной функциональности?

Да → `features/<feature>`.

Не имеет значения, что это:

- component;
- hook;
- store;
- API client;
- utility;
- type.

Главное — **кому принадлежит ответственность**.

---

### Шаг 3. Код обслуживает несколько features и является самостоятельным механизмом?

Да → `services/<service>`.

---

### Шаг 4. Код универсальный, технический и не знает о конкретной feature?

Да → `shared`.

---

### Шаг 5. Остались сомнения?

Не создавай новую папку автоматически.

Сначала ответь:

> Кто является владельцем этой логики?

Если владельца невозможно назвать, вероятно, граница ещё не определена правильно.

---

# 24. Decision Tree

```text
                 Новый код
                    │
                    ▼
          Это Next.js route/runtime?
              /             \
            да               нет
            │                 │
            ▼                 ▼
          app         Это часть одной feature?
                         /          \
                       да            нет
                       │              │
                       ▼              ▼
                   features     Нужен нескольким
                                  features как
                               самостоятельный service?
                                   /       \
                                 да         нет
                                 │           │
                                 ▼           ▼
                             services      shared
```

---

# 25. Не проектируй сначала по техническим папкам

Плохой старт:

```text
src/
├── components/
├── hooks/
├── services/
├── stores/
├── api/
├── utils/
└── types/
```

Проблема: через несколько месяцев логика одной функциональности оказывается размазана по всему проекту.

Например:

```text
components/user-form.tsx
hooks/use-user.ts
api/user.ts
stores/user-store.ts
utils/user.ts
```

Чтобы понять одну функцию системы, нужно ходить по пяти каталогам.

---

# 26. Как выглядит ED-подход

Вместо этого:

```text
features/
└── user-editing/
    ├── index.ts
    ├── _api.ts
    ├── ui/
    │   └── user-form.tsx
    ├── model/
    │   └── use-user-form.ts
    └── lib/
        └── normalize-form.ts
```

Функциональность собрана в одном месте.

При необходимости её можно заменить, протестировать или удалить как единый блок.

---

# 27. Composition Root

Особенно важно отделять **composition** от **implementation**.

Например:

```text
app/dashboard/page.tsx
```

может собрать:

```tsx
import { SearchFeature } from '@/features/search';
import { ProfileFeature } from '@/features/profile';

export default function Page() {
  return (
    <>
      <SearchFeature />
      <ProfileFeature />
    </>
  );
}
```

При этом каждая feature остаётся самостоятельной.

`app` отвечает за композицию.

`features` отвечают за функциональность.

`services` отвечают за самостоятельные механизмы.

`shared` предоставляет фундамент.

---

# 28. Feature как мини-продукт внутри приложения

Хорошая feature обычно имеет собственные:

```text
UI
state
API
logic
types
tests
```

Пример:

```text
features/payment/
├── index.ts
├── _api.ts
├── ui/
│   ├── payment-form.tsx
│   └── payment-status.tsx
├── model/
│   ├── use-payment.ts
│   └── payment-store.ts
├── lib/
│   └── validate-payment.ts
└── __tests__/
    ├── payment.test.ts
    └── payment-form.test.tsx
```

Необязательно создавать все каталоги сразу.

ED поощряет **эволюционное усложнение** структуры.

Начало:

```text
features/payment/
└── index.ts
```

Появился UI:

```text
features/payment/
├── index.ts
└── ui/
```

Появилось состояние:

```text
features/payment/
├── index.ts
├── ui/
└── model/
```

Появилась локальная логика:

```text
features/payment/
├── index.ts
├── ui/
├── model/
└── lib/
```

---

# 29. Не создавай пустые архитектурные каталоги

Плохой подход:

```text
features/payment/
├── ui/
├── model/
├── lib/
├── api/
├── types/
├── constants/
└── utils/
```

если внутри почти ничего нет.

Лучше:

```text
features/payment/
└── ui/
```

И добавлять структуру тогда, когда появляется соответствующая ответственность.

Это и есть evolutionary-подход.

---

# 30. Один каталог — одна идея

Название каталога должно быть понятным без чтения файлов.

Плохо:

```text
features/common/
features/misc/
features/helpers/
features/core/
```

Хорошо:

```text
features/search/
features/profile-editing/
features/file-upload/
```

Аналогично для services:

```text
services/session/
services/notification/
services/storage/
```

---

# 31. Как отличать business logic от utility

Очень полезный критерий.

### Utility

Не знает о конкретной предметной области.

```ts
formatDate(date);
clamp(value, min, max);
debounce(fn);
```

Вероятно:

```text
shared/lib
```

### Business logic

Знает о конкретном понятии или правиле системы.

```ts
calculateOrderTotal(order);
validatePaymentState(payment);
applyPreset(data);
```

Вероятно:

```text
features/<feature>/lib
```

или:

```text
services/<service>
```

в зависимости от того, является ли логика локальной или самостоятельной и переиспользуемой.

---

# 32. Как отличать service от shared utility

Задай два вопроса.

### Вопрос 1

Есть ли у компонента собственное понятие состояния/жизненного цикла/интерфейса?

Если да, это может быть `service`.

### Вопрос 2

Это просто чистая функция без самостоятельной ответственности?

Если да, это скорее `shared/lib` или локальный `feature/lib`.

Например:

```text
shared/lib/date.ts
```

не service.

А:

```text
services/notification/
```

может быть полноценным service с provider, hooks и внутренним менеджером.

---

# 33. Тесты должны следовать архитектуре

Тесты также желательно располагать рядом с владельцем логики.

Например:

```text
features/search/
├── ui/
├── model/
├── lib/
└── __tests__/
```

или рядом с исходным файлом, если команда использует такой стиль.

Главное правило:

> Тест должен находиться рядом с архитектурной ответственностью, которую он проверяет.

Например тест feature не должен автоматически попадать в глобальное:

```text
src/tests/
```

если из-за этого теряется связь между тестом и владельцем логики.

---

# 34. API и server/client boundaries в Next.js

ED не отменяет правила Next.js.

Важно отдельно контролировать:

- Server Components;
- Client Components;
- server-only code;
- browser-only code;
- route handlers;
- environment variables.

Например, если feature содержит browser state:

```text
features/editor/model/use-editor.ts
```

она может быть client-side.

Но server-only integration не должна случайно импортироваться в Client Component.

Архитектурная папка не отменяет runtime boundary.

---

# 35. Route Handlers

Next.js `route.ts` относятся к `app`, потому что являются частью маршрутизации.

Но бизнес-логику не следует складывать прямо внутрь handler.

Плохо:

```text
app/api/orders/route.ts
```

с большим количеством:

```text
validation
business rules
mapping
database logic
notifications
```

Лучше:

```text
app/api/orders/route.ts
        ↓
feature/service
        ↓
shared infrastructure
```

`route.ts` должен быть тонким адаптером runtime.

---

# 36. Где хранить state

State принадлежит месту, где находится его ответственность.

### UI state одной feature

```text
features/editor/model/editor-store.ts
```

### Shared application state

Только если state действительно используется разными независимыми частями системы и представляет общую application concern.

Например:

```text
shared/lib/
```

не является автоматически подходящим местом для store.

Не следует создавать:

```text
shared/stores/
```

только потому, что "store должен быть где-то общий".

Сначала нужно определить владельца state.

---

# 37. Где хранить API hooks

Плохой глобальный подход:

```text
shared/hooks/
├── useUsers.ts
├── useOrders.ts
├── usePayments.ts
└── useSearch.ts
```

Если hooks относятся к конкретным возможностям, правильнее:

```text
features/users/model/use-users.ts
features/orders/model/use-orders.ts
features/payments/model/use-payments.ts
features/search/model/use-search.ts
```

В `shared` остаются только hooks, которые действительно не принадлежат feature.

---

# 38. Где хранить API clients

Разделяй два понятия.

### Общий transport

```text
shared/api/http-client.ts
```

### API конкретной feature

```text
features/orders/_api.ts
```

или:

```text
features/orders/model/api.ts
```

в зависимости от соглашений команды.

Не стоит автоматически делать глобальный каталог:

```text
shared/api/orders.ts
shared/api/users.ts
shared/api/payments.ts
```

только потому, что все они являются HTTP-запросами.

---

# 39. Где хранить интеграции

Если интеграция является самостоятельным переиспользуемым механизмом:

```text
services/
└── analytics/
```

Если интеграция нужна исключительно одной feature:

```text
features/checkout/
└── _api.ts
```

Если это общий технический transport:

```text
shared/api/
```

Всегда сначала определяется **владелец**, потом технический тип.

---

# 40. Что считать архитектурным smell

Следующие признаки говорят, что ED-границы начинают разрушаться.

## 40.1 Огромный `shared`

```text
shared/
├── hooks/
├── services/
├── stores/
├── api/
├── types/
├── utils/
└── everything/
```

Если туда постоянно складывается новый код, значит feature boundaries определены плохо.

---

## 40.2 Огромный `app`

Если страницы содержат десятки строк бизнес-логики, `app` используется неправильно.

---

## 40.3 Feature imports feature

```text
feature-a -> feature-b -> feature-c
```

Частое появление таких связей — сигнал пересмотреть декомпозицию.

---

## 40.4 Service imports feature

Это почти всегда нарушение архитектурной направленности.

---

## 40.5 Shared imports feature

Это фундаментальная ошибка слоя зависимостей.

---

## 40.6 Глобальные `utils`, `types`, `hooks`

Если каталоги становятся огромными, скорее всего код нужно вернуть ближе к владельцу.

---

## 40.7 Пустые каталоги

Если каталог создан "на будущее", это не эволюционная архитектура.

---

# 41. Антипаттерн: все делать shared

Это одна из самых частых ошибок.

Разработчик думает:

> "Это может ещё где-нибудь пригодиться, положу в shared."

Результат:

```text
shared/
├── user.ts
├── order.ts
├── payment.ts
├── dashboard.ts
├── form.ts
└── business.ts
```

ED действует наоборот:

> **Сначала локальность. Потом доказанная переиспользуемость.**

Сначала код принадлежит feature.

Только когда появляется реальная независимая потребность, код поднимается в `shared` или `services`.

---

# 42. Антипаттерн: технические категории поверх бизнес-контекста

Не рекомендуется:

```text
components/
hooks/
utils/
api/
stores/
```

как верхнеуровневая архитектура.

Эти категории допустимы **внутри архитектурных блоков**, например:

```text
features/catalog/
├── ui/
├── model/
└── lib/
```

То есть техническая классификация подчинена архитектурной границе.

---

# 43. Антипаттерн: service как папка для любого кода

Слово `service` часто используется слишком широко.

Не следует складывать туда:

```text
services/
├── format-date.ts
├── calculate-total.ts
├── modal-service.ts
├── user-hook.ts
└── random-helper.ts
```

Service должен иметь **самостоятельную ответственность и смысл**.

---

# 44. Антипаттерн: feature как page

Feature не обязана совпадать с маршрутом.

Например:

```text
app/orders/[id]/page.tsx
```

не означает, что нужно создать:

```text
features/orders/[id]/page.tsx
```

Route и feature — разные архитектурные понятия.

Один route может собирать несколько features.

Одна feature может использоваться на нескольких routes.

---

# 45. Route ≠ Feature

Это одно из главных правил ED + Next.js.

```text
URL
 ↓
app route
 ↓
composition
 ↓
feature
```

Например:

```text
app/settings/page.tsx
```

может использовать:

```text
features/profile/
features/preferences/
features/notifications/
```

Маршрут — техническая точка входа.

Feature — архитектурная единица функциональности.

---

# 46. Минимальный шаблон проекта

Для небольшого проекта достаточно:

```text
src/
├── app/
│   ├── layout.tsx
│   └── page.tsx
│
├── features/
│   └── example/
│       ├── index.ts
│       └── ui/
│           └── example.tsx
│
├── services/
│   └── session/
│       └── index.ts
│
└── shared/
    ├── ui/
    │   └── button.tsx
    ├── lib/
    │   └── date.ts
    ├── api/
    │   └── http-client.ts
    └── config/
        └── env.ts
```

Не нужно создавать десятки каталогов заранее.

---

# 47. Масштабируемый шаблон

По мере роста:

```text
src/
├── app/
│   ├── layout.tsx
│   ├── providers.tsx
│   ├── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx
│
├── features/
│   ├── auth/
│   │   ├── index.ts
│   │   ├── _api.ts
│   │   ├── ui/
│   │   └── model/
│   ├── search/
│   │   ├── index.ts
│   │   ├── _api.ts
│   │   ├── ui/
│   │   ├── model/
│   │   └── lib/
│   └── profile/
│       ├── index.ts
│       ├── ui/
│       └── model/
│
├── services/
│   ├── session/
│   │   ├── index.ts
│   │   ├── _session-manager.ts
│   │   └── _types.ts
│   └── notification/
│       ├── index.ts
│       ├── notification-provider.tsx
│       └── use-notification.ts
│
└── shared/
    ├── ui/
    │   ├── button.tsx
    │   ├── input.tsx
    │   └── dialog.tsx
    ├── lib/
    │   ├── date.ts
    │   └── logger.ts
    ├── api/
    │   ├── http-client.ts
    │   └── generated-types.ts
    ├── config/
    │   ├── env.ts
    │   └── routes.ts
    └── domain/
        ├── user.ts
        └── session.ts
```

---

# 48. Как строить проект с нуля по ED

## Шаг 1. Создать runtime/app layer

Начать с:

```text
app/
```

Определить маршруты и глобальные providers.

Не складывать туда бизнес-логику.

---

## Шаг 2. Определить функциональные границы

Составить список реально существующих capabilities системы.

Например:

```text
authentication
search
profile-editing
reporting
notifications
```

Для каждой крупной capability создать feature.

---

## Шаг 3. Начинать с минимальной feature

Не создавать заранее:

```text
ui/
model/
lib/
api/
utils/
constants/
```

Создать только реально необходимые каталоги.

---

## Шаг 4. Найти независимые services

После появления нескольких features определить, какие механизмы:

- используются несколькими features;
- имеют самостоятельную ответственность;
- не должны принадлежать одной feature.

Только тогда создаётся `services`.

---

## Шаг 5. Формировать shared последним

Сначала локальный код.

Потом доказанная переиспользуемость.

Только после этого:

```text
shared/
```

---

## Шаг 6. Ввести публичные API модулей

Для feature/service использовать:

```text
index.ts
```

для публичных экспортов.

Это снижает связанность с внутренней структурой каталогов.

---

## Шаг 7. Проверить dependency graph

Убедиться:

```text
app -> features/services/shared
features -> services/shared
services -> shared
shared -> no application layers
```

---

## Шаг 8. Только после этого оптимизировать структуру

Не надо реорганизовывать проект каждый раз после создания файла.

Сначала возникает функциональность.

Затем наблюдается реальное использование.

После этого архитектура уточняется.

Это и есть evolutionary design.

---

# 49. Правила миграции существующего проекта

Если проект уже существует и не соответствует ED, не стоит делать массовый перенос всех файлов за один шаг.

Рекомендуемый порядок:

### Этап 1

Определить реальные features.

### Этап 2

Перенести route/page-код в `app`.

### Этап 3

Собрать связанные UI/state/API около соответствующих features.

### Этап 4

Убрать ошибочно глобальные `hooks`, `utils`, `types`.

### Этап 5

Выделить настоящие services.

### Этап 6

Оставшееся универсальное ядро структурировать в `shared`.

### Этап 7

Проверить импорты и циклические зависимости.

### Этап 8

Только после успешного typecheck/test/build удалить старые каталоги.

---

# 50. Как понять, что feature определена неправильно

Есть несколько характерных сигналов.

### Слишком маленькая feature

Если внутри:

```text
features/foo/
└── button.tsx
```

и `foo` не имеет самостоятельного смысла, возможно это просто shared UI.

### Слишком большая feature

Если внутри десятки независимых сценариев:

```text
features/account/
├── registration/
├── login/
├── password-reset/
├── billing/
├── notifications/
└── profile/
```

возможно, граница `account` слишком широкая и функции следует декомпозировать.

### Feature стала service

Если модуль фактически предоставляет самостоятельный механизм нескольким features и не представляет отдельную пользовательскую capability, возможно его место в `services`.

---

# 51. Правила именования

Рекомендуется:

- директории — `kebab-case`;
- React-компоненты — по соглашению проекта, например `PascalCase.tsx`;
- hooks — `use-*.ts`;
- публичная точка входа — `index.ts`;
- приватные implementation files — с `_` при необходимости обозначить внутренность.

Главное не форма имени, а семантика модуля.

---

# 52. Не путать физическую структуру и dependency boundary

Папки сами по себе не обеспечивают архитектуру.

Можно создать идеальное дерево:

```text
app/
features/
services/
shared/
```

и всё равно нарушить ED импортами.

Поэтому настоящая архитектура состоит из двух частей:

```text
Folder structure
        +
Dependency rules
```

Обе части обязательны.

---

# 53. Архитектура должна быть проверяема

Хорошая ED-структура должна позволять задавать автоматические правила:

- `shared` не импортирует `features`;
- `services` не импортирует `features`;
- feature не импортирует внутренности другой feature;
- route не содержит бизнес-логику;
- публичные API модулей импортируются через `index.ts`;
- запрещены циклические зависимости.

Эти правила можно постепенно закреплять:

- ESLint;
- dependency-cruiser;
- Nx/Turborepo tooling;
- custom scripts;
- TypeScript project boundaries;
- CI checks.

---

# 54. Практический checklist перед добавлением файла

Перед созданием файла ответь:

```text
1. Что делает этот код?
2. Какую ответственность он реализует?
3. Кто является его владельцем?
4. Это одна feature или несколько?
5. Это самостоятельный service?
6. Это действительно shared?
7. Кто имеет право его импортировать?
8. Может ли код жить ближе к месту использования?
```

Если на вопрос №8 ответ "да" — сначала оставь код локальным.

---

# 55. Практический checklist перед созданием каталога

Не создавай каталог, пока не можешь сформулировать его назначение одним предложением.

Хорошо:

```text
features/search — функциональность поиска.
services/session — общий механизм управления сессией.
shared/api — общий транспорт API.
```

Плохо:

```text
utils — туда потом что-нибудь положим.
hooks — все hooks проекта.
services — всё, что не знаем куда положить.
```

---

# 56. Каноническая модель ED

В компактном виде архитектуру можно запомнить так:

```text
                    USER / HTTP / NEXT.JS
                              │
                              ▼
                         ┌─────────┐
                         │   app   │
                         └────┬────┘
                              │
                 composition │
                              ▼
                     ┌────────────────┐
                     │    features    │
                     │  functionality │
                     └───────┬────────┘
                             │
                             ▼
                     ┌────────────────┐
                     │    services    │
                     │  mechanisms    │
                     └───────┬────────┘
                             │
                             ▼
                     ┌────────────────┐
                     │     shared     │
                     │   foundation   │
                     └────────────────┘
```

Смысл каждого уровня:

```text
app       = composition
features  = capabilities
services  = reusable mechanisms
shared    = foundation
```

---

# 57. Формула ED

Можно использовать следующую формулу:

> **Local first → Reuse second → Extract only when justified.**

Или по-русски:

> **Сначала локализуй ответственность. Затем докажи переиспользуемость. Только после этого выноси код выше.**

Это один из главных механизмов, который не даёт `shared` и `services` превратиться в свалку.

---

# 58. Финальный стандарт проекта

Проект можно считать хорошо структурированным по ED, если одновременно выполняется следующее:

- `app` отвечает за routes и composition;
- features представляют самостоятельные функциональности;
- каждая feature по возможности автономна;
- services являются независимыми механизмами;
- services не зависят от features;
- shared не знает о features и services;
- бизнес-логика не живёт в routes;
- глобальные `hooks`, `utils`, `types` не используются как склад по умолчанию;
- технические категории применяются внутри архитектурных модулей, а не вместо них;
- новый код сначала остаётся локальным;
- `index.ts` используется как публичная граница там, где это полезно;
- внутренние implementation details не экспортируются без необходимости;
- структура расширяется вместе с реальными потребностями проекта;
- dependency graph остаётся направленным и предсказуемым.

---

# 59. Краткий эталон для ежедневной разработки

Перед commit можно мысленно проверить четыре строки:

```text
APP      → куда пользователь/Next.js приходит
FEATURE  → что пользователь/система умеет делать
SERVICE  → какой самостоятельный механизм это обеспечивает
SHARED   → что объективно общее для всех
```

Если новый файл невозможно однозначно отнести к одной из этих ответственностей — **не надо сразу создавать новый верхнеуровневый каталог**.

Сначала пересмотри архитектурную границу.

---

# 60. Reference Tree

```text
src/
├── app/
│   ├── layout.tsx
│   ├── providers.tsx
│   ├── page.tsx
│   └── ...routes/
│
├── features/
│   ├── feature-a/
│   │   ├── index.ts
│   │   ├── _api.ts
│   │   ├── ui/
│   │   ├── model/
│   │   └── lib/
│   └── feature-b/
│       ├── index.ts
│       ├── _api.ts
│       ├── ui/
│       ├── model/
│       └── lib/
│
├── services/
│   ├── service-a/
│   │   ├── index.ts
│   │   └── ...
│   └── service-b/
│       ├── index.ts
│       └── ...
│
└── shared/
    ├── ui/
    ├── lib/
    ├── api/
    ├── config/
    └── domain/
```

---

# 61. Источник исходной модели

Данный guide обобщает архитектурную модель ED + Next.js из предоставленного reference-примера: `app` отвечает за маршрутизацию и глобальные обёртки; `features` — за независимые функциональные модули; `services` — за переиспользуемые самостоятельные сервисы; `shared` — за общее ядро. citeturn856091view0

Документ намеренно оформлен как **самостоятельный pattern guide**, а не как описание конкретного приложения.

---

# 62. One-page rule set

```text
1. Route belongs to app.
2. Capability belongs to feature.
3. Independent reusable mechanism belongs to service.
4. Truly generic code belongs to shared.
5. Keep code local until reuse is proven.
6. app composes; it does not own business logic.
7. features should not form dependency chains.
8. services must not depend on features.
9. shared must not depend on application layers.
10. Folder structure is useful only together with dependency rules.
11. Do not create empty architectural folders.
12. Prefer ownership over technical classification.
13. Extract upward only when the abstraction is proven.
14. Keep public module APIs explicit.
15. Let architecture evolve with the system.
```
