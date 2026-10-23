# Founders Club

Приложение Founders Club: React/Vite, Express, PostgreSQL 17, email OTP, cookie-сессии, проекты, медиа, модерация и Docker-развёртывание. Это текущая версия разработки, а не подтверждённо завершённый production-релиз. Ограничения и инструкция переноса: [запуск на другом компьютере](docs/LOCAL_HANDOFF.md).

## Запуск одной командой

Требуется Docker Desktop.

После клонирования репозитория или распаковки ZIP перейдите в папку, содержащую `docker-compose.yml`. Для обычного локального запуска Supabase, VPS, SMTP и файл `.env` не нужны. Будут созданы новая локальная база с демонстрационными данными и отдельное хранилище изображений; данные с предыдущего компьютера автоматически не переносятся.

```powershell
docker compose up -d --build
```

Откройте <http://localhost:8787>. Для локального входа используйте `demo-owner@founders.local`; код разработчика — `123456`. Код выводится только вне production.

Проверка состояния:

```powershell
Invoke-RestMethod http://localhost:8787/api/health
docker compose ps
```

Остановка без удаления данных:

```powershell
docker compose down
```

Не добавляйте `-v`, если хотите сохранить PostgreSQL и загруженные изображения.

## Разработка

Требуются Node.js 22+ и Docker Desktop.

```powershell
docker compose up -d db
npm ci
npm run db:setup
npm run dev
```

Интерфейс откроется на <http://localhost:5173>, API — на <http://localhost:8787>. Vite проксирует `/api` и `/uploads` на API.

Полная локальная проверка:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/verify.ps1
```

Она запускает typecheck, интеграционные тесты, production-сборку, Docker health-check и smoke-проход всех уникальных HTTP-маршрутов реестра экранов.

## Что хранится в PostgreSQL

- пользователи, одноразовые коды и отзываемые сессии;
- подписки, согласия, идемпотентные платёжные заказы и история;
- проекты, соавторы, медиа, модерационные дела и audit log;
- голоса, отзывы и жалобы;
- ресурсы, версии лицензий и история скачиваний;
- промо-заказы и атомарная бронь слотов;
- Telegram-приглашения и события приложения.

Миграции применяются автоматически при старте API. Загруженные PNG/JPEG/WebP сохраняются в отдельном постоянном томе `founders_uploads`, проверяются по сигнатуре, ограничены 5 МБ и восемью файлами на проект.

## Production-развёртывание

1. Скопируйте `.env.production.example` в `.env` и замените все значения `replace-with-...`.
2. Укажите публичный HTTPS URL в `APP_ORIGIN` и рабочий SMTP.
3. Запустите:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

4. Поставьте перед портом `8787` reverse proxy (Caddy, Traefik или Nginx) с TLS.
5. Проверьте `/api/health`, `/robots.txt`, `/sitemap.xml`, вход по email и загрузку изображения.

Production-override отключает локальный код, требует SMTP и секреты, включает secure cookie, `no-new-privileges`, read-only root filesystem и работу за одним доверенным proxy hop.

### Важное про оплату

Локальная среда использует mock без списания. В production `PAYMENTS_MODE=disabled` оставляет интерфейс доступным, но сервер безопасно отклоняет создание оплаты. До приёма реальных денег нужно выбрать провайдера, реализовать его checkout/webhook/refund-адаптер и пройти проверку на тестовом кабинете. Подмена реального провайдера mock-режимом в production намеренно запрещена.

### Резервные копии

На Linux-хосте:

```bash
sh scripts/backup.sh /secure/backups/founders-club
```

Скрипт сохраняет отдельные архивы PostgreSQL и загруженных файлов. Копии нужно выносить с сервера, шифровать и регулярно проверять восстановлением на отдельном стенде.

## Команды

| Команда | Назначение |
| --- | --- |
| `npm run check` | типы, тесты и production-сборка |
| `npm run db:migrate` | применить миграции |
| `npm run db:seed` | добавить помеченные demo-данные |
| `node scripts/smoke-routes.mjs` | проверить все HTTP-маршруты |
| `docker compose logs -f app` | смотреть API/runtime логи |

## Документы приёмки

- [Чеклист реализации](docs/IMPLEMENTATION_CHECKLIST.md)
- [30 сквозных сценариев](docs/FLOW_CHECKLIST.md)
- [Решения перед production](docs/PRODUCTION_SIGNOFF.md)
- [Полный реестр требований](docs/REQUIREMENTS.md)
