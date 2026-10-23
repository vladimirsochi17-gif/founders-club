import React, { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  Action,
  Avatar,
  Badge,
  Brand,
  Button,
  Context,
  Empty,
  Field,
  Icon,
  Link,
  ModalFrame,
  Notice,
  PageHead,
  ProductCard,
  ProjectGrid,
  readModel,
  initial,
  resolveRoute,
  resources,
  routeFor,
  sid,
  specs,
  useApp,
  projects,
  type Model,
  type Params,
} from "./core";
import "./quality.css";
import { api } from "../../lib/api";
import { useProjects } from "../../lib/useProjects";

const Home = lazy(() =>
  import("./Public").then((module) => ({ default: module.Home })),
);
const Catalog = lazy(() =>
  import("./Public").then((module) => ({ default: module.Catalog })),
);
const PublicEditorial = lazy(() =>
  import("./Public").then((module) => ({ default: module.PublicEditorial })),
);
const ProjectPage = lazy(() =>
  import("./Public").then((module) => ({ default: module.ProjectPage })),
);
const Profile = lazy(() =>
  import("./PublicProfile").then((module) => ({ default: module.PublicProfile })),
);
const Wall = lazy(() =>
  import("./Public").then((module) => ({ default: module.Wall })),
);
const ResourceArea = lazy(() =>
  import("./Resources").then((module) => ({ default: module.ResourceArea })),
);
const Auth = lazy(() =>
  import("./Account").then((module) => ({ default: module.Auth })),
);
const Billing = lazy(() =>
  import("./Account").then((module) => ({ default: module.Billing })),
);
const Club = lazy(() =>
  import("./Account").then((module) => ({ default: module.Club })),
);
const Dashboard = lazy(() =>
  import("./Account").then((module) => ({ default: module.Dashboard })),
);
const Ownership = lazy(() =>
  import("./Account").then((module) => ({ default: module.Ownership })),
);
const ProfileEdit = lazy(() =>
  import("./Account").then((module) => ({ default: module.ProfileEdit })),
);
const Wizard = lazy(() =>
  import("./Account").then((module) => ({ default: module.Wizard })),
);
const Admin = lazy(() =>
  import("./Operations").then((module) => ({ default: module.Admin })),
);
const LiveModeration = lazy(() => import("./LiveModeration").then(module => ({ default: module.LiveModeration })));
const Requests = lazy(() => import("./Requests").then(module => ({ default: module.Requests })));
const Promotion = lazy(() =>
  import("./Operations").then((module) => ({ default: module.Promotion })),
);
const SystemPage = lazy(() =>
  import("./Operations").then((module) => ({ default: module.SystemPage })),
);
const Review = lazy(() => import("./Review"));
function Search() {
  const a = useApp();
  const { items: searchableProjects } = useProjects();
  const [q, setQ] = useState("");
  const found = searchableProjects.filter((p) =>
    (p.name + " " + p.desc + " " + p.owner)
      .toLowerCase()
      .includes(q.toLowerCase()),
  );
  return (
    <div className="command-search">
      <h2>Что вы ищете?</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          try {
            localStorage.setItem("fc-last-query", q);
          } catch {}
          a.go(9, {
            q,
          });
        }}
      >
        <div className="search-field">
          <Icon name="search" />
          <input
            autoFocus
            aria-label="Поиск по платформе"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Проекты, авторы, инструменты…"
          />
          <kbd>↵</kbd>
        </div>
      </form>
      <span className="search-group-label">
        {q ? "СОВПАДЕНИЯ В ПРОЕКТАХ" : "ПОПРОБУЙТЕ НАЙТИ"}
      </span>
      {found.length ? (
        found.slice(0, 4).map((p) => (
          <Link
            to={35}
            params={{
              slug: p.slug,
            }}
            className="search-result"
            key={p.slug}
          >
            <Avatar name={p.name.slice(0, 2)} color={p.color} />
            <div>
              <strong>{p.name}</strong>
              <span>{p.tag}{p.isDemo ? " · DEMO" : ""}</span>
            </div>
            <Icon name="arrow" />
          </Link>
        ))
      ) : (
        <Empty
          title="Нет совпадений"
          text="Попробуйте другое название."
          icon="search"
        />
      )}
      <div className="search-footer">
        <span>Esc — закрыть</span>
        <Button
          variant="text"
          onClick={() => {
            a.go(10);
          }}
        >
          Расширенный поиск
        </Button>
      </div>
    </div>
  );
}
function Navigation() {
  const a = useApp();
  return (
    <>
      <h2>Навигация</h2>
      <nav className="mobile-navigation">
        {[
          [2, "Проекты"],
          [25, "Стена"],
          [53, "Библиотека"],
          [71, "Founder Arsenal"],
          [84, "Launch Kits"],
          [93, "Сообщество"],
          [16, "Тарифы"],
        ].map(([n, t]) => (
          <Link to={Number(n)} key={String(n)}>
            {t}
            <Icon name="arrow" />
          </Link>
        ))}
      </nav>
      <div className="form-actions">
        <Action to={a.model.logged ? 131 : 102} variant="primary">
          {a.model.logged ? "Мой кабинет" : "Войти"}
        </Action>
        <Action to={119}>Добавить проект</Action>
      </div>
    </>
  );
}
function Header() {
  const a = useApp(),
    n = Number(a.id);
  return (
    <header className="site-header">
      <div className="header-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Основная навигация">
          {[
            [
              2,
              "Проекты",
              n <= 15 || (n >= 22 && n <= 24) || (n >= 35 && n <= 52),
            ],
            [25, "Стена", n >= 25 && n <= 34],
            [53, "Библиотека", n >= 53 && n <= 70],
            [71, "Инструменты", n >= 71 && n <= 92],
            [93, "Сообщество", n >= 93 && n <= 101],
            [16, "Тарифы", n === 16 || n === 17],
          ].map(([to, label, active]) => (
            <Link
              to={Number(to)}
              key={String(to)}
              className={
                active && (to !== 2 || n < 25 || n > 34) ? "active" : ""
              }
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="header-search"
            aria-label="Открыть поиск"
            onClick={() => a.modal(<Search />)}
          >
            <Icon name="search" />
            <span>Поиск проектов и инструментов</span>
            <kbd>⌘ K</kbd>
          </button>
          {a.model.logged ? (
            <button
              className="account-trigger"
              aria-label="Меню аккаунта"
              onClick={() =>
                a.modal(
                  <>
                    <div className="founder-row">
                      <Avatar name={a.model.name.slice(0, 2)} large />
                      <div>
                        <h2>{a.model.name}</h2>
                        <Badge>{a.model.adminRole ? "Команда платформы" : "Участник"}</Badge>
                      </div>
                    </div>
                    <nav className="mobile-navigation">
                      {[
                        [131, "Мой кабинет"],
                        [133, "Мои проекты"],
                        [145, "Мои ресурсы"],
                        [118, "Подписка"],
                        [146, "Настройки"],
                      ].map(([to, t]) => (
                        <Link key={String(to)} to={Number(to)}>
                          {t}
                          <Icon name="arrow" />
                        </Link>
                      ))}
                    </nav>
                    <Button
                      variant="text"
                      onClick={() => {
                        void api.logout().then(async () => {
                          await a.refreshSession();
                          a.go(102);
                        }).catch((error) => a.notify(error.message));
                      }}
                    >
                      Выйти
                    </Button>
                  </>,
                )
              }
            >
              <Avatar name={a.model.name.slice(0, 2)} />
            </button>
          ) : (
            <Link to={102} className="header-login">
              Войти
            </Link>
          )}
          <Link
            to={a.model.logged ? 131 : 16}
            className="btn primary header-cta"
          >
            {a.model.logged ? "Мой кабинет" : "Начать за 299 ₽"}
            <Icon name="arrow" size={18} />
          </Link>
          <button
            className="icon-button menu-button"
            aria-label="Открыть меню"
            onClick={() => a.modal(<Navigation />)}
          >
            <Icon name="menu" />
          </button>
        </div>
      </div>
    </header>
  );
}
function Footer() {
  const a = useApp();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div>
            <Brand />
            <p>Для тех, кто создаёт своё.</p>
            <span className="fine">Платформа независимых авторов</span>
          </div>
          {[
            {
              title: "Исследуйте",
              links: [
                [2, "Проекты"],
                [25, "Project Wall"],
                [11, "Подборки"],
                [22, "Журнал"],
              ],
            },
            {
              title: "Создавайте",
              links: [
                [53, "Design Vault"],
                [71, "Founder Arsenal"],
                [84, "Launch Kits"],
                [119, "Добавить проект"],
              ],
            },
            {
              title: "Оставайтесь рядом",
              links: [
                [93, "Сообщество"],
                [16, "Тарифы"],
                [18, "Вопросы и ответы"],
                [19, "Контакты"],
              ],
            },
          ].map((g) => (
            <div key={g.title}>
              <h3>{g.title}</h3>
              {g.links.map(([to, t]) => (
                <Link to={Number(to)} key={String(to)}>
                  {t}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Founders Club</span>
          <div>
            <Link to={223}>Конфиденциальность</Link>
            <Link to={224}>Условия</Link>
            <Link to={225}>Лицензии</Link>
            <Link to={226}>Правила публикаций</Link>
            <Link to={228}>Реклама</Link>
          </div>
        </div>
        <div className="prototype-disclosure">
          <span>
            Стартовые проекты, авторы и изображения помечены как демонстрационные.
          </span>
          {import.meta.env.DEV && (
            <a
              href="/_review"
              onClick={(e) => {
                e.preventDefault();
                a.gotoPath("/_review");
              }}
            >
              Карта экранов и проверка
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
function StateView({ state }: { state: string }) {
  const a = useApp();
  if (state === "loading")
    return (
      <div className="container page">
        <PageHead title={specs.get(a.id)?.name || "Загрузка"} />
        <div
          className="skeleton-grid"
          aria-busy="true"
          aria-label="Загрузка данных"
        >
          {Array.from(
            {
              length: 6,
            },
            (_, i) => (
              <div className="skeleton-card" key={i}>
                <i />
                <b />
                <span />
                <span />
              </div>
            ),
          )}
        </div>
        <p className="fine">
          Изолированное состояние загрузки для проверки макета.
        </p>
      </div>
    );
  return (
    <div className="container page">
      <PageHead title={specs.get(a.id)?.name || "Состояние"} />
      <Empty
        title={
          state === "empty"
            ? "Здесь пока нет данных"
            : state === "error"
              ? "Не удалось загрузить данные"
              : "Для этого нужен доступ"
        }
        text={
          state === "empty"
            ? "Когда появятся записи, они будут отображаться здесь."
            : state === "error"
              ? "Проверьте соединение. Не повторяйте оплату, пока не выяснен статус предыдущего заказа."
              : "Войдите в аккаунт и проверьте необходимые права. Оплаченная подписка не заменяет подтверждение авторства."
        }
        icon={
          state === "error" ? "flag" : state === "restricted" ? "lock" : "file"
        }
      />
      <div className="center">
        <Button
          onClick={() =>
            a.go(a.id, {
              ...a.params,
              state: "",
            })
          }
        >
          {state === "error" ? "Повторить" : "Вернуться к макету"}
        </Button>
        {state === "restricted" && <Action to={102}>Войти</Action>}
      </div>
    </div>
  );
}
function Screen() {
  const a = useApp();
  const id = Number(a.id);
  if (!a.model.sessionReady && ((id >= 108 && id <= 209) || id === 51))
    return <div className="container page" role="status" aria-busy="true">Проверяем сессию…</div>;
  if (a.params.state && a.params.state !== "filled")
    return <StateView state={a.params.state} />;
  if (a.id === "review") return <Review />;
  if (id >= 174 && id <= 209 && !a.model.adminRole)
    return <div className="container page"><Empty title="Доступ ограничен" text="Для этого раздела нужен аккаунт сотрудника платформы." /><Action to={102}>Войти</Action></div>;
  if (id === 1) return <Home />;
  if (id >= 2 && id <= 9) return <Catalog />;
  if (id >= 10 && id <= 24) return <PublicEditorial />;
  if (id >= 25 && id <= 34) return <Wall />;
  if (id >= 35 && id <= 45) return <ProjectPage />;
  if (id >= 46 && id <= 50) return <Profile />;
  if (id === 51) return <ProfileEdit />;
  if (id === 52) return <Ownership />;
  if ((id >= 53 && id <= 92) || id === 64 || id === 66) return <ResourceArea />;
  if (id >= 93 && id <= 101) return <Club />;
  if (id >= 102 && id <= 107) return <Auth />;
  if ((id >= 108 && id <= 118) || id === 154 || id === 155) return <Billing />;
  if (id >= 119 && id <= 130) return <Wizard />;
  if (id >= 131 && id <= 157) return <Dashboard />;
  if (id >= 158 && id <= 173) return <Promotion />;
  if ([174, 182, 183].includes(id)) return <LiveModeration />;
  if ([208, 209].includes(id)) return <Requests admin />;
  if (id >= 174 && id <= 209) return <Admin />;
  if (id === 218) return <Requests />;
  return <SystemPage />;
}
export function FoundersApp() {
  const browserPath = () => location.pathname + location.search;
  const [route, setRoute] = useState(() => resolveRoute(browserPath()));
  const [model, updateModel] = useState<Model>(readModel);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [toast, setToast] = useState("");
  const [dirty, updateDirty] = useState(false);
  const dirtyRef = useRef(false);
  const setDirty = (value: boolean) => {
    dirtyRef.current = value;
    updateDirty(value);
  };
  const [offline, setOffline] = useState(!navigator.onLine);
  const scrolls = useRef(new Map<string, number>());
  const currentPath = useRef(browserPath());
  const authenticatedRef = useRef(false);
  const sessionUser = useRef<string | null>(null);
  const sessionVersion = useRef(0);
  const persistTimer = useRef<number | undefined>(undefined);
  const notify = (message: string) => setToast(message);
  const modalOpen = useRef(false);
  const openModal = (content: React.ReactNode) => {
    if (!modalOpen.current)
      history.pushState(
        {
          fc: true,
          fcModal: true,
        },
        "",
        location.href,
      );
    modalOpen.current = true;
    setModalContent(content);
  };
  const close = () => {
    setModalContent(null);
    modalOpen.current = false;
    if (history.state?.fcModal) history.back();
  };
  const setModel = (change: Partial<Model> | ((m: Model) => Partial<Model>)) =>
    updateModel((m) => {
      const next = {
        ...m,
        ...(typeof change === "function" ? change(m) : change),
      };
      return next;
    });
  useEffect(() => {
    try {
      localStorage.removeItem("fc-design-v3");
      localStorage.setItem("fc-reduced-motion", String(model.themeMotion));
    } catch { /* Private browsing may disable storage. */ }
    if (!authenticatedRef.current || !model.logged) return;
    const userId = sessionUser.current;
    persistTimer.current = window.setTimeout(() => {
      if (userId !== sessionUser.current) return;
      void api.patchState({ themeMotion: model.themeMotion, saved: model.saved,
        notifications: model.notifications, preferences: model.preferences, onboardingGoal: model.onboardingGoal })
        .catch(() => setToast("Не удалось синхронизировать настройки с сервером."));
    }, 350);
    return () => window.clearTimeout(persistTimer.current);
  }, [model.themeMotion, model.saved, model.notifications, model.preferences, model.onboardingGoal, model.logged]);
  const refreshSession = async () => {
    const version = ++sessionVersion.current;
    const session = await api.session();
    if (version !== sessionVersion.current) return;
    window.clearTimeout(persistTimer.current);
    authenticatedRef.current = !!session.authenticated;
    if (!session.authenticated) {
      sessionUser.current = null;
      updateModel({ ...readModel(), sessionReady: true });
      return;
    }
    const sameUser = sessionUser.current === session.user.publicId;
    sessionUser.current = session.user.publicId;
    const subscription = session.subscription;
    const owned = await api.myProjects();
    if (version !== sessionVersion.current) return;
    const draft = owned.find(row => ['draft', 'revisions'].includes(row.status));
    updateModel((m) => ({
      ...(sameUser ? m : initial),
      ...(session.state || {}),
      ...(!sameUser && draft ? {
        draftServerId: draft.public_id,
        draft: { name: draft.name, slug: draft.slug, short: draft.short_description,
          description: draft.description, category: draft.category, stage: draft.stage,
          url: draft.website_url || "", proof: draft.ownership_proof || "" },
        media: draft.media || [],
        projectStatus: ({ draft: "Черновик", revisions: "Нужны правки", pending: "На проверке", published: "Опубликован", rejected: "Отклонён", archived: "В архиве" } as Record<string,string>)[draft.status],
      } : {}),
      ownProjects: owned,
      logged: true,
      sessionReady: true,
      email: session.user.email,
      name: session.user.name,
      handle: session.user.handle || m.handle,
      bio: session.user.bio || "",
      subscribed:
        !!subscription && ["active", "cancelled"].includes(subscription.status) && new Date(subscription.currentPeriodEnd).getTime() > Date.now(),
      cancelled: !!subscription?.cancelAtPeriodEnd,
      subscriptionEnd: subscription?.currentPeriodEnd || "",
      plan: subscription?.plan === "plus" ? "Plus" : "Founder",
      adminRole: ["moderator", "admin", "superadmin"].includes(
        session.user.role,
      )
        ? session.user.role
        : undefined,
    }));
  };
  function commit(path: string, push = true, restore = false) {
    scrolls.current.set(currentPath.current, window.scrollY);
    if (push) {
      const url = path;
      if (history.state?.fcModal)
        history.replaceState(
          {
            fc: true,
          },
          "",
          url,
        );
      else
        history.pushState(
          {
            fc: true,
          },
          "",
          url,
        );
    }
    modalOpen.current = false;
    currentPath.current = path;
    setRoute(resolveRoute(path));
    setModalContent(null);
    requestAnimationFrame(() => {
      window.scrollTo({
        top: restore ? scrolls.current.get(path) || 0 : 0,
        behavior: "instant" as ScrollBehavior,
      });
      document.getElementById("main-content")?.focus({
        preventScroll: true,
      });
    });
  }
  function gotoPath(path: string) {
    if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
      notify("Некорректный адрес перехода.");
      return;
    }
    if (dirtyRef.current) {
      openModal(
        <>
          <h2>Остались несохранённые изменения</h2>
          <p>
            Останьтесь в форме или уйдите без сохранения. Уже сохранённый
            черновик останется.
          </p>
          <div className="form-actions">
            <Button onClick={close}>Остаться</Button>
            <Button
              variant="danger"
              onClick={() => {
                setDirty(false);
                commit(path);
              }}
            >
              Уйти без сохранения
            </Button>
          </div>
        </>,
      );
      return;
    }
    commit(path);
  }
  const go = (id: number | string, params: Params = {}) => {
    const n = Number(id);
    if (n === 235) {
      openModal(<Search />);
      return;
    }
    if (n === 234) {
      openModal(<Navigation />);
      return;
    }
    gotoPath(routeFor(id, params));
  };
  const back = (fallback = 1) => {
    if (modalContent) {
      close();
      return;
    }
    if (dirtyRef.current) {
      gotoPath(routeFor(fallback));
      return;
    }
    if (history.state?.fc) {
      history.back();
    } else gotoPath(routeFor(fallback));
  };
  useEffect(() => {
    const pop = () => {
      const path = browserPath();
      if (modalOpen.current) {
        modalOpen.current = false;
        setModalContent(null);
        if (path === currentPath.current) return;
      }
      if (path === currentPath.current) return;
      if (dirtyRef.current) {
        history.pushState(
          {
            fc: true,
          },
          "",
          currentPath.current,
        );
        gotoPath(path);
        return;
      }
      commit(path, false, true);
    };
    const keys = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        openModal(<Search />);
      }
    };
    const unload = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    const online = () => setOffline(!navigator.onLine);
    window.addEventListener("popstate", pop);
    window.addEventListener("keydown", keys);
    window.addEventListener("beforeunload", unload);
    window.addEventListener("online", online);
    window.addEventListener("offline", online);
    return () => {
      window.removeEventListener("popstate", pop);
      window.removeEventListener("keydown", keys);
      window.removeEventListener("beforeunload", unload);
      window.removeEventListener("online", online);
      window.removeEventListener("offline", online);
    };
  }, [dirty]);
  useEffect(() => {
    void refreshSession().catch(() => {
      updateModel({ ...readModel(), sessionReady: true });
      setToast("Сервер недоступен. Вход и сохранение данных временно недоступны.");
    });
    return () => window.clearTimeout(persistTimer.current);
  }, []);
  useEffect(() => {
    document.title =
      (specs.get(route.id)?.name || "Карта прототипа") + " — Founders Club";
    document.documentElement.lang = "ru";
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "robots");
      document.head.appendChild(meta);
    }
    const indexable =
      /^(\/$|\/projects(?:\/|$)|\/categories\/|\/tags\/|\/collections(?:\/|$)|\/about$|\/how-it-works$|\/pricing(?:\/|$)|\/faq$|\/contact$|\/journal(?:\/|$)|\/updates$|\/wall(?:\/|$)|\/p\/|\/u\/|\/vault(?:\/|$)|\/arsenal(?:\/|$)|\/kits(?:\/|$)|\/club(?:\/|$)|\/help$|\/legal\/|\/status$)/.test(
        route.path,
      );
    meta.setAttribute(
      "content",
      indexable ? "index,follow" : "noindex,nofollow",
    );
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", location.origin + location.pathname);
  }, [route.id, route.path]);
  const context = {
    ...route,
    model,
    setModel,
    go,
    back,
    notify,
    modal: openModal,
    close,
    dirty,
    setDirty,
    gotoPath,
    refreshSession,
  };
  const admin = Number(route.id) >= 174 && Number(route.id) <= 209;
  return (
    <Context.Provider value={context}>
      <div className="fc-app" data-session-ready={model.sessionReady ? "true" : "false"}>
        <a
          className="skip-link"
          href="#main-content"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("main-content")?.focus();
          }}
        >
          К содержимому
        </a>
        {!admin && <Header />}
        {offline && (
          <div className="offline-banner" role="status">
            <Icon name="flag" />
            Нет соединения. Локальный черновик не синхронизирован с сервером.
          </div>
        )}
        <div id="main-content" tabIndex={-1}>
          <Suspense
            fallback={
              <div className="container page" aria-busy="true">
                <div className="skeleton-grid">
                  {Array.from({ length: 6 }, (_, index) => (
                    <div className="skeleton-card" key={index}>
                      <i />
                      <b />
                      <span />
                      <span />
                    </div>
                  ))}
                </div>
              </div>
            }
          >
            <Screen />
          </Suspense>
        </div>
        {!admin && <Footer />}
        {modalContent && (
          <ModalFrame onClose={close}>{modalContent}</ModalFrame>
        )}
        {toast && (
          <div className="toast" role="status" aria-live="polite">
            <Icon name="check" />
            <span>{toast}</span>
            <button
              className="icon-button"
              aria-label="Закрыть уведомление"
              onClick={() => setToast("")}
            >
              <Icon name="close" />
            </button>
          </div>
        )}
      </div>
    </Context.Provider>
  );
}
