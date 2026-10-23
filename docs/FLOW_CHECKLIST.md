# F01–F30 — контроль сквозных сценариев

Статусы отражают текущую реализацию и не подменяют внешние интеграции. `PASS` — серверная ветка реализована и проверена; `PARTIAL` — UI/доменный каркас есть, но требуется провайдер или не реализована вся политика; `BLOCKED` — требуется решение владельца/внешний сервис.

| ID | Сценарий | Статус | Проверка / остаток |
| --- | --- | --- | --- |
| F01 | Гость смотрит проекты | PASS | Каталог, категории/query, проект, автор и history URL работают; deep link проходит production HTTP smoke. |
| F02 | Поиск проекта | PASS | Глобальный поиск, Enter, Esc/modal history и URL результата работают на клавиатуре и мыши. |
| F03 | Подписка после клика файла | PASS local / PARTIAL prod | OTP, returnTo, два согласия, idempotent order, mock confirm, license/download работают. Нужен реальный payment adapter. |
| F04 | Новая публикация | PASS | 7 шагов, PostgreSQL draft, upload, preview, subscription limit, submit и moderation case. |
| F05 | Исправления модератора | PARTIAL | Статусы и optimistic moderation есть; детальная привязка каждого замечания к полю требует расширения схемы. |
| F06 | Отказ и апелляция | PARTIAL | Экраны и решение reject есть; отдельная серверная сущность апелляции ещё не добавлена. |
| F07 | Вступление в клуб | BLOCKED | Gates есть; нужны Telegram bot/chat и политика одноразовых invite. |
| F08 | Отмена подписки | PASS local / PARTIAL prod | Cancel-at-period-end и сохранение лицензий проверены; provider cancel нужен после выбора провайдера. |
| F09 | Истёкший платёж | PARTIAL | Схема past_due/period end есть; provider webhook и retry policy не подключены. |
| F10 | Стена на десктопе | PASS UI | Панорамирование/масштаб/плитка/back реализованы; production smoke пройден. |
| F11 | Стена на мобильном | PASS UI | 390 px, sheet/back и controls доступны; физический touch-device не входил в этот прогон. |
| F12 | Голосование и отзыв | PASS | Уникальный toggle vote и review upsert работают через PostgreSQL и интеграционный тест. |
| F13 | Выбор дизайна | PASS demo / PARTIAL content | Gate, license history и download работают; нужны коммерческие архивы. |
| F14 | Arsenal-скилл | PARTIAL | Инструкции/compatibility UI есть; реальные пакеты и security review не предоставлены. |
| F15 | Платное продвижение | PARTIAL | Уникальная атомарная бронь слота и order schema есть; provider/маркировка/статистика не подключены. |
| F16 | Промо отклонено | PARTIAL | UI-ветка есть; refund provider и связанная серверная policy зависят от оплаты. |
| F17 | Модерация проекта | PASS core | RBAC, `SKIP LOCKED`, optimistic version, решение, публикация и audit log проверены. |
| F18 | Жалоба на проект | PASS core | Приватная жалоба пишется в PostgreSQL; UI подтверждает отправку. Расширенные уведомления сторон остаются. |
| F19 | Админ-платёж | PARTIAL | Роли и обезличенный экран есть; реальная сверка/refund невозможны без провайдера. |
| F20 | Отмена редактирования | PASS | Dirty guard работает для внутренней навигации, Back и beforeunload. |
| F21 | Проблема сети при публикации | PASS core / PARTIAL resume | Локальная страховка, offline banner и серверный upload есть; chunked resumable upload не реализован. |
| F22 | Удаление аккаунта | BLOCKED | Нужна утверждённая retention/legal policy и reauth delete endpoint. |
| F23 | Смена плана | PARTIAL | Сервер меняет план идемпотентно; proration и дата вступления требуют решения/провайдера. |
| F24 | Изменение handle | PARTIAL | UI профиля есть; server uniqueness и redirect history ещё не реализованы. |
| F25 | Политика / рекуррентное согласие | PASS core | Два чекбокса обязательны, terms version и timestamp сохраняются. Нужны финальные юртексты. |
| F26 | Ресурс с отозванной лицензией | PARTIAL | inactive resource блокируется сервером; массовое уведомление скачавшим требует email job. |
| F27 | Несуществующая страница | PASS | Неизвестный `/p/:slug` получает серверный HTTP 404 и клиентский recovery UI. |
| F28 | Платный автор с двумя проектами | PASS core | Лимит Founder=1 / Plus=3 проверяется транзакционно перед submit. Значения нужно утвердить. |
| F29 | Доступ соавтора | PARTIAL | Нормализованные members/roles есть; email invite acceptance/ACL UI не завершены. |
| F30 | Лицензия после отмены | PASS core | История лицензии остаётся после cancel; повторная выдача зависит от активности ресурса и версии лицензии. |

## Итог

- PASS или PASS core/UI: 17.
- PARTIAL/BLOCKED из-за внешнего решения или незавершённой ветки: 13.
- Нельзя считать публичный коммерческий запуск завершённым до пунктов из `PRODUCTION_SIGNOFF.md`; локальный production-like запуск и основное ядро работают сейчас.
