import React, {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { SCREEN_ROUTES } from "./screenRoutes";
import { api } from "../../lib/api";
export type Params = Record<string, string>;
export const specs = new Map<string, (typeof SCREEN_ROUTES)[number]>(
  SCREEN_ROUTES.map((screen) => [screen.id, screen]),
);
export const sid = (n: number | string) => String(n).padStart(3, "0");
export const categories = [
  "Все проекты",
  "SaaS",
  "AI",
  "Мобильные",
  "Инструменты",
  "Дизайн",
  "Игры",
  "Образование",
  "Другое",
];
export const projects = [
  {
    slug: "mindflow",
    name: "MindFlow",
    tag: "AI",
    desc: "Пространство для заметок, в котором мысли находят связи.",
    owner: "alexdev",
    initials: "АЛ",
    color: "#6f6598",
    image: "/assets/mindflow.jpg",
  },
  {
    slug: "flowstreak",
    name: "FlowStreak",
    tag: "Мобильные",
    desc: "Маленькие привычки. Понятный ритм. Ваш личный прогресс.",
    owner: "maria",
    initials: "МА",
    color: "#8b8ab3",
    image: "/assets/flowstreak.jpg",
  },
  {
    slug: "uihunt",
    name: "UIHunt",
    tag: "Дизайн",
    desc: "Коллекция продуманных интерфейсов для новых продуктов.",
    owner: "designboy",
    initials: "ДБ",
    color: "#3c7165",
    image: "/assets/uihunt.jpg",
  },
  {
    slug: "paymio",
    name: "Paymio",
    tag: "SaaS",
    desc: "Платёжная инфраструктура для независимых digital-продуктов.",
    owner: "ivankr",
    initials: "ИК",
    color: "#5575a0",
    image: "/assets/paymio.jpg",
  },
  {
    slug: "gamewiki",
    name: "GameWiki",
    tag: "Игры",
    desc: "Место, где собираются знания о любимых инди-играх.",
    owner: "pixelmind",
    initials: "ПМ",
    color: "#a16b48",
    image: "/assets/gamewiki.jpg",
  },
  {
    slug: "quickqr",
    name: "QuickQR",
    tag: "Инструменты",
    desc: "Создавайте QR-коды и управляйте ссылками в одном месте.",
    owner: "tools_lab",
    initials: "ТЛ",
    color: "#7c7896",
    image: "/assets/quickqr.jpg",
  },
];
export type Project = (typeof projects)[number] & { isDemo?: boolean; stage?: string; publishedAt?: string; votes?: number };
export const resources = [
  {
    slug: "editorial-ui",
    name: "Editorial UI",
    type: "UI-компоненты",
    stack: "React · Tailwind",
    desc: "Спокойная интерфейсная система для содержательных продуктов.",
    image: "/assets/uihunt.jpg",
  },
  {
    slug: "focus-dashboard",
    name: "Focus Dashboard",
    type: "Готовые страницы",
    stack: "React · TypeScript",
    desc: "Рабочее пространство с ясной иерархией и доступной навигацией.",
    image: "/assets/mindflow.jpg",
  },
  {
    slug: "subscription-flow",
    name: "Subscription Flow",
    type: "UI-блоки",
    stack: "React · Tailwind",
    desc: "Тарифы, прозрачные согласия и управление подпиской.",
    image: "/assets/paymio.jpg",
  },
  {
    slug: "daily-planner",
    name: "Daily Planner",
    type: "Шаблоны",
    stack: "React · TypeScript",
    desc: "Календарь и трекер задач с мобильной адаптацией.",
    image: "/assets/flowstreak.jpg",
  },
];
export type Model = {
  logged: boolean;
  email: string;
  name: string;
  handle: string;
  bio: string;
  plan: string;
  subscribed: boolean;
  cancelled: boolean;
  consent: boolean;
  terms: boolean;
  verified: boolean;
  telegram: boolean;
  vote: string[];
  saved: string[];
  downloads: string[];
  draft: Record<string, string>;
  draftStep: number;
  projectStatus: string;
  notifications: string[];
  returnTo: string;
  review: string;
  themeMotion: boolean;
  [key: string]: any;
};
export const initial: Model = {
  logged: false,
  email: "",
  name: "Автор проекта",
  handle: "founder",
  bio: "Создаю независимые цифровые продукты.",
  plan: "Founder",
  subscribed: false,
  cancelled: false,
  consent: false,
  terms: false,
  verified: false,
  telegram: false,
  vote: [],
  saved: [],
  downloads: [],
  draft: {
    name: "",
    slug: "",
    url: "",
    category: "SaaS",
    short: "",
    description: "",
    stage: "Идея",
    proof: "",
  },
  draftStep: 120,
  projectStatus: "Черновик",
  notifications: [],
  returnTo: "",
  review: "",
  themeMotion: false,
};
export function readModel(): Model {
  try {
    return {
      ...initial,
      themeMotion: localStorage.getItem("fc-reduced-motion") === "true",
    };
  } catch {
    return initial;
  }
}
export function routeFor(id: number | string, params: Params = {}): string {
  const s = specs.get(sid(id));
  if (!s) return "/404";
  if (s.route.startsWith("component:") || s.route.startsWith("modal:"))
    return "/_review?component=" + sid(id);
  let route = s.route
    .replace(" (mobile)", "")
    .replace(
      /:slug/g,
      params.slug ||
        (Number(id) >= 53 && Number(id) <= 70
          ? "editorial-ui"
          : Number(id) >= 71 && Number(id) <= 83
            ? "frontend-review"
            : Number(id) >= 84 && Number(id) <= 92
              ? "saas"
              : "mindflow"),
    )
    .replace(/:handle/g, params.handle || "alexdev")
    .replace(/:id/g, params.project || "demo-01");
  const u = new URL(route, "https://prototype.local");
  Object.entries(params)
    .filter(([k]) => !["slug", "handle", "project"].includes(k))
    .forEach(([k, v]) => {
      if (v) u.searchParams.set(k, v);
      else u.searchParams.delete(k);
    });
  return u.pathname + u.search;
}
export function resolveRoute(path: string) {
  const u = new URL(path || "/", "https://prototype.local");
  const params = Object.fromEntries(u.searchParams);
  if (u.pathname === "/_review")
    return {
      id: params.component || "review",
      params,
      path: u.pathname,
    };
  if (u.pathname === "/wall") {
    let id = params.map
      ? "026"
      : params.project
        ? "027"
        : params.find !== undefined
          ? "028"
          : params.category !== undefined
            ? "029"
            : params.slot
              ? "032"
              : params.mine
                ? "033"
                : "025";
    return {
      id,
      params,
      path: u.pathname,
    };
  }
  const ordered = [...SCREEN_ROUTES]
    .filter((s) => s.route.startsWith("/") && !s.route.includes("(mobile)"))
    .sort(
      (a, b) =>
        b.route.split("/").length - a.route.split("/").length ||
        Number(a.route.includes(":")) - Number(b.route.includes(":")),
    );
  const exact = ordered.find(
    (s) => !s.route.includes(":") && s.route.split("?")[0] === u.pathname,
  );
  if (exact)
    return {
      id: exact.id,
      params,
      path: u.pathname,
    };
  for (const s of ordered) {
    const keys: string[] = [];
    const rx =
      "^" +
      s.route.split("?")[0].replace(/:([a-z]+)/g, (_, k) => {
        keys.push(k);
        return "([^/]+)";
      }) +
      "$";
    const m = u.pathname.match(new RegExp(rx));
    if (m) {
      try { keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); if (k === 'id') params.project = params[k]; }); }
      catch { return { id: "210", params, path: u.pathname }; }
      return {
        id: s.id,
        params,
        path: u.pathname,
      };
    }
  }
  return {
    id: "210",
    params,
    path: u.pathname,
  };
}
export type AppContext = {
  id: string;
  params: Params;
  path: string;
  model: Model;
  setModel: (update: Partial<Model> | ((m: Model) => Partial<Model>)) => void;
  go: (id: number | string, params?: Params) => void;
  back: (fallback?: number) => void;
  notify: (text: string) => void;
  modal: (content: React.ReactNode) => void;
  close: () => void;
  dirty: boolean;
  setDirty: (v: boolean) => void;
  gotoPath: (path: string) => void;
  refreshSession: () => Promise<void>;
};
export const Context = createContext<AppContext>(null!);
export const useApp = () => useContext(Context);
export function Icon({
  name = "arrow",
  size = 20,
}: {
  name?: string;
  size?: number;
}) {
  const paths: Record<string, React.ReactNode> = {
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    back: <path d="M19 12H5m5-5-5 5 5 5" />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 4 4" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    down: <path d="m6 9 6 6 6-6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    heart: (
      <path d="M20.5 5.5a5 5 0 0 0-7 0L12 7l-1.5-1.5a5 5 0 0 0-7 7L12 21l8.5-8.5a5 5 0 0 0 0-7Z" />
    ),
    external: (
      <path d="M14 4h6v6m0-6L10 14m0-10H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5" />
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    shield: (
      <>
        <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    copy: (
      <>
        <rect x="8" y="8" width="12" height="13" rx="2" />
        <path d="M16 8V3H3v13h5" />
      </>
    ),
    code: <path d="m8 6-6 6 6 6m8-12 6 6-6 6m-5-14-2 16" />,
    file: (
      <>
        <path d="M14 2H5v20h14V7l-5-5Z" />
        <path d="M14 2v6h5M8 13h8M8 17h6" />
      </>
    ),
    bell: (
      <>
        <path d="M6 8a6 6 0 0 1 12 0v7l3 3H3l3-3V8Zm3 13h6" />
      </>
    ),
    user: (
      <>
        <circle cx="12" cy="7" r="4" />
        <path d="M4 22v-3a8 8 0 0 1 16 0v3" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="10" width="16" height="12" rx="2" />
        <path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v3" />
      </>
    ),
    download: <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />,
    filter: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
        <path d="M8 3v6m8 0v6M9 15v6" />
      </>
    ),
    chat: <path d="M21 3H3v14h4v4l5-4h9V3Z" />,
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2" />
      </>
    ),
    chart: <path d="M4 3v18h17M8 16v-4m5 4V8m5 8V4" />,
    flag: <path d="M5 22V3h14l-3 5 3 5H5" />,
    mail: (
      <>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m2 5 10 8L22 5" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    logout: <path d="M9 3H3v18h6m3-5 5-4-5-4m-4 4h13" />,
    trash: (
      <>
        <path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.grid}
    </svg>
  );
}
export function Brand() {
  const a = useApp();
  return (
    <a
      className="brand"
      href="/"
      onClick={(e) => {
        e.preventDefault();
        a.go(1);
      }}
    >
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path
          d="M2 12V8a6 6 0 0 1 6-6h12v7H9v3H2Zm0 17V17h7v12H2Zm10 0V13h8v16h-8ZM23 2h7v27h-7V2Z"
          fill="currentColor"
        />
        <path d="M2 17 20 7v8L2 25v-8Z" fill="currentColor" />
      </svg>
      <span>Founders Club</span>
    </a>
  );
}
export function Link({
  to,
  children,
  className = "",
  params = {},
  ...rest
}: {
  to: number | string;
  children: React.ReactNode;
  className?: string;
  params?: Params;
  [k: string]: any;
}) {
  const a = useApp();
  const targetRoute = specs.get(sid(to))?.route || "";
  const resolvedParams = /^(\/dashboard\/projects\/|\/projects\/:id)/.test(targetRoute) && a.model.draftServerId
    ? { project: a.model.draftServerId, ...params } : params;
  return (
    <a
      {...rest}
      href={routeFor(to, resolvedParams)}
      className={className}
      onClick={(e) => {
        if (e.ctrlKey || e.metaKey || e.shiftKey) return;
        e.preventDefault();
        a.go(to, resolvedParams);
      }}
    >
      {children}
    </a>
  );
}
export function Button({
  children,
  onClick,
  variant = "primary",
  icon,
  disabled = false,
  type = "button",
  className = "",
}: {
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: string;
  icon?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      className={`btn ${variant} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
      {icon && <Icon name={icon} />}
    </button>
  );
}
export function Action({
  to,
  children,
  variant = "secondary",
  params = {},
  icon = "arrow",
}: {
  to: number | string;
  children: React.ReactNode;
  variant?: string;
  params?: Params;
  icon?: string;
}) {
  return (
    <Link to={to} params={params} className={"btn " + variant}>
      {children}
      {icon && <Icon name={icon} />}
    </Link>
  );
}
export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return <span className={"badge " + tone}>{children}</span>;
}
export function Demo() {
  return <Badge>DEMO</Badge>;
}
export function Avatar({
  name = "ФК",
  color = "#7d8274",
  large = false,
}: {
  name?: string;
  color?: string;
  large?: boolean;
}) {
  return (
    <span
      className={"avatar " + (large ? "large" : "")}
      style={{
        background: color,
      }}
    >
      {name}
    </span>
  );
}
export function PageHead({
  title,
  description,
  children,
  back = 1,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
  back?: number;
}) {
  const a = useApp();
  return (
    <>
      <button className="back-link" onClick={() => a.back(back)}>
        <Icon name="back" size={16} />
        Назад
      </button>
      <header className="page-head">
        <div>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {children}
      </header>
    </>
  );
}
export function SectionHead({
  title,
  to,
  action = "Смотреть все",
}: {
  title: string;
  to?: number;
  action?: string;
}) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      {to && (
        <Link to={to}>
          {action}
          <Icon name="arrow" size={18} />
        </Link>
      )}
    </div>
  );
}
export function Notice({
  children,
  tone = "neutral",
  title,
}: {
  children: React.ReactNode;
  tone?: string;
  title?: string;
}) {
  return (
    <div className={"notice " + tone}>
      <Icon
        name={
          tone === "danger" ? "flag" : tone === "positive" ? "check" : "shield"
        }
      />
      <div>
        {title && <strong>{title}</strong>}
        <div>{children}</div>
      </div>
    </div>
  );
}
export function Empty({
  title = "Пока ничего нет",
  text = "Новые записи появятся здесь.",
  to,
  cta = "Перейти в каталог",
  icon = "grid",
}: {
  title?: string;
  text?: string;
  to?: number;
  cta?: string;
  icon?: string;
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Icon name={icon} size={30} />
      </span>
      <h2>{title}</h2>
      <p>{text}</p>
      {to && <Action to={to}>{cta}</Action>}
    </div>
  );
}
export function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  hint,
  error,
  required = false,
  options,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  options?: string[];
  maxLength?: number;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {options ? (
        <select
          id={id}
          value={value}
          required={required}
          aria-invalid={!!error}
          aria-describedby={hint || error ? id + "-help" : undefined}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          id={id}
          value={value}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={hint || error ? id + "-help" : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-describedby={hint || error ? id + "-help" : undefined}
        />
      )}{" "}
      {(hint || error) && (
        <small id={id + "-help"} className={error ? "error-text" : ""}>
          {error || hint}
        </small>
      )}
    </div>
  );
}
export function Check({
  label,
  checked,
  onChange,
  hint,
}: {
  label: React.ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <label className="check-row">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        {label}
        {hint && <small>{hint}</small>}
      </span>
    </label>
  );
}
export function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <div className="toggle-row">
      <div>
        <strong>{label}</strong>
        {hint && <p>{hint}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={"switch " + (checked ? "on" : "")}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </div>
  );
}
export function Tabs({
  items,
  active,
  params = {},
}: {
  items: [number, string][];
  active?: string;
  params?: Params;
}) {
  const a = useApp();
  return (
    <nav className="tabs" aria-label="Разделы страницы">
      {items.map(([id, text]) => (
        <Link
          to={id}
          key={id}
          params={params}
          className={(active || a.id) === sid(id) ? "active" : ""}
          aria-current={(active || a.id) === sid(id) ? "page" : undefined}
        >
          {text}
        </Link>
      ))}
    </nav>
  );
}
export function Table({
  heads,
  rows,
}: {
  heads: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {heads.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} data-label={heads[j]}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {!rows.length && (
        <Empty
          title="Нет записей"
          text="Данные появятся после первого события."
        />
      )}
    </div>
  );
}
export function Accordion({
  items,
}: {
  items: {
    title: string;
    body: React.ReactNode;
  }[];
}) {
  return (
    <div className="accordion">
      {items.map((i, k) => (
        <details key={i.title} id={"question-" + k}>
          <summary>
            {i.title}
            <Icon name="plus" />
          </summary>
          <div>{i.body}</div>
        </details>
      ))}
    </div>
  );
}
export function Copy({
  value,
  label = "Копировать",
}: {
  value: string;
  label?: string;
}) {
  const a = useApp();
  const [copied, setCopied] = useState(false);
  return (
    <Button
      variant="secondary"
      icon={copied ? "check" : "copy"}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          a.notify("Скопировано");
        } catch {
          a.modal(
            <>
              <h2>Скопируйте вручную</h2>
              <p>Браузер не дал доступ к буферу обмена.</p>
              <textarea
                readOnly
                value={value}
                onFocus={(e) => e.target.select()}
              />
            </>,
          );
        }
      }}
    >
      {copied ? "Скопировано" : label}
    </Button>
  );
}
export function ModalFrame({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const root = ref.current;
    const get = () =>
      Array.from(
        root?.querySelectorAll<HTMLElement>(
          'a,button,input,textarea,select,[tabindex="0"]',
        ) || [],
      ).filter((e) => !e.hasAttribute("disabled") && e.getClientRects().length > 0);
    (get()[1] || get()[0] || root)?.focus();
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Tab") {
        const elems = get(),
          first = elems[0],
          last = elems[elems.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
        if (!root?.contains(document.activeElement)) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", fn);
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", fn);
      document.body.style.overflow = old;
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Диалог Founders Club"
        ref={ref}
      >
        <button
          className="icon-button close-modal"
          onClick={onClose}
          aria-label="Закрыть диалог"
        >
          <Icon name="close" />
        </button>
        {children}
      </div>
    </div>
  );
}
export function DownloadDemo({
  name = "founders-demo.txt",
  text = "Демонстрационный файл Founders Club. Не является коммерческим ресурсом.",
}: {
  name?: string;
  text?: string;
}) {
  const a = useApp();
  return (
    <Button
      icon="download"
      onClick={() => {
        const url = URL.createObjectURL(
          new Blob([text], {
            type: "text/plain;charset=utf-8",
          }),
        );
        const link = document.createElement("a");
        link.href = url;
        link.download = name;
        link.click();
        URL.revokeObjectURL(url);
        a.setModel((m) => ({
          downloads: [...new Set([...m.downloads, name])],
        }));
        a.notify("Демо-файл скачан. Реальный архив не подключён.");
      }}
    >
      Скачать демо-файл
    </Button>
  );
}
export function ProductCard({
  project = p0,
  compact = false,
}: {
  project?: Project;
  compact?: boolean;
}) {
  const a = useApp(),
    saved = a.model.saved.includes(project.slug);
  return (
    <article className={"project-card " + (compact ? "compact" : "")}>
      <Link
        to={35}
        params={{
          slug: project.slug,
        }}
        className="project-art"
      >
        <img
          src={project.image}
          alt={"Интерфейс " + project.name}
          loading="lazy"
        />
        {project.isDemo !== false && <span className="art-demo">DEMO</span>}
      </Link>
      <div className="project-info">
        <span className="category-tag">{project.tag}</span>
        <h3>
          <Link
            to={35}
            params={{
              slug: project.slug,
            }}
          >
            {project.name}
          </Link>
        </h3>
        <p>{project.desc}</p>
        <div className="project-meta">
          <Link
            to={46}
            params={{
              handle: project.owner,
            }}
            className="author"
          >
            <Avatar name={project.initials} color={project.color} />
            <span>@{project.owner}</span>
          </Link>
          <button
            className={"icon-button save " + (saved ? "selected" : "")}
            aria-label={(saved ? "Убрать" : "Сохранить") + " " + project.name}
            aria-pressed={saved}
            onClick={() => {
              if (!a.model.logged) {
                a.setModel({
                  returnTo: routeFor(35, {
                    slug: project.slug,
                  }),
                });
                a.go(102);
                return;
              }
              a.setModel((m) => ({
                saved: saved
                  ? m.saved.filter((x) => x !== project.slug)
                  : [...m.saved, project.slug],
              }));
              a.notify(saved ? "Удалено из сохранённого" : "Проект сохранён");
            }}
          >
            <Icon name="heart" size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
const p0 = projects[0];
export function ProjectGrid({ items = projects }: { items?: Project[] }) {
  return (
    <div className="project-grid">
      {items.map((p) => (
        <ProductCard project={p} key={p.slug} />
      ))}
    </div>
  );
}
export function StatCards({
  values = ["—", "—", "—", "—"],
  labels = ["Показы", "Открытия", "Переходы на сайт", "Голоса"],
}: {
  values?: string[];
  labels?: string[];
}) {
  return (
    <div className="stats-grid">
      {labels.map((label, i) => (
        <div className="stat-card" key={label}>
          <span>{label}</span>
          <strong>{values[i]}</strong>
          <small>Нет подключённых данных</small>
        </div>
      ))}
    </div>
  );
}
export function FormPanel({
  title,
  description,
  fields,
  submit = "Сохранить",
  onSubmit,
  children,
}: {
  title?: string;
  description?: string;
  fields: {
    label: string;
    key: string;
    type?: string;
    hint?: string;
    required?: boolean;
    options?: string[];
  }[];
  submit?: string;
  onSubmit?: (data: Record<string, string>) => void | Promise<void>;
  children?: React.ReactNode;
}) {
  const a = useApp();
  const [data, setData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const requestKey = useRef(crypto.randomUUID());
  const requestKind = ({'019':'contact','069':'resource','083':'tool','155':'billing','151':'affiliate','163':'editorial','130':'appeal'} as Record<string,string>)[a.id];
  return (
    <form
      className="panel form-panel"
      onSubmit={async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
          const values = Object.fromEntries(fields.map(f => [f.key, data[f.key] ?? f.options?.[0] ?? ""]));
          if (onSubmit) await onSubmit(values);
          else if (requestKind) {
            const result = await api.submitRequest(requestKind, values, requestKey.current);
            a.notify(`Обращение ${result.public_id.slice(0,8)} сохранено на сервере. ${a.model.logged ? 'Ответ появится в разделе обращений.' : 'Сохраните номер для связи с поддержкой.'}`);
          } else throw new Error("Этот раздел пока не подключён к серверу. Данные не сохранены.");
          a.setDirty(false);
        } catch (error) {
          a.notify(error instanceof Error ? error.message : "Не удалось отправить форму.");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {title && <h2>{title}</h2>}
      {description && <p>{description}</p>}
      {fields.map((f) => (
        <Field
          key={f.key}
          label={f.label}
          type={f.type}
          hint={f.hint}
          required={f.required}
          options={f.options}
          value={data[f.key] ?? f.options?.[0] ?? ""}
          onChange={(v) => {
            setData((d) => ({
              ...d,
              [f.key]: v,
            }));
            a.setDirty(true);
          }}
        />
      ))}
      {children}
      <div className="form-actions">
        <Button type="submit" icon="check" disabled={submitting}>
          {submitting ? "Отправляем…" : requestKind ? submit.replace("демо-", "") : submit}
        </Button>
      </div>
    </form>
  );
}
