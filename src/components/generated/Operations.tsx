import React, { useState } from "react";
import {
  Action,
  Accordion,
  Avatar,
  Badge,
  Button,
  Check,
  Copy,
  Demo,
  DownloadDemo,
  Empty,
  Field,
  FormPanel,
  Icon,
  Link,
  Notice,
  PageHead,
  ProductCard,
  ProjectGrid,
  SectionHead,
  StatCards,
  Table,
  Tabs,
  Toggle,
  projects,
  routeFor,
  sid,
  specs,
  useApp,
} from "./core";
import { AccountShell } from "./Account";
const promos = [
  {
    id: 159,
    title: "Выделение карточки",
    desc: "Тонкий акцент, чтобы проект заметили в рекламном блоке.",
    price: "199 ₽",
    term: "за размещение",
    icon: "sun",
  },
  {
    id: 160,
    title: "Рекламное поднятие",
    desc: "Отдельное рекламное размещение на 24 часа.",
    price: "Уточняется",
    term: "по инвентарю",
    icon: "arrow",
  },
  {
    id: 161,
    title: "На главной на день",
    desc: "Рекламное место на главной в выбранную дату.",
    price: "790 ₽",
    term: "за день",
    icon: "grid",
  },
  {
    id: 162,
    title: "Неделя на главной",
    desc: "Недельное размещение в рекламной зоне.",
    price: "1 490 ₽",
    term: "за неделю",
    icon: "clock",
  },
  {
    id: 163,
    title: "Обзор проекта",
    desc: "Рекламный материал после редакционного согласования.",
    price: "По заявке",
    term: "без гарантии охвата",
    icon: "file",
  },
];
function Calendar({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (s: string) => void;
}) {
  const [month, setMonth] = useState(10);
  return (
    <div className="calendar">
      <div className="calendar-head">
        <button
          className="icon-button"
          aria-label="Предыдущий месяц"
          onClick={() => setMonth((m) => Math.max(10, m - 1))}
        >
          <Icon name="back" />
        </button>
        <h3>
          {month === 10 ? "Октябрь" : month === 11 ? "Ноябрь" : "Декабрь"} 2026
        </h3>
        <button
          className="icon-button"
          aria-label="Следующий месяц"
          onClick={() => setMonth((m) => Math.min(12, m + 1))}
        >
          <Icon name="arrow" />
        </button>
      </div>
      <div className="calendar-grid">
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => (
          <span key={d}>{d}</span>
        ))}
        {Array.from(
          {
            length: month === 11 ? 30 : 31,
          },
          (_, i) => {
            const date = `2026-${month}-${String(i + 1).padStart(2, "0")}`,
              busy = [4, 9, 15, 23].includes(i);
            return (
              <button
                key={i}
                disabled={busy || (month === 10 && i < 21)}
                aria-label={`${i + 1} ${month === 10 ? "октября" : month === 11 ? "ноября" : "декабря"}${busy ? ", занято в демо" : ""}`}
                aria-pressed={selected === date}
                className={selected === date ? "selected" : busy ? "busy" : ""}
                onClick={() => onSelect(date)}
              >
                {i + 1}
                {busy && <i />}
              </button>
            );
          },
        )}
      </div>
      <div className="calendar-legend">
        <span>
          <i />
          Доступно в демо
        </span>
        <span>
          <i className="busy" />
          Занято в демо
        </span>
      </div>
      <p className="fine">
        DEMO · Календарь не отражает реальную доступность. Серверное
        резервирование не подключено.
      </p>
    </div>
  );
}
export function Promotion() {
  const a = useApp(),
    id = Number(a.id);
  const product =
    promos.find((x) => x.id === id) ||
    promos.find((x) => x.id === a.model.promoProduct) ||
    promos[2];
  const [date, setDate] = useState(a.model.promoDate || "");
  const [format, setFormat] = useState(product.title);
  const [device, setDevice] = useState("Desktop");
  const [agree, setAgree] = useState(false);
  const [period, setPeriod] = useState("Весь период");
  const choose = (n: number) => {
    a.setModel({
      promoProduct: n,
    });
    a.go(n);
  };
  if (id === 158)
    return (
      <div className="container page">
        <PageHead
          title="Пусть о проекте узнают."
          description="Рекламные возможности с прозрачными условиями. Без обещаний трафика и влияния на органический рейтинг."
          back={136}
        />
        <div className="promo-intro">
          <h2>
            Внимание нельзя гарантировать.
            <br />
            Хорошее место — можно согласовать.
          </h2>
          <p>
            Выберите формат и посмотрите, как он будет выглядеть. Доступность,
            цена и срок подтверждаются до оплаты.
          </p>
        </div>
        <div className="promo-products">
          {promos.map((p) => (
            <article key={p.id}>
              <Icon name={p.icon} size={28} />
              <h2>{p.title}</h2>
              <p>{p.desc}</p>
              <div>
                <strong>{p.price}</strong>
                <span>{p.term}</span>
              </div>
              <Button
                variant="secondary"
                onClick={() => choose(p.id)}
                icon="arrow"
              >
                Подробнее
              </Button>
            </article>
          ))}
        </div>
        <Notice>
          Все рекламные места отмечаются «Реклама». Оплата не покупает голоса и
          не меняет честный рейтинг. Цены — проектные параметры ТЗ, не
          действующая оферта.
        </Notice>
        <Action to={153}>Мои кампании</Action>
        <Action to={228} variant="text">
          Правила продвижения
        </Action>
      </div>
    );
  if ([159, 160, 161, 162, 163, 170].includes(id))
    return (
      <div className="container page">
        <PageHead
          title={id === 170 ? "Выберите своё окно" : product.title}
          description={product.desc}
          back={158}
        />
        <div className="promo-detail">
          <div>
            {id === 159 ? (
              <div className="ad-comparison">
                <div>
                  <span>Обычная карточка</span>
                  <ProductCard project={projects[0]} />
                </div>
                <div className="promoted-card">
                  <Badge tone="warm">Реклама</Badge>
                  <ProductCard project={projects[0]} />
                </div>
              </div>
            ) : id === 163 ? (
              <>
                <div className="review-format">
                  <Icon name="file" size={42} />
                  <h2>Содержательный рассказ о продукте</h2>
                  <p>
                    Формат, площадка и материалы согласуются с редакцией до
                    покупки. Реальных рекламных примеров пока нет.
                  </p>
                </div>
                <FormPanel
                  fields={[
                    {
                      label: "Проект",
                      key: "name",
                      required: true,
                    },
                    {
                      label: "Что стоит рассказать?",
                      key: "brief",
                      type: "textarea",
                      required: true,
                    },
                  ]}
                  submit="Сохранить демо-заявку"
                />
              </>
            ) : (
              <Calendar
                selected={date}
                onSelect={(d) => {
                  setDate(d);
                  a.setModel({
                    promoDate: d,
                  });
                }}
              />
            )}
          </div>
          <aside className="panel order-summary">
            <Badge tone="warm">Рекламный формат</Badge>
            <h2>{product.title}</h2>
            <div className="price">{product.price}</div>
            <p>{product.term}</p>
            <p>Выбрано: {date || "пока без даты"}</p>
            <Notice>
              Место подтверждает сервер. В демо нельзя купить или
              зарезервировать настоящий слот.
            </Notice>
            <Button
              disabled={id !== 159 && id !== 163 && !date}
              onClick={() => {
                a.setModel({
                  promoProduct: product.id,
                  promoDate: date,
                });
                a.go(164);
              }}
              icon="arrow"
            >
              Настроить размещение
            </Button>
            <Action to={228} variant="text">
              Условия и ограничения
            </Action>
          </aside>
        </div>
      </div>
    );
  if ([164, 165, 169].includes(id))
    return (
      <div className="container page">
        <PageHead
          title={
            id === 164
              ? "Настроим размещение"
              : id === 169
                ? "Так увидят ваш проект"
                : "Проверьте рекламный заказ"
          }
          description="Разовая покупка. Не подписка. Не покупка позиции в рейтинге."
          back={id === 164 ? 158 : 164}
        />
        <div className="checkout-layout">
          <div className="panel">
            {id === 164 ? (
              <>
                <Field
                  label="Проект"
                  value={a.model.draft.name || "MindFlow · DEMO"}
                  onChange={() => {}}
                  options={[a.model.draft.name || "MindFlow · DEMO"]}
                />
                <Field
                  label="Формат"
                  value={format}
                  options={promos.map((x) => x.title)}
                  onChange={(v) => {
                    setFormat(v);
                    a.setModel({
                      promoProduct: promos.find((x) => x.title === v)?.id,
                    });
                  }}
                />
                <Field
                  label="Дата начала"
                  value={date}
                  onChange={(v) => {
                    setDate(v);
                    a.setModel({
                      promoDate: v,
                    });
                  }}
                  type="date"
                />
                <Action to={170} variant="text">
                  Проверить календарь
                </Action>
                <Action to={169}>Посмотреть превью</Action>
                <Notice>
                  Если слот занят в момент подтверждения, сервер должен
                  предложить другую дату до списания. В демо это интеграционная
                  аннотация.
                </Notice>
              </>
            ) : id === 169 ? (
              <>
                <div className="segmented">
                  {["Desktop", "Mobile"].map((v) => (
                    <button
                      key={v}
                      className={device === v ? "active" : ""}
                      onClick={() => setDevice(v)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <div
                  className={
                    "ad-preview " + (device === "Mobile" ? "mobile" : "")
                  }
                >
                  <div className="section-head">
                    <h3>Реклама</h3>
                    <Badge>Платное размещение</Badge>
                  </div>
                  <ProductCard project={projects[0]} />
                </div>
                <Action to={164}>Изменить</Action>
              </>
            ) : (
              <>
                <h2>Перед оплатой</h2>
                <Table
                  heads={["Параметр", "Значение"]}
                  rows={[
                    ["Проект", a.model.draft.name || "MindFlow · DEMO"],
                    ["Формат", product.title],
                    ["Дата", a.model.promoDate || "Не выбрана"],
                    ["Сумма", product.price],
                    ["Автопродление", "Нет · разовый заказ"],
                  ]}
                />
                <Check
                  checked={agree}
                  onChange={setAgree}
                  label={
                    <span>
                      Принимаю <Link to={228}>правила размещения</Link> и
                      понимаю, что охват не гарантирован
                    </span>
                  }
                />
                <Notice>
                  В демо не создаётся бронь и не удерживается платёж. Статус
                  реального заказа должен подтверждаться сервером.
                </Notice>
              </>
            )}
          </div>
          <aside className="panel order-summary">
            <h2>{product.title}</h2>
            <div className="price">{product.price}</div>
            <span>Разовое размещение</span>
            <div className="summary-total">
              <span>Маркировка</span>
              <strong>Реклама</strong>
            </div>
            {id === 165 ? (
              <Button
                disabled={!agree}
                onClick={() => {
                  a.setModel({
                    purchaseKind: "promotion",
                    promoPrice: product.price,
                    promoTitle: product.title,
                    paymentDemo: false,
                    returnTo: "/dashboard/promotions/demo-01",
                    promoStatus: "Ожидает модерации",
                  });
                  a.go(110);
                }}
              >
                К оплате разового заказа
              </Button>
            ) : (
              <Action to={id === 164 ? 169 : 165} variant="primary">
                {id === 164 ? "Продолжить" : "Подтвердить превью"}
              </Action>
            )}
          </aside>
        </div>
      </div>
    );
  return (
    <AccountShell>
      <PageHead
        title={
          id === 166
            ? "Ваше рекламное размещение"
            : id === 167
              ? "Результаты размещения"
              : id === 168
                ? "Экспорт рекламной статистики"
                : id === 172
                  ? "Размещение не одобрено"
                  : id === 173
                    ? "Кампания завершена"
                    : "Дополнительная возможность"
        }
        back={153}
      />
      {id === 171 ? (
        <div className="panel">
          <h2>Подберите формат для своего проекта</h2>
          <p>
            Только если реклама сейчас полезна. Никаких обещаний роста и
            давления.
          </p>
          <Action to={158}>Посмотреть форматы</Action>
          <Button
            variant="text"
            onClick={() => {
              a.setModel({
                hideUpsell: true,
              });
              a.go(131);
            }}
          >
            Больше не показывать
          </Button>
        </div>
      ) : id === 172 ? (
        <>
          <Notice tone="danger" title="Требуется исправление — DEMO">
            На изображении не читается название проекта. Загрузите более ясный
            креатив и отправьте повторно. Слот и условия возврата проверяются
            отдельно.
          </Notice>
          <Action to={164} variant="primary">
            Исправить
          </Action>
          <Action to={155}>Обращение по возврату</Action>
        </>
      ) : id === 168 ? (
        <div className="panel">
          <Field
            label="Период"
            value={period}
            onChange={setPeriod}
            options={["Весь период", "7 дней", "30 дней"]}
          />
          <Notice>
            Доступна структура отчёта. Реальные события не подключены.
          </Notice>
          <DownloadDemo
            name="promotion-template.csv"
            text="date,placement,impressions,outbound_clicks,ctr\n"
          />
        </div>
      ) : (
        <>
          <div className="campaign-header">
            <div>
              <Badge tone="warm">
                {id === 173
                  ? "Завершена · DEMO"
                  : a.model.promoStatus || "Не создана · DEMO"}
              </Badge>
              <h2>{product.title}</h2>
              <p>
                Проект: {a.model.draft.name || "MindFlow · DEMO"} ·{" "}
                {a.model.promoDate || "Дата не выбрана"}
              </p>
            </div>
            <Action to={id === 167 ? 168 : 167}>
              {id === 167 ? "Экспорт CSV" : "Статистика"}
            </Action>
          </div>
          <StatCards
            labels={["Показы рекламы", "Внешние клики", "CTR", "Расход"]}
            values={["—", "—", "—", "—"]}
          />
          <Notice>
            Реальная кампания не запускалась. Показатели не выдуманы и не
            заменены нулями.
          </Notice>
          <div className="panel">
            <h3>История размещения</h3>
            <Empty
              title="Событий нет"
              text="Оплата, модерация и запуск будут отдельными событиями подтверждённого сервером заказа."
              icon="clock"
            />
          </div>
          {id === 173 && <Action to={164}>Настроить новое размещение</Action>}
          <Action to={19} variant="text">
            Помощь с кампанией
          </Action>
        </>
      )}
    </AccountShell>
  );
}
const adminNav: [number, string, string][] = [
  [174, "Обзор", "grid"],
  [182, "Модерация", "shield"],
  [178, "Проекты", "file"],
  [175, "Пользователи", "user"],
  [185, "Жалобы", "flag"],
  [190, "Design Vault", "code"],
  [193, "Arsenal", "code"],
  [195, "Launch Kits", "grid"],
  [197, "Подписки", "shield"],
  [199, "Платежи", "lock"],
  [201, "Реклама", "sun"],
  [204, "Telegram", "chat"],
  [206, "Аналитика", "chart"],
  [207, "SEO и контент", "file"],
  [208, "Поддержка", "mail"],
];
const lists: Record<
  number,
  {
    cols: string[];
    rows: string[][];
    detail: number;
    search: string;
  }
> = {
  175: {
    cols: ["Пользователь", "Роль", "Подписка", "Статус"],
    rows: [
      ["Автор · DEMO", "User", "Нет", "Email скрыт"],
      ["Редактор · DEMO", "Модератор", "Рабочая роль", "Демо-аккаунт"],
    ],
    detail: 176,
    search: "Имя или ID пользователя",
  },
  178: {
    cols: ["Проект", "Категория", "Статус", "Автор"],
    rows: [
      ["MindFlow · DEMO", "AI", "На проверке", "@alexdev"],
      ["FlowStreak · DEMO", "Мобильные", "Черновик", "@maria"],
    ],
    detail: 184,
    search: "Название или ID проекта",
  },
  179: {
    cols: ["Категория", "Slug", "Статус", "Действие"],
    rows: [
      ["SaaS", "saas", "Демо", "Настроить"],
      ["Дизайн", "design", "Демо", "Настроить"],
      ["Инструменты", "tools", "Демо", "Настроить"],
    ],
    detail: 179,
    search: "Название категории",
  },
  180: {
    cols: ["Тег", "Slug", "Синонимы", "Статус"],
    rows: [
      ["Продуктивность", "productivity", "Нет", "Демо"],
      ["Разработка", "development", "dev", "Демо"],
    ],
    detail: 180,
    search: "Тег или синоним",
  },
  181: {
    cols: ["Подборка", "Куратор", "Статус", "Публикация"],
    rows: [
      ["Для спокойной работы", "Редакция · DEMO", "Черновик", "Не назначена"],
    ],
    detail: 181,
    search: "Подборка",
  },
  182: {
    cols: ["Заявка", "Тип", "Статус", "Ответственный"],
    rows: [
      [
        "MindFlow · DEMO",
        "Первичная публикация",
        "Ожидает решения",
        "Не назначен",
      ],
      [
        "Проверка авторства · DEMO",
        "Ручное подтверждение",
        "Ожидает решения",
        "Не назначен",
      ],
    ],
    detail: 183,
    search: "Проект или заявка",
  },
  185: {
    cols: ["Объект", "Причина", "Статус", "Приоритет"],
    rows: [["MindFlow · DEMO", "Нарушение прав", "Новая", "Обычный"]],
    detail: 186,
    search: "Проект или номер жалобы",
  },
  187: {
    cols: ["Отзыв", "Проект", "Статус", "Действие"],
    rows: [],
    detail: 187,
    search: "Текст или проект",
  },
  188: {
    cols: ["Проект", "Период", "Подтверждённые голоса", "Сигналы"],
    rows: [],
    detail: 189,
    search: "Проект",
  },
  189: {
    cols: ["Сигнал", "Объект", "Статус", "Проверка"],
    rows: [],
    detail: 189,
    search: "Сигнал или проект",
  },
  190: {
    cols: ["Ресурс", "Версия", "Лицензия", "Статус"],
    rows: [
      ["Editorial UI · DEMO", "1.0", "Не подтверждена", "Черновик"],
      ["Focus Dashboard · DEMO", "1.0", "Не подтверждена", "Черновик"],
    ],
    detail: 191,
    search: "Название ресурса",
  },
  193: {
    cols: ["Инструмент", "Тип", "Проверка", "Статус"],
    rows: [
      ["Frontend Review · DEMO", "Skill", "Не проверен", "Черновик"],
      ["Project Context · DEMO", "AGENTS.md", "Не проверен", "Черновик"],
    ],
    detail: 194,
    search: "Инструмент",
  },
  195: {
    cols: ["Комплект", "Версия", "Манифест", "Статус"],
    rows: [["SaaS Starter · DEMO", "1.0", "Не загружен", "Черновик"]],
    detail: 196,
    search: "Название комплекта",
  },
  197: {
    cols: ["Аккаунт", "План", "Внутренний статус", "Провайдер"],
    rows: [["Автор · DEMO", "Founder", "Демонстрация", "Не подключён"]],
    detail: 198,
    search: "Аккаунт или ID подписки",
  },
  199: {
    cols: ["Заказ", "Сумма", "Статус", "Провайдер"],
    rows: [],
    detail: 200,
    search: "Заказ или provider ID",
  },
  201: {
    cols: ["Кампания", "Формат", "Период", "Статус"],
    rows: [["MindFlow · DEMO", "На главной", "Не назначен", "Черновик"]],
    detail: 202,
    search: "Кампания или проект",
  },
  204: {
    cols: ["Участник", "Авторство", "Подписка", "Синхронизация"],
    rows: [["Автор · DEMO", "Не проверено", "Демо", "Бот не подключён"]],
    detail: 205,
    search: "Участник или ID",
  },
  208: {
    cols: ["Обращение", "Тема", "Статус", "Ответственный"],
    rows: [["DEMO-001", "Публикация проекта", "Открыто", "Не назначен"]],
    detail: 209,
    search: "Номер или тема",
  },
};
export function Admin() {
  const a = useApp(),
    id = Number(a.id);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("Все");
  const [reason, setReason] = useState("");
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [decision, setDecision] = useState("");
  const [date, setDate] = useState("");
  const [edit, setEdit] = useState("");
  const [role, setRole] = useState(a.model.adminRole || "Модератор");
  const def = lists[id];
  const required = [
    "Авторство проверено",
    "Контент соответствует правилам",
    "Ссылки безопасны",
    "Изображения принадлежат автору",
  ];
  function decide(status: string) {
    if (status !== "Опубликован" && !reason.trim()) {
      a.notify("Укажите причину решения");
      return;
    }
    if (status === "Опубликован" && !required.every((k) => checks[k])) {
      a.notify("Завершите чеклист проверки");
      return;
    }
    a.setModel((m) => ({
      projectStatus: status,
      verified: status === "Опубликован" || m.verified,
      audit: [
        ...(m.audit || []),
        {
          action: status,
          reason: reason || "Чеклист пройден",
          time: new Date().toISOString(),
          role,
        },
      ],
    }));
    setDecision(status);
    a.notify(
      "Демо-решение записано локально. Реальная модерация не выполнялась.",
    );
  }
  if (!a.model.adminRole)
    return (
      <div className="container page">
        <PageHead title="Административный доступ" />
        <Empty
          title="Нужна рабочая роль"
          text="Пользовательский аккаунт не получает административный доступ. Для просмотра дизайна используйте отдельный демо-режим."
          icon="lock"
        />
        <div className="center">
          <Button
            onClick={() =>
              a.modal(
                <>
                  <h2>Просмотр административного интерфейса</h2>
                  <p>
                    Это локальная демонстрация без реальных пользовательских
                    данных и серверных полномочий.
                  </p>
                  <Button
                    onClick={() => {
                      a.setModel({
                        adminRole: "Модератор",
                      });
                    }}
                  >
                    Открыть демо модератора
                  </Button>
                </>,
              )
            }
          >
            Посмотреть демо-админку
          </Button>
        </div>
      </div>
    );
  return (
    <div className="admin-shell">
      <aside className="admin-nav">
        <Link to={174} className="admin-brand">
          Founders Club<span>УПРАВЛЕНИЕ · DEMO</span>
        </Link>
        <nav>
          {adminNav.map(([to, t, icon]) => (
            <Link to={to} className={id === to ? "active" : ""} key={to}>
              <Icon name={icon} size={18} />
              {t}
            </Link>
          ))}
        </nav>
        <Link to={177}>
          <Icon name="shield" />
          Роли и доступы
        </Link>
        <Link to={1}>
          <Icon name="external" />
          Публичный сайт
        </Link>
      </aside>
      <main className="admin-main">
        <div className="admin-topline">
          <span>Рабочее пространство</span>
          <div className="inline">
            <Badge>{role} · DEMO</Badge>
            <Button
              variant="text"
              onClick={() => {
                a.setModel({
                  adminRole: "",
                });
                a.go(131);
              }}
            >
              Выйти из демо
            </Button>
          </div>
        </div>
        <PageHead
          title={(specs.get(a.id)?.name || "Администрирование").replace(
            "Админ: ",
            "",
          )}
          back={174}
        />
        {id === 174 ? (
          <>
            <StatCards
              labels={[
                "В очереди модерации",
                "Активные подписки",
                "Обращения",
                "Интеграции",
              ]}
              values={["—", "—", "—", "—"]}
            />
            <Notice title="Нет подключённого backend">
              Карточки и таблицы ниже — демонстрация структуры. Это не
              фактические данные платформы.
            </Notice>
            <div className="admin-overview">
              <section className="panel">
                <SectionHead title="Рабочая очередь" to={182} />
                {[
                  ["Проверить проект", 183, "Заявка · DEMO"],
                  ["Разобрать обращение", 209, "Поддержка · DEMO"],
                  ["Проверить ресурс", 191, "Лицензия не подтверждена"],
                ].map(([t, to, d]) => (
                  <Link className="queue-row" to={Number(to)} key={String(to)}>
                    <Icon name="file" />
                    <div>
                      <strong>{t}</strong>
                      <p>{d}</p>
                    </div>
                    <Icon name="arrow" />
                  </Link>
                ))}
              </section>
              <section className="panel">
                <h2>Состояние интеграций</h2>
                {[
                  "Платёжный провайдер",
                  "Telegram Bot",
                  "Файловое хранилище",
                  "Аналитика",
                ].map((t) => (
                  <div className="status-line" key={t}>
                    <span>{t}</span>
                    <Badge>Не подключено</Badge>
                  </div>
                ))}
                <Action to={229} variant="text">
                  Сервисный статус
                </Action>
              </section>
            </div>
            <div className="inline">
              <Action to={179}>Категории</Action>
              <Action to={180}>Теги</Action>
              <Action to={181}>Подборки</Action>
            </div>
          </>
        ) : def ? (
          <>
            <div className="list-toolbar">
              <div className="search-field">
                <Icon name="search" />
                <input
                  aria-label={def.search}
                  placeholder={def.search}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <select
                value={filter}
                aria-label="Фильтр статуса"
                onChange={(e) => setFilter(e.target.value)}
              >
                {["Все", "Черновик", "На проверке", "Открыто"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
              {[179, 180, 181, 190, 193, 195].includes(id) && (
                <Button
                  icon="plus"
                  onClick={() =>
                    [190, 193, 195].includes(id)
                      ? a.go(id === 190 ? 192 : def.detail)
                      : a.modal(
                          <>
                            <h2>
                              {id === 179
                                ? "Новая категория"
                                : id === 180
                                  ? "Новый тег"
                                  : "Новая подборка"}
                            </h2>
                            <FormPanel
                              fields={[
                                {
                                  label: "Название",
                                  key: "name",
                                  required: true,
                                },
                                {
                                  label: "Slug",
                                  key: "slug",
                                  required: true,
                                },
                                {
                                  label: "Описание",
                                  key: "description",
                                  type: "textarea",
                                },
                              ]}
                              submit="Сохранить демо-черновик"
                            />
                          </>,
                        )
                  }
                >
                  Добавить
                </Button>
              )}
            </div>
            <Table
              heads={[...def.cols, ""]}
              rows={def.rows
                .filter(
                  (r) =>
                    r.join(" ").toLowerCase().includes(q.toLowerCase()) &&
                    (filter === "Все" || r.includes(filter)),
                )
                .map((r, i) => [
                  ...r,
                  <Button
                    variant="text"
                    icon="arrow"
                    onClick={() => {
                      if ([179, 180, 181, 187].includes(id)) {
                        a.modal(
                          <>
                            <h2>{r[0]}</h2>
                            <Notice>
                              {id === 179
                                ? "Категорию с проектами нельзя удалить без переноса."
                                : id === 180
                                  ? "Слияние требует предпросмотра затронутых проектов и редиректов."
                                  : "Изменения публикуются только после проверки."}
                            </Notice>
                            <FormPanel
                              fields={[
                                {
                                  label: "Название",
                                  key: "name",
                                  required: true,
                                },
                                {
                                  label: "Slug",
                                  key: "slug",
                                },
                                {
                                  label: "Причина изменения",
                                  key: "reason",
                                  type: "textarea",
                                  required: true,
                                },
                              ]}
                            />
                          </>,
                        );
                      } else a.go(def.detail);
                    }}
                  >
                    Открыть
                  </Button>,
                ])}
            />
            {id === 199 && (
              <Action to={200} variant="text">
                Посмотреть демо-карточку платежа
              </Action>
            )}
            {id === 201 && <Action to={203}>Календарь инвентаря</Action>}
            {id === 182 && (
              <Notice>
                В боевом режиме решение блокируется, если заявку уже
                рассматривает другой модератор. В демо серверная блокировка не
                имитируется как работающая.
              </Notice>
            )}
            {id === 189 && (
              <Notice tone="warm">
                Сигнал антифрода — не доказательство нарушения. Исключение
                голосов требует причины и возможности отката.
              </Notice>
            )}
          </>
        ) : id === 183 || id === 202 ? (
          <>
            <div className="moderation-layout">
              <section>
                <div className="panel">
                  <div className="inline">
                    <Badge tone="warm">
                      {id === 183
                        ? a.model.projectStatus
                        : a.model.promoStatus || "На проверке"}{" "}
                      · DEMO
                    </Badge>
                    <span className="fine">Заявка DEMO-001</span>
                  </div>
                  <h2>{a.model.draft.name || "MindFlow"}</h2>
                  <img
                    className="moderation-preview"
                    src={
                      a.model.media?.[0]?.url ||
                      "/assets/mindflow.jpg"
                    }
                    alt="Демо-превью заявки"
                  />
                  <p>
                    {a.model.draft.short ||
                      "Демонстрационный продукт для проверки интерфейса модерации."}
                  </p>
                  <Action
                    to={35}
                    params={{
                      slug: a.model.draft.slug || "my-project",
                    }}
                  >
                    Публичный предпросмотр
                  </Action>
                </div>
                <div className="panel">
                  <h3>История изменений</h3>
                  {a.model.audit?.length ? (
                    a.model.audit.map((row: any, i: number) => (
                      <div className="audit-row" key={i}>
                        <strong>{row.action}</strong>
                        <p>{row.reason}</p>
                        <small>
                          {new Date(row.time).toLocaleString("ru-RU", {
                            timeZone: "Europe/Moscow",
                          })}{" "}
                          · МСК · {row.role} · DEMO
                        </small>
                      </div>
                    ))
                  ) : (
                    <p className="muted">Подтверждённых решений пока нет.</p>
                  )}
                </div>
              </section>
              <aside className="panel moderation-check">
                <h2>Проверка {id === 202 ? "рекламы" : "проекта"}</h2>
                {required.map((k) => (
                  <Check
                    key={k}
                    label={k}
                    checked={!!checks[k]}
                    onChange={(v) =>
                      setChecks((c) => ({
                        ...c,
                        [k]: v,
                      }))
                    }
                  />
                ))}
                {id === 202 && (
                  <Check
                    label="Рекламная маркировка видна"
                    checked={!!checks.ad}
                    onChange={(v) =>
                      setChecks((c) => ({
                        ...c,
                        ad: v,
                      }))
                    }
                  />
                )}
                <Field
                  label="Комментарий / причина решения"
                  value={reason}
                  onChange={setReason}
                  type="textarea"
                  hint="Обязательно для отклонения и запроса исправлений"
                />
                <Button
                  disabled={!!decision || (id === 202 && !checks.ad)}
                  onClick={() => decide("Опубликован")}
                  icon="check"
                >
                  Одобрить — демо
                </Button>
                <Button
                  variant="secondary"
                  disabled={!!decision}
                  onClick={() => decide("Нужны исправления")}
                >
                  Запросить исправления
                </Button>
                <Button
                  variant="danger"
                  disabled={!!decision}
                  onClick={() => decide("Отклонён")}
                >
                  Отклонить
                </Button>
                {decision && (
                  <Notice tone="positive">
                    Демо-решение: {decision}. Повторное решение заблокировано в
                    этой сессии.
                  </Notice>
                )}
              </aside>
            </div>
            <Notice>
              Настоящие audit log, блокировка конкурентных решений и отправка
              уведомления требуют backend.
            </Notice>
          </>
        ) : id === 176 || id === 184 || id === 205 ? (
          <>
            <div className="panel entity-profile">
              <Avatar name="ДА" large />
              <div>
                <Demo />
                <h2>
                  {id === 184
                    ? a.model.draft.name || "MindFlow"
                    : "Демонстрационный автор"}
                </h2>
                <p>
                  {id === 205
                    ? "Telegram ID: •••••• · OAuth не подключён"
                    : "ID: demo-01 · Личные данные скрыты"}
                </p>
              </div>
              <Badge>Демо-запись</Badge>
            </div>
            <div className="admin-overview">
              <div className="panel">
                <h2>Связанные объекты</h2>
                <Action to={id === 184 ? 183 : id === 205 ? 198 : 177}>
                  {id === 184
                    ? "Модерировать"
                    : id === 205
                      ? "Подписка"
                      : "Роли и права"}
                </Action>
                <Action to={id === 184 ? 35 : 184}>Проект</Action>
                <Action to={198}>Подписка</Action>
              </div>
              <div className="panel">
                <h2>Действия</h2>
                <Field
                  label="Причина ограничения"
                  value={reason}
                  onChange={setReason}
                  type="textarea"
                />
                <Button
                  variant="danger"
                  disabled={!reason.trim()}
                  onClick={() =>
                    a.modal(
                      <>
                        <h2>Подтвердите ограничение — демо</h2>
                        <p>{reason}</p>
                        <Button
                          variant="danger"
                          onClick={() => {
                            a.notify(
                              "Демо-ограничение записано. Реальные права не менялись.",
                            );
                            a.close();
                          }}
                        >
                          Подтвердить
                        </Button>
                      </>,
                    )
                  }
                >
                  Ограничить доступ
                </Button>
              </div>
            </div>
            <Notice>
              Любое изменение реальных прав требует RBAC, повторной проверки и
              записи причины в audit log.
            </Notice>
          </>
        ) : id === 177 ? (
          <>
            <div className="panel">
              <h2>Предпросмотр полномочий</h2>
              <Field
                label="Демо-роль"
                value={role}
                onChange={(v) => {
                  setRole(v);
                }}
                options={["Модератор", "Администратор"]}
              />
              <Table
                heads={["Разрешение", "Модератор", "Администратор"]}
                rows={[
                  "Проверка проектов|Да|Да",
                  "Разбор жалоб|Да|Да",
                  "Доступ к платежам|Нет|По отдельному разрешению",
                  "Возвраты|Нет|Повторная аутентификация",
                  "Назначение ролей|Нет|С audit log",
                ].map((r) => r.split("|"))}
              />
              <Notice>
                Последнего superadmin нельзя удалить или лишить роли. Изменение
                выбора здесь — только просмотр демо-матрицы.
              </Notice>
            </div>
          </>
        ) : id === 186 ? (
          <div className="moderation-layout">
            <div className="panel">
              <h2>Жалоба DEMO-001</h2>
              <Badge tone="warm">Ожидает рассмотрения</Badge>
              <h3>Основание</h3>
              <p>
                {a.model.report ||
                  "Демонстрационный запрос о возможном нарушении прав."}
              </p>
              <Notice>
                Данные заявителя не публикуются. Дубли объединяются, конфликт
                интересов передаётся другому сотруднику.
              </Notice>
              <Action to={35}>Открыть объект жалобы</Action>
            </div>
            <div className="panel">
              <Field
                label="Резолюция"
                value={reason}
                onChange={setReason}
                type="textarea"
                required
              />
              {[
                "Отклонить жалобу",
                "Ограничить проект",
                "Передать на эскалацию",
              ].map((t) => (
                <Button
                  key={t}
                  variant={t.includes("Ограничить") ? "danger" : "secondary"}
                  disabled={!reason}
                  onClick={() =>
                    a.modal(
                      <>
                        <h2>{t}?</h2>
                        <p>{reason}</p>
                        <Button
                          onClick={() => {
                            a.setModel({
                              reportStatus: t,
                            });
                            a.close();
                            a.notify("Демо-резолюция сохранена локально");
                          }}
                        >
                          Подтвердить — демо
                        </Button>
                      </>,
                    )
                  }
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>
        ) : id === 191 || id === 194 || id === 196 ? (
          <>
            <div className="editor-layout">
              <FormPanel
                title={
                  id === 191
                    ? "Метаданные ресурса"
                    : id === 194
                      ? "Инструкции и безопасность"
                      : "Состав Launch Kit"
                }
                fields={[
                  {
                    label: "Название",
                    key: "name",
                    required: true,
                  },
                  {
                    label: "Slug",
                    key: "slug",
                    required: true,
                  },
                  {
                    label: "Версия",
                    key: "version",
                    required: true,
                  },
                  {
                    label: "Описание",
                    key: "description",
                    type: "textarea",
                    required: true,
                  },
                  {
                    label: id === 194 ? "Разрешения и риски" : "Зависимости",
                    key: "deps",
                    type: "textarea",
                  },
                  {
                    label: id === 196 ? "Манифест файлов" : "История изменений",
                    key: "manifest",
                    type: "textarea",
                  },
                  {
                    label: "Источник / правообладатель",
                    key: "source",
                    required: true,
                  },
                ]}
                submit="Сохранить демо-черновик"
              />
              <aside className="panel">
                <h2>Перед публикацией</h2>
                {[
                  "Лицензия подтверждена",
                  "Файлы проверены",
                  "Секретов нет",
                  "Превью соответствует файлам",
                  "Совместимость протестирована",
                ].map((t) => (
                  <Check
                    key={t}
                    label={t}
                    checked={!!checks[t]}
                    onChange={(v) =>
                      setChecks((c) => ({
                        ...c,
                        [t]: v,
                      }))
                    }
                  />
                ))}
                <Notice tone="warm">
                  Чекбокс не заменяет реальную проверку. Серверная публикация
                  отключена.
                </Notice>
                <Button disabled>Опубликовать</Button>
                <Action to={id === 191 ? 60 : id === 194 ? 78 : 90}>
                  Предпросмотр
                </Action>
              </aside>
            </div>
          </>
        ) : id === 192 ? (
          <div className="panel">
            <h2>Проверяем до публикации</h2>
            <label className="upload-zone">
              <Icon name="download" size={32} />
              <strong>Выбрать архив ресурса</strong>
              <span>ZIP · обязательны манифест и лицензия</span>
              <input
                type="file"
                accept=".zip"
                onChange={(e) => setEdit(e.target.files?.[0]?.name || "")}
              />
            </label>
            {edit && (
              <Notice tone="warm">
                Выбран {edit}. Файл не загружен и не проверен. Антивирусная
                проверка и защита от архивных путей ../ требуют сервера.
              </Notice>
            )}
            <Button disabled>Проверить и продолжить</Button>
            <Action to={190} variant="text">
              Вернуться к ресурсам
            </Action>
          </div>
        ) : id === 198 || id === 200 ? (
          <>
            <Notice tone="warm" title="Чувствительный раздел">
              {role === "Модератор"
                ? "В рабочей роли модератора платежи и возвраты недоступны. Здесь показана обезличенная схема карточки."
                : "Демо-режим не даёт реальных платёжных полномочий."}
            </Notice>
            <div className="panel">
              <h2>{id === 198 ? "Подписка DEMO-001" : "Платёж DEMO-001"}</h2>
              <Table
                heads={["Параметр", "Значение"]}
                rows={
                  id === 198
                    ? [
                        ["Тариф", "Founder"],
                        ["Статус провайдера", "Не подключён"],
                        ["Внутренний статус", "Демонстрация"],
                        ["Версия согласия", "Не подписано"],
                        ["Платёжный токен", "Не хранится в макете"],
                      ]
                    : [
                        ["Сумма", "—"],
                        ["Provider ID", "••••••"],
                        ["Idempotency", "Гарантируется PostgreSQL"],
                        ["Webhook", "Не получен"],
                        ["Возврат", "Не выполнялся"],
                      ]
                }
              />
              <div className="form-actions">
                <Button
                  variant="secondary"
                  onClick={() =>
                    a.notify("Провайдер не подключён. Статус не подтверждён.")
                  }
                >
                  Проверить у провайдера
                </Button>
                {id === 200 && (
                  <Button
                    variant="danger"
                    disabled={role === "Модератор"}
                    onClick={() =>
                      a.modal(
                        <>
                          <h2>Запрос возврата — только демонстрация</h2>
                          <Notice>
                            Реальная операция требует повторной аутентификации,
                            проверки роли и идемпотентного запроса.
                          </Notice>
                          <Field
                            label="Причина"
                            value={reason}
                            onChange={setReason}
                            type="textarea"
                          />
                          <Button
                            onClick={() => {
                              a.notify("Возврат не выполнялся");
                              a.close();
                            }}
                          >
                            Закрыть демонстрацию
                          </Button>
                        </>,
                      )
                    }
                  >
                    Запрос возврата
                  </Button>
                )}
                <Action to={id === 198 ? 199 : 197}>
                  {id === 198 ? "Платежи" : "Подписки"}
                </Action>
              </div>
            </div>
            <div className="panel">
              <h2>События провайдера</h2>
              <Empty
                title="Webhook-событий нет"
                text="Повтор одного события не должен создавать повторное списание или возврат."
                icon="clock"
              />
            </div>
          </>
        ) : id === 203 ? (
          <>
            <Calendar selected={date} onSelect={setDate} />
            <Notice>
              Изменение лимита мест, блокировка даты и конфликт резервов
              подтверждаются атомарно на сервере. В демо доступность не
              продаётся.
            </Notice>
            <Action to={202}>Пример рекламного заказа</Action>
          </>
        ) : id === 206 ? (
          <>
            <Field
              label="Период"
              value={filter}
              onChange={setFilter}
              options={["7 дней", "30 дней", "90 дней"]}
            />
            <StatCards
              labels={["MRR", "Активные подписки", "Конверсия", "Churn"]}
            />
            <div className="panel">
              <h2>Воронка продукта</h2>
              <div className="funnel">
                {["Посещение", "Регистрация", "Подписка", "Проект", "Клуб"].map(
                  (t, i) => (
                    <Link to={[178, 175, 197, 178, 204][i]} key={t}>
                      <span>{t}</span>
                      <strong>—</strong>
                    </Link>
                  ),
                )}
              </div>
              <Notice>
                Атрибуция, боты и неполные события должны учитываться отдельно.
                Аналитика не подключена.
              </Notice>
            </div>
          </>
        ) : id === 207 ? (
          <>
            <Table
              heads={["Раздел", "Canonical", "Индексация", "Статус"]}
              rows={[
                [
                  <Link to={35}>/p/:slug</Link>,
                  "Публичный URL",
                  "После публикации",
                  "Серверный canonical",
                ],
                [
                  <Link to={46}>/u/:handle</Link>,
                  "Публичный профиль",
                  "По настройке",
                  "Серверный canonical",
                ],
                ["/dashboard/*", "—", "noindex", "Проектное правило"],
                ["/admin/*", "—", "noindex", "Проектное правило"],
              ]}
            />
            <Notice>
              История браузера, robots.txt, sitemap.xml, canonical и правила
              noindex формируются сервером. Индексация всё равно зависит от
              поисковой системы и качества опубликованного контента.
            </Notice>
            <FormPanel
              title="Редактор метаданных"
              fields={[
                {
                  label: "URL",
                  key: "url",
                  required: true,
                },
                {
                  label: "Title",
                  key: "title",
                  required: true,
                },
                {
                  label: "Description",
                  key: "description",
                  type: "textarea",
                },
              ]}
            />
          </>
        ) : id === 209 ? (
          <div className="support-layout">
            <div className="panel">
              <Badge>Открыто · DEMO</Badge>
              <h2>Обращение DEMO-001</h2>
              <div className="support-message">
                <strong>Демонстрационный автор</strong>
                <p>Где можно посмотреть статус отправленного проекта?</p>
                <small>Пример обращения, не настоящая переписка</small>
              </div>
              <FormPanel
                fields={[
                  {
                    label: "Ответ",
                    key: "reply",
                    type: "textarea",
                    required: true,
                  },
                ]}
                submit="Сохранить демо-ответ"
              />
              <Notice>
                Письмо пользователю не отправляется. В рабочем режиме ошибка
                отправки сохраняет черновик ответа.
              </Notice>
            </div>
            <aside className="panel">
              <h3>Связанные объекты</h3>
              <Action to={176}>Пользователь</Action>
              <Action to={184}>Проект</Action>
              <Field
                label="Статус"
                value={filter}
                onChange={setFilter}
                options={["Открыто", "В работе", "Эскалация", "Закрыто"]}
              />
              <Button
                onClick={() => a.notify("Статус изменён только в демо-сессии")}
              >
                Сохранить статус
              </Button>
            </aside>
          </div>
        ) : (
          <Empty
            title="Нет доступных данных"
            text="Рабочая интеграция этого раздела ещё не подключена."
            to={174}
            cta="К обзору"
          />
        )}
        <footer className="admin-disclaimer">
          DEMO · Никакие реальные пользователи, платежи или права в этом
          прототипе не изменяются.
        </footer>
      </main>
    </div>
  );
}
const legalSections: Record<
  number,
  {
    title: string;
    sections: [string, string][];
  }
> = {
  223: {
    title: "Обработка персональных данных",
    sections: [
      [
        "Какие данные",
        "Профиль, сведения о проектах, необходимые события безопасности и согласия. Оператор, правовые основания и сроки хранения должны быть указаны перед запуском.",
      ],
      [
        "Ваш выбор",
        "Необязательная аналитика и рассылки требуют отдельного выбора. Публичные поля управляются в настройках профиля.",
      ],
      [
        "Запросы и удаление",
        "Доступ, исправление, экспорт и удаление доступны через обращение оператору. Юридические сроки хранения требуют согласования.",
      ],
    ],
  },
  224: {
    title: "Условия подписки",
    sections: [
      [
        "Состав доступа",
        "Founder Membership включает публикацию по правилам модерации, доступные материалы и клуб после проверки авторства. Лимиты и состав тарифов утверждаются отдельно.",
      ],
      [
        "Оплата и продление",
        "Цена, период и сумма следующего списания показываются до оплаты. Автопродление оформляется только с отдельным согласием, зафиксированным с версией условий.",
      ],
      [
        "Отмена",
        "Будущие списания прекращаются. Доступ действует до конца оплаченного периода. Базовая карточка проекта остаётся публичной.",
      ],
      [
        "Возвраты и ограничения",
        "Основания, сроки и процедура возврата должны быть юридически утверждены. Подписка не гарантирует модерацию, трафик или финансовый результат.",
      ],
    ],
  },
  225: {
    title: "Лицензия библиотеки",
    sections: [
      [
        "Коммерческое применение",
        "Права определяются индивидуальной лицензией материала и её версией на момент получения. Сторонние услуги и API не включены.",
      ],
      [
        "Сохранение прав",
        "Отмена подписки не отменяет ранее предоставленное право коммерческого использования. Новые файлы и версии могут требовать действующей подписки.",
      ],
      [
        "Повторная выдача",
        "Условия доступа к ранее полученному архиву должны быть явно указаны до скачивания. При конфликте прав выдача приостанавливается.",
      ],
    ],
  },
  226: {
    title: "Публикации и модерация",
    sections: [
      [
        "Авторство и содержание",
        "Публикуйте собственные проекты с достоверным описанием и изображениями, на которые у вас есть права.",
      ],
      [
        "Процесс проверки",
        "Заявка может быть одобрена, возвращена с замечаниями или отклонена с понятной причиной. Повторные заявки не должны дублироваться.",
      ],
      [
        "Жалобы и апелляции",
        "Автор может исправить материалы или подать апелляцию. Личные данные заявителей не публикуются.",
      ],
      [
        "Ограничения",
        "Запрещённые категории и юридические формулировки должны быть отдельно утверждены владельцем продукта.",
      ],
    ],
  },
  227: {
    title: "Партнёрская программа",
    sections: [
      [
        "Статус программы",
        "Программа не запущена. Вознаграждения и выплаты не обещаются до публикации согласованных условий.",
      ],
      [
        "Атрибуция",
        "Период учёта, порядок расчёта, отмены при возвратах и ограничения каналов должны быть определены заранее.",
      ],
      [
        "Коммуникация",
        "Спам, скрытые обещания и вымышленные бонусы недопустимы. Данные рефералов защищаются.",
      ],
    ],
  },
  228: {
    title: "Платное продвижение",
    sections: [
      [
        "Маркировка",
        "Платные блоки обозначаются «Реклама» и отделены от органического ранжирования.",
      ],
      [
        "Размещение",
        "Формат, срок, цена и доступность слота подтверждаются до оплаты. Один слот не может быть продан двум заказчикам.",
      ],
      [
        "Результаты",
        "Показы и переходы измеряются отдельно. Посещения, лиды и продажи не гарантируются.",
      ],
      [
        "Отмена и возврат",
        "Правила для отклонённых креативов, конфликтов дат и отмен должны быть утверждены и доступны до покупки.",
      ],
    ],
  },
};
export function SystemPage() {
  const a = useApp(),
    id = Number(a.id);
  const [optional, setOptional] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [q, setQ] = useState("");
  const [checked, setChecked] = useState(false);
  const [toast, setToast] = useState(false);
  if (legalSections[id]) {
    const doc = legalSections[id];
    return (
      <div className="container page article-width">
        <PageHead
          title={doc.title}
          description="Редакция макета 2.0 · 22 октября 2026"
          back={id === 224 ? 109 : 1}
        />
        <Notice tone="warm" title="Не юридический документ">
          Это структура и продуктовые положения из ТЗ. Реквизиты оператора и
          юридические формулировки ещё не утверждены. Нельзя использовать как
          действующую оферту или политику.
        </Notice>
        <nav className="toc">
          {doc.sections.map(([t], i) => (
            <a
              key={t}
              href={"#legal-" + i}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("legal-" + i)?.scrollIntoView();
              }}
            >
              {i + 1}. {t}
            </a>
          ))}
        </nav>
        <article className="prose">
          {doc.sections.map(([t, p], i) => (
            <section key={t} id={"legal-" + i}>
              <h2>
                {i + 1}. {t}
              </h2>
              <p>{p}</p>
            </section>
          ))}
        </article>
        <div className="form-actions">
          <Copy value={location.href} />
          <Action
            to={
              id === 224
                ? 109
                : id === 225
                  ? 67
                  : id === 226
                    ? 119
                    : id === 227
                      ? 151
                      : id === 228
                        ? 158
                        : 149
            }
          >
            {id === 224 ? "Назад к оплате" : "Продолжить"}
          </Action>
        </div>
      </div>
    );
  }
  if (id === 216)
    return (
      <div className="container page narrow">
        <PageHead title="Ваши данные — ваш выбор" back={149} />
        <div className="panel">
          <h2>Настройки согласий</h2>
          <Toggle
            label="Необходимые данные"
            checked
            onChange={() => {}}
            hint="Нужны для работы сессии, безопасности и сохранения выбора."
          />
          <Toggle
            label="Необязательная аналитика"
            checked={optional}
            onChange={setOptional}
            hint="Помогает понять использование продукта. До согласия выключена."
          />
          <Toggle
            label="Маркетинговые рассылки"
            checked={marketing}
            onChange={setMarketing}
          />
          <div className="form-actions">
            <Button
              onClick={() => {
                a.setModel({
                  consents: {
                    optional,
                    marketing,
                  },
                });
                a.notify("Выбор сохранён локально");
                a.back(1);
              }}
            >
              Принять выбор
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                a.setModel({
                  consents: {
                    optional: false,
                    marketing: false,
                  },
                });
                a.notify("Необязательные категории отклонены");
                a.back(1);
              }}
            >
              Отклонить необязательное
            </Button>
          </div>
        </div>
      </div>
    );
  if (id === 217 || id === 218)
    return (
      <AccountShell>
        <PageHead
          title={id === 217 ? "Центр событий" : "Ваши обращения"}
          back={131}
        />
        {id === 218 && a.model.report ? (
          <div className="panel">
            <Badge>{a.model.reportStatus || "Сохранено локально · DEMO"}</Badge>
            <h2>Обращение о проекте</h2>
            <p>{a.model.report}</p>
            <Notice>
              Не отправлено на сервер. Обращения других пользователей не
              доступны.
            </Notice>
          </div>
        ) : (
          <Empty
            title={id === 217 ? "Пока всё спокойно" : "Обращений пока нет"}
            text={
              id === 217
                ? "Статусы модерации, ответы и новости подписки появятся здесь."
                : "Здесь будет история ваших собственных обращений."
            }
            to={id === 217 ? 147 : 19}
            cta={
              id === 217 ? "Настроить уведомления" : "Связаться с поддержкой"
            }
            icon={id === 217 ? "bell" : "chat"}
          />
        )}
      </AccountShell>
    );
  if (id === 222)
    return (
      <div className="container page">
        <PageHead
          title="Давайте разберёмся"
          description="Короткий путь к ответу."
        />
        <Field label="Что вы хотите узнать?" value={q} onChange={setQ} />
        <div className="management-grid">
          {[
            [18, "Частые вопросы", "Подписка, публикация и материалы"],
            [15, "Первый проект", "От идеи до публичной страницы"],
            [67, "Лицензии", "Как использовать скачанное"],
            [99, "Сообщество", "Участие и правила клуба"],
            [155, "Вопрос по оплате", "Статусы, обращения и возвраты"],
            [19, "Написать нам", "Если нужна помощь человека"],
          ]
            .filter((x) =>
              (x[1] + " " + x[2]).toLowerCase().includes(q.toLowerCase()),
            )
            .map(([to, t, d]) => (
              <Link
                to={Number(to)}
                className="management-card"
                key={String(to)}
              >
                <Icon name="file" />
                <h2>{t}</h2>
                <p>{d}</p>
                <Icon name="arrow" />
              </Link>
            ))}
        </div>
      </div>
    );
  if (id === 229)
    return (
      <div className="container page article-width">
        <PageHead
          title="Состояние сервисов"
          description="Только подтверждённые статусы. Отсутствие данных — не зелёный индикатор."
        />
        <div className="panel">
          {[
            "Публичный каталог",
            "Авторизация",
            "Платежи",
            "Выдача файлов",
            "Telegram-клуб",
            "Модерация",
          ].map((t) => (
            <div className="status-line" key={t}>
              <strong>{t}</strong>
              <Badge>Мониторинг не подключён</Badge>
            </div>
          ))}
        </div>
        <Empty
          title="История инцидентов не подключена"
          text="Время восстановления не прогнозируется без данных."
          icon="clock"
        />
        <Button
          onClick={() =>
            a.notify("Источник статуса не подключён. Проверка недоступна.")
          }
        >
          Проверить снова
        </Button>
      </div>
    );
  if (id >= 230)
    return (
      <div className="container page article-width">
        <PageHead
          title={"Компонент " + id + " · " + specs.get(a.id)?.name}
          description="Изолированное представление системного компонента для проверки дизайна."
        />
        {id === 230 ? (
          <Empty
            title="Здесь начнётся ваша история"
            text="Создайте первый проект — он появится в этой области."
            to={119}
            cta="Создать проект"
          />
        ) : id === 231 ? (
          <div className="skeleton-grid" aria-label="Загрузка" aria-busy="true">
            {[0, 1, 2].map((n) => (
              <div className="skeleton-card" key={n}>
                <i />
                <b />
                <span />
                <span />
              </div>
            ))}
          </div>
        ) : id === 232 ? (
          <>
            <Button
              onClick={() =>
                a.notify("Изменения сохранены только в локальном демо-профиле.")
              }
            >
              Показать уведомление
            </Button>
            <Notice tone="danger">
              Критическая ошибка не исчезает автоматически. Повторите действие
              или обратитесь в поддержку.
            </Notice>
          </>
        ) : id === 233 ? (
          <Button
            onClick={() =>
              a.modal(
                <>
                  <h2>Остались несохранённые изменения</h2>
                  <p>
                    Можно продолжить редактирование или уйти без сохранения.
                  </p>
                  <div className="form-actions">
                    <Button onClick={a.close}>Остаться</Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        a.setDirty(false);
                        a.close();
                        a.go(131);
                      }}
                    >
                      Уйти без сохранения
                    </Button>
                  </div>
                </>,
              )
            }
          >
            Показать защиту формы
          </Button>
        ) : id === 234 ? (
          <div className="settings-list">
            {[
              [2, "Проекты"],
              [25, "Стена"],
              [53, "Библиотека"],
              [71, "Инструменты"],
              [93, "Сообщество"],
              [16, "Тарифы"],
            ].map(([to, t]) => (
              <Link key={String(to)} to={Number(to)}>
                {t}
                <Icon name="arrow" />
              </Link>
            ))}
          </div>
        ) : id === 235 ? (
          <>
            <Field label="Поиск" value={q} onChange={setQ} />
            <Button
              onClick={() =>
                a.go(9, {
                  q,
                })
              }
            >
              Найти
            </Button>
          </>
        ) : (
          <Notice>
            Глобальный footer расположен внизу страницы. Все ссылки ведут в
            соответствующие разделы.
          </Notice>
        )}
      </div>
    );
  const data: Record<number, [string, string, string, number]> = {
    210: [
      "404",
      "Здесь пока нет страницы",
      "Ссылка могла измениться или в адресе есть ошибка. Попробуйте каталог проектов.",
      2,
    ],
    211: [
      "500",
      "Что-то пошло не так",
      "Не удалось получить ответ сервера. Повторная проверка не повторяет платёж.",
      229,
    ],
    212: [
      "OFFLINE",
      "Кажется, связь пропала",
      "Локальный черновик может быть не синхронизирован. Не закрывайте браузер, если в нём есть несохранённые файлы.",
      135,
    ],
    213: [
      "403",
      "Для этого нужен другой доступ",
      "Войдите, оформите подписку или подтвердите авторство — в зависимости от действия.",
      102,
    ],
    214: [
      "SESSION",
      "Сессия закончилась",
      "Войдите снова. Повторная авторизация не должна отправлять форму второй раз.",
      102,
    ],
    215: [
      "ПАУЗА",
      "Проводим технические работы",
      "Точное время восстановления пока не подтверждено. Поддержка и юридические документы остаются доступны.",
      229,
    ],
    219: [
      "ОГРАНИЧЕНИЕ",
      "Доступ к аккаунту ограничен",
      "Проверьте правила и подайте апелляцию, если считаете это ошибкой. Вопрос по оплате рассматривается отдельно.",
      19,
    ],
    220: [
      "АРХИВ",
      "Материал больше не доступен",
      "Выдача новых файлов остановлена. Ранее полученные права зависят от лицензии на момент скачивания.",
      53,
    ],
  };
  if (id === 221)
    return (
      <div className="container page narrow">
        <PageHead title="Подтверждение действия" />
        <div className="panel">
          <h2>Удалить демонстрационный черновик?</h2>
          <p>
            Это образец опасного действия. До подтверждения ничего не меняется.
          </p>
          <div className="form-actions">
            <Button variant="secondary" onClick={() => a.back(131)}>
              Отмена
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                a.notify("Подтверждён пример действия. Данные не удалялись.");
                a.back(131);
              }}
            >
              Подтвердить — демо
            </Button>
          </div>
        </div>
      </div>
    );
  const [code, title, description, to] = data[id] || data[210];
  return (
    <div className="container page system-status">
      <span className="system-code">{code}</span>
      <h1>{title}</h1>
      <p>{description}</p>
      <div className="form-actions">
        <Action to={to} variant="primary">
          {to === 2
            ? "Открыть каталог"
            : to === 102
              ? "Войти"
              : to === 19
                ? "Подать обращение"
                : to === 53
                  ? "Открыть библиотеку"
                  : to === 135
                    ? "Мои черновики"
                    : "Состояние сервисов"}
        </Action>
        <Button variant="text" onClick={() => a.back(1)}>
          Назад
        </Button>
      </div>
      {id === 211 && (
        <p className="fine">ID ошибки: DEMO-ERROR · без персональных данных</p>
      )}
      {id === 214 && (
        <Notice>
          В демо сохранён только локальный черновик. Серверная сессия не
          подключена.
        </Notice>
      )}
      {id === 220 && (
        <Action to={19} variant="text">
          Вопрос о ранее скачанном материале
        </Action>
      )}
    </div>
  );
}
