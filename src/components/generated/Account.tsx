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
  SectionHead,
  StatCards,
  Table,
  Tabs,
  Toggle,
  projects,
  resources,
  routeFor,
  specs,
  useApp,
} from "./core";
import { Pricing } from "./Public";
import { ResourceCard } from "./Resources";
import { api, ApiError } from "../../lib/api";
import { MyProjects } from "./MyProjects";
const accountNav: [number, string, string][] = [
  [131, "Обзор", "grid"],
  [133, "Мои проекты", "file"],
  [137, "Аналитика", "chart"],
  [145, "Мои ресурсы", "code"],
  [144, "Сообщество", "chat"],
  [153, "Продвижение", "sun"],
  [118, "Подписка", "shield"],
  [146, "Настройки", "user"],
];
export function AccountShell({ children }: { children: React.ReactNode }) {
  const a = useApp();
  if (!a.model.logged) return <div className="container page"><Empty title="Войдите в аккаунт" text="Личный кабинет доступен после подтверждения email." to={102} cta="Войти" /></div>;
  return (
    <div className="account-shell container">
      <aside className="account-nav">
        <div className="account-identity">
          <Avatar name={a.model.name.slice(0, 2).toUpperCase()} large />
          <div>
            <strong>{a.model.name}</strong>
            <span>Личный кабинет</span>
          </div>
        </div>
        <nav aria-label="Кабинет">
          {accountNav.map(([id, name, icon]) => (
            <Link
              to={id}
              key={id}
              className={a.id === String(id) ? "active" : ""}
            >
              <Icon name={icon} />
              {name}
            </Link>
          ))}
        </nav>
        <div className="side-membership">
          <span>Ваш доступ</span>
          <strong>{a.model.subscribed ? a.model.plan : "Без подписки"}</strong>
          <p>
            {a.model.subscribed
              ? "Доступ до конца оплаченного периода"
              : "Больше инструментов для ваших идей."}
          </p>
          <Action to={a.model.subscribed ? 118 : 16} variant="text">
            {a.model.subscribed ? "Управлять" : "Посмотреть тарифы"}
          </Action>
        </div>
      </aside>
      <main className="account-main">{children}</main>
    </div>
  );
}
export function Auth() {
  const a = useApp(),
    id = Number(a.id);
  const [email, setEmail] = useState(a.model.email);
  const [name, setName] = useState(
    a.model.name === "Автор проекта" ? "" : a.model.name,
  );
  const [consent, setConsent] = useState(false);
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(id === 104);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setSent(id === 104); setCode(""); setError("");
  }, [id]);
  const target = a.params.returnTo || a.model.returnTo || "/dashboard";
  const purpose =
    id === 103 || (id === 104 && a.model.authPurpose === "signup")
      ? "signup"
      : id === 105
        ? "recover"
        : "login";

  async function submitAuth() {
    setError("");
    setLoading(true);
    try {
      if (!sent && id !== 104) {
        const result = await api.requestCode({
          email,
          purpose,
          name: name || undefined,
          termsAccepted: consent,
        });
        a.setModel({
          email,
          name: name || a.model.name,
          authPurpose: purpose,
          authDevCode: result.devCode || "",
        });
        if (id === 103) a.go(104, { returnTo: target });
        else setSent(true);
        return;
      }
      await api.verifyCode({ email: email || a.model.email, code, purpose });
      await a.refreshSession();
      a.notify("Вход подтверждён. Сессия сохранена безопасной cookie.");
      a.gotoPath(
        purpose === "signup" && target === "/dashboard"
          ? routeFor(106)
          : target,
      );
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "Не удалось выполнить вход. Попробуйте ещё раз.",
      );
    } finally {
      setLoading(false);
    }
  }
  if (id === 106 || id === 107)
    return (
      <div className="container page onboarding">
        <PageHead
          title={id === 106 ? "Рады вашему замыслу." : "С чего начнём?"}
          description="Не нужно делать всё сразу. Выберите то, что полезно сейчас."
        />
        <div className="goal-grid">
          {[
            {
              title: "Показать свой проект",
              desc: "Расскажите, что создаёте, и получите свою публичную страницу.",
              icon: "file",
              to: 119,
            },
            {
              title: "Найти инструменты",
              desc: "Компоненты, шаблоны и инструкции для следующего шага.",
              icon: "code",
              to: 53,
            },
            {
              title: "Найти единомышленников",
              desc: "Узнайте, как устроен клуб подтверждённых основателей.",
              icon: "chat",
              to: 93,
            },
          ].map((g) => (
            <Link className="goal-card" key={g.title} to={g.to}>
              <Icon name={g.icon} size={32} />
              <h2>{g.title}</h2>
              <p>{g.desc}</p>
              <span className="inline-link">
                Начать <Icon name="arrow" />
              </span>
            </Link>
          ))}
        </div>
        <Action to={131} variant="text">
          Пока пропустить
        </Action>
      </div>
    );
  return (
    <div className="auth-layout">
      <div className="auth-photo">
        <img
          src="/assets/founders-architecture.jpg"
          alt="Студия с видом на горы"
        />
        <div>
          <h2>
            У больших идей
            <br />
            бывает маленькое начало.
          </h2>
          <p>Создавайте. Делитесь. Находите своё окружение.</p>
        </div>
      </div>
      <div className="auth-content">
        <button className="back-link" onClick={() => a.back(1)}>
          <Icon name="back" />
          Назад
        </button>
        <div className="auth-form">
          <h1>
            {id === 102
              ? "С возвращением."
              : id === 103
                ? "Начните свою историю."
                : id === 104
                  ? a.model.authDevCode ? "Введите тестовый код" : "Проверьте почту"
                  : "Вернём доступ."}
          </h1>
          <p>
            {id === 102
              ? "Получите одноразовый код — пароль не нужен."
              : id === 103
                ? "Один аккаунт для проектов, инструментов и сообщества."
                : id === 104
                  ? a.model.authDevCode ? `Код для ${a.model.email || email} показан ниже. Письмо не отправляется.` : `Введите код, отправленный на ${a.model.email || email}.`
                  : "Укажите email, с которым создавали аккаунт."}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submitAuth();
            }}
          >
            {id === 103 && (
              <Field
                label="Как вас зовут"
                value={name}
                onChange={setName}
                placeholder="Ваше имя"
              />
            )}
            {id === 104 || (sent && [102,105].includes(id)) ? (
              <Field
                label="Код подтверждения"
                value={code}
                onChange={(v) => {
                  setCode(v);
                  setError("");
                }}
                maxLength={6}
                required
                error={error}
                placeholder="000000"
              />
            ) : (
              <Field
                label="Email"
                value={email}
                onChange={setEmail}
                type="email"
                required
                placeholder="you@project.ru"
              />
            )}
            {id === 103 && (
              <Check
                checked={consent}
                onChange={setConsent}
                label={
                  <span>
                    Принимаю <Link to={224}>условия</Link> и{" "}
                    <Link to={223}>политику обработки данных</Link>
                  </span>
                }
              />
            )}
            {error && (
              <p role="alert" className="error-text">
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={loading || (id === 103 && !consent)}
              icon="arrow"
            >
              {loading
                ? "Подождите…"
                : id === 102
                  ? sent
                    ? "Подтвердить вход"
                    : "Получить код"
                  : id === 103
                    ? "Создать аккаунт"
                    : id === 104
                      ? "Подтвердить код"
                      : sent ? "Подтвердить код" : "Получить код восстановления"}
            </Button>
          </form>
          {sent && id === 105 && (
            <Notice tone="positive">
              Если адрес зарегистрирован, инструкция уже отправлена. Ответ
              одинаков для существующих и новых адресов.
            </Notice>
          )}
          {a.model.authDevCode && (id === 104 || (sent && [102,105].includes(id))) && (
            <Notice tone="warm" title="Тестовый режим">
              Тестовый код: {a.model.authDevCode}. Письмо не отправляется.
              В публичной песочнице аккаунт доступен только в браузере регистрации.
            </Notice>
          )}
          {id === 102 && (
            <>
              <div className="auth-links">
                <Link to={105}>Не получается войти?</Link>
                <Link
                  to={103}
                  params={{
                    returnTo: target,
                  }}
                >
                  Создать аккаунт
                </Link>
              </div>
            </>
          )}
          {id === 103 && (
            <p className="center">
              Уже есть аккаунт?{" "}
              <Link
                to={102}
                params={{
                  returnTo: target,
                }}
              >
                Войти
              </Link>
            </p>
          )}
          {id === 104 && (
            <div className="auth-links">
              <Button
                variant="text"
                onClick={() =>
                  void api
                    .requestCode({ email: a.model.email, purpose })
                    .then((result) => {
                      a.setModel({ authDevCode: result.devCode || "" });
                      a.notify("Новый код отправлен.");
                    })
                    .catch((caught) =>
                      setError(
                        caught instanceof ApiError
                          ? caught.message
                          : "Не удалось отправить код.",
                      ),
                    )
                }
              >
                Отправить ещё раз
              </Button>
              <Action to={103} variant="text">
                Изменить email
              </Action>
            </div>
          )}
          <p className="auth-demo">
            <Icon name="shield" />
            Одноразовый код действует 10 минут. Сессия хранится в httpOnly
            cookie.
          </p>
        </div>
      </div>
    </div>
  );
}
export function Billing() {
  const a = useApp(),
    id = Number(a.id),
    plus = [109,110].includes(id) ? (a.params.plan || (a.model.checkoutPlan === "Plus" ? "plus" : "founder")) === "plus" : a.model.plan === "Plus",
    price = plus ? "699" : "299",
    promo = id !== 109 && a.model.purchaseKind === "promotion",
    promoPrice = a.model.promoPrice || "790 ₽",
    purchaseTitle = promo
      ? a.model.promoTitle || "Рекламное размещение"
      : "Founder" + (plus ? " Plus" : "");
  const [paymentState, setPaymentState] = useState("waiting");
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [billingBusy, setBillingBusy] = useState(false);
  const [billingError, setBillingError] = useState("");
  const [payments, setPayments] = useState<any[]>([]);
  useEffect(() => {
    if (id !== 117 || !a.model.logged) return;
    let alive = true;
    api.billingHistory().then(rows => { if (alive) setPayments(rows); })
      .catch(error => { if (alive) setBillingError(error.message); });
    return () => { alive = false; };
  }, [id, a.model.logged]);
  const end = a.model.subscriptionEnd
    ? new Intl.DateTimeFormat("ru-RU", { dateStyle: "long", timeZone: "Europe/Moscow" }).format(
        new Date(a.model.subscriptionEnd),
      )
    : "конца оплаченного периода";
  if (id === 108) return <Pricing />;
  if (id === 109)
    return (
      <div className="container page checkout-page">
        <PageHead
          title="Один шаг к новым возможностям"
          description="Проверьте состав подписки и условия продления."
          back={108}
        />
        <div className="checkout-layout">
          <section className="panel">
            <h2>Оформление подписки</h2>
            <div className="field"><span>Email аккаунта для квитанции</span><strong>{a.model.email || "Войдите в аккаунт"}</strong></div>
            <div className="checkout-method">
              <Icon name="shield" size={30} />
              <div>
                <h3>Безопасная оплата у провайдера</h3>
                <p>Данные карты не вводятся и не хранятся на Founders Club.</p>
              </div>
            </div>
            <Check
              label={
                <span>
                  Принимаю <Link to={224}>оферту и условия подписки</Link>
                </span>
              }
              checked={a.model.terms}
              onChange={(terms) =>
                a.setModel({
                  terms,
                })
              }
            />
            <Check
              label={`Согласен на автоматическое списание ${price} ₽ каждый месяц`}
              hint="Отменить будущие списания можно в кабинете. Доступ сохранится до конца оплаченного периода."
              checked={a.model.consent}
              onChange={(consent) =>
                a.setModel({
                  consent,
                })
              }
            />
            <Notice>
              Локально используется mock-провайдер без списания. На хостинге
              checkout включается после настройки выбранного платёжного
              провайдера.
            </Notice>
            {billingError && (
              <p role="alert" className="error-text">
                {billingError}
              </p>
            )}
            <Button
              disabled={!a.model.consent || !a.model.terms || billingBusy}
              onClick={() => {
                setBillingBusy(true);
                setBillingError("");
                const key = a.model.checkoutKey || crypto.randomUUID();
                void api
                  .checkout(plus ? "plus" : "founder", key)
                  .then((payment) => {
                    a.setModel({
                      purchaseKind: "subscription",
                      paymentDemo: false,
                      paymentId: payment.public_id,
                      checkoutKey: key,
                    });
                    a.go(110, { payment: payment.public_id, plan: plus ? "plus" : "founder" });
                  })
                  .catch((caught) =>
                    setBillingError(
                      caught instanceof ApiError
                        ? caught.message
                        : "Не удалось создать оплату.",
                    ),
                  )
                  .finally(() => setBillingBusy(false));
              }}
              icon="arrow"
            >
              {billingBusy ? "Создаём заказ…" : `Перейти к оплате · ${price} ₽`}
            </Button>
            <p className="fine">
              Предложенные лимиты тарифа требуют утверждения до запуска.
            </p>
          </section>
          <aside className="panel order-summary">
            <span className="section-kicker">ВАШ ВЫБОР</span>
            <h2>Founder{plus ? " Plus" : ""}</h2>
            <div className="price">
              {price}
              <span> ₽ / месяц</span>
            </div>
            <ul className="check-list">
              <li>
                <Icon name="check" />
                Публикация {plus ? "до 3 проектов*" : "1 проекта*"}
              </li>
              <li>
                <Icon name="check" />
                Design Vault и Founder Arsenal
              </li>
              <li>
                <Icon name="check" />
                Launch Kits
              </li>
              <li>
                <Icon name="check" />
                Клуб после подтверждения авторства
              </li>
            </ul>
            <div className="summary-total">
              <span>Сегодня</span>
              <strong>{price} ₽</strong>
            </div>
            <Action to={108} variant="text">
              Изменить тариф
            </Action>
          </aside>
        </div>
      </div>
    );
  if (id === 110)
    return (
      <div className="container page narrow">
        <PageHead
          title={promo ? "Оплата разового размещения" : "Оплата подписки"}
          description={
            purchaseTitle +
            " · " +
            (promo ? promoPrice + " · без автопродления" : price + " ₽ / месяц")
          }
          back={promo ? 165 : 109}
        />
        <div className="panel provider-frame">
          <Icon name="lock" size={36} />
          <h2>Платёжный провайдер</h2>
          <p>
            В рабочем продукте здесь откроется сертифицированная форма
            провайдера. Успех подтверждается сервером, а не параметром URL.
          </p>
          <Badge tone="warm">ДЕМО-СЦЕНАРИЙ · НЕ ПЛАТЁЖ</Badge>
          <div className="payment-status">
            <span className="status-ring" />
            <div>
              <strong>Ожидает подтверждения</strong>
              <p>Средства не списываются.</p>
            </div>
          </div>
          <div className="scenario-actions">
            {billingError && <p role="alert" className="error-text">{billingError}</p>}
            <Button
              disabled={billingBusy || !(a.params.payment || a.model.paymentId)}
              onClick={() => {
                if (promo) {
                  a.notify("Разовые промо-заказы подключаются отдельным провайдерным адаптером.");
                  return;
                }
                setBillingBusy(true);
                setBillingError("");
                void api
                  .confirmMockPayment(a.params.payment || a.model.paymentId)
                  .then(async () => {
                    await a.refreshSession();
                    a.setModel({ paymentDemo: true, checkoutKey: "" });
                    a.go(111);
                  })
                  .catch((caught) =>
                    setBillingError(caught instanceof ApiError ? caught.message : "Не удалось подтвердить оплату."),
                  )
                  .finally(() => setBillingBusy(false));
              }}
            >
              {billingBusy ? "Подтверждаем…" : "Подтвердить локальный mock-платёж"}
            </Button>
            <Button variant="secondary" onClick={() => a.go(112)}>
              Показать отказ
            </Button>
            <Button variant="text" onClick={() => a.go(promo ? 165 : 109)}>
              Отменить и вернуться
            </Button>
          </div>
        </div>
      </div>
    );
  if (id === 111 || id === 112 || id === 113)
    return (
      <div className="container page status-page">
        <span
          className={"status-symbol " + (id === 112 ? "danger" : "positive")}
        >
          <Icon name={id === 112 ? "close" : "check"} size={38} />
        </span>
        <Demo />
        <h1>
          {id === 112
            ? "Платёж не прошёл"
            : id === 113
              ? "Всё готово к следующему шагу"
              : a.model.paymentDemo
                ? promo
                  ? "Разовый заказ подтверждён — демо"
                  : "Подписка активирована — демо"
                : "Ожидаем подтверждения"}
        </h1>
        <p>
          {id === 112
            ? "Не создавайте новый заказ, пока не проверен статус предыдущего. В действующей подписке ничего не изменилось."
            : id === 111 && !a.model.paymentDemo
              ? "Прямое открытие этого URL не подтверждает оплату: нужен успешный ответ сервера."
              : "Локальный mock-провайдер подтвердил заказ без реального списания."}
        </p>
        {id !== 112 && a.model.paymentDemo && (
          <div className="confirmation-details">
            <span>
              {promo ? "Разовый заказ" : "Тариф"}
              <strong>{purchaseTitle}</strong>
            </span>
            <span>
              {promo ? "Автопродление" : "Доступ до"}
              <strong>{promo ? "Нет" : end}</strong>
            </span>
            <span>
              Статус<strong>Демонстрация</strong>
            </span>
          </div>
        )}
        <div className="form-actions">
          {id === 112 ? (
            <>
              <Action to={110} variant="primary">
                Попробовать снова
              </Action>
              <Action to={19}>Поддержка</Action>
            </>
          ) : id === 111 ? (
            <Button
              onClick={() =>
                a.gotoPath(a.model.returnTo || "/membership/active")
              }
              disabled={!a.model.paymentDemo}
            >
              Продолжить <Icon name="arrow" />
            </Button>
          ) : (
            <>
              <Action to={119} variant="primary">
                Создать проект
              </Action>
              <Action to={53}>В библиотеку</Action>
              <Action to={93}>В клуб</Action>
            </>
          )}
        </div>
      </div>
    );
  return (
    <AccountShell>
      <PageHead title={specs.get(a.id)?.name || "Подписка"} back={118} />
      {id === 118 ? (
        <>
          <div className="membership-card">
            <div>
              <span className="section-kicker">FOUNDER MEMBERSHIP</span>
              <h2>
                {a.model.subscribed
                  ? "Founder" + (plus ? " Plus" : "")
                  : "Ваш следующий шаг"}
              </h2>
              <p>
                {a.model.subscribed
                  ? a.model.cancelled
                    ? "Автопродление отключено. Доступ до " + end + "."
                    : "Доступ оплачен до " + end + "."
                  : "Доступ к инструментам, публикации и проверенному сообществу."}
              </p>
              <Badge tone={a.model.subscribed ? "positive" : "neutral"}>
                {a.model.subscribed
                  ? a.model.cancelled
                    ? "Отменена · доступ действует"
                    : "Активна"
                  : "Без подписки"}
              </Badge>
            </div>
            <div className="membership-price">
              <strong>{price} ₽</strong>
              <span>в месяц</span>
              <Action to={108}>
                {a.model.subscribed ? "Сменить тариф" : "Выбрать тариф"}
              </Action>
            </div>
          </div>
          <div className="settings-list">
            <Link to={117}>
              <Icon name="file" />
              <div>
                <strong>История платежей</strong>
                <p>Квитанции, даты и статусы</p>
              </div>
              <Icon name="arrow" />
            </Link>
            <Link to={154}>
              <Icon name="lock" />
              <div>
                <strong>Способ оплаты</strong>
                <p>Управление у платёжного провайдера</p>
              </div>
              <Icon name="arrow" />
            </Link>
            <Link to={a.model.cancelled ? 108 : 114}>
              <Icon name="clock" />
              <div>
                <strong>
                  {a.model.cancelled
                    ? "Возобновить подписку"
                    : "Отключить автопродление"}
                </strong>
                <p>Права на скачанные материалы сохраняются</p>
              </div>
              <Icon name="arrow" />
            </Link>
          </div>
          <Notice>
            В локальной среде платежи подтверждает mock-провайдер без списания.
            На хостинге платёжный адаптер включается отдельной настройкой.
          </Notice>
        </>
      ) : id === 114 ? (
        <div className="panel cancel-panel">
          <h2>Отключить следующее списание?</h2>
          <p>
            Никаких дополнительных шагов и обязательного объяснения причины.
          </p>
          <ul className="check-list">
            <li>
              <Icon name="check" />
              Будущие списания отключатся сразу
            </li>
            <li>
              <Icon name="check" />
              Доступ сохранится до {end}
            </li>
            <li>
              <Icon name="check" />
              Базовая страница проекта останется публичной
            </li>
            <li>
              <Icon name="check" />
              Лицензии на скачанные материалы сохранятся
            </li>
          </ul>
          <Field
            label="Причина — необязательно"
            value={reason}
            onChange={setReason}
            options={[
              "Не хочу указывать",
              "Пока не пользуюсь",
              "Не хватает возможностей",
              "Другая причина",
            ]}
          />
          <div className="form-actions">
            <Button
              variant="danger"
              onClick={() => {
                setBillingBusy(true);
                setBillingError("");
                void api.cancelSubscription().then(async () => {
                  await a.refreshSession();
                  a.go(115);
                }).catch((caught) => setBillingError(caught instanceof ApiError ? caught.message : "Не удалось отменить продление.")).finally(() => setBillingBusy(false));
              }}
              disabled={billingBusy}
            >
              {billingBusy ? "Отключаем…" : "Отключить продление"}
            </Button>
            <Action to={118}>Оставить подписку</Action>
          </div>
        </div>
      ) : id === 115 ? (
        <>
          <Notice tone="positive" title="Автопродление отключено">
            Сервер сохранил отмену будущих списаний. Доступ действует до конца
            оплаченного периода.
          </Notice>
          <div className="panel">
            <h2>Ваш доступ действует до {end}</h2>
            <p>
              Уже полученные права на ресурсы сохраняются и после окончания
              периода.
            </p>
            <Action to={118}>К подписке</Action>
            <Action to={66} variant="text">
              Мои скачивания и лицензии
            </Action>
          </div>
        </>
      ) : id === 116 ? (
        <>
          <Notice tone="danger" title="Продление не подтверждено">
            В рабочем продукте здесь появятся причина провайдера и срок
            повторной попытки. Мы не показываем вымышленный grace period.
          </Notice>
          <Action to={154}>Обновить способ оплаты</Action>
          <Action to={110} variant="primary">
            Повторить попытку
          </Action>
        </>
      ) : id === 117 ? (
        <>
          {billingError && <Notice>{billingError}</Notice>}
          {payments.length ? <Table heads={["Дата", "Сумма", "Статус", "Провайдер"]} rows={payments.map(payment => [
            new Date(payment.created_at).toLocaleString("ru-RU"), `${payment.amount} ${payment.currency}`,
            ({ pending: "Ожидает подтверждения", succeeded: "Оплачен", failed: "Отклонён", refunded: "Возвращён" } as Record<string,string>)[payment.status] || payment.status,
            payment.provider === "mock" ? "Локальный тест · без списания" : payment.provider,
          ])} /> : <Empty
            title="Платежей пока нет"
            text="Здесь будут отображаться платежи из вашего аккаунта."
            icon="file"
          />}
          <Action to={155} variant="text">
            Вопрос по оплате
          </Action>
        </>
      ) : id === 154 ? (
        <>
          <Empty
            title="Способ оплаты не добавлен"
            text="Данные карты вводятся только в защищённой форме провайдера."
            icon="lock"
          />
          <Button
            onClick={() =>
              a.notify("Платёжный провайдер не подключён. Карта не добавлена.")
            }
          >
            Добавить у провайдера
          </Button>
        </>
      ) : (
        <FormPanel
          fields={[
            {
              label: "Номер платежа",
              key: "payment",
              required: true,
            },
            {
              label: "Причина обращения",
              key: "reason",
              type: "textarea",
              required: true,
            },
          ]}
          submit="Создать демо-обращение"
        >
          <Notice>
            Возврат не обещается автоматически. Условия и статус конкретного
            платежа проверяются отдельно.
          </Notice>
        </FormPanel>
      )}
    </AccountShell>
  );
}
export function Ownership() {
  const a = useApp();
  const [method, setMethod] = useState("Ручная заявка");
  const [evidence, setEvidence] = useState(a.model.draft.proof || "");
  const [sent, setSent] = useState(false);
  return (
    <div className="container page article-width">
      <PageHead
        title="Подтвердите, что это ваш проект"
        description="Проверка авторства помогает сохранить доверие в каталоге и сообществе."
        back={124}
      />
      <div className="verification-methods">
        {[
          "DNS-запись",
          "Файл на сайте",
          "GitHub",
          "Рабочий email",
          "Ручная заявка",
        ].map((m) => (
          <button
            className={m === method ? "active" : ""}
            key={m}
            onClick={() => setMethod(m)}
          >
            <Icon
              name={
                m === "GitHub"
                  ? "code"
                  : m.includes("email")
                    ? "mail"
                    : m === "Ручная заявка"
                      ? "user"
                      : "shield"
              }
            />
            {m}
          </button>
        ))}
      </div>
      <div className="panel">
        <h2>{method}</h2>
        {method === "Ручная заявка" ? (
          <>
            <p>
              Нет своего домена или публичного репозитория? Опишите свою связь с
              проектом и приложите публичное подтверждение.
            </p>
            <Field
              label="Доказательства авторства"
              type="textarea"
              value={evidence}
              onChange={setEvidence}
              placeholder="Ссылка на авторский профиль, публикацию о проекте или другое подтверждение"
            />
          </>
        ) : (
          <>
            <p>
              {method === "DNS-запись"
                ? "Добавьте TXT-запись в настройках домена."
                : method === "Файл на сайте"
                  ? "Разместите проверочный файл в корне сайта."
                  : method === "GitHub"
                    ? "Свяжите аккаунт с правами на репозиторий."
                    : "Укажите адрес на домене проекта."}{" "}
              Токен ниже — демонстрационный, реальная проверка не выполняется.
            </p>
            <div className="copy-line">
              <code>founders-verification=demo-not-a-token</code>
              <Copy value="founders-verification=demo-not-a-token" />
            </div>
            <Field
              label={
                method === "Рабочий email"
                  ? "Email"
                  : "Адрес проекта или репозитория"
              }
              value={evidence}
              onChange={setEvidence}
              type={method === "Рабочий email" ? "email" : "url"}
            />
          </>
        )}
        <Button
          disabled={!evidence.trim()}
          onClick={() => {
            a.setModel((m) => ({
              draft: {
                ...m.draft,
                proof: evidence,
              },
              ownershipPending: true,
            }));
            setSent(true);
          }}
        >
          {method === "Ручная заявка"
            ? "Сохранить демо-заявку"
            : "Показать запрос проверки"}
        </Button>
        {sent && (
          <Notice tone="warm" title="Ожидает проверки — демо">
            Доказательства сохранены только локально. Авторство не подтверждено
            автоматически.
          </Notice>
        )}
      </div>
      <Action to={125} variant="text">
        Продолжить с ручной заявкой
      </Action>
    </div>
  );
}
export function Wizard() {
  const a = useApp(),
    id = Number(a.id),
    d = a.model.draft;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [rules, setRules] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const draftId = useRef<string | undefined>(a.model.draftServerId);
  const saveQueue = useRef<Promise<unknown>>(Promise.resolve());
  const currentDraft = useRef(d);
  currentDraft.current = d;
  useEffect(() => { draftId.current = a.model.draftServerId; }, [a.model.draftServerId]);
  const [media, setMedia] = useState<
    {
      id?: string;
      name: string;
      url: string;
    }[]
  >(a.model.media || []);
  useEffect(() => { setMedia(a.model.media || []); }, [a.model.media]);
  const labels = [
    "Основное",
    "Описание",
    "Медиа",
    "Команда",
    "Авторство",
    "Предпросмотр",
    "Отправка",
  ];
  function update(key: string, value: string) {
    a.setDirty(true);
    a.setModel((m) => ({
      draft: {
        ...m.draft,
        [key]: value,
      },
      draftStep: id,
    }));
    setErrors((e) => ({
      ...e,
      [key]: "",
    }));
  }
  function persistDraft() {
    const snapshot = d;
    const task = saveQueue.current.catch(() => undefined).then(async () => {
      const saved = await api.saveDraft({ ...snapshot, publicId: draftId.current || undefined });
      draftId.current = saved.public_id;
      a.setModel({ draftServerId: saved.public_id });
      if (snapshot === currentDraft.current) a.setDirty(false);
      return saved.public_id as string;
    });
    saveQueue.current = task;
    return task;
  }
  useEffect(() => {
    if (!a.model.logged || !["Черновик", "Нужны правки", "Нужны исправления"].includes(a.model.projectStatus) ||
        !d.name.trim() || !/^[a-z0-9-]{3,64}$/.test(d.slug)) return;
    const timer = window.setTimeout(() => {
      setSaving(true);
      void persistDraft().then(() => setSaveError("")).catch(error => setSaveError(error.message))
        .finally(() => setSaving(false));
    }, 900);
    return () => window.clearTimeout(timer);
  }, [d, a.model.logged]);
  async function next() {
    let err: Record<string, string> = {};
    if (id === 120) {
      if (!d.name.trim()) err.name = "Введите название проекта";
      if (!/^[a-z0-9-]{3,48}$/.test(d.slug))
        err.slug = "От 3 до 48 латинских букв, цифр и дефисов";
      if (d.url && !/^https?:\/\//.test(d.url))
        err.url = "Адрес должен начинаться с https:// или http://";
    }
    if (id === 121) {
      if (!d.short.trim()) err.short = "Добавьте короткое описание";
      if (!d.description.trim()) err.description = "Расскажите о проекте";
    }
    if (Object.keys(err).length) {
      setErrors(err);
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      await persistDraft();
      a.setDirty(false);
      a.setModel({ draftStep: id + 1 });
      a.go(id + 1);
    } catch (caught) {
      setSaveError(caught instanceof ApiError ? caught.message : "Не удалось сохранить черновик.");
    } finally {
      setSaving(false);
    }
  }
  if (id === 119)
    return (
      <div className="container page article-width">
        <PageHead
          title="Расскажите о своём проекте"
          description="Не обязательно быть большим. Важно быть настоящим."
          back={133}
        />
        <div className="wizard-intro">
          <Icon name="file" size={42} />
          <h2>Подготовьте самое важное</h2>
          <ul className="check-list">
            <li>
              <Icon name="check" />
              Название, короткое описание и ссылку
            </li>
            <li>
              <Icon name="check" />
              Логотип, обложку 16:9 и реальные скриншоты
            </li>
            <li>
              <Icon name="check" />
              Информацию об авторе и подтверждение связи с проектом
            </li>
          </ul>
          <Notice>
            После заполнения названия и адреса изменения автоматически сохраняются на сервере.
            При ошибке сохранения не закрывайте страницу: предупреждение останется видимым.
          </Notice>
          <div className="form-actions">
            <Button
              onClick={() => {
                if (!a.model.logged) {
                  a.setModel({
                    returnTo: "/projects/create",
                  });
                  a.go(102);
                  return;
                }
                if (
                  a.model.projectStatus === "Опубликован" &&
                  a.model.plan !== "Plus"
                ) {
                  a.notify(
                    "В проектном варианте Founder — один активный проект. Для второго выберите Plus.",
                  );
                  a.go(108);
                  return;
                }
                a.go(a.model.draftStep || 120);
              }}
              icon="arrow"
            >
              {d.name ? "Продолжить черновик" : "Начать публикацию"}
            </Button>
            <Action to={135} variant="text">
              Мои черновики
            </Action>
          </div>
          <Link to={226}>Правила публикации и модерации</Link>
        </div>
      </div>
    );
  if (id >= 127)
    return (
      <div className="container page article-width">
        <PageHead
          title={
            id === 127
              ? "Проект ожидает проверки"
              : id === 128
                ? "Проект опубликован — демо"
                : id === 129
                  ? "Нужно немного доработать"
                  : "Решение по проекту"
          }
          back={134}
        />
        <Notice
          tone={id === 128 ? "positive" : id === 130 ? "danger" : "warm"}
          title={
            id === 127
              ? "Заявка принята"
              : id === 128
                ? "Демонстрация состояния публикации"
                : id === 129
                  ? "Замечания привязаны к разделам"
                  : "Укажите причину и следующий шаг"
          }
        >
          {id === 127
            ? "Проект сохранён в PostgreSQL и поставлен в очередь модерации. Решение появится в кабинете."
            : id === 128
              ? "В рабочем продукте этот статус появится только после решения модератора."
              : id === 129
                ? "Обложка: используйте реальный скриншот. Описание: уточните задачу продукта. Это демонстрационные замечания."
                : "Демо-причина: недостаточно подтверждений авторства. Вы можете дополнить заявку или подать апелляцию."}
        </Notice>
        <div className="panel">
          <h2>{d.name || "Ваш проект"}</h2>
          <p>{d.short || "Черновик проекта"}</p>
          {id === 127 ? (
            <>
              <Action to={136}>К управлению проектом</Action>
              <Action to={134} variant="text">
                Все статусы
              </Action>
            </>
          ) : id === 128 ? (
            <>
              <Action
                to={35}
                params={{
                  slug: "my-project",
                }}
                variant="primary"
              >
                Открыть страницу
              </Action>
              <Action
                to={43}
                params={{
                  slug: "my-project",
                }}
              >
                Поделиться
              </Action>
              <Action to={33} variant="text">
                Моя плитка
              </Action>
            </>
          ) : id === 129 ? (
            <>
              <Action to={139} variant="primary">
                Исправить замечания
              </Action>
              <Action to={130}>Обжаловать</Action>
            </>
          ) : (
            <>
              <FormPanel
                fields={[
                  {
                    label: "Почему решение стоит пересмотреть?",
                    key: "appeal",
                    type: "textarea",
                    required: true,
                  },
                  {
                    label: "Новые доказательства",
                    key: "url",
                    type: "url",
                  },
                ]}
                submit="Сохранить демо-апелляцию"
              />
              <Notice>
                Условия оплаты и возврата рассматриваются отдельно по оферте.
                Отклонение проекта не означает автоматического возврата.
              </Notice>
              <Action to={155} variant="text">
                Обращение по оплате
              </Action>
            </>
          )}
        </div>
      </div>
    );
  return (
    <div className="container page wizard-page">
      <div className="wizard-heading">
        <div>
          <span className="section-kicker">НОВЫЙ ПРОЕКТ</span>
          <h1>{labels[id - 120]}</h1>
        </div>
        <span className="save-status">
          <Icon name="check" />
          {saving ? "Сохраняем…" : saveError ? "Не сохранено" : a.model.draftServerId ? "Черновик на сервере" : "Заполните название и адрес"}
        </span>
      </div>
      <ol className="wizard-stepper">
        {labels.map((l, i) => (
          <li
            className={
              i === id - 120 ? "active" : i < id - 120 ? "complete" : ""
            }
            key={l}
          >
            <button
              onClick={() => a.go(120 + i)}
              aria-current={i === id - 120 ? "step" : undefined}
            >
              <span>
                {i < id - 120 ? <Icon name="check" size={15} /> : i + 1}
              </span>
              {l}
            </button>
          </li>
        ))}
      </ol>
      <div className="wizard-content">
        <div className="panel">
          {id === 120 && (
            <>
              <h2>Начнём с знакомства</h2>
              <p>
                Так ваш проект увидят в каталоге. Название и ссылка должны быть
                понятными.
              </p>
              <Field
                label="Название проекта"
                value={d.name}
                onChange={(v) => update("name", v)}
                required
                maxLength={64}
                placeholder="Например, MindFlow"
                error={errors.name}
              />
              <Field
                label="Короткий адрес"
                value={d.slug}
                onChange={(v) => update("slug", v.toLowerCase())}
                required
                hint={"founders.club/p/" + (d.slug || "your-project")}
                error={errors.slug}
              />
              <Field
                label="Категория"
                value={d.category}
                onChange={(v) => update("category", v)}
                options={[
                  "SaaS",
                  "AI",
                  "Мобильные",
                  "Инструменты",
                  "Дизайн",
                  "Игры",
                  "Образование",
                  "Другое",
                ]}
              />
              <Field
                label="Сайт или публичное демо"
                value={d.url}
                onChange={(v) => update("url", v)}
                type="url"
                placeholder="https://"
                error={errors.url}
                hint="Если проект ещё не запущен, оставьте поле пустым и поясните это в описании."
              />
            </>
          )}
          {id === 121 && (
            <>
              <h2>Чем полезна ваша идея?</h2>
              <Field
                label="Одно предложение о проекте"
                value={d.short}
                onChange={(v) => update("short", v)}
                maxLength={160}
                required
                error={errors.short}
                hint={`${d.short.length} / 160 символов`}
              />
              <Field
                label="Описание"
                value={d.description}
                onChange={(v) => update("description", v)}
                type="textarea"
                required
                error={errors.description}
                placeholder="Какую проблему решаете, для кого и чем отличаетесь?"
              />
              <Field
                label="Стадия"
                value={d.stage}
                onChange={(v) => update("stage", v)}
                options={["Идея", "Прототип", "MVP", "Запущен"]}
              />
              <Field
                label="Теги"
                value={d.tags || ""}
                onChange={(v) => update("tags", v)}
                hint="До 5 понятных тегов через запятую"
              />
              <Notice>
                Не добавляйте неподтверждённые цифры, отзывы и обещания
                результата.
              </Notice>
            </>
          )}
          {id === 122 && (
            <>
              <h2>Покажите, как это выглядит</h2>
              <p>
                Реальные изображения помогают понять продукт ещё до перехода на
                сайт.
              </p>
              <label className="upload-zone">
                <Icon name="plus" size={32} />
                <strong>Добавить изображения</strong>
                <span>PNG, JPEG, WebP · до 5 МБ · не больше 8 файлов</span>
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/webp"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (media.length + files.length > 8) {
                      a.notify("Можно добавить не больше 8 файлов");
                      return;
                    }
                    const accepted = files.filter((f) => {
                      if (
                        !["image/png", "image/jpeg", "image/webp"].includes(
                          f.type,
                        ) ||
                        f.size > 5 * 1024 * 1024
                      ) {
                        a.notify(
                          "Файл " +
                            f.name +
                            " не подходит по формату или размеру",
                        );
                        return false;
                      }
                      return true;
                    });
                    if (!accepted.length) return;
                    setSaving(true);
                    setSaveError("");
                    try {
                      const publicId = a.model.draftServerId || (await persistDraft());
                      const uploaded = await api.uploadProjectMedia(publicId, accepted);
                      const next = [
                        ...media,
                        ...uploaded.map((item) => ({
                          id: item.public_id as string,
                          name: item.name as string,
                          url: item.url as string,
                        })),
                      ];
                      setMedia(next);
                      a.setModel({ media: next });
                      a.notify(`Загружено файлов: ${uploaded.length}`);
                    } catch (caught) {
                      setSaveError(
                        caught instanceof ApiError
                          ? caught.message
                          : "Не удалось загрузить изображения.",
                      );
                    } finally {
                      setSaving(false);
                      e.target.value = "";
                    }
                  }}
                />
              </label>
              <div className="uploaded-grid">
                {media.map((m, i) => (
                  <div key={m.name + i}>
                    <img src={m.url} alt={m.name} />
                    <p>{i === 0 ? "Обложка · 16:9" : m.name}</p>
                    <div className="inline">
                      <Button
                        variant="text"
                        disabled={!i || saving}
                        onClick={async () => {
                          const next = [...media];
                          [next[i], next[i - 1]] = [next[i - 1], next[i]];
                          const ids = next.map((item) => item.id).filter(Boolean) as string[];
                          setSaving(true);
                          try {
                            await api.reorderProjectMedia(a.model.draftServerId, ids);
                            setMedia(next); a.setModel({ media: next });
                          } catch (error) { a.notify(error instanceof Error ? error.message : "Не удалось сохранить порядок."); }
                          finally { setSaving(false); }
                        }}
                      >
                        Раньше
                      </Button>
                      <Button
                        variant="text"
                        disabled={saving}
                        onClick={async () => {
                          const next = media.filter((_, n) => n !== i);
                          setSaving(true);
                          try {
                            if (m.id) await api.deleteProjectMedia(a.model.draftServerId, m.id);
                            setMedia(next); a.setModel({ media: next }); a.notify("Изображение удалено.");
                          } catch (error) { a.notify(error instanceof Error ? error.message : "Не удалось удалить изображение."); }
                          finally { setSaving(false); }
                        }}
                      >
                        Удалить
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Notice>
                Первая картинка используется как обложка 16:9. Файлы проверяются
                по формату, сохраняются на сервере и привязываются к черновику.
              </Notice>
            </>
          )}
          {id === 123 && (
            <>
              <h2>Кто стоит за проектом?</h2>
              <div className="team-row">
                <Avatar name={a.model.name.slice(0, 2)} />
                <div>
                  <strong>{a.model.name}</strong>
                  <p>Владелец проекта</p>
                </div>
                <Badge>Основатель</Badge>
              </div>
              <Field
                label="Email соавтора — необязательно"
                value={d.invite || ""}
                onChange={(v) => update("invite", v)}
                type="email"
                placeholder="coauthor@project.ru"
              />
              <Field
                label="Роль"
                value={d.role || "Редактор"}
                onChange={(v) => update("role", v)}
                options={["Редактор", "Аналитик", "Менеджер продвижения"]}
              />
              <Notice>
                Приглашение отправится только после подключения сервера.
                Владелец не может быть удалён без передачи прав.
              </Notice>
            </>
          )}
          {id === 124 && (
            <>
              <h2>Это ваш проект?</h2>
              <p>
                Выберите удобный способ подтверждения. Если нет домена,
                предусмотрена ручная заявка.
              </p>
              <Action to={52} variant="primary">
                Выбрать способ проверки
              </Action>
              <div className="status-line">
                <Icon name="shield" />
                <div>
                  <strong>
                    {a.model.verified
                      ? "Подтверждено · DEMO"
                      : a.model.ownershipPending
                        ? "Ручная заявка сохранена"
                        : "Проверка не пройдена"}
                  </strong>
                  <p>Без проверки авторства вход в клуб недоступен.</p>
                </div>
              </div>
              <Field
                label="Пояснение для ручной проверки"
                value={d.proof || ""}
                onChange={(v) => {
                  update("proof", v);
                  a.setModel({
                    ownershipPending: !!v,
                  });
                }}
                type="textarea"
              />
            </>
          )}
          {id === 125 && (
            <>
              <h2>Всё выглядит правильно?</h2>
              <div className="wizard-preview">
                {media[0] ? (
                  <img src={media[0].url} alt="Обложка проекта" />
                ) : (
                  <div className="preview-placeholder">
                    <Icon name="file" size={38} />
                  </div>
                )}
                <Badge>{d.category}</Badge>
                <h2>{d.name || "Название не заполнено"}</h2>
                <p>{d.short || "Короткое описание не заполнено"}</p>
                <small>{d.url || "Сайт пока не указан"}</small>
              </div>
              <div className="review-sections">
                {[
                  [120, "Название и ссылка", !!d.name && !!d.slug],
                  [121, "Описание", !!d.description],
                  [122, "Изображения", !!media.length],
                  [124, "Авторство", !!d.proof || a.model.verified],
                ].map(([to, title, ok]) => (
                  <Link key={String(to)} to={Number(to)}>
                    <Icon name={ok ? "check" : "flag"} />
                    <span>{String(title)}</span>
                    <span>{ok ? "Заполнено" : "Проверить"}</span>
                    <Icon name="arrow" />
                  </Link>
                ))}
              </div>
            </>
          )}
          {id === 126 && (
            <>
              <h2>Готовы показать проект?</h2>
              <p>
                После отправки модератор проверит материалы и подтверждение
                авторства. Вы увидите результат в кабинете.
              </p>
              <div className="summary-total">
                <span>Проект</span>
                <strong>{d.name || "Без названия"}</strong>
              </div>
              <Check
                checked={rules}
                onChange={setRules}
                label={
                  <span>
                    Подтверждаю право размещения и принимаю{" "}
                    <Link to={226}>правила публикации</Link>
                  </span>
                }
              />
              <Notice>
                После отправки проект попадёт в серверную очередь. Публикация
                произойдёт только после решения модератора.
              </Notice>
            </>
          )}
        </div>
        <aside className="wizard-tip">
          <span>ХОРОШАЯ ОСНОВА</span>
          <h3>
            {id === 120
              ? "Ясность важнее громкости."
              : id === 121
                ? "Расскажите о пользе."
                : id === 122
                  ? "Настоящее лучше идеального."
                  : "Каждый шаг имеет значение."}
          </h3>
          <p>
            {id === 120
              ? "Используйте название, по которому вас легко найти. Избегайте набора ключевых слов и обещаний."
              : id === 121
                ? "Опишите конкретную задачу, аудиторию и текущее состояние продукта."
                : id === 122
                  ? "Скриншоты вашего продукта полезнее случайных стоковых изображений."
                  : "Можно вернуться к предыдущему шагу. Введённый текст останется в локальном черновике."}
          </p>
          <Link to={226}>
            Правила публикации <Icon name="arrow" />
          </Link>
        </aside>
      </div>
      <div className="wizard-bottom">
        <Button variant="secondary" onClick={() => a.go(id - 1)} icon="back">
          Назад
        </Button>
        <span>Шаг {id - 119} из 7</span>
        {saveError && <p role="alert" className="error-text">{saveError}</p>}
        <Button
          disabled={saving || id === 126 && !rules}
          onClick={() => {
            if (id === 126) {
              if (!d.name.trim() || !/^[a-z0-9-]{3,48}$/.test(d.slug)) {
                a.notify("Заполните название и корректный короткий адрес");
                a.go(120);
                return;
              }
              if (!d.short.trim() || !d.description.trim()) {
                a.notify("Добавьте короткое и полное описание");
                a.go(121);
                return;
              }
              if (!media.length) {
                a.notify("Добавьте обложку проекта");
                a.go(122);
                return;
              }
              if (
                !d.proof.trim() &&
                !a.model.verified &&
                !a.model.ownershipPending
              ) {
                a.notify(
                  "Добавьте подтверждение авторства или пояснение для проверки",
                );
                a.go(124);
                return;
              }
              if (!a.model.subscribed) {
                a.setModel({
                  returnTo: "/projects/create/submit",
                });
                a.go(108);
                return;
              }
              setSaving(true);
              setSaveError("");
              void persistDraft().then(async (publicId) => {
                await api.submitProject(publicId);
                return publicId;
              }).then((publicId) => {
                a.setModel({ projectStatus: "На проверке", draftStep: 126 });
                a.go(127, { project: publicId });
              }).catch((caught) => setSaveError(caught instanceof ApiError ? caught.message : "Не удалось отправить проект.")).finally(() => setSaving(false));
            } else void next();
          }}
          icon="arrow"
        >
          {saving ? "Сохраняем…" : id === 126 ? "Отправить на модерацию" : "Продолжить"}
        </Button>
      </div>
    </div>
  );
}
export function Club() {
  const a = useApp(),
    id = Number(a.id);
  const [q, setQ] = useState("");
  const [rules, setRules] = useState(false);
  if (id === 93)
    return (
      <div className="container page club-page">
        <div className="club-intro">
          <div>
            <span className="resource-section-label">FOUNDERS CLUB</span>
            <h1>
              Свои люди.
              <br />
              Общее движение.
            </h1>
            <p>
              Закрытый Telegram-клуб для тех, кто создаёт собственный проект.
              Опыт, вопросы и разговоры по делу.
            </p>
            <Button
              onClick={() => {
                if (!a.model.logged) {
                  a.setModel({
                    returnTo: "/club/connect",
                  });
                  a.go(102);
                } else if (!a.model.subscribed) {
                  a.setModel({
                    returnTo: "/club/connect",
                  });
                  a.go(109);
                } else a.go(94);
              }}
              icon="arrow"
            >
              Вступить в клуб
            </Button>
            <p className="fine">
              Нужны активная подписка и подтверждённое авторство.
            </p>
          </div>
          <img
            src="/assets/founders-architecture.jpg"
            alt="Спокойное рабочее пространство"
          />
        </div>
        <div className="club-principles">
          {[
            [
              "Не просто чат",
              "Обсуждайте реальные задачи с авторами собственных продуктов.",
            ],
            [
              "Проверенное участие",
              "Каждый участник подтверждает свою связь с проектом.",
            ],
            [
              "Без обещаний успеха",
              "Никаких гарантированных инвестиций, клиентов и продаж.",
            ],
          ].map(([t, d]) => (
            <div key={t}>
              <Icon name="shield" />
              <h2>{t}</h2>
              <p>{d}</p>
            </div>
          ))}
        </div>
        <SectionHead title="Как попасть внутрь" />
        <div className="club-steps">
          {[
            "Оформите подписку",
            "Подтвердите авторство",
            "Подключите Telegram",
            "Получите приглашение",
          ].map((t, i) => (
            <div key={t}>
              <span>0{i + 1}</span>
              <h3>{t}</h3>
            </div>
          ))}
        </div>
        <div className="inline">
          <Action to={99}>Правила сообщества</Action>
          <Action to={97} variant="text">
            Участники
          </Action>
        </div>
      </div>
    );
  if (id === 97 || id === 98)
    return (
      <div className="container page">
        <PageHead
          title="Люди, которые создают"
          description="Публичные профили участников — только с их согласия."
          back={93}
        />
        <Field
          label="Найти по специализации или проекту"
          value={q}
          onChange={setQ}
        />
        <Empty
          title="Публичный состав ещё не опубликован"
          text="Здесь нет вымышленных участников или скрытых контактов. Реальные профили появятся после согласия авторов."
          icon="user"
        />
      </div>
    );
  if (id === 99)
    return (
      <div className="container page article-width">
        <PageHead title="Простые правила хорошего сообщества" back={93} />
        <article className="prose">
          <h2>Уважайте время и опыт других</h2>
          <p>
            Обсуждайте идеи, а не личности. Не публикуйте чужие личные данные и
            приватную переписку.
          </p>
          <h2>Делитесь опытом, а не спамом</h2>
          <p>
            Реклама и предложения — только в предусмотренных для этого местах.
            Не отправляйте массовые личные сообщения.
          </p>
          <h2>Сохраняйте доверие</h2>
          <p>
            Не выдавайте чужой проект за свой, не обещайте неподтверждённые
            результаты. Спорные ситуации передавайте модератору.
          </p>
        </article>
        <Check
          label="Прочитал правила сообщества"
          checked={rules}
          onChange={setRules}
        />
        <Button disabled={!rules} onClick={() => a.go(95)}>
          Продолжить
        </Button>
        <Action to={19} variant="text">
          Поддержка
        </Action>
      </div>
    );
  return (
    <div className="container page narrow">
      <PageHead
        title={
          id === 94
            ? "Свяжите Telegram"
            : id === 95
              ? "Проверим условия участия"
              : id === 96
                ? "Ваше приглашение"
                : id === 100
                  ? "Доступ временно закрыт"
                  : "Вернёмся в клуб"
        }
        back={93}
      />
      <div className="panel club-connect">
        <span className="telegram-mark">
          <Icon name="chat" size={38} />
        </span>
        {id === 94 ? (
          <>
            <h2>Ваш аккаунт — ваша связь</h2>
            <p>
              Telegram нужен для выдачи индивидуального приглашения и управления
              доступом. Бот не получает доступ к вашей личной переписке.
            </p>
            <Notice>
              OAuth и бот не подключены. Мы не создаём и не показываем фиктивную
              ссылку в чат.
            </Notice>
            <Button
              onClick={() => {
                a.setModel({
                  telegram: true,
                });
                a.go(95);
              }}
            >
              Показать связанную учётную запись — демо
            </Button>
          </>
        ) : id === 95 || id === 101 ? (
          <>
            <h2>Два условия для входа</h2>
            <div className="rights-check">
              <span>
                <Icon name={a.model.subscribed ? "check" : "lock"} />
                Подписка {a.model.subscribed ? "активна · DEMO" : "не активна"}
              </span>
              <Action to={109} variant="text">
                Тариф
              </Action>
            </div>
            <div className="rights-check">
              <span>
                <Icon name={a.model.verified ? "check" : "lock"} />
                Авторство{" "}
                {a.model.verified ? "подтверждено · DEMO" : "не подтверждено"}
              </span>
              <Action to={52} variant="text">
                Проверить
              </Action>
            </div>
            <Button
              disabled={!a.model.subscribed || !a.model.verified}
              onClick={() => a.go(96)}
            >
              Получить приглашение
            </Button>
            <p className="fine">
              Статус автора изменяется после решения модератора. Демо-решение
              доступно в разделе проверки прототипа.
            </p>
          </>
        ) : id === 96 ? (
          <>
            <h2>Индивидуальная ссылка</h2>
            <Notice>
              Реальная выдача приглашения не подключена. В рабочем продукте
              ссылка одноразовая, ограничена по времени и выдаётся только после
              серверной проверки.
            </Notice>
            <Button disabled icon="external">
              Открыть Telegram
            </Button>
            <Action to={95} variant="text">
              Проверить условия доступа
            </Action>
          </>
        ) : (
          <>
            <h2>Проверьте подписку и авторство</h2>
            <p>
              После окончания оплаченного периода доступ к чату закрывается.
              Публичная карточка проекта остаётся.
            </p>
            <Action to={118} variant="primary">
              Управлять подпиской
            </Action>
            <Action to={19} variant="text">
              Обжаловать ограничение
            </Action>
          </>
        )}
      </div>
    </div>
  );
}
export function ProfileEdit() {
  const a = useApp();
  const [form, setForm] = useState({
    name: a.model.name,
    handle: a.model.handle,
    bio: a.model.bio,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!a.dirty) setForm({ name: a.model.name, handle: a.model.handle, bio: a.model.bio });
  }, [a.model.name, a.model.handle, a.model.bio]);
  return (
    <AccountShell>
      <PageHead
        title="Ваш профиль"
        description="Расскажите о себе ровно столько, сколько хотите показать публично."
        back={132}
      />
      <form
        className="panel"
        onSubmit={(e) => {
          e.preventDefault();
          if (!/^[a-z0-9_]{3,30}$/.test(form.handle)) {
            setError("От 3 до 30 латинских букв, цифр и подчёркиваний");
            return;
          }
          setSaving(true);
          setError("");
          void api
            .updateProfile(form)
            .then((profile) => {
              a.setModel(profile);
              a.setDirty(false);
              a.notify("Профиль сохранён.");
              a.go(46, { handle: profile.handle });
            })
            .catch((caught) =>
              setError(
                caught instanceof ApiError
                  ? caught.message
                  : "Не удалось сохранить профиль.",
              ),
            )
            .finally(() => setSaving(false));
        }}
      >
        <div className="profile-avatar-edit">
          <Avatar name={form.name.slice(0, 2)} large />
          <p>
            В демо используется монограмма.
            <br />
            Публичный email не отображается.
          </p>
        </div>
        {Object.entries(form).map(([k, v]) => (
          <Field
            key={k}
            label={
              k === "name"
                ? "Имя"
                : k === "handle"
                  ? "Публичный адрес"
                  : "О себе"
            }
            value={v}
            type={k === "bio" ? "textarea" : "text"}
            required={k !== "bio"}
            error={k === "handle" ? error : undefined}
            onChange={(val) => {
              setForm((f) => ({
                ...f,
                [k]: val,
              }));
              a.setDirty(true);
            }}
          />
        ))}
        <div className="form-actions">
        <Button type="submit" disabled={saving}>
          {saving ? "Сохраняем…" : "Сохранить профиль"}
        </Button>
          <Button variant="secondary" onClick={() => a.go(132)}>
            Отмена
          </Button>
        </div>
      </form>
    </AccountShell>
  );
}
export function Dashboard() {
  const a = useApp(),
    id = Number(a.id);
  const [period, setPeriod] = useState("30 дней");
  const [filter, setFilter] = useState("Все");
  const [edit, setEdit] = useState({
    ...a.model.draft,
  });
  useEffect(() => { if (!a.dirty) setEdit({ ...a.model.draft }); }, [a.model.draft]);
  useEffect(() => {
    const project = a.model.ownProjects?.find((row: any) => row.public_id === a.params.project);
    if (!project || a.model.draftServerId === project.public_id) return;
    a.setModel({ draftServerId: project.public_id, media: project.media,
      projectStatus: ({draft:"Черновик",published:"Опубликован",pending:"На проверке",revisions:"Нужны исправления",rejected:"Отклонён"} as Record<string,string>)[project.status],
      draft: {name:project.name,slug:project.slug,short:project.short_description,description:project.description,category:project.category,stage:project.stage,url:project.website_url||"",proof:project.ownership_proof||""} });
  }, [a.params.project, a.model.ownProjects]);
  const [phrase, setPhrase] = useState("");
  const [reauth, setReauth] = useState(false);
  const [invite, setInvite] = useState("");
  const [role, setRole] = useState("Редактор");
  const [status, setStatus] = useState("");
  const [toggles, setToggles] = useState<Record<string, boolean>>(
    a.model.preferences || {},
  );
  const title = specs.get(a.id)?.name || "Личный кабинет";
  const toggle = (key: string, v: boolean) => {
    const next = {
      ...toggles,
      [key]: v,
    };
    setToggles(next);
    a.setModel({
      preferences: next,
    });
    a.notify("Настройка изменена. Синхронизируем с сервером.");
  };
  const settings = [
    ["Профиль", 51, "Имя, адрес и публичная информация", "user"],
    ["Уведомления", 147, "Выберите, о чём узнавать", "bell"],
    ["Безопасность", 148, "Сессии и способы входа", "shield"],
    ["Подписка", 118, "Тариф, продление и оплата", "file"],
    ["Приватность и данные", 149, "Видимость и экспорт", "lock"],
    ["Удаление аккаунта", 156, "Последствия и подтверждение", "trash"],
  ];
  if ([133,134,135].includes(id)) return <AccountShell><MyProjects /></AccountShell>;
  return (
    <AccountShell>
      <PageHead
        title={
          id === 131
            ? `С возвращением${a.model.name === "Автор проекта" ? "" : ", " + a.model.name}.`
            : id === 137
              ? "Что происходит с проектом"
              : title
        }
        description={
          id === 131
            ? "Всё для следующего шага — в вашем рабочем пространстве."
            : undefined
        }
        back={id === 136 ? 133 : 131}
      >
        {[131, 133, 134, 135].includes(id) && (
          <Action to={119} variant="primary" icon="plus">
            Создать проект
          </Action>
        )}
      </PageHead>
      {id === 131 ? (
        <>
          <div className="dashboard-welcome">
            <div>
              <Badge>Ваш следующий шаг</Badge>
              <h2>
                {a.model.draft.name
                  ? "Доведите идею до публикации."
                  : "У вашей идеи будет свой адрес."}
              </h2>
              <p>
                Начните со страницы проекта. Черновик можно дополнять в удобном
                темпе.
              </p>
              <Action to={119} variant="primary">
                {a.model.draft.name
                  ? "Продолжить черновик"
                  : "Добавить первый проект"}
              </Action>
            </div>
            <div className="welcome-monogram">
              F
              <span>
                make something
                <br />
                that matters.
              </span>
            </div>
          </div>
          <SectionHead title="Сейчас в работе" to={133} />
          {a.model.draft.name ? (
            <div className="project-management-row">
              <Avatar name={a.model.draft.name.slice(0, 2)} />
              <div>
                <h3>{a.model.draft.name}</h3>
                <Badge>{a.model.projectStatus}</Badge>
              </div>
              <Action to={136}>Открыть</Action>
            </div>
          ) : (
            <Empty
              title="Начните с первого проекта"
              text="Публичная карточка, обновления и обратная связь будут собраны здесь."
              to={119}
              cta="Создать проект"
            />
          )}
          <SectionHead title="Для вашей следующей версии" to={53} />
          <div className="resource-grid">
            <ResourceCard />
            <ResourceCard index={2} />
          </div>
        </>
      ) : [133, 134, 135].includes(id) ? (
        <>
          <Tabs
            items={[
              [133, "Все проекты"],
              [134, "По статусам"],
              [135, "Черновики"],
            ]}
          />
          {id === 134 && (
            <div className="segmented">
              {[
                "Все",
                "Черновик",
                "На проверке",
                "Опубликован",
                "Нужны исправления",
                "Отклонён",
              ].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={filter === f ? "active" : ""}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
          {a.model.draft.name &&
          (filter === "Все" || a.model.projectStatus === filter) ? (
            <Table
              heads={["Проект", "Статус", "Последний шаг", "Действие"]}
              rows={[
                [
                  <strong>{a.model.draft.name}</strong>,
                  <Badge>{a.model.projectStatus}</Badge>,
                  specs.get(String(a.model.draftStep))?.name || "Основное",
                  <div className="inline">
                    <Action to={id === 135 ? a.model.draftStep : 136}>
                      Продолжить
                    </Action>
                    <Button
                      variant="text"
                      onClick={() =>
                        a.modal(
                          <>
                            <h2>Удалить локальный черновик?</h2>
                            <p>
                              Это действие удалит введённые данные из
                              демо-профиля.
                            </p>
                            <div className="form-actions">
                              <Button variant="secondary" onClick={a.close}>
                                Отмена
                              </Button>
                              <Button
                                variant="danger"
                                onClick={() => {
                                  a.setModel((m) => ({
                                    draft: {
                                      ...m.draft,
                                      name: "",
                                      short: "",
                                      description: "",
                                    },
                                    projectStatus: "Черновик",
                                  }));
                                  a.close();
                                  a.notify("Локальный черновик очищен");
                                }}
                              >
                                Удалить
                              </Button>
                            </div>
                          </>,
                        )
                      }
                    >
                      Удалить
                    </Button>
                  </div>,
                ],
              ]}
            />
          ) : (
            <Empty
              title={
                id === 135
                  ? "Нет незавершённых черновиков"
                  : "Здесь появятся ваши проекты"
              }
              text="Создайте страницу своего продукта, чтобы начать."
              to={119}
              cta="Создать проект"
            />
          )}
          <Notice>
            Предлагаемый лимит: Founder — 1 активный проект, Plus — до 3.
            Требует утверждения перед запуском.
          </Notice>
        </>
      ) : id === 132 ? (
        <div className="panel profile-summary">
          <Avatar name={a.model.name.slice(0, 2)} large />
          <h2>{a.model.name}</h2>
          <p>{a.model.bio}</p>
          <div className="inline">
            <Action to={51} variant="primary">
              Редактировать профиль
            </Action>
            <Action
              to={46}
              params={{
                handle: a.model.handle,
              }}
            >
              Публичная страница
            </Action>
          </div>
          <Notice>Достижения появятся только после проверенных событий.</Notice>
        </div>
      ) : id === 136 ? (
        <>
          <div className="project-manage-head">
            <div className="product-mark">
              {(a.model.draft.name || "МП").slice(0, 2)}
            </div>
            <div>
              <Badge>{a.model.projectStatus}</Badge>
              <h2>{a.model.draft.name || "Ваш проект"}</h2>
              <p>
                {a.model.draft.short ||
                  "Начните с заполнения основных сведений."}
              </p>
            </div>
            <Action to={125}>Предпросмотр</Action>
          </div>
          <div className="management-grid">
            {[
              [139, "Редактировать", "Описание, изображения и ссылки", "file"],
              [137, "Аналитика", "Показы, открытия и внешние клики", "chart"],
              [142, "Команда", "Участники, роли и приглашения", "user"],
              [140, "Обновления", "Расскажите о новой версии", "clock"],
              [141, "Отзывы", "Ответы и обратная связь", "chat"],
              [158, "Продвижение", "Отдельные рекламные размещения", "sun"],
            ].map(([to, t, d, icon]) => (
              <Link
                className="management-card"
                to={Number(to)}
                key={String(to)}
              >
                <Icon name={String(icon)} size={24} />
                <h3>{t}</h3>
                <p>{d}</p>
                <Icon name="arrow" />
              </Link>
            ))}
          </div>
          <Action to={143} variant="text">
            Уведомления о проекте
          </Action>
        </>
      ) : id === 137 ? (
        <>
          <div className="list-toolbar">
            <div className="segmented">
              {["7 дней", "30 дней", "90 дней"].map((p) => (
                <button
                  key={p}
                  className={period === p ? "active" : ""}
                  onClick={() => setPeriod(p)}
                >
                  {p}
                </button>
              ))}
            </div>
            <Action to={138} icon="download">
              Экспорт CSV
            </Action>
          </div>
          <StatCards />
          <div className="panel chart-panel">
            <div className="section-head">
              <h2>Динамика интереса</h2>
              <Badge>{period}</Badge>
            </div>
            <div className="empty-chart">
              <div className="chart-gridlines" />
              <p>Для графика пока нет данных</p>
              <span>Показы ≠ открытия ≠ переходы</span>
            </div>
          </div>
          <div className="panel">
            <h2>Источники переходов</h2>
            <Empty
              title="События ещё не поступали"
              text="Внутренние просмотры и внешние клики будут учитываться отдельно. Подозрительный трафик — отдельной категорией."
              icon="chart"
            />
          </div>
        </>
      ) : id === 138 ? (
        <div className="panel">
          <h2>Экспорт без лишних данных</h2>
          <Field
            label="Период"
            value={period}
            onChange={setPeriod}
            options={["7 дней", "30 дней", "90 дней"]}
          />
          <p>
            Показы, открытия, внешние клики и голоса. Персональные данные
            посетителей в выгрузку не включаются.
          </p>
          <Notice>
            Реальной аналитики нет. Можно скачать только структуру CSV без
            вымышленных значений.
          </Notice>
          <DownloadDemo
            name="analytics-template.csv"
            text="date,impressions,views,outbound_clicks,votes\n"
          />
        </div>
      ) : id === 139 ? (
        <form
          className="panel"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await api.saveDraft({ ...edit, publicId: a.model.draftServerId });
              a.setModel({ draft: edit }); a.setDirty(false);
              a.notify("Черновик сохранён на сервере."); a.go(136, { project: a.model.draftServerId });
            } catch (error) { a.notify(error instanceof Error ? error.message : "Не удалось сохранить изменения."); }
          }}
        >
          <h2>Изменения проекта</h2>
          <Notice>
            Обновление публичных полей может потребовать повторной модерации. До
            одобрения публичная версия не меняется.
          </Notice>
          {[
            ["name", "Название"],
            ["short", "Короткое описание"],
            ["description", "Описание"],
            ["url", "Сайт"],
          ].map(([key, label]) => (
            <Field
              key={key}
              label={label}
              value={edit[key] || ""}
              type={
                key === "description"
                  ? "textarea"
                  : key === "url"
                    ? "url"
                    : "text"
              }
              onChange={(v) => {
                setEdit((d) => ({
                  ...d,
                  [key]: v,
                }));
                a.setDirty(true);
              }}
            />
          ))}
          <div className="form-actions">
            <Button type="submit">Сохранить черновик</Button>
            <Button
              variant="secondary"
              onClick={() => {
                a.setModel({
                  draft: edit,
                });
                a.setDirty(false);
                a.go(126);
              }}
            >
              Отправить изменения
            </Button>
            <Button variant="text" onClick={() => a.go(136)}>
              Отмена
            </Button>
          </div>
        </form>
      ) : id === 140 ? (
        <FormPanel
          fields={[
            {
              label: "Название обновления",
              key: "name",
              required: true,
            },
            {
              label: "Дата",
              key: "date",
              type: "date",
              required: true,
            },
            {
              label: "Тип",
              key: "type",
              options: ["Новая возможность", "Улучшение", "Исправление"],
            },
            {
              label: "Что изменилось",
              key: "description",
              type: "textarea",
              required: true,
            },
          ]}
          submit="Сохранить демо-обновление"
        />
      ) : id === 141 ? (
        <Empty
          title="Обратная связь ещё впереди"
          text="Здесь появятся реальные отзывы. Делитесь страницей проекта и отвечайте по существу."
          to={43}
          cta="Поделиться проектом"
          icon="chat"
        />
      ) : id === 142 ? (
        <>
          <div className="panel">
            <h2>Команда и доступы</h2>
            <div className="team-row">
              <Avatar name={a.model.name.slice(0, 2)} />
              <div>
                <strong>{a.model.name}</strong>
                <p>Единственный владелец</p>
              </div>
              <Badge>Полный доступ</Badge>
            </div>
            <Notice>
              Владельца нельзя удалить или понизить без передачи прав.
              Приглашения и изменения ролей проверяются сервером.
            </Notice>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStatus(
                  "Демо-приглашение " +
                    invite +
                    " сохранено. Письмо не отправлено.",
                );
                a.setModel({
                  invitation: {
                    email: invite,
                    role,
                  },
                });
              }}
            >
              <Field
                label="Email участника"
                value={invite}
                onChange={setInvite}
                type="email"
                required
              />
              <Field
                label="Роль"
                value={role}
                onChange={setRole}
                options={["Редактор", "Аналитик", "Менеджер продвижения"]}
              />
              <Button type="submit" icon="plus">
                Пригласить — демо
              </Button>
            </form>
            {status && <Notice>{status}</Notice>}
          </div>
          <SectionHead title="История изменений доступа" />
          <Empty
            title="Нет подтверждённых изменений"
            text="Реальный журнал событий будет неизменяемым и доступным уполномоченным участникам."
            icon="clock"
          />
        </>
      ) : id === 143 || id === 147 ? (
        <div className="panel">
          <h2>{id === 143 ? "События проекта" : "Как держать вас в курсе"}</h2>
          {(id === 143
            ? [
                "Модерация проекта",
                "Новые отзывы",
                "Голоса",
                "Еженедельная статистика",
              ]
            : [
                "Сервисные уведомления по email",
                "Дайджест новых материалов",
                "Маркетинговые рассылки",
                "Уведомления в Telegram",
              ]
          ).map((t) => (
            <Toggle
              label={t}
              key={t}
              checked={!!toggles[t]}
              onChange={(v) => toggle(t, v)}
              hint={
                t === "Маркетинговые рассылки"
                  ? "Отдельное добровольное согласие. По умолчанию выключено."
                  : undefined
              }
            />
          ))}
          <Action to={94} variant="text">
            Подключить Telegram
          </Action>
          <Button
            variant="secondary"
            onClick={() =>
              a.notify("Тестовое сообщение не отправлено: канал не подключён.")
            }
          >
            Отправить тест
          </Button>
        </div>
      ) : id === 144 ? (
        <>
          <div className="panel">
            <h2>Ваш путь в сообщество</h2>
            {[
              ["Подписка", a.model.subscribed, 118],
              ["Авторство", a.model.verified, 52],
              ["Telegram", a.model.telegram, 94],
            ].map(([t, ok, to]) => (
              <div className="rights-check" key={String(t)}>
                <span>
                  <Icon name={ok ? "check" : "lock"} />
                  {t}
                </span>
                <Badge tone={ok ? "positive" : "warm"}>
                  {ok ? "Демо-подтверждение" : "Нужно действие"}
                </Badge>
                <Action to={Number(to)} variant="text">
                  Открыть
                </Action>
              </div>
            ))}
            <Action to={95} variant="primary">
              Проверить доступ
            </Action>
          </div>
          <Action to={99} variant="text">
            Правила сообщества
          </Action>
        </>
      ) : id === 145 ? (
        <>
          <Tabs
            items={[
              [145, "Обзор"],
              [64, "Сохранённое"],
              [66, "Скачивания"],
            ]}
          />
          <Notice>
            После отмены подписки лицензии на уже полученные материалы остаются
            доступны в истории скачиваний.
          </Notice>
          <SectionHead title="Посмотрите, что пригодится" to={53} />
          <div className="resource-grid">
            <ResourceCard />
            <ResourceCard index={1} />
          </div>
        </>
      ) : id === 146 ? (
        <div className="settings-list">
          {settings.map(([t, to, desc, icon]) => (
            <Link to={Number(to)} key={String(to)}>
              <Icon name={String(icon)} />
              <div>
                <strong>{t}</strong>
                <p>{desc}</p>
              </div>
              <Icon name="arrow" />
            </Link>
          ))}
        </div>
      ) : id === 148 ? (
        <>
          <div className="panel">
            <h2>Активные сессии</h2>
            <div className="session-row">
              <Icon name="shield" size={30} />
              <div>
                <strong>Текущий браузер</strong>
                <p>Защищённая серверная сессия</p>
              </div>
              <Badge>Это устройство</Badge>
            </div>
            <Button
              variant="danger"
              onClick={() =>
                a.modal(
                  <>
                    <h2>Завершить текущую сессию?</h2>
                    <p>Сессия будет отозвана. Сохранённые на сервере черновики останутся в аккаунте.</p>
                    <Button
                      onClick={() => {
                        void api.logout().then(async () => {
                          await a.refreshSession();
                          a.close();
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
              Завершить сессию
            </Button>
          </div>
          <Notice>
            Вход работает по одноразовому email-коду, поэтому постоянного пароля
            нет. Управление несколькими устройствами потребует отдельного экрана
            списка сессий.
          </Notice>
        </>
      ) : id === 149 ? (
        <div className="panel">
          <h2>Вы решаете, что видно другим</h2>
          {[
            "Публичный профиль",
            "Показывать участие в команде",
            "Публичные метрики проекта",
            "Необязательная аналитика",
          ].map((t) => (
            <Toggle
              key={t}
              label={t}
              checked={!!toggles[t]}
              onChange={(v) => toggle(t, v)}
            />
          ))}
          <div className="form-actions">
            <Action to={157}>Экспорт данных</Action>
            <Action to={156} variant="text">
              Удаление аккаунта
            </Action>
          </div>
        </div>
      ) : id === 150 || id === 152 ? (
        <>
          <Notice title="Партнёрская программа пока не запущена">
            Выплаты и начисления не создаются. Условия атрибуции и
            вознаграждения будут опубликованы до старта.
          </Notice>
          <Empty
            title={
              id === 152
                ? "Начислений нет"
                : "Рекомендуйте, когда будете готовы"
            }
            text="Здесь не будет фиктивного дохода или скрытых личных данных рефералов."
            to={151}
            cta="Оставить интерес"
            icon="user"
          />
        </>
      ) : id === 151 ? (
        <FormPanel
          description="Оставьте интерес к программе. Это не регистрация действующего партнёрского договора."
          fields={[
            {
              label: "Имя / название",
              key: "name",
              required: true,
            },
            {
              label: "Email",
              key: "email",
              type: "email",
              required: true,
            },
            {
              label: "Ссылка на вашу площадку",
              key: "url",
              type: "url",
            },
            {
              label: "Как вы планируете рассказывать о платформе?",
              key: "description",
              type: "textarea",
            },
          ]}
          submit="Сохранить демо-заявку"
        />
      ) : id === 153 ? (
        <Empty
          title="Ваши кампании появятся здесь"
          text="Реклама — отдельный формат, не покупка места в честном рейтинге."
          to={158}
          cta="Посмотреть варианты"
          icon="sun"
        />
      ) : id === 156 ? (
        <div className="panel delete-panel">
          <h2>Это затронет больше, чем профиль</h2>
          <ul className="check-list">
            <li>
              <Icon name="flag" />
              Публичный профиль и проекты будут обработаны по правилам удаления.
            </li>
            <li>
              <Icon name="flag" />
              Права владельца команды нужно передать заранее.
            </li>
            <li>
              <Icon name="flag" />
              Будущие списания необходимо отменить отдельно.
            </li>
            <li>
              <Icon name="flag" />
              Некоторые платёжные записи хранятся в предусмотренные законом
              сроки.
            </li>
            <li>
              <Icon name="check" />
              Ранее полученные лицензии не исчезают автоматически.
            </li>
          </ul>
          <Action to={114} variant="text">
            Сначала проверить автопродление
          </Action>
          <Check
            checked={reauth}
            onChange={setReauth}
            label="Демонстрация: повторная аутентификация пройдена"
          />
          <Field
            label="Введите УДАЛИТЬ для подтверждения"
            value={phrase}
            onChange={setPhrase}
          />
          <div className="form-actions">
            <Button
              variant="danger"
              disabled={phrase !== "УДАЛИТЬ" || !reauth}
              onClick={() => {
                a.notify(
                  "Демо-запрос удаления создан. Реальный аккаунт не удалялся.",
                );
                setStatus("Запрос сохранён в демо. Реального удаления нет.");
              }}
            >
              Подтвердить удаление — демо
            </Button>
            <Action to={146}>Отмена</Action>
          </div>
          {status && <Notice>{status}</Notice>}
        </div>
      ) : id === 157 ? (
        <div className="panel">
          <h2>Копия ваших данных</h2>
          <p>
            В реальном продукте архив выдаётся по временной защищённой ссылке
            после повторной проверки личности.
          </p>
          {["Профиль", "Проекты", "История действий", "Согласия"].map((t) => (
            <Toggle
              key={t}
              label={t}
              checked={toggles[t] !== false}
              onChange={(v) => toggle(t, v)}
            />
          ))}
          <Notice>
            В демо доступен только экспорт локального профиля без платёжных или
            серверных данных.
          </Notice>
          <DownloadDemo
            name="founders-local-demo.json"
            text={JSON.stringify(
              {
                name: a.model.name,
                handle: a.model.handle,
                draft: a.model.draft,
              },
              null,
              2,
            )}
          />
        </div>
      ) : (
        <Empty
          title="Раздел доступен из меню"
          text="Выберите нужную область кабинета."
          to={131}
          cta="Обзор кабинета"
        />
      )}
    </AccountShell>
  );
}
