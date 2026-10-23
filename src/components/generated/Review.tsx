import { useState } from "react";
import { SCREEN_SPECS } from "./screenSpecs";
import { Badge, Field, Link, Notice, PageHead } from "./core";

export default function Review() {
  const [query, setQuery] = useState("");
  const [module, setModule] = useState("Все");
  const modules = [...new Set(SCREEN_SPECS.map((screen) => screen.module))];
  const list = SCREEN_SPECS.filter(
    (screen) =>
      (module === "Все" || screen.module === module) &&
      `${screen.id} ${screen.name}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="container page review-page">
      <PageHead
        title="Карта проекта и контроль покрытия"
        description="Реестр помогает проверять реализацию. Интеграционные сценарии дополнительно покрыты API-тестами."
      />
      <Notice tone="warm" title="Реестр не заменяет приёмку">
        Каждый релиз требует проверки состояний, ролей, внешних провайдеров и
        сквозных сценариев.
      </Notice>
      <div className="list-toolbar">
        <Field
          label="Найти Screen ID"
          value={query}
          onChange={setQuery}
          placeholder="Например, 139 или подписка"
        />
        <Field
          label="Модуль"
          value={module}
          onChange={setModule}
          options={["Все", ...modules]}
        />
      </div>
      <div className="review-grid">
        {list.map((screen) => (
          <article key={screen.id}>
            <div>
              <Badge>{screen.id}</Badge>
              <Badge>{screen.priority}</Badge>
            </div>
            <h3>
              <Link to={screen.id}>{screen.name}</Link>
            </h3>
            <code>{screen.route}</code>
            <details>
              <summary>Критерии экрана</summary>
              <p>{screen.composition}</p>
              <p>{screen.actions}</p>
              <p>{screen.states}</p>
              <p>{screen.back}</p>
            </details>
            <div className="review-states">
              {(
                [
                  ["filled", "Макет"],
                  ["loading", "Загрузка"],
                  ["empty", "Пусто"],
                  ["error", "Ошибка"],
                  ["restricted", "Доступ"],
                ] as const
              ).map(([state, label]) => (
                <Link
                  key={state}
                  to={screen.id}
                  params={{ state: state === "filled" ? "" : state }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
