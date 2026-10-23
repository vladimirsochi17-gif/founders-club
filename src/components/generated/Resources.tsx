import React, { useEffect, useState } from "react";
import {
  Action,
  Accordion,
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
  SectionHead,
  Table,
  Tabs,
  resources,
  routeFor,
  sid,
  specs,
  useApp,
} from "./core";
import { api, ApiError } from "../../lib/api";
const vaultTabs: [number, string][] = [
  [53, "Обзор"],
  [54, "Компоненты"],
  [55, "Анимации"],
  [56, "Страницы"],
  [57, "Блоки"],
  [58, "Иконки"],
  [59, "Шаблоны"],
  [65, "Коллекции"],
];
const arsenalTabs: [number, string][] = [
  [71, "Все инструменты"],
  [72, "MCP"],
  [73, "Skills"],
  [74, "Агенты"],
  [75, "Промпты"],
  [76, "Codex"],
  [77, "Cursor"],
  [82, "Подборки"],
];
const kitTabs: [number, string][] = [
  [84, "Все наборы"],
  [85, "SaaS"],
  [86, "Telegram Mini App"],
  [87, "Directory"],
  [88, "Landing"],
  [89, "Digital Shop"],
];
const tools = [
  {
    slug: "frontend-review",
    name: "Frontend Review",
    type: "Skill",
    desc: "Структурированный разбор интерфейса: иерархия, доступность, адаптация.",
    icon: "code",
    tag: "Дизайн и QA",
  },
  {
    slug: "project-context",
    name: "Project Context",
    type: "AGENTS.md",
    desc: "Контекст проекта, договорённости и безопасные границы работы агента.",
    icon: "file",
    tag: "Разработка",
  },
  {
    slug: "release-checklist",
    name: "Release Checklist",
    type: "Agent",
    desc: "Последовательная проверка изменений перед публикацией продукта.",
    icon: "shield",
    tag: "Релиз",
  },
  {
    slug: "research-brief",
    name: "Research Brief",
    type: "Prompt",
    desc: "От идеи к внятному брифу с вопросами, источниками и ограничениями.",
    icon: "chat",
    tag: "Исследование",
  },
];
const kits = [
  {
    slug: "saas",
    name: "SaaS Starter",
    desc: "От первого экрана до прозрачной подписки.",
    image:
      "/assets/paymio.jpg",
    tags: "Auth · Billing UI · Dashboard",
    to: 85,
  },
  {
    slug: "telegram",
    name: "Telegram Mini App",
    desc: "Интерфейс маленького продукта с большой задачей.",
    image:
      "/assets/flowstreak.jpg",
    tags: "WebApp · Theme · UI",
    to: 86,
  },
  {
    slug: "directory",
    name: "Directory",
    desc: "Каталог, поиск и понятная модерация.",
    image:
      "/assets/uihunt.jpg",
    tags: "Cards · Filters · SEO",
    to: 87,
  },
  {
    slug: "landing",
    name: "Editorial Landing",
    desc: "Ясный рассказ о вашем следующем проекте.",
    image:
      "/assets/founders-architecture.jpg",
    tags: "Hero · Pricing · FAQ",
    to: 88,
  },
  {
    slug: "store",
    name: "Digital Shop",
    desc: "Витрина цифровых продуктов и сценарий покупки.",
    image:
      "/assets/quickqr.jpg",
    tags: "Products · Cart · Delivery",
    to: 89,
  },
];
export function ResourceCard({ index = 0 }: { index?: number }) {
  const r = resources[index % resources.length];
  return (
    <article className="resource-card">
      <Link
        to={60}
        params={{
          slug: r.slug,
        }}
        className="resource-art"
      >
        <img src={r.image} alt={"Демонстрационный дизайн " + r.name} />
        <span className="art-demo">DEMO</span>
      </Link>
      <div>
        <span className="resource-meta">
          {r.type} <span>{r.stack}</span>
        </span>
        <h3>
          <Link
            to={60}
            params={{
              slug: r.slug,
            }}
          >
            {r.name}
          </Link>
        </h3>
        <p>{r.desc}</p>
        <div className="resource-bottom">
          <Badge>v1.0 · Демо</Badge>
          <Link
            to={60}
            params={{
              slug: r.slug,
            }}
            aria-label={"Открыть " + r.name}
          >
            <Icon name="arrow" />
          </Link>
        </div>
      </div>
    </article>
  );
}
function LivePreview() {
  const [checked, setChecked] = useState([false, true, false]);
  return (
    <div className="live-preview">
      <div className="live-preview-inner">
        <span className="section-kicker">YOUR WORKSPACE</span>
        <h2>
          Меньше шума.
          <br />
          Больше смысла.
        </h2>
        <p>Три небольших шага к следующей версии.</p>
        {[
          "Сформулировать главную задачу",
          "Собрать первый прототип",
          "Показать его людям",
        ].map((t, i) => (
          <Check
            key={t}
            label={t}
            checked={checked[i]}
            onChange={(v) =>
              setChecked((s) => s.map((x, j) => (j === i ? v : x)))
            }
          />
        ))}
      </div>
      <div className="preview-stamp">LIVE PREVIEW · DEMO</div>
    </div>
  );
}
function MotionLibrary() {
  const [running, setRunning] = useState(false);
  const [duration, setDuration] = useState("600");
  const [motion, setMotion] = useState("fade");
  return (
    <section className="panel motion-library">
      <div className="section-head">
        <div>
          <Badge>CSS · Live preview</Badge>
          <h2>Плавное появление</h2>
          <p>
            Сначала смысл, затем движение. Ничего не запускается автоматически.
          </p>
        </div>
        <Button onClick={() => setRunning((v) => !v)}>
          {running ? "Остановить" : "Запустить превью"}
        </Button>
      </div>
      <div className="motion-controls">
        <Field
          label="Длительность, мс"
          value={duration}
          options={["200", "400", "600", "800"]}
          onChange={setDuration}
        />
        <Field
          label="Движение"
          value={motion}
          options={["fade", "slide", "scale"]}
          onChange={setMotion}
        />
      </div>
      <div className="motion-stage">
        <div
          key={duration + motion}
          className={"motion-sample " + (running ? "playing " + motion : "")}
          style={{
            animationDuration: duration + "ms",
          }}
        >
          <Icon name="file" size={32} />
          <h3>Ваша следующая идея</h3>
          <p>Небольшое изменение. Понятный результат.</p>
        </div>
      </div>
      <Notice>
        При prefers-reduced-motion анимация отключена. Переключения остаются
        мгновенными.
      </Notice>
      <div className="code-panel">
        <pre>
          <code>
            {"/* " +
              motion +
              " · " +
              duration +
              "ms */\n.transition { transition: opacity " +
              duration +
              "ms ease; }\n@media (prefers-reduced-motion: reduce) {\n  .transition { transition: none; }\n}"}
          </code>
        </pre>
        <Copy
          value={
            "@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }"
          }
          label="Копировать reduced-motion правило"
        />
      </div>
    </section>
  );
}
export function ResourceArea() {
  const a = useApp(),
    id = Number(a.id),
    arsenal = (id >= 71 && id <= 83) || a.params.origin === "arsenal",
    kit = id >= 84 && id <= 92;
  const [q, setQ] = useState("");
  const [stack, setStack] = useState("Все стеки");
  const [device, setDevice] = useState("Desktop");
  const [file, setFile] = useState("Component.tsx");
  const [ide, setIde] = useState("Codex");
  const [accepted, setAccepted] = useState(false);
  const [downloadGranted, setDownloadGranted] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  useEffect(() => { setAccepted(false); setDownloadGranted(false); setDownloadUrl(""); setDownloadError(""); }, [a.params.slug]);
  const [downloadBusy, setDownloadBusy] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const [progress, setProgress] = useState<Record<number, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem("fc-kit-progress") || "{}");
    } catch {
      return {};
    }
  });
  const r = resources.find((x) => x.slug === a.params.slug) || resources[0],
    t = tools.find((x) => x.slug === a.params.slug) || tools[0],
    k =
      kits.find((x) => x.slug === a.params.slug) ||
      kits.find((x) => x.to === id) ||
      kits[0];
  const rp = {
      slug: r.slug,
    },
    tp = {
      slug: t.slug,
      origin: "arsenal",
    },
    kp = {
      slug: k.slug,
    };
  const download = (to: number, params: Record<string, string>) => {
    if (!a.model.subscribed) {
      a.setModel({
        returnTo: routeFor(to, params),
      });
      a.go(70, {
        resource: params.slug,
        returnTo: routeFor(to, params),
      });
      return;
    }
    a.go(to, params);
  };
  if ([69, 83].includes(id))
    return (
      <div className="container page narrow">
        <PageHead
          title={
            id === 69
              ? "Какого ресурса не хватает?"
              : "Предложите полезный инструмент"
          }
          description="Расскажите о задаче. Это поможет понять, что действительно нужно авторам."
          back={id === 69 ? 53 : 71}
        />
        <FormPanel
          fields={[
            {
              label: "Название или задача",
              key: "name",
              required: true,
            },
            {
              label: "Категория",
              key: "category",
              options:
                id === 69
                  ? ["UI-компонент", "Анимация", "Страница", "Иконки", "Шаблон"]
                  : ["MCP", "Skill", "Агент", "Промпт", "Конфигурация"],
            },
            {
              label: "Стек / платформа",
              key: "stack",
            },
            {
              label: "Что нужно сделать?",
              key: "description",
              type: "textarea",
              required: true,
            },
            {
              label: "Ссылка на пример",
              key: "url",
              type: "url",
            },
          ]}
          submit="Отправить предложение"
        />
      </div>
    );
  if (id === 64 || id === 66) {
    const data = id === 64 ? a.model.saved : a.model.downloads;
    return (
      <div className="container page">
        <PageHead
          title={id === 64 ? "Сохранено на потом" : "Ваши скачивания"}
          description={
            id === 64
              ? "То, к чему хочется вернуться."
              : "Версии файлов и лицензии на момент получения."
          }
          back={145}
        />
        <Tabs
          items={[
            [64, "Сохранённое"],
            [66, "Скачивания"],
          ]}
        />
        {data.length ? (
          <Table
            heads={["Материал", "Тип", "Условия", "Действие"]}
            rows={data.map((x) => [
              x,
              <Demo />,
              "Демонстрационный файл",
              <div className="inline">
                <Action
                  to={67}
                  params={{
                    slug: x.replace(/-demo\.txt$/, ""),
                  }}
                  icon=""
                >
                  Лицензия
                </Action>
                {id === 64 && (
                  <Button
                    variant="text"
                    onClick={() => {
                      a.setModel((m) => ({
                        saved: m.saved.filter((s) => s !== x),
                      }));
                      a.notify("Удалено из сохранённого");
                    }}
                  >
                    Удалить
                  </Button>
                )}
              </div>,
            ])}
          />
        ) : (
          <Empty
            title={
              id === 64
                ? "Ваша коллекция начинается здесь"
                : "Вы ещё ничего не скачивали"
            }
            text={
              id === 64
                ? "Сохраняйте полезные материалы, чтобы вернуться к ним позже."
                : "После получения файла здесь появятся версия и условия его использования."
            }
            to={53}
            cta="Открыть библиотеку"
            icon="file"
          />
        )}
        {id === 66 && (
          <Notice title="Лицензии остаются с вами">
            Отмена подписки не отменяет разрешённое коммерческое использование
            уже полученных ресурсов. Повторная выдача зависит от заранее
            опубликованных условий конкретного файла.
          </Notice>
        )}
      </div>
    );
  }
  if (id === 70)
    return (
      <div className="container page gate-page">
        <button className="back-link" onClick={() => a.back(60)}>
          <Icon name="back" />
          Вернуться к ресурсу
        </button>
        <div className="gate-layout">
          <div>
            <span className="resource-section-label">DESIGN VAULT</span>
            <h1>
              Хорошие инструменты.
              <br />
              Больше возможностей.
            </h1>
            <p>
              Полные исходники доступны участникам Founder. Превью открыто всем
              — сначала посмотрите, подходит ли вам ресурс.
            </p>
            <ul className="check-list">
              <li>
                <Icon name="check" />
                Исходные файлы и инструкция
              </li>
              <li>
                <Icon name="check" />
                История версий и зависимости
              </li>
              <li>
                <Icon name="check" />
                Условия коммерческого использования
              </li>
            </ul>
            <div className="inline">
              <Button
                onClick={() => {
                  a.setModel({
                    returnTo:
                      a.params.returnTo ||
                      a.model.returnTo ||
                      routeFor(63, {
                        slug: a.params.resource || r.slug,
                      }),
                  });
                  a.go(a.model.logged ? 109 : 102, {
                    returnTo: "/checkout",
                  });
                }}
              >
                Получить доступ · 299 ₽/мес <Icon name="arrow" />
              </Button>
              <Action to={17} variant="text">
                Сравнить тарифы
              </Action>
            </div>
            <p className="fine">
              Автопродление — только с отдельным согласием. В прототипе платежи
              не выполняются.
            </p>
          </div>
          <div className="locked-preview">
            <LivePreview />
            <span className="lock-banner">
              <Icon name="lock" />
              Полный ресурс по подписке
            </span>
          </div>
        </div>
      </div>
    );
  const isDetail = [
    60, 61, 62, 63, 67, 68, 78, 79, 80, 81, 85, 86, 87, 88, 89, 90, 91, 92,
  ].includes(id);
  if (isDetail) {
    const title = arsenal ? t.name : kit ? k.name : r.name,
      base = arsenal ? 78 : kit ? 90 : 60,
      params = arsenal ? tp : kit ? kp : rp;
    const source = arsenal ? 71 : kit ? 84 : 53;
    const code =
      file === "Component.tsx"
        ? 'export function ProjectCard({ project }) {\n  return (\n    <article className="project-card">\n      <h3>{project.name}</h3>\n      <p>{project.description}</p>\n      <a href={project.url}>Открыть проект</a>\n    </article>\n  );\n}\n\n// Демонстрационный фрагмент.\n// Полный ресурс не подключён.'
        : ":root {\n  --canvas: #f8f6f2;\n  --ink: #20211f;\n  --border: #e5e1d9;\n}\n.project-card {\n  padding: 24px;\n  border: 1px solid var(--border);\n  border-radius: 12px;\n}";
    return (
      <div className="container page resource-detail">
        <button className="back-link" onClick={() => a.back(source)}>
          <Icon name="back" />
          {arsenal ? "Founder Arsenal" : kit ? "Launch Kits" : "Design Vault"}
        </button>
        <div className="resource-title">
          <div>
            <div className="inline">
              <Badge>{arsenal ? t.type : kit ? "Launch Kit" : r.type}</Badge>
              <Demo />
              <Badge>v1.0</Badge>
            </div>
            <h1>{title}</h1>
            <p>{arsenal ? t.desc : kit ? k.desc : r.desc}</p>
          </div>
          <div className="inline">
            <Button
              variant="secondary"
              icon="heart"
              onClick={() => {
                a.setModel((m) => ({
                  saved: [...new Set([...m.saved, title])],
                }));
                a.notify("Ресурс сохранён");
              }}
            >
              Сохранить
            </Button>
            <Button
              icon="download"
              onClick={() => download(kit ? 91 : 63, params)}
            >
              Скачать
            </Button>
          </div>
        </div>
        {arsenal && (
          <Notice title="Проверьте доступы до установки" tone="warm">
            Демонстрационный материал не проходил аудит безопасности. Не
            запускайте неизвестные команды. Секреты и токены не должны храниться
            в конфигурации.
          </Notice>
        )}
        <Tabs
          items={
            arsenal
              ? [
                  [78, "Обзор"],
                  [79, "Установка"],
                  [80, "Совместимость"],
                  [81, "Версии"],
                ]
              : kit
                ? [
                    [90, "Обзор и состав"],
                    [92, "Инструкция"],
                    [91, "Скачивание"],
                  ]
                : [
                    [60, "Превью"],
                    [61, "Код"],
                    [62, "Установка"],
                    [67, "Лицензия"],
                    [68, "Версии"],
                  ]
          }
          params={params}
          active={[85, 86, 87, 88, 89].includes(id) ? "090" : a.id}
        />
        <div className="resource-layout">
          <main>
            {id === 60 && (
              <>
                <div className="preview-toolbar">
                  <span>Интерактивное превью</span>
                  <div className="segmented">
                    {["Desktop", "Mobile"].map((d) => (
                      <button
                        className={device === d ? "active" : ""}
                        onClick={() => setDevice(d)}
                        key={d}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div
                  className={
                    "preview-stage " +
                    (device === "Mobile" ? "mobile-preview" : "")
                  }
                >
                  <LivePreview />
                </div>
                <section className="prose">
                  <h2>Ясная основа для вашего интерфейса</h2>
                  <p>
                    Компоненты с продуманной типографикой, понятными состояниями
                    и вниманием к русскоязычному интерфейсу. Этот экземпляр
                    демонстрирует превью и структуру выдачи — готовый
                    коммерческий архив не прикреплён.
                  </p>
                </section>
              </>
            )}
            {id === 61 && (
              <div className="code-panel">
                <div className="code-toolbar">
                  <div className="segmented">
                    {["Component.tsx", "styles.css"].map((f) => (
                      <button
                        key={f}
                        onClick={() => setFile(f)}
                        className={file === f ? "active" : ""}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <Copy value={code} />
                </div>
                <pre>
                  <code>{code}</code>
                </pre>
                <div className="code-foot">
                  <Badge>Демо-фрагмент</Badge>
                  <span>Полный архив доступен после проверки прав.</span>
                </div>
              </div>
            )}
            {(id === 62 || id === 79) && (
              <>
                <h2>Установка без сюрпризов</h2>
                <p>
                  Выберите инструмент. Команды копируются, но никогда не
                  выполняются сайтом.
                </p>
                <div className="segmented">
                  {["Codex", "Cursor", "Вручную"].map((v) => (
                    <button
                      key={v}
                      className={ide === v ? "active" : ""}
                      onClick={() => setIde(v)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <ol className="steps-list">
                  <li>
                    <h3>Проверьте состав и лицензию</h3>
                    <p>
                      Изучите README, зависимости и список разрешений перед
                      использованием.
                    </p>
                  </li>
                  <li>
                    <h3>Создайте отдельную ветку</h3>
                    <p>
                      Не добавляйте непроверенный код сразу в основной проект.
                    </p>
                  </li>
                  <li>
                    <h3>Перенесите проверенные файлы</h3>
                    <div className="code-panel">
                      <pre>
                        <code>
                          {ide === "Вручную"
                            ? "src/components/\n  ProjectCard.tsx\n  project-card.css"
                            : "# DEMO: сначала прочитайте README\n# и проверьте права доступа.\n# Команда установки не опубликована."}
                        </code>
                      </pre>
                      <Copy
                        value="Прочитай README ресурса, проверь зависимости и лицензию. Предложи изменения без выполнения внешних команд."
                        label="Скопировать промпт проверки"
                      />
                    </div>
                  </li>
                  <li>
                    <h3>Проверьте в своём окружении</h3>
                    <p>
                      Версии, доступность и поведение на мобильном устройстве.
                    </p>
                  </li>
                </ol>
                <Action to={base} params={params}>
                  Вернуться к ресурсу
                </Action>
              </>
            )}
            {[63, 91].includes(id) && (
              <div className="panel download-panel">
                <span className="download-symbol">
                  <Icon name="download" size={32} />
                </span>
                <h2>Перед скачиванием</h2>
                <p>{title} · v1.0 · DEMO</p>
                <Table
                  heads={["Файл", "Назначение"]}
                  rows={[
                    ["README.txt", "Описание демонстрационного материала"],
                    ["Лицензия", "Не является лицензией реального ресурса"],
                  ]}
                />
                <Notice>
                  Коммерческий архив не подключён. Кнопка ниже выдаёт только
                  настоящий небольшой демо-файл, а не имитацию успешной
                  загрузки.
                </Notice>
                <Check
                  label="Понимаю, что это демонстрационный материал"
                  checked={accepted}
                  onChange={setAccepted}
                />
                {downloadError && (
                  <p role="alert" className="error-text">
                    {downloadError}
                  </p>
                )}
                {accepted && id === 63 && !downloadGranted ? (
                  <Button
                    icon="download"
                    disabled={downloadBusy}
                    onClick={() => {
                      setDownloadBusy(true);
                      setDownloadError("");
                      void api
                        .downloadResource(r.slug)
                        .then((result) => {
                          setDownloadGranted(true);
                          setDownloadUrl(result.downloadUrl || "");
                          a.setModel((model) => ({
                            downloads: Array.from(
                              new Set([...model.downloads, r.slug]),
                            ),
                          }));
                          a.notify("Лицензия и версия скачивания записаны в базе данных.");
                        })
                        .catch((caught) =>
                          setDownloadError(
                            caught instanceof ApiError
                              ? caught.message
                              : "Не удалось выдать ресурс.",
                          ),
                        )
                        .finally(() => setDownloadBusy(false));
                    }}
                  >
                    {downloadBusy ? "Проверяем доступ…" : "Получить файл и лицензию"}
                  </Button>
                ) : accepted && downloadUrl ? (
                  <a className="btn primary" href={downloadUrl} download>Скачать файл</a>
                ) : accepted ? (
                  <DownloadDemo
                    name={title.toLowerCase().replace(/ /g, "-") + "-demo.txt"}
                  />
                ) : (
                  <Button disabled icon="download">
                    Скачать демо-файл
                  </Button>
                )}
                <Action to={67} params={params} variant="text">
                  Открыть лицензию
                </Action>
                <Action to={66} variant="text">
                  История скачиваний
                </Action>
              </div>
            )}
            {id === 67 && (
              <article className="prose">
                <h2>Лицензия и ваши права</h2>
                <Notice title="Проект документа">
                  Индивидуальная лицензия коммерческого ресурса должна быть
                  подтверждена правообладателем. Здесь показана структура
                  условий, а не юридическая оферта.
                </Notice>
                <h3>Коммерческое использование</h3>
                <p>
                  Разрешённые способы применения, число проектов и права на
                  изменения фиксируются в лицензии конкретного файла на момент
                  скачивания.
                </p>
                <h3>После отмены подписки</h3>
                <p>
                  Ранее предоставленные права использования сохраняются.
                  Получение новых версий требует действующего доступа. Повторная
                  выдача исходного архива регулируется указанными при получении
                  условиями.
                </p>
                <h3>Ограничения</h3>
                <p>
                  Перепродажа исходников и распространение самостоятельного
                  набора не разрешаются автоматически. При конфликте лицензий
                  выдача приостанавливается до проверки.
                </p>
                <Copy value={location.href} />
                <Action to={63} params={params}>
                  К скачиванию
                </Action>
              </article>
            )}
            {(id === 68 || id === 81) && (
              <div className="timeline">
                <article>
                  <span className="timeline-dot" />
                  <div>
                    <div className="inline">
                      <h2>Версия 1.0</h2>
                      <Demo />
                    </div>
                    <p>
                      Демонстрационная версия макета. Проверенные релизы и даты
                      появятся после подключения реестра.
                    </p>
                    <Accordion
                      items={[
                        {
                          title: "Состав версии",
                          body: "Превью, описание, структура файлов и экран лицензии.",
                        },
                      ]}
                    />
                  </div>
                </article>
                <Notice>
                  Совместимость не подтверждена тестированием. Не считайте
                  демо-версию готовым пакетом.
                </Notice>
              </div>
            )}
            {id === 78 && (
              <>
                <div className="tool-preview">
                  <span>
                    <Icon name={t.icon} size={54} />
                  </span>
                  <div>
                    <h2>{t.name}</h2>
                    <p>{t.tag}</p>
                    <Badge>Образец файла · DEMO</Badge>
                  </div>
                  <pre>
                    <code>
                      {"# " +
                        t.name +
                        "\n\n## Scope\nReview the interface and report issues.\n\n## Boundaries\nDo not run commands or change files.\nAsk before external actions."}
                    </code>
                  </pre>
                </div>
                <section className="prose">
                  <h2>Понятная задача. Ограниченные полномочия.</h2>
                  <p>
                    {t.desc} В карточке настоящего инструмента будут указаны
                    автор, источник, точные версии и результаты проверки.
                  </p>
                </section>
              </>
            )}
            {id === 80 && (
              <>
                <h2>Совместимость — это результат проверки</h2>
                <Field
                  label="Инструмент"
                  value={ide}
                  options={["Codex", "Cursor", "Другой"]}
                  onChange={setIde}
                />
                <Table
                  heads={["Среда", "Версия", "Статус"]}
                  rows={["Windows", "macOS", "Linux"].map((os) => [
                    os,
                    ide + " · не указана",
                    <Badge tone="warm">Не проверено</Badge>,
                  ])}
                />
                <Notice>
                  Отсутствие ошибки в макете не означает совместимость. Для
                  публикации нужны воспроизводимые проверки.
                </Notice>
                <Action to={79} params={tp}>
                  Инструкция установки
                </Action>
              </>
            )}
            {kit && ![91, 92].includes(id) && (
              <>
                <img
                  className="kit-hero"
                  src={k.image}
                  alt={"Демонстрация " + k.name}
                />
                <h2>Что внутри</h2>
                <Accordion
                  items={[
                    {
                      title: "01 · Интерфейс и компоненты",
                      body: "Базовые страницы, формы и состояния. React / TypeScript.",
                    },
                    {
                      title: "02 · Структура проекта",
                      body: "Организация файлов, пример темизации и точки подключения интеграций.",
                    },
                    {
                      title: "03 · Инструкция и чеклист запуска",
                      body: "Этапы установки, проверка зависимостей и рекомендации по доступности.",
                    },
                    {
                      title: "04 · Лицензия и ограничения",
                      body: "Сторонние API, хостинг, платёжный провайдер и реальные авторизационные сервисы не включены. Их необходимо подключить отдельно.",
                    },
                  ]}
                />
                <Notice title="Не однокнопочная публикация">
                  Набор помогает начать работу. Настройка интеграций,
                  безопасность и запуск требуют отдельной проверки.
                </Notice>
              </>
            )}
            {id === 92 && (
              <>
                <h2>От пакета к своему проекту</h2>
                <p>
                  Прогресс этого чеклиста сохраняется только в вашем браузере.
                </p>
                {[
                  "Изучить README и лицензию",
                  "Проверить версии окружения",
                  "Развернуть файлы в отдельной ветке",
                  "Настроить свои интеграции без секретов в коде",
                  "Проверить сценарии и адаптивность",
                  "Подготовить собственный запуск",
                ].map((step, i) => (
                  <div className="guide-step" key={step}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <Check
                      label={step}
                      checked={!!progress[i]}
                      onChange={(v) => {
                        const next = {
                          ...progress,
                          [i]: v,
                        };
                        setProgress(next);
                        localStorage.setItem(
                          "fc-kit-progress",
                          JSON.stringify(next),
                        );
                      }}
                    />
                  </div>
                ))}
                <Accordion
                  items={[
                    {
                      title: "Не запускается локальная сборка",
                      body: "Проверьте версию Node, файл README и установку зависимостей. Не используйте неизвестные команды из случайных источников.",
                    },
                    {
                      title: "Не работает оплата или авторизация",
                      body: "Это отдельные интеграции. Потребуются ваши настройки провайдера и серверная проверка.",
                    },
                  ]}
                />
              </>
            )}
          </main>
          <aside>
            <div className="panel resource-facts">
              <h3>О материале</h3>
              <dl>
                <div>
                  <dt>Автор</dt>
                  <dd>Редакция · DEMO</dd>
                </div>
                <div>
                  <dt>Версия</dt>
                  <dd>1.0 · концепция</dd>
                </div>
                <div>
                  <dt>Технологии</dt>
                  <dd>React, TypeScript</dd>
                </div>
                <div>
                  <dt>Зависимости</dt>
                  <dd>Указаны в README</dd>
                </div>
                <div>
                  <dt>Доступ</dt>
                  <dd>Founder Membership</dd>
                </div>
                <div>
                  <dt>Лицензия</dt>
                  <dd>
                    <Link to={67} params={params}>
                      Условия использования
                    </Link>
                  </dd>
                </div>
              </dl>
              <Button
                icon="download"
                onClick={() => download(kit ? 91 : 63, params)}
              >
                Получить файлы
              </Button>
              <small>Никаких сторонних API-услуг в составе.</small>
            </div>
            <Action to={arsenal ? 83 : 69} variant="text">
              Предложить улучшение
            </Action>
          </aside>
        </div>
      </div>
    );
  }
  const vaultType: Record<number, string> = {
    54: "UI-компоненты",
    56: "Готовые страницы",
    57: "UI-блоки",
    59: "Шаблоны",
  };
  const toolType: Record<number, string> = {
    72: "MCP",
    73: "Skill",
    74: "Agent",
    75: "Prompt",
  };
  const list = arsenal
    ? tools.filter(
        (t) =>
          (!toolType[id] || t.type === toolType[id]) &&
          (t.name + t.desc).toLowerCase().includes(q.toLowerCase()),
      )
    : resources.filter(
        (r) =>
          (!vaultType[id] || r.type === vaultType[id]) &&
          (stack === "Все стеки" || r.stack.includes(stack)) &&
          (r.name + r.desc).toLowerCase().includes(q.toLowerCase()),
      );
  return (
    <div className="container page library-page">
      <div className="library-head">
        <div>
          <span className="resource-section-label">
            {arsenal ? "FOUNDER ARSENAL" : kit ? "LAUNCH KITS" : "DESIGN VAULT"}
          </span>
          <h1>
            {arsenal ? (
              <>
                Инструменты,
                <br />
                которые работают на вас.
              </>
            ) : kit ? (
              <>
                Не с нуля.
                <br />С хорошей основы.
              </>
            ) : (
              <>
                Меньше рутины.
                <br />
                Больше хорошего дизайна.
              </>
            )}
          </h1>
          <p>
            {arsenal
              ? "Skills, MCP, агенты и конфигурации с понятной областью применения."
              : kit
                ? "Продуманные комплекты для первого запуска. Выберите свой формат продукта."
                : "Компоненты, страницы и шаблоны для ваших проектов. Посмотрите, попробуйте, используйте."}
          </p>
          <div className="inline">
            <Action to={16} variant="primary">
              Доступ с Founder
            </Action>
            <Action to={arsenal ? 83 : 69} variant="text">
              Предложить ресурс
            </Action>
          </div>
        </div>
        <div
          className={"library-visual " + (arsenal ? "arsenal-visual" : "")}
          aria-hidden="true"
        >
          {arsenal ? (
            <>
              <Icon name="code" size={52} />
              <pre>
                skills/
                <br /> design-review.md
                <br /> release-checklist.md
                <br />
                <br />
                <span>clear scope. useful tools.</span>
              </pre>
            </>
          ) : (
            <img
              src={
                kit
                  ? "/assets/flowstreak.jpg"
                  : "/assets/paymio.jpg"
              }
              alt=""
            />
          )}
        </div>
      </div>
      {arsenal && (
        <Notice tone="warm" title="Сначала безопасность">
          Изучите разрешения и совместимость до установки. Демонстрационные
          инструменты не прошли аудит.
        </Notice>
      )}
      <Tabs items={arsenal ? arsenalTabs : kit ? kitTabs : vaultTabs} />
      <div className="list-toolbar">
        <div className="search-field">
          <Icon name="search" />
          <input
            aria-label="Поиск материалов"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={arsenal ? "Найти инструмент…" : "Найти ресурс…"}
          />
        </div>
        <select
          disabled={arsenal || id === 55 || id === 58}
          aria-label="Стек"
          value={stack}
          onChange={(e) => setStack(e.target.value)}
        >
          {["Все стеки", "React", "TypeScript", "CSS"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </div>
      {id === 55 ? (
        <MotionLibrary />
      ) : id === 58 ? (
        <div className="icon-library">
          {[
            "search",
            "arrow",
            "grid",
            "shield",
            "code",
            "file",
            "user",
            "heart",
            "bell",
            "mail",
            "chart",
            "lock",
            "download",
            "filter",
            "clock",
            "trash",
          ]
            .filter((n) => n.includes(q))
            .map((n) => (
              <button
                key={n}
                onClick={() =>
                  a.modal(
                    <>
                      <h2>Иконка {n}</h2>
                      <span id="icon-export">
                        <Icon name={n} size={64} />
                      </span>
                      <p>
                        Демонстрационная SVG-иконка из дизайн-системы. Исходники
                        передаются вместе с прототипом.
                      </p>
                      <Button
                        onClick={async () => {
                          const svg =
                            document.querySelector(
                              "#icon-export svg",
                            )?.outerHTML;
                          if (svg) {
                            try {
                              await navigator.clipboard.writeText(svg);
                              a.notify("SVG скопирован");
                            } catch {
                              a.notify(
                                "Браузер не разрешил доступ к буферу обмена",
                              );
                            }
                          }
                        }}
                      >
                        Копировать SVG
                      </Button>
                    </>,
                  )
                }
              >
                <Icon name={n} size={28} />
                <span>{n}</span>
              </button>
            ))}
        </div>
      ) : kit ? (
        <div className="resource-grid kits-grid">
          {kits
            .filter((k) =>
              (k.name + k.desc).toLowerCase().includes(q.toLowerCase()),
            )
            .map((k) => (
              <article className="resource-card" key={k.slug}>
                <Link
                  to={k.to}
                  params={{
                    slug: k.slug,
                  }}
                  className="resource-art"
                >
                  <img src={k.image} alt={k.name} />
                  <span className="art-demo">DEMO</span>
                </Link>
                <div>
                  <span className="resource-meta">{k.tags}</span>
                  <h2>
                    <Link
                      to={k.to}
                      params={{
                        slug: k.slug,
                      }}
                    >
                      {k.name}
                    </Link>
                  </h2>
                  <p>{k.desc}</p>
                  <Action
                    to={k.to}
                    params={{
                      slug: k.slug,
                    }}
                    variant="text"
                  >
                    Посмотреть состав
                  </Action>
                </div>
              </article>
            ))}
        </div>
      ) : arsenal ? (
        <div className="tools-grid">
          {list.map((item: any) => (
            <article className="tool-card" key={item.slug}>
              <div className="tool-top">
                <span className="tool-icon">
                  <Icon name={item.icon} size={26} />
                </span>
                <Badge>{item.type}</Badge>
              </div>
              <h2>
                <Link
                  to={78}
                  params={{
                    slug: item.slug,
                  }}
                >
                  {item.name}
                </Link>
              </h2>
              <p>{item.desc}</p>
              <div className="inline">
                <Demo />
                <Badge>Не проверено</Badge>
              </div>
              <Link
                className="tool-link"
                to={78}
                params={{
                  slug: item.slug,
                }}
              >
                Назначение и доступы <Icon name="arrow" />
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="resource-grid">
          {list.map((item: any) => (
            <ResourceCard
              key={item.slug}
              index={resources.findIndex((r) => r.slug === item.slug)}
            />
          ))}
        </div>
      )}
      {!list.length && !kit && (
        <Empty
          title="Нет подходящих материалов"
          text="Попробуйте другой запрос."
          icon="search"
        />
      )}
      <p className="demo-caption">
        DEMO · Превью и описания показывают структуру будущего каталога. Готовые
        коммерческие архивы не подключены.
      </p>
      {[55, 56, 57, 59, 65, 82].includes(id) && (
        <Notice>
          {id === 55
            ? "Анимационные превью управляются пользователем и учитывают reduced motion."
            : id === 65 || id === 82
              ? "Коллекции будут сформированы из проверенных совместимых ресурсов. Сейчас показаны примеры материалов."
              : "Совместимость, наличие мобильных вариантов и лицензии проверяются для каждого материала отдельно."}
        </Notice>
      )}
    </div>
  );
}
