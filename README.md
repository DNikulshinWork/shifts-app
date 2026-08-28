# 📅 Смены.График

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2-3ECF8E)](https://supabase.com/)
[![pnpm](https://img.shields.io/badge/pnpm-10-F69220)](https://pnpm.io/)

Приложение для управления графиками смен с удобным календарём, гибкой настройкой типов смен и пресетами (шаблонами).

## 🚀 Возможности

- **Календарь** – просмотр смен по дням с навигацией по месяцам.
- **Управление типами смен** – создание, редактирование, удаление типов (название, цвет, эмодзи, длительность, категория).
- **Пресеты (шаблоны)** – создание последовательностей смен для быстрого заполнения графика.
- **Применение пресетов** – тремя режимами:
  - _Перезапись_ – заменяет все существующие смены в диапазоне.
  - _Заполнить пустые_ – добавляет смены только в свободные дни.
  - _Продолжить_ – продолжает последовательность с учётом предыдущих применений.
- **Тёмная тема** – автоматически подстраивается под системные настройки.
- **Валидация форм** – Zod + React Hook Form.
- **Кэширование и офлайн-поддержка** – React Query.

## 🛠️ Технологии

| Категория                 | Инструменты                                   |
| ------------------------- | --------------------------------------------- |
| **Фреймворк**             | Next.js 16 (App Router, Turbopack)            |
| **UI**                    | React 19, Tailwind CSS 4, shadcn/ui (Base UI) |
| **Язык**                  | TypeScript 5.8                                |
| **База данных**           | Supabase (PostgreSQL)                         |
| **Управление состоянием** | React Query, Zustand                          |
| **Формы**                 | React Hook Form + Zod                         |
| **Даты**                  | date-fns                                      |
| **Тестирование**          | Vitest, Testing Library                       |
| **Линтинг**               | ESLint, Prettier                              |
| **Сборка**                | pnpm (workspaces)                             |

## 📦 Установка и запуск

### Требования

- **Node.js** 20+ ([скачать](https://nodejs.org/))
- **pnpm** 10+ ([установка](https://pnpm.io/installation))

### 1. Клонируйте репозиторий

```bash
git clone https://github.com/your-username/shifts-app.git
cd shifts-app
2. Установите зависимости
bash
pnpm install
3. Настройте Supabase
Создайте проект в Supabase.

В разделе SQL Editor выполните скрипты в папке db/:

Сначала db/schema.sql – создание таблиц, индексов, RLS и политик.

Затем db/seed.sql – добавление базовых типов смен (скрипт идемпотентный).

При необходимости пересоздать БД – используйте db/full-reset.sql.

Получите Project URL и anon public ключ в Settings → API.

Создайте файл .env.local в корне:

env
NEXT_PUBLIC_SUPABASE_URL=ваш-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш-anon-ключ
4. Запустите приложение
bash
pnpm dev
Откройте http://localhost:3000 в браузере.

📝 Доступные скрипты
Команда	Описание
pnpm dev	Запуск dev-сервера (Turbopack)
pnpm build	Сборка production-версии
pnpm start	Запуск собранного приложения
pnpm lint	Проверка ESLint
pnpm format	Форматирование кода Prettier'ом
pnpm typecheck	Проверка типов TypeScript
pnpm test	Запуск тестов (Vitest)
pnpm verify	Все проверки сразу (lint + format + typecheck + test)
📁 Структура проекта (ключевые папки)
text
apps/web/               # Основное Next.js приложение
├── src/
│   ├── app/            # Страницы (App Router)
│   ├── features/       # Фичи по доменам (calendar, settings, ...)
│   ├── shared/         # Переиспользуемые модули
│   │   ├── api/        # API-сервисы (Supabase)
│   │   ├── hooks/      # React Query хуки
│   │   ├── lib/        # Утилиты (supabase, react-query, applyPreset, transform)
│   │   ├── ui/         # Компоненты UI (shadcn/ui)
│   │   └── types/      # Вспомогательные типы для БД
│   └── stores/         # Zustand хранилища
├── public/             # Статика
└── ...
packages/types/          # Общие типы и Zod-схемы (используются во всём проекте)
db/                      # SQL-скрипты для базы данных
  ├── schema.sql        # Создание таблиц, индексов, RLS
  ├── seed.sql          # Инициализация базовыми типами смен (идемпотентно)
  ├── reset.sql         # Удаление всех таблиц
  └── full-reset.sql    # Полный сброс и пересоздание (всё в одном)
🧪 Тестирование
Тесты написаны на Vitest и Testing Library. Запускаются командой:

bash
pnpm test          # интерактивный режим
pnpm test:ci       # однократный запуск (для CI)
Покрываются валидации Zod-схем и ключевые бизнес-логики.

🤝 Вклад
Если вы хотите внести свой вклад:

Форкните репозиторий.

Создайте ветку для своей фичи (git checkout -b feature/amazing-feature).

Закоммитьте изменения (git commit -m 'Add some amazing feature').

Запушьте (git push origin feature/amazing-feature).

Откройте Pull Request.

Для серьёзных изменений сначала создайте Issue для обсуждения.

📄 Лицензия
MIT © 2026 — см. файл LICENSE (если есть).

⭐ Не забудьте поставить звезду, если проект вам полезен!
```
