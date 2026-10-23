import React, { useEffect, useRef, useState } from "react";
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
  categories,
  projects,
  resources,
  routeFor,
  sid,
  specs,
  useApp,
} from "./core";
import { api } from "../../lib/api";
import { useProjects } from "../../lib/useProjects";
const faqs = [
  {
    title: "Что входит в Founder Membership?",
    body: "Публикация авторского проекта, доступ к Design Vault, Founder Arsenal и Launch Kits. Вступление в закрытый Telegram-клуб доступно после проверки авторства.",
  },
  {
    title: "Что произойдёт после отмены подписки?",
    body: "Будущие списания отключаются. Доступ к платным функциям и клубу действует до конца оплаченного периода. Базовая карточка проекта остаётся публичной.",
  },
  {
    title: "Можно ли использовать скачанные материалы в коммерческих проектах?",
    body: "Да, если это разрешено лицензией конкретного ресурса. Права на уже полученные материалы сохраняются после отмены. Условия повторного скачивания указываются отдельно.",
  },
  {
    title: "Можно ли разместить проект без собственного сайта?",
    body: "Да. Можно указать публичное демо или репозиторий и выбрать ручное подтверждение авторства. Модератор рассмотрит предоставленные доказательства.",
  },
  {
    title: "Покупка подписки гарантирует публикацию?",
    body: "Нет. Каждый проект проверяется по правилам публикации. При замечаниях автор получает причины и возможность исправить заявку или подать апелляцию.",
  },
  {
    title: "Как работают возвраты?",
    body: "Обращение рассматривается по условиям действующей оферты и конкретного платежа. Автоматический возврат не обещается. В прототипе юридические условия требуют утверждения.",
  },
];
export function Home() {
  const liveProjects = useProjects();
  const a = useApp();
  return (
    <>
      <section className="home-hero">
        <img
          className="hero-scene"
          src="/assets/founders-architecture.jpg"
          alt="Современная студия на берегу горного озера"
        />
        <div className="hero-inner">
          <div className="hero-copy">
            <h1>
              Идеи
              <br />
              становятся
              <br />
              реальными
            </h1>
            <p>
              Каталог независимых проектов, полезные инструменты, закрытое
              сообщество основателей и всё необходимое для запуска и роста — в
              одном месте.
            </p>
            <div className="hero-actions">
              <Action
                to={a.model.logged ? 119 : 102}
                params={{
                  returnTo: "/projects/create",
                }}
                variant="primary"
              >
                Разместить проект
              </Action>
              <Action to={2} variant="white" icon="">
                Смотреть проекты
              </Action>
            </div>
            <div className="hero-note">
              <Icon name="shield" size={19} />
              <span>Для тех, кто создаёт своё. От 299 ₽/мес.</span>
            </div>
          </div>
          <div className="hero-words" aria-hidden="true">
            Продукты
            <br />
            Люди
            <br />
            Идеи
            <br />
            Развитие
          </div>
          <div className="hero-resources">
            {[
              {
                name: "Design Vault",
                desc: "Компоненты и интерфейсы для ваших продуктов",
                to: 53,
                img: "/assets/paymio.jpg",
              },
              {
                name: "Founder Arsenal",
                desc: "Skills, MCP, агенты и конфигурации",
                to: 71,
                img: "/assets/uihunt.jpg",
              },
              {
                name: "Launch Kits",
                desc: "Готовая основа для следующего запуска",
                to: 84,
                img: "/assets/flowstreak.jpg",
              },
              {
                name: "Founders Club",
                desc: "Закрытое сообщество проверенных авторов",
                to: 93,
                img: "/assets/founders-architecture.jpg",
              },
            ].map((r) => (
              <Link key={r.name} to={r.to} className="hero-resource">
                <img src={r.img} alt="" />
                <div>
                  <h3>{r.name}</h3>
                  <p>{r.desc}</p>
                </div>
                <span className="round-arrow">
                  <Icon name="arrow" size={18} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <div className="container home-content">
        <CategoryBar />
        <SectionHead
          title="Откройте новые проекты"
          to={2}
          action="Все проекты"
        />
        {liveProjects.error ? <Notice>{liveProjects.error}</Notice> : <ProjectGrid items={liveProjects.items.slice(0, 6)} />}
        <p className="demo-caption">
          DEMO · Примеры карточек и авторов для демонстрации дизайна. Не
          являются реальными участниками.
        </p>
        <div className="benefit-row">
          <Link to={53} className="benefit vault-benefit">
            <div>
              <h3>Библиотека инструментов</h3>
              <p>
                Компоненты, шаблоны и конфигурации, чтобы не начинать с чистого
                листа.
              </p>
              <span className="btn secondary">
                Перейти в библиотеку <Icon name="arrow" />
              </span>
            </div>
            <img
              src="/assets/paymio.jpg"
              alt=""
            />
          </Link>
          <Link to={93} className="benefit club-benefit">
            <div>
              <h3>Закрытое сообщество</h3>
              <p>Обменивайтесь опытом с теми, кто тоже создаёт свой продукт.</p>
              <span className="btn secondary">
                Узнать о клубе <Icon name="arrow" />
              </span>
            </div>
            <img
              src="/assets/founders-architecture.jpg"
              alt=""
            />
          </Link>
          <Link to={137} className="benefit analytics-benefit">
            <div>
              <h3>Аналитика и рост</h3>
              <p>
                Понимайте, как находят ваш проект. Показы, открытия и переходы
                отдельно.
              </p>
              <span className="btn secondary">
                Узнать больше <Icon name="arrow" />
              </span>
            </div>
            <div className="bar-art" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </Link>
        </div>
        <section className="wall-teaser">
          <div>
            <span className="section-kicker">PROJECT WALL</span>
            <h2>
              Каждый проект —<br />
              часть большой истории.
            </h2>
            <p>
              Исследуйте стену независимых продуктов.
              <br />
              За каждой плиткой — идея и её автор.
            </p>
            <Action to={25}>Исследовать стену</Action>
          </div>
          <div className="mini-wall" aria-hidden="true">
            {Array.from(
              {
                length: 18,
              },
              (_, i) => (
                <span
                  key={i}
                  style={{
                    background: projects[i % 6].color,
                  }}
                >
                  {projects[i % 6].name.slice(0, 2)}
                </span>
              ),
            )}
          </div>
        </section>
        <SectionHead title="Из редакции" to={22} />
        <div className="editorial-row">
          <Link
            to={23}
            params={{
              slug: "first-project",
            }}
            className="journal-cover"
          >
            <img
              src="/assets/founders-architecture.jpg"
              alt="Архитектура и природный свет"
            />
            <div>
              <span>ГИД · DEMO</span>
              <h3>От идеи до первой публичной версии</h3>
            </div>
          </Link>
          <div className="editorial-note">
            <span className="section-kicker">НАЧНИТЕ С МАЛОГО</span>
            <h2>
              Хорошему проекту
              <br />
              нужна своя среда.
            </h2>
            <p>
              Создайте страницу, расскажите о своей работе и найдите инструменты
              для следующего шага.
            </p>
            <Action to={15} variant="text">
              Как устроен Founders Club
            </Action>
          </div>
        </div>
      </div>
    </>
  );
}
export function CategoryBar({
  selected = "Все проекты",
  onSelect,
}: {
  selected?: string;
  onSelect?: (v: string) => void;
}) {
  const a = useApp();
  return (
    <div className="category-bar">
      <div className="category-scroll">
        {categories.map((c, i) => (
          <button
            className={selected === c ? "active" : ""}
            key={c}
            onClick={() =>
              onSelect
                ? onSelect(c)
                : a.go(
                    i ? 7 : 2,
                    i
                      ? {
                          slug: c.toLowerCase(),
                          category: c,
                        }
                      : {},
                  )
            }
          >
            <Icon
              name={
                [
                  "grid",
                  "code",
                  "sun",
                  "file",
                  "grid",
                  "sun",
                  "grid",
                  "file",
                  "grid",
                ][i]
              }
              size={17}
            />
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
const demoProjectFacts: Record<
  string,
  {
    stage: string;
    price: string;
    language: string;
    date: string;
  }
> = {
  mindflow: {
    stage: "MVP",
    price: "Freemium",
    language: "Русский",
    date: "2026-10-20",
  },
  flowstreak: {
    stage: "Запущен",
    price: "Бесплатно",
    language: "Русский",
    date: "2026-10-19",
  },
  uihunt: {
    stage: "Запущен",
    price: "Платно",
    language: "Английский",
    date: "2026-10-18",
  },
  paymio: {
    stage: "MVP",
    price: "Платно",
    language: "Русский",
    date: "2026-10-17",
  },
  gamewiki: {
    stage: "Идея",
    price: "Бесплатно",
    language: "Русский",
    date: "2026-10-16",
  },
  quickqr: {
    stage: "Запущен",
    price: "Freemium",
    language: "Английский",
    date: "2026-10-15",
  },
};
function CatalogFilters({
  values,
  onApply,
}: {
  values: Record<string, string>;
  onApply: (v: Record<string, string>) => void;
}) {
  const a = useApp();
  const [filters, setFilters] = useState({
    category: values.category || "Все проекты",
    stage: values.stage || "Любая стадия",
    price: values.price || "Любая",
  });
  return (
    <>
      <h2>Уточнить поиск</h2>
      <p>Параметры демонстрационных проектов.</p>
      {[
        ["category", "Категория", categories],
        ["stage", "Стадия", ["Любая стадия", "Идея", "MVP", "Запущен"]],
        [
          "price",
          "Модель оплаты",
          ["Любая", "Бесплатно", "Freemium", "Платно"],
        ],
      ].map(([key, label, options]) => (
        <Field
          key={String(key)}
          label={String(label)}
          value={filters[key as keyof typeof filters]}
          options={options as string[]}
          onChange={(v) =>
            setFilters((x) => ({
              ...x,
              [String(key)]: v,
            }))
          }
        />
      ))}
      <div className="form-actions">
        <Button
          variant="secondary"
          onClick={() => {
            onApply({
              category: "",
              stage: "",
              price: "",
            });
            a.close();
          }}
        >
          Сбросить
        </Button>
        <Button
          onClick={() => {
            onApply(filters);
            a.close();
          }}
        >
          Показать проекты
        </Button>
      </div>
    </>
  );
}
export function Catalog() {
  const a = useApp(),
    id = Number(a.id);
  const [q, setQ] = useState(a.params.q || "");
  const { items: catalogProjects, loading, error } = useProjects();
  useEffect(() => setQ(a.params.q || ""), [a.params.q]);
  const category = a.params.category || "Все проекты",
    sort = a.params.sort || "Рекомендуемые";
  const title =
    id === 3
      ? "Новые проекты"
      : id === 4
        ? "Популярные проекты"
        : id === 5
          ? "Проекты недели"
          : id === 6
            ? "Проекты месяца"
            : id === 7
              ? a.params.category || a.params.slug || "Категория"
              : id === 8
                ? "#" + (a.params.slug || "продуктивность")
                : id === 9
                  ? "Найдите то, что вдохновляет"
                  : "Каталог проектов";
  const query = (a.params.q || "").toLowerCase();
  const matches = (value: string) =>
    !query || value.toLowerCase().includes(query);
  const filtered = catalogProjects.filter((p) => {
    const facts = demoProjectFacts[p.slug] || {
      stage: p.stage || "Не указана",
      price: "Не указана",
      language: "Русский",
      date: p.publishedAt?.slice(0, 10) || "",
    };
    return (
      (category === "Все проекты" || p.tag === category) &&
      matches(p.name + " " + p.desc + " " + p.owner) &&
      (!a.params.stage ||
        a.params.stage === "Любая стадия" ||
        facts.stage === a.params.stage) &&
      (!a.params.price ||
        a.params.price === "Любая" ||
        facts.price === a.params.price) &&
      (!a.params.language ||
        a.params.language === "Любой" ||
        facts.language === a.params.language) &&
      (!a.params.from || facts.date >= a.params.from) &&
      (!a.params.until || facts.date <= a.params.until)
    );
  });
  const resultType = id === 9 ? a.params.type || "projects" : "projects";
  const authors = catalogProjects.filter((p) => matches(p.owner + " " + p.name));
  const foundResources = resources.filter((r) =>
    matches(r.name + " " + r.desc + " " + r.type),
  );
  const resultCount =
    resultType === "authors"
      ? authors.length
      : resultType === "resources"
        ? foundResources.length
        : filtered.length;
  const items =
    sort === "По названию"
      ? [...filtered].sort((a, b) => a.name.localeCompare(b.name))
      : sort === "Новые сначала"
        ? [...filtered].sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""))
        : [...filtered].sort((a, b) => (b.votes || 0) - (a.votes || 0));
  const apply = (updates: Record<string, string>) =>
    a.go(id === 9 ? 9 : id === 7 ? 7 : id, {
      ...a.params,
      ...updates,
    });
  const filters = <CatalogFilters values={a.params} onApply={apply} />;
  return (
    <div className="container page">
      <PageHead
        title={title}
        description="Независимые продукты. Разные идеи. Люди, которые делают."
        back={2}
      >
        <Action to={119} variant="primary" icon="plus">
          Добавить проект
        </Action>
      </PageHead>
      <Tabs
        items={[
          [2, "Все проекты"],
          [3, "Новые"],
          [4, "Популярные"],
          [11, "Подборки"],
        ]}
        active={id === 5 || id === 6 ? "004" : a.id}
      />
      {loading && <Notice>Загружаем проекты…</Notice>}
      {error && <Notice>{error} Обновите страницу, чтобы повторить загрузку.</Notice>}
      <form
        className="catalog-search"
        onSubmit={(e) => {
          e.preventDefault();
          a.go(9, {
            q,
          });
        }}
      >
        <Icon name="search" />
        <input
          aria-label="Поиск проектов"
          placeholder="Название, автор или задача…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Button type="submit">Найти</Button>
      </form>
      {[4, 5, 6].includes(id) && (
        <div className="toolbar">
          <Tabs
            items={[
              [4, "За всё время"],
              [5, "За неделю"],
              [6, "За месяц"],
            ]}
          />
          <Notice>
            Рейтинг появится после накопления проверенных голосов. Сейчас
            показаны демонстрационные проекты без ранжирования.
          </Notice>
        </div>
      )}
      <CategoryBar
        selected={category}
        onSelect={(c) =>
          apply({
            category: c,
          })
        }
      />
      <div className="list-toolbar">
        <span>
          Найдено: {resultCount} <Demo />
        </span>
        <div>
          <Button
            variant="secondary"
            icon="filter"
            onClick={() => a.modal(filters)}
          >
            Фильтры
          </Button>
          <label className="sort-label">
            <span className="sr-only">Сортировка</span>
            <select
              value={sort}
              onChange={(e) =>
                apply({
                  sort: e.target.value,
                })
              }
            >
              {["Рекомендуемые", "Новые сначала", "По названию"].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
      {id === 9 && (
        <div className="segmented" aria-label="Тип результатов">
          {[
            ["projects", "Проекты"],
            ["authors", "Авторы"],
            ["resources", "Ресурсы"],
          ].map(([type, label]) => (
            <button
              key={type}
              aria-pressed={resultType === type}
              className={resultType === type ? "active" : ""}
              onClick={() =>
                apply({
                  type,
                })
              }
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {resultType === "projects" ? (
        items.length ? (
          <ProjectGrid items={items} />
        ) : (
          <Empty
            title="Не нашли совпадений"
            text="Попробуйте другой запрос или сбросьте фильтры."
            to={2}
            cta="Сбросить фильтры"
            icon="search"
          />
        )
      ) : resultType === "authors" ? (
        authors.length ? (
          <div className="resource-grid">
            {authors.map((p) => (
              <Link
                className="panel"
                key={p.owner}
                to={46}
                params={{
                  handle: p.owner,
                }}
              >
                <Avatar name={p.initials} color={p.color} />
                <h3>@{p.owner}</h3>
                <p>Автор проекта {p.name} · DEMO</p>
                <span className="inline-link">
                  Открыть профиль <Icon name="arrow" />
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <Empty
            title="Авторы не найдены"
            text="Попробуйте имя автора или название проекта."
            icon="search"
          />
        )
      ) : foundResources.length ? (
        <div className="resource-grid">
          {foundResources.map((r) => (
            <Link
              className="panel"
              key={r.slug}
              to={60}
              params={{
                slug: r.slug,
              }}
            >
              <Badge>{r.type}</Badge>
              <h3>{r.name}</h3>
              <p>{r.desc}</p>
              <span className="inline-link">
                Открыть ресурс <Icon name="arrow" />
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <Empty
          title="Ресурсы не найдены"
          text="Попробуйте другое название или задачу."
          icon="search"
        />
      )}
      <div className="pagination">
        <span>Страница 1 из 1</span>
        <Button disabled variant="secondary">
          Назад
        </Button>
        <Button disabled variant="secondary">
          Далее
        </Button>
      </div>
    </div>
  );
}
export function Pricing({ compare = false }: { compare?: boolean }) {
  const a = useApp();
  return (
    <div className="container page pricing-page">
      <PageHead
        title={compare ? "Всё прозрачно. До оплаты." : "Среда для ваших идей."}
        description="Выберите доступ, который нужен вашему проекту. Отменить продление можно в любой момент."
      />
      <div className="pricing-plans">
        {[
          {
            name: "Founder",
            price: "299",
            desc: "Для первого независимого проекта",
            features: [
              "Публикация проекта и его обновлений",
              "Design Vault и Founder Arsenal",
              "Launch Kits для старта",
              "Клуб после подтверждения авторства",
              "Базовая аналитика проекта",
            ],
          },
          {
            name: "Founder Plus",
            price: "699",
            desc: "Для тех, кто создаёт несколько",
            features: [
              "Всё, что входит в Founder",
              "До 3 активных проектов*",
              "Расширенный набор материалов*",
              "Расширенная аналитика*",
              "Раздельные доступы команды",
            ],
          },
        ].map((p, i) => (
          <article className={"plan " + (!i ? "featured" : "")} key={p.name}>
            <div className="plan-label">
              <h2>{p.name}</h2>
              {!i && <Badge tone="warm">Начните здесь</Badge>}
            </div>
            <p>{p.desc}</p>
            <div className="price">
              {p.price}
              <span> ₽ / месяц</span>
            </div>
            <ul className="check-list">
              {p.features.map((x) => (
                <li key={x}>
                  <Icon name="check" />
                  {x}
                </li>
              ))}
            </ul>
            <Button
              variant={i ? "secondary" : "primary"}
              onClick={() => {
                a.setModel({
                  checkoutPlan: i ? "Plus" : "Founder",
                  purchaseKind: "subscription",
                });
                a.go(a.model.logged ? 109 : 102, {
                  plan: i ? "plus" : "founder",
                  returnTo: "/checkout?plan=" + (i ? "plus" : "founder"),
                });
              }}
            >
              Выбрать {p.name}
              <Icon name="arrow" />
            </Button>
            <small>Ежемесячное автопродление с отдельным согласием</small>
          </article>
        ))}
      </div>
      <Notice title="Параметры проектного предложения">
        * Лимиты Founder 1 / Plus 3 и состав Plus рекомендованы в ТЗ 2.0 и
        требуют утверждения. Локально заказ подтверждается mock-провайдером без
        списания; на хостинге нужен выбранный платёжный провайдер.
      </Notice>
      {compare ? (
        <Table
          heads={["Возможности", "Founder", "Founder Plus"]}
          rows={[
            "Активные проекты*|1|До 3",
            "Публичная карточка после отмены|Сохраняется|Сохраняется",
            "Уже скачанные лицензии|Сохраняются|Сохраняются",
            "Клуб|После проверки|После проверки",
            "Отмена автопродления|В любой момент|В любой момент",
          ].map((r) => r.split("|"))}
        />
      ) : (
        <div className="center">
          <Action to={17} variant="text">
            Сравнить все возможности
          </Action>
        </div>
      )}
      <section className="faq-section">
        <h2>Важное о подписке</h2>
        <Accordion items={faqs.slice(0, 3)} />
      </section>
    </div>
  );
}
export function PublicEditorial() {
  const a = useApp(),
    id = Number(a.id);
  const [search, setSearch] = useState("");
  const [random, setRandom] = useState(0);
  const title = specs.get(a.id)?.name || "";
  if (id === 16 || id === 17) return <Pricing compare={id === 17} />;
  if (id === 13)
    return (
      <div className="container page narrow">
        <PageHead
          title="Случайная находка"
          description="Иногда лучшее открытие — то, которое не искали."
          back={2}
        />
        <ProductCard project={projects[random]} />
        <div className="form-actions">
          <Button
            onClick={() => setRandom((n) => (n + 1) % projects.length)}
            icon="arrow"
          >
            Другой проект
          </Button>
          <Action
            to={35}
            params={{
              slug: projects[random].slug,
            }}
          >
            Открыть подробнее
          </Action>
        </div>
      </div>
    );
  if (id === 10)
    return (
      <div className="container page narrow">
        <PageHead title="Расширенный поиск" back={9} />
        <FormPanel
          fields={[
            {
              label: "Поисковый запрос",
              key: "q",
            },
            {
              label: "Категория",
              key: "category",
              options: categories,
            },
            {
              label: "Стадия",
              key: "stage",
              options: ["Любая стадия", "Идея", "MVP", "Запущен"],
            },
            {
              label: "Модель оплаты",
              key: "price",
              options: ["Любая", "Бесплатно", "Freemium", "Платно"],
            },
            {
              label: "Язык",
              key: "language",
              options: ["Любой", "Русский", "Английский"],
            },
            {
              label: "Опубликован после",
              key: "from",
              type: "date",
            },
            {
              label: "Опубликован до",
              key: "until",
              type: "date",
            },
            {
              label: "Теги",
              key: "tags",
            },
          ]}
          submit="Применить фильтры"
          onSubmit={(data) => {
            if (data.from && data.until && data.from > data.until) {
              a.notify("Начальная дата не может быть позже конечной");
              return;
            }
            a.go(9, data);
          }}
        />
      </div>
    );
  if (id === 18)
    return (
      <div className="container page article-width">
        <PageHead
          title="Ответы на важные вопросы"
          description="Публикации, подписка, материалы и сообщество — без мелкого шрифта."
        />
        <Field
          label="Поиск по вопросам"
          value={search}
          onChange={setSearch}
          placeholder="Например, отмена подписки"
        />
        {faqs.filter((f) =>
          (f.title + " " + f.body).toLowerCase().includes(search.toLowerCase()),
        ).length ? (
          <Accordion
            items={faqs.filter((f) =>
              (f.title + " " + f.body)
                .toLowerCase()
                .includes(search.toLowerCase()),
            )}
          />
        ) : (
          <Empty
            title="Такого вопроса пока нет"
            text="Напишите нам — поможем разобраться."
            to={19}
            cta="Связаться"
          />
        )}
        <div className="help-band">
          <h3>Не нашли ответ?</h3>
          <Action to={19}>Задать вопрос</Action>
        </div>
      </div>
    );
  if (id === 19)
    return (
      <div className="container page">
        <PageHead
          title="Давайте поговорим"
          description="Есть вопрос, идея или нужна помощь с проектом?"
        />
        <div className="split-layout">
          <div>
            <h2>Мы на связи</h2>
            <p>
              Выберите тему обращения и опишите ситуацию. Не отправляйте пароли,
              данные банковской карты и личные документы.
            </p>
            <Notice>
              Обращение сохраняется в очереди поддержки. Для ответа в личном кабинете войдите перед отправкой.
            </Notice>
            <Action to={18} variant="text">
              Возможно, ответ уже есть в FAQ
            </Action>
          </div>
          <FormPanel
            fields={[
              {
                label: "Ваш email",
                key: "email",
                type: "email",
                required: true,
              },
              {
                label: "Тема",
                key: "topic",
                options: [
                  "Общий вопрос",
                  "Публикация проекта",
                  "Оплата и подписка",
                  "Материалы и лицензии",
                  "Сообщество",
                  "Жалоба",
                ],
              },
              {
                label: "Сообщение",
                key: "message",
                type: "textarea",
                required: true,
              },
            ]}
            submit="Отправить обращение"
          >
            <p className="fine">
              Обработка обращения — согласно{" "}
              <Link to={223}>политике конфиденциальности</Link>.
            </p>
          </FormPanel>
        </div>
      </div>
    );
  if (id === 20 || id === 21)
    return (
      <div className="container page article-width">
        <PageHead
          title={
            id === 20
              ? "Рекомендуйте то, что вам близко."
              : "Партнёр Founders Club"
          }
          description="Партнёрская программа для авторов и сообществ."
        />
        <Notice title="Программа готовится к запуску">
          Условия вознаграждений и атрибуции ещё не утверждены. Сейчас можно
          оставить интерес к участию — без обещания начислений.
        </Notice>
        <div className="feature-lines">
          <div>
            <span>01</span>
            <h3>Знакомство с продуктом</h3>
            <p>Сначала оцените полезность платформы для вашей аудитории.</p>
          </div>
          <div>
            <span>02</span>
            <h3>Прозрачные условия</h3>
            <p>
              Комиссии, возвраты и правила атрибуции будут опубликованы до
              старта.
            </p>
          </div>
          <div>
            <span>03</span>
            <h3>Осмысленная рекомендация</h3>
            <p>Никакого спама, вымышленных бонусов и скрытых обещаний.</p>
          </div>
        </div>
        <Action to={151} variant="primary">
          Оставить интерес
        </Action>
        <Action to={227} variant="text">
          Условия программы
        </Action>
      </div>
    );
  if (id === 11 || id === 12 || id === 22)
    return (
      <div className="container page">
        <PageHead
          title={
            id === 22
              ? "Журнал о тех, кто делает."
              : id === 12
                ? "Инструменты для спокойной работы"
                : "Хорошие проекты. Вместе."
          }
          description={
            id === 22
              ? "Идеи, практические заметки и опыт создания независимых продуктов."
              : "Тематические подборки редакции — не рекламный рейтинг."
          }
          back={id === 12 ? 11 : 1}
        />
        {id === 12 ? (
          <>
            <p className="fine">
              Редакционная подборка · DEMO · 22 октября 2026
            </p>
            <p className="lead">
              Планировать, записывать, создавать. Небольшие инструменты для
              больших замыслов.
            </p>
            <ProjectGrid items={projects.slice(0, 4)} />
          </>
        ) : (
          <>
            <div className="editorial-grid">
              {[
                "Рабочий день без лишнего шума",
                "От идеи до первой версии",
                "Дизайн, который помогает",
              ].map((x, i) => (
                <Link
                  key={x}
                  to={id === 22 ? 23 : 12}
                  params={{
                    slug: ["first-project", "first-version", "useful-design"][
                      i
                    ],
                  }}
                  className="editorial-card"
                >
                  <img
                    src={
                      [
                        "/assets/founders-architecture.jpg",
                        "/assets/flowstreak.jpg",
                        "/assets/uihunt.jpg",
                      ][i]
                    }
                    alt=""
                  />
                  <div>
                    <span className="fine">
                      {id === 22 ? "Гид" : "Подборка"} · DEMO
                    </span>
                    <h2>{x}</h2>
                    <p>
                      Практичные идеи и полезные находки для самостоятельных
                      авторов.
                    </p>
                    <span className="inline-link">
                      Читать <Icon name="arrow" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <Notice>
              Демонстрационные редакционные материалы. Фактические авторы и даты
              появятся после подключения CMS.
            </Notice>
          </>
        )}
      </div>
    );
  if (id === 23)
    return (
      <div className="container page article-width">
        <PageHead
          title="От идеи до первой публичной версии"
          description="Короткий гид для независимого автора. Демонстрационный редакционный материал."
          back={22}
        />
        <img
          className="article-cover"
          src="/assets/founders-architecture.jpg"
          alt="Рабочая студия на берегу озера"
        />
        <div className="article-meta">
          <Demo />
          <span>Редакция · 22 октября 2026 · 5 минут</span>
          <Copy value={location.href} label="Поделиться" />
        </div>
        <aside className="toc">
          <strong>В этой статье</strong>
          <a
            href="#problem"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("problem")?.scrollIntoView();
            }}
          >
            01. Сформулируйте задачу
          </a>
          <a
            href="#prototype"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("prototype")?.scrollIntoView();
            }}
          >
            02. Сделайте маленькую версию
          </a>
          <a
            href="#publish"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("publish")?.scrollIntoView();
            }}
          >
            03. Расскажите о результате
          </a>
        </aside>
        <article className="prose">
          <h2 id="problem">Начните с понятной задачи</h2>
          <p>
            За сильным проектом обычно стоит конкретная потребность. Опишите,
            кому вы помогаете и что человек сможет сделать проще. Такой фокус
            помогает принимать решения о первой версии.
          </p>
          <blockquote>
            Первая версия не обязана уметь всё. Она должна хорошо решать одну
            задачу.
          </blockquote>
          <h2 id="prototype">Соберите работающий сценарий</h2>
          <p>
            Выберите один путь пользователя и пройдите его целиком. Проверьте не
            только счастливый финал, но и ошибку, пустое состояние, возврат
            назад и использование на телефоне.
          </p>
          <h2 id="publish">Покажите то, что уже работает</h2>
          <p>
            Подготовьте ясное описание, настоящие скриншоты и список
            ограничений. Честный рассказ о стадии продукта полезнее обещаний,
            которые пока нечем подтвердить.
          </p>
        </article>
        <Action to={119} variant="primary">
          Создать страницу проекта
        </Action>
      </div>
    );
  if (id === 24)
    return (
      <div className="container page article-width">
        <PageHead
          title="Платформа развивается"
          description="Новые возможности, улучшения и исправления — в одном месте."
        />
        <Empty
          title="История релизов появится здесь"
          text="Пока нет подтверждённых релизов, мы не показываем вымышленные обновления."
          to={147}
          cta="Настроить уведомления"
          icon="clock"
        />
      </div>
    );
  return (
    <div className="container page">
      <PageHead
        title={
          id === 14
            ? "Место для тех, кто создаёт."
            : "От идеи — к своему проекту."
        }
        description="Founders Club соединяет независимые продукты, полезные инструменты и опыт авторов."
      />
      <div className="about-hero">
        <img
          src="/assets/founders-architecture.jpg"
          alt="Архитектурная студия с видом на горы"
        />
        <div>
          <h2>
            Не обещаем успех.
            <br />
            Создаём условия для работы.
          </h2>
          <p>
            Публикуйте свои проекты, находите инструменты и обсуждайте решения с
            другими основателями. Мы не гарантируем трафик, инвестиции или
            продажи.
          </p>
          <Action to={119} variant="primary">
            Начать с проекта
          </Action>
        </div>
      </div>
      <div className="feature-lines">
        {[
          "Расскажите о проекте",
          "Пройдите модерацию",
          "Соберите свои инструменты",
          "Найдите сообщество",
        ].map((t, i) => (
          <div key={t}>
            <span>0{i + 1}</span>
            <h3>{t}</h3>
            <p>
              {
                [
                  "Название, описание и реальные изображения помогут людям понять вашу идею.",
                  "Проверка авторства и правил защищает каталог от спама.",
                  "Компоненты, инструкции и наборы помогают делать следующий шаг.",
                  "Клуб открыт авторам с активной подпиской и подтверждённым проектом.",
                ][i]
              }
            </p>
            <Link to={[119, 226, 53, 93][i]}>
              Подробнее <Icon name="arrow" />
            </Link>
          </div>
        ))}
      </div>
      <SectionHead title="Есть вопросы?" to={18} />
      <Accordion items={faqs.slice(0, 3)} />
    </div>
  );
}
function GalleryDialog({
  images,
  title,
  initial = 0,
}: {
  images: string[];
  title: string;
  initial?: number;
}) {
  const [index, setIndex] = useState(initial);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        setIndex(
          (n) =>
            (n + (e.key === "ArrowRight" ? 1 : images.length - 1)) %
            images.length,
        );
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [images.length]);
  return (
    <>
      <h2>{title} — медиагалерея</h2>
      <p>DEMO · Концептуальные изображения продукта</p>
      <img
        className="lightbox-image"
        src={images[index]}
        alt={title + " — изображение " + (index + 1)}
      />
      <div className="form-actions">
        <Button
          variant="secondary"
          onClick={() =>
            setIndex((n) => (n + images.length - 1) % images.length)
          }
        >
          Предыдущее
        </Button>
        <span aria-live="polite">
          {index + 1} / {images.length}
        </span>
        <Button onClick={() => setIndex((n) => (n + 1) % images.length)}>
          Следующее
        </Button>
      </div>
    </>
  );
}
export function ProjectPage() {
  const a = useApp(), id = Number(a.id);
  const [remoteProject, setRemoteProject] = useState<any>(null);
  const [remoteState, setRemoteState] = useState<"idle" | "loading" | "ready" | "missing" | "error">("loading");
  const [projectRetry, setProjectRetry] = useState(0);
  useEffect(() => {
    if (remoteProject) document.title = `${remoteProject.name} — Founders Club`;
    if (remoteState === "missing") document.querySelector('meta[name="robots"]')?.setAttribute('content', 'noindex,nofollow');
  }, [remoteProject, remoteState]);
  const localProject =
      a.params.slug === "my-project" ||
      (a.model.draft.slug && a.params.slug === a.model.draft.slug)
        ? {
            ...projects[0],
            slug: a.model.draft.slug || "my-project",
            name: a.model.draft.name || "Мой проект",
            desc: a.model.draft.short || "Описание пока не добавлено",
            tag: a.model.draft.category || "SaaS",
            owner: a.model.handle,
            initials: a.model.name.slice(0, 2),
            image: a.model.media?.[0]?.url || projects[0].image,
          }
        : projects.find((p) => p.slug === a.params.slug);
  useEffect(() => {
    let alive = true;
    if (a.params.slug === "my-project" && a.model.draft.name) {
      setRemoteState("idle");
      setRemoteProject(null);
      return;
    }
    setRemoteState("loading");
    setRemoteProject(null);
    void api
      .publicProject(a.params.slug)
      .then((project) => {
        if (!alive) return;
        setRemoteProject(project);
        setRemoteState("ready");
      })
      .catch((error) => { if (alive) setRemoteState(error.status === 404 ? "missing" : "error"); });
    return () => { alive = false; };
  }, [a.params.slug, projectRetry]);
  const p = remoteProject
    ? {
        ...projects[0],
        slug: remoteProject.slug as string,
        name: remoteProject.name as string,
        desc: remoteProject.short_description as string,
        description: remoteProject.description as string,
        tag: remoteProject.category as string,
        owner: (remoteProject.owner_handle || "founder") as string,
        initials: String(remoteProject.name).slice(0, 2).toUpperCase(),
        image: (remoteProject.cover_url || projects[0].image) as string,
        websiteUrl: (remoteProject.website_url || "") as string,
        stage: (remoteProject.stage || "Не указана") as string,
        isDemo: !!remoteProject.is_demo,
      }
    : localProject || projects[0];
  const isDemo = remoteProject ? !!remoteProject.is_demo : p.slug !== a.model.draft.slug;
  const params = {
      slug: p.slug,
    };
  const [media, setMedia] = useState(0);
  const [review, setReview] = useState(a.model.review || "");
  const voted = a.model.vote.includes(p.slug);
  const gallery: string[] =
    a.model.draft.slug === p.slug && a.model.media?.length
      ? a.model.media.map((m: { url: string }) => m.url)
      : remoteProject?.media?.length ? remoteProject.media.map((item: { url: string }) => item.url) : [p.image];
  const openGallery = () =>
    a.modal(<GalleryDialog images={gallery} title={p.name} initial={media} />);
  if (remoteState === "error") return <div className="container page"><Empty title="Не удалось загрузить проект" text="Проверьте подключение и повторите запрос." /><Button onClick={() => setProjectRetry(value => value + 1)}>Повторить</Button></div>;
  if (remoteState === "loading" || (remoteProject && remoteProject.slug !== a.params.slug))
    return (
      <div className="container page" aria-busy="true">
        <PageHead title="Загружаем проект" />
        <div className="skeleton-grid"><div className="skeleton-card"><i /><b /><span /></div></div>
      </div>
    );
  if (id === 45 || remoteState === "missing")
    return (
      <div className="container page">
        <PageHead title="Проект недоступен" />
        <Empty
          title="Этот проект сейчас недоступен"
          text="Он мог быть скрыт автором или снят с публикации. Частные причины модерации не публикуются."
          to={2}
        />
        <SectionHead title="Другие идеи для вдохновения" />
        <ProjectGrid items={projects.slice(0, 3)} />
      </div>
    );
  if (id === 43)
    return (
      <div className="container page narrow">
        <PageHead title="Поделиться проектом" back={35} />
        <ProductCard project={p} />
        <Field
          label="Публичная ссылка"
          value={location.origin + routeFor(35, params)}
          onChange={() => {}}
        />
        <Copy
          value={location.origin + routeFor(35, params)}
        />
      </div>
    );
  if (id === 44)
    return (
      <div className="container page narrow">
        <PageHead
          title="Сообщить о проблеме"
          description={
            "Жалоба на " + p.name + ". Её текст увидит только модерация."
          }
          back={35}
        />
        <FormPanel
          fields={[
            {
              label: "Причина",
              key: "reason",
              options: [
                "Нарушение авторских прав",
                "Вводит в заблуждение",
                "Запрещённый контент",
                "Спам",
                "Другая причина",
              ],
            },
            {
              label: "Что произошло?",
              key: "message",
              type: "textarea",
              required: true,
            },
            {
              label: "Ссылка на подтверждение",
              key: "evidence",
              type: "url",
            },
          ]}
          submit="Отправить на рассмотрение"
          onSubmit={async (d) => {
            if (!a.model.logged) {
              a.setModel({ returnTo: routeFor(44, params) });
              a.go(102);
              return;
            }
            await api.reportProject(p.slug, d.reason, [d.message, d.evidence].filter(Boolean).join("\n\n"));
            a.setModel({
              report: d.message,
            });
            a.notify("Жалоба отправлена модерации.");
            a.go(218);
          }}
        />
      </div>
    );
  return (
    <div className="container page project-page">
      <button className="back-link" onClick={() => a.back(2)}>
        <Icon name="back" />К проектам
      </button>
      <div className="project-title">
        <div
          className="product-mark"
          style={{
            background: p.color,
          }}
        >
          {p.name.slice(0, 2)}
        </div>
        <div>
          <div className="inline">
            <Badge>{p.tag}</Badge>
            {isDemo && <Demo />}
          </div>
          <h1>{p.name}</h1>
          <p>{p.desc}</p>
        </div>
        <div className="project-primary">
          <Button
            icon="external"
            onClick={() => {
              if (!isDemo && /^https?:\/\//i.test((p as any).websiteUrl || "")) {
                window.open((p as any).websiteUrl, "_blank", "noopener,noreferrer");
                return;
              }
              a.modal(
                <>
                  <h2>{isDemo ? "Демонстрационный проект" : "Ссылка пока не указана"}</h2>
                  <p>
                    {isDemo ? "У демонстрационной карточки нет действующего сайта." : "Автор не добавил публичный сайт или демо проекта."}
                  </p>
                  <Button onClick={a.close}>Понятно</Button>
                </>,
              );
            }}
          >
            Открыть сайт
          </Button>
          <Button
            variant={voted ? "warm" : "secondary"}
            icon="heart"
            onClick={async () => {
              if (!a.model.logged) {
                a.setModel({
                  returnTo: routeFor(35, params),
                });
                a.go(102);
                return;
              }
              try {
                const result = await api.voteProject(p.slug);
                a.setModel((m) => ({
                  vote: result.voted
                    ? [...new Set([...m.vote, p.slug])]
                    : m.vote.filter((x) => x !== p.slug),
                }));
                a.notify(result.voted ? "Голос учтён" : "Голос отменён");
              } catch (error) {
                a.notify(error instanceof Error ? error.message : "Не удалось сохранить голос.");
              }
            }}
          >
            {voted ? "Вы поддержали" : "Поддержать"}
          </Button>
        </div>
      </div>
      <Tabs
        items={[
          [35, "Обзор"],
          [37, "О проекте"],
          [36, "Медиа"],
          [38, "Обновления"],
          [39, "Отзывы"],
          [40, "Команда"],
          [42, "Статистика"],
        ]}
        params={params}
      />
      <div className="project-layout">
        <main>
          {id === 35 && (
            <>
              <button
                className="large-project-art"
                aria-label="Открыть галерею проекта"
                onClick={() => a.go(36, params)}
              >
                <img src={p.image} alt={"Демо-интерфейс " + p.name} />
                <span>
                  <Icon name="grid" />
                  Посмотреть галерею
                </span>
              </button>
              <section className="prose">
                <h2>Создано, чтобы упростить ваш день.</h2>
                <p>
                  {remoteProject
                    ? remoteProject.description
                    : p.slug === a.model.draft.slug
                    ? a.model.draft.description
                    : p.desc +
                      " Этот демонстрационный пример показывает структуру страницы проекта с описанием, медиа и контактами создателя."}
                </p>
                <Action to={37} params={params} variant="text">
                  Узнать больше о проекте
                </Action>
              </section>
            </>
          )}
          {id === 36 && (
            <>
              <div className="gallery-main">
                <img src={gallery[media]} alt={"Демо-экран " + (media + 1)} />
                <button
                  className="gallery-open"
                  aria-label="Увеличить изображение"
                  onClick={openGallery}
                >
                  <Icon name="external" />
                </button>
              </div>
              <div className="gallery-thumbs">
                {gallery.map((src, i) => (
                  <button
                    aria-label={"Изображение " + (i + 1)}
                    aria-pressed={media === i}
                    className={media === i ? "active" : ""}
                    key={src}
                    onClick={() => setMedia(i)}
                  >
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
              <p className="fine">
                DEMO · {media + 1} из {gallery.length} · Изображения концепций,
                не реальные скриншоты
              </p>
            </>
          )}
          {id === 37 && (
            <article className="prose">
              <h2>Какая задача стоит за {p.name}</h2>
              <p>
                {p.desc} Вместо сложного набора функций — короткий путь от
                намерения до результата.
              </p>
              <h2>Для кого этот проект</h2>
              <p>
                Для независимых авторов, небольших команд и людей, которые ценят
                продуманные инструменты. Текст демонстрирует структуру описания,
                а не заявляет фактические свойства продукта.
              </p>
              <h2>Стадия и технологии</h2>
              <div className="inline">
                <Badge>Демо-концепция</Badge>
                <Badge>React</Badge>
                <Badge>TypeScript</Badge>
              </div>
            </article>
          )}
          {id === 38 && (
            <Empty
              title="История только начинается"
              text="Когда автор опубликует обновление, оно появится здесь."
              to={143}
              cta="Следить за обновлениями"
              icon="clock"
            />
          )}
          {id === 39 && (
            <>
              {remoteProject?.reviewItems?.length ? remoteProject.reviewItems.map((item: any) => <article className="panel" key={item.id}>
                <strong>{item.name} · @{item.handle}</strong><p>{item.body}</p>
                <small>{new Date(item.created_at).toLocaleDateString("ru-RU")}</small>
              </article>) : <Empty
                title="Пока без отзывов"
                text="Здесь будут настоящие впечатления пользователей. Мы не придумываем отзывы."
                icon="chat"
              />}
              <form
                className="panel"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!a.model.logged) {
                    a.setModel({
                      returnTo: routeFor(39, params),
                      review,
                    });
                    a.setDirty(false);
                    a.go(102);
                    return;
                  }
                  if (review.trim().length < 10) {
                    a.notify("Отзыв должен содержать не меньше 10 символов.");
                    return;
                  }
                  void api
                    .reviewProject(p.slug, review)
                    .then(async () => {
                      a.setModel({ review });
                      const project = await api.publicProject(p.slug);
                      setRemoteProject(project);
                      setReview("");
                      a.setDirty(false);
                      a.notify("Отзыв опубликован.");
                    })
                    .catch((error) =>
                      a.notify(error instanceof Error ? error.message : "Не удалось опубликовать отзыв."),
                    );
                }}
              >
                <h2>Поделитесь впечатлением</h2>
                <Field
                  label="Ваш отзыв"
                  type="textarea"
                  value={review}
                  required
                  onChange={(v) => {
                    setReview(v);
                    a.setDirty(true);
                  }}
                />
                <Button type="submit">
                  {a.model.logged
                    ? "Опубликовать отзыв"
                    : "Войти и оставить отзыв"}
                </Button>
              </form>
            </>
          )}
          {id === 40 && (
            <div className="founder-row">
              <Avatar name={p.initials} color={p.color} large />
              <div>
                <Demo />
                <h2>@{p.owner}</h2>
                <p>Основатель проекта</p>
                <Action
                  to={46}
                  params={{
                    handle: p.owner,
                  }}
                >
                  Профиль автора
                </Action>
              </div>
            </div>
          )}
          {id === 41 && (
            <>
              <h2>Похожи по задаче, разные по подходу</h2>
              <ProjectGrid
                items={projects.filter((x) => x.slug !== p.slug).slice(0, 3)}
              />
            </>
          )}
          {id === 42 && (
            <>
              <h2>Публичная статистика</h2>
              <Notice>
                Метрики не подключены. Автор сможет управлять видимостью
                показателей. Ноль и отсутствие данных — разные состояния.
              </Notice>
              <StatCards />
              <Action to={137}>Аналитика для автора</Action>
            </>
          )}
        </main>
        <aside className="project-sidebar">
          <div className="panel founder-panel">
            <span className="section-kicker">СОЗДАТЕЛЬ ПРОЕКТА</span>
            <Link
              to={46}
              params={{
                handle: p.owner,
              }}
              className="founder-row"
            >
              <Avatar name={p.initials} color={p.color} large />
              <div>
                <strong>@{p.owner}</strong>
                <p>Независимый автор</p>
                <Demo />
              </div>
            </Link>
            <Link
              to={46}
              params={{
                handle: p.owner,
              }}
              className="inline-link"
            >
              Профиль основателя <Icon name="arrow" />
            </Link>
          </div>
          <dl className="project-facts">
            <div>
              <dt>Категория</dt>
              <dd>
                <Link
                  to={7}
                  params={{
                    category: p.tag,
                    slug: p.tag.toLowerCase(),
                  }}
                >
                  {p.tag}
                </Link>
              </dd>
            </div>
            <div>
              <dt>Стадия</dt>
              <dd>
                {remoteProject
                  ? remoteProject.stage
                  : p.slug === a.model.draft.slug
                  ? a.model.draft.stage
                  : demoProjectFacts[p.slug]?.stage || "Демо-концепция"}{" "}
                · DEMO
              </dd>
            </div>
            <div>
              <dt>Модель</dt>
              <dd>{demoProjectFacts[p.slug]?.price || "Не указана"} · DEMO</dd>
            </div>
            <div>
              <dt>Проверка</dt>
              <dd>Не проводилась</dd>
            </div>
          </dl>
          <Action to={43} params={params} variant="secondary" icon="copy">
            Поделиться проектом
          </Action>
          <Link to={44} params={params} className="report-link">
            <Icon name="flag" size={16} />
            Сообщить о проблеме
          </Link>
        </aside>
      </div>
      <section className="related-section">
        <SectionHead title="Ещё несколько находок" to={2} />
        <ProjectGrid
          items={projects.filter((x) => x.slug !== p.slug).slice(0, 4)}
        />
      </section>
    </div>
  );
}
export function Profile() {
  const a = useApp(),
    id = Number(a.id),
    p = projects.find((x) => x.owner === a.params.handle) || projects[0],
    mine = a.params.handle === a.model.handle;
  const name = mine ? a.model.name : "@" + p.owner;
  return (
    <div className="container page">
      <button className="back-link" onClick={() => a.back(35)}>
        <Icon name="back" />
        Назад к проекту
      </button>
      <section className="profile-hero">
        <Avatar
          name={mine ? a.model.name.slice(0, 2).toUpperCase() : p.initials}
          color={p.color}
          large
        />
        <div>
          <Demo />
          <h1>{name}</h1>
          <p>
            {mine
              ? a.model.bio
              : "Независимый автор. Создаю цифровые продукты и делюсь тем, что получается."}
          </p>
          <div className="inline">
            <Badge>Основатель</Badge>
            <span className="muted">Профиль демонстрационного автора</span>
          </div>
        </div>
        <Action
          to={mine ? 51 : 50}
          params={{
            handle: mine ? a.model.handle : p.owner,
          }}
        >
          {mine ? "Редактировать" : "Контакты"}
        </Action>
      </section>
      <Tabs
        items={[
          [46, "Обзор"],
          [47, "Проекты"],
          [48, "Команды"],
          [49, "Достижения"],
          [50, "Контакты"],
        ]}
        params={{
          handle: mine ? a.model.handle : p.owner,
        }}
      />
      {id === 46 || id === 47 ? (
        <>
          <SectionHead title="Сделано автором" />
          <ProjectGrid items={[p]} />
        </>
      ) : id === 48 ? (
        <div className="panel">
          <h2>Публичное участие</h2>
          <div className="founder-row">
            <Avatar name={p.initials} color={p.color} />
            <div>
              <Link
                to={35}
                params={{
                  slug: p.slug,
                }}
              >
                {p.name}
              </Link>
              <p>Основатель</p>
            </div>
          </div>
        </div>
      ) : id === 49 ? (
        <Empty
          title="Достижения появятся здесь"
          text="Бейджи выдаются только за подтверждённые события. Демо-профилю они не присвоены."
          icon="shield"
        />
      ) : (
        <Empty
          title="Автор не добавил контакты"
          text="Личные email и скрытые способы связи не публикуются."
          to={47}
          cta="Посмотреть проекты"
          icon="mail"
        />
      )}
    </div>
  );
}
export function Wall() {
  const a = useApp();
  const root = useRef<HTMLDivElement>(null);
  const [view, setView] = useState(() => ({
    x: Number(a.params.x) || 0,
    y: Number(a.params.y) || 0,
    z: Number(a.params.z) || 1,
  }));
  const [query, setQuery] = useState(a.params.find || "");
  const [cat, setCat] = useState(a.params.category || "Все проекты");
  const [map, setMap] = useState(a.id === "026");
  const pointer = useRef<{
    x: number;
    y: number;
    sx: number;
    sy: number;
    distance?: number;
  } | null>(null);
  const pointers = useRef(
    new Map<
      number,
      {
        x: number;
        y: number;
      }
    >(),
  );
  const moved = useRef(false);
  const tile = projects.find((p) => p.slug === a.params.project);
  const saveView = () => {
    const u = new URL(location.href);
    const current = new URL(
      u.hash.slice(1) || "/wall",
      "https://prototype.local",
    );
    u.hash =
      current.pathname +
      "?" +
      new URLSearchParams({
        ...Object.fromEntries(current.searchParams),
        x: String(Math.round(view.x)),
        y: String(Math.round(view.y)),
        z: String(view.z),
        ...(cat !== "Все проекты"
          ? {
              category: cat,
            }
          : {}),
      });
    history.replaceState(history.state, "", u);
  };
  const zoom = (delta: number) =>
    setView((v) => ({
      ...v,
      z: Math.max(0.55, Math.min(1.8, v.z + delta)),
    }));
  useEffect(() => {
    saveView();
  }, [view.x, view.y, view.z]);
  const select = (slug: string) => {
    a.go(27, {
      project: slug,
      x: String(view.x),
      y: String(view.y),
      z: String(view.z),
    });
  };
  const tiles = Array.from(
    {
      length: 48,
    },
    (_, i) => ({
      ...projects[i % 6],
      index: i,
    }),
  );
  return (
    <div className="wall-page">
      <div className="wall-heading">
        <div>
          <button className="back-link" onClick={() => a.back(1)}>
            <Icon name="back" />
            Назад
          </button>
          <h1>
            Project Wall<span>Идеи обретают своё место.</span>
          </h1>
        </div>
        <div className="inline">
          <Demo />
          <Button variant="secondary" onClick={() => a.go(33)}>
            Моя плитка
          </Button>
          <Action to={2}>Каталог</Action>
        </div>
      </div>
      <div className="wall-toolbar">
        <div className="wall-search">
          <Icon name="search" />
          <input
            aria-label="Найти проект на стене"
            placeholder="Название проекта или автор"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const p = projects.find((p) =>
                  (p.name + " " + p.owner)
                    .toLowerCase()
                    .includes(query.toLowerCase()),
                );
                if (p) {
                  setView({
                    x: 0,
                    y: 0,
                    z: 1,
                  });
                  select(p.slug);
                } else a.notify("Совпадений нет. Попробуйте каталог.");
              }
              if (e.key === "Escape") setQuery("");
            }}
          />
        </div>
        <select
          aria-label="Категория стены"
          value={cat}
          onChange={(e) => setCat(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <Button
          variant="secondary"
          onClick={() => setMap((v) => !v)}
          icon="grid"
        >
          Мини-карта
        </Button>
      </div>
      <div
        className="wall-canvas"
        ref={root}
        tabIndex={0}
        aria-label="Стена проектов. Перетаскивайте, используйте кнопки масштаба или клавиши стрелок."
        onKeyDown={(e) => {
          if (
            ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
          ) {
            e.preventDefault();
            setView((v) => ({
              ...v,
              x:
                v.x +
                (e.key === "ArrowLeft" ? 40 : e.key === "ArrowRight" ? -40 : 0),
              y:
                v.y +
                (e.key === "ArrowUp" ? 40 : e.key === "ArrowDown" ? -40 : 0),
            }));
          }
        }}
        onPointerDown={(e) => {
          pointers.current.set(e.pointerId, {
            x: e.clientX,
            y: e.clientY,
          });
          moved.current = false;
          pointer.current = {
            x: e.clientX,
            y: e.clientY,
            sx: view.x,
            sy: view.y,
          };
          if (pointers.current.size === 2) {
            const [p, q] = [...pointers.current.values()];
            pointer.current.distance = Math.hypot(p.x - q.x, p.y - q.y);
          }
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!pointers.current.has(e.pointerId) || !pointer.current) return;
          pointers.current.set(e.pointerId, {
            x: e.clientX,
            y: e.clientY,
          });
          if (pointers.current.size === 2) {
            const [p, q] = [...pointers.current.values()],
              d = Math.hypot(p.x - q.x, p.y - q.y);
            if (pointer.current.distance) {
              const ratio = d / pointer.current.distance;
              setView((v) => ({
                ...v,
                z: Math.max(0.55, Math.min(1.8, v.z * ratio)),
              }));
            }
            pointer.current.distance = d;
            moved.current = true;
            return;
          }
          const dx = e.clientX - pointer.current.x,
            dy = e.clientY - pointer.current.y;
          if (Math.abs(dx) + Math.abs(dy) > 5) moved.current = true;
          setView((v) => ({
            ...v,
            x: Math.max(-1100, Math.min(600, pointer.current!.sx + dx)),
            y: Math.max(-650, Math.min(400, pointer.current!.sy + dy)),
          }));
        }}
        onPointerUp={(e) => {
          pointers.current.delete(e.pointerId);
          e.currentTarget.releasePointerCapture(e.pointerId);
          if (!moved.current) {
            const el = document
              .elementFromPoint(e.clientX, e.clientY)
              ?.closest("[data-project]");
            if (el) select(el.getAttribute("data-project")!);
          }
          pointer.current = null;
          saveView();
        }}
        onPointerCancel={() => {
          pointers.current.clear();
          pointer.current = null;
        }}
      >
        <div
          className="wall-mosaic"
          style={{
            transform: `translate(${view.x}px,${view.y}px) scale(${view.z})`,
          }}
        >
          {tiles.map((p, i) => (
            <button
              data-project={p.slug}
              key={i}
              className={
                "wall-tile " +
                ((cat !== "Все проекты" && cat !== p.tag) ||
                (query &&
                  !(p.name + p.owner)
                    .toLowerCase()
                    .includes(query.toLowerCase()))
                  ? "dimmed"
                  : "")
              }
              onClick={(e) => {
                if (e.detail === 0) select(p.slug);
              }}
              style={{
                background: p.color,
              }}
            >
              <img src={p.image} alt="" draggable={false} />
              <span>
                <b>{p.name}</b>
                <small>DEMO · #{String(i + 1).padStart(3, "0")}</small>
              </span>
            </button>
          ))}
        </div>
        {map && (
          <button
            className="wall-minimap"
            aria-label="Вернуть вид к центру стены"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() =>
              setView({
                x: 0,
                y: 0,
                z: 1,
              })
            }
          >
            {tiles.map((p, i) => (
              <i
                key={i}
                style={{
                  background: p.color,
                }}
              />
            ))}
            <span />
          </button>
        )}
        <div
          className="wall-controls"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button aria-label="Уменьшить масштаб" onClick={() => zoom(-0.1)}>
            <Icon name="minus" />
          </button>
          <span>{Math.round(view.z * 100)}%</span>
          <button aria-label="Увеличить масштаб" onClick={() => zoom(0.1)}>
            <Icon name="plus" />
          </button>
          <button
            aria-label="Вернуть исходный масштаб"
            onClick={() =>
              setView({
                x: 0,
                y: 0,
                z: 1,
              })
            }
          >
            <Icon name="grid" />
          </button>
        </div>
        <p className="wall-help">
          Перетаскивайте холст · Масштабируйте двумя пальцами · Выберите проект
        </p>
      </div>
      {(tile || a.id === "033" || a.id === "032") && (
        <div className="wall-detail">
          <button
            className="icon-button close-modal"
            aria-label="Закрыть карточку плитки"
            onClick={() =>
              a.go(25, {
                x: String(view.x),
                y: String(view.y),
                z: String(view.z),
              })
            }
          >
            <Icon name="close" />
          </button>
          {tile ? (
            <>
              <img src={tile.image} alt="" />
              <div>
                <Demo />
                <h2>{tile.name}</h2>
                <p>{tile.desc}</p>
                <Action
                  to={35}
                  params={{
                    slug: tile.slug,
                  }}
                  variant="primary"
                >
                  Подробнее о проекте
                </Action>
                <Action to={34}>Поделиться</Action>
              </div>
            </>
          ) : (
            <>
              <h2>
                {a.id === "033"
                  ? "У вашего проекта будет своё место"
                  : "Здесь может быть ваш проект"}
              </h2>
              <p>
                Плитка появляется после одобрения проекта. Ячейки отдельно не
                продаются.
              </p>
              <Action to={119}>Создать проект</Action>
            </>
          )}
        </div>
      )}
      {a.id === "030" && (
        <Notice>
          Founding-серия: до 1 000 уникальных номеров. В демо не показываем
          число свободных мест как факт.
        </Notice>
      )}
      {a.id === "034" && (
        <div className="panel">
          <h2>Поделиться стеной</h2>
          <Copy value={location.href} />
          <p>Ссылка сохраняет масштаб и положение холста.</p>
        </div>
      )}
    </div>
  );
}
