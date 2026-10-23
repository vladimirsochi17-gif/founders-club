import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Action, Button, Check, Empty, Field, Notice, PageHead, Table, useApp } from "./core";

export function LiveModeration() {
  const a = useApp();
  const [cases, setCases] = useState<any[]>([]);
  const [audit, setAudit] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState("");
  const [reason, setReason] = useState("");
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const requirements = ["Авторство проверено", "Контент соответствует правилам", "Ссылки безопасны", "Изображения принадлежат автору"];
  const load = async () => {
    setError(""); setLoading(true);
    try {
      setCases(await api.moderation());
      if (["admin", "superadmin"].includes(a.model.adminRole)) setAudit(await api.audit());
    } catch (error) { setError(error instanceof Error ? error.message : "Не удалось загрузить очередь."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const current = cases.find(item => item.public_id === selected);
  const decide = async (decision: string) => {
    if (!current) return;
    setBusy(true); setError("");
    try {
      await api.moderate(current.public_id, decision, reason, current.version);
      setSelected(""); setChecks({}); setReason("");
      await load(); a.notify("Решение сохранено на сервере.");
    } catch (error) { setError(error instanceof Error ? error.message : "Не удалось сохранить решение."); }
    finally { setBusy(false); }
  };
  return <main className="container page">
    <PageHead title="Модерация проектов" description={`Рабочая роль: ${a.model.adminRole}`} back={131}>
      <Action to={1}>На сайт</Action><Button disabled={busy || loading} onClick={load}>Обновить очередь</Button>
    </PageHead>
    {error && <Notice tone="danger">{error}</Notice>}
    {loading ? <Notice>Загружаем данные…</Notice> : current ? <div className="moderation-layout">
      <section className="panel"><h2>{current.name}</h2><p>{current.short_description}</p><p style={{whiteSpace:"pre-wrap"}}>{current.description}</p>
        <h3>Подтверждение авторства</h3><p>{current.ownership_proof}</p>
        {/^https?:\/\//i.test(current.website_url || "") && <a href={current.website_url} target="_blank" rel="noopener noreferrer">Открыть сайт проекта ↗</a>}
        <div className="uploaded-grid">{current.media.map((url: string) => <img key={url} src={url} alt="Изображение проекта на проверке" />)}</div>
      </section>
      <section className="panel"><h2>Решение</h2>
        {requirements.map(label => <Check key={label} label={label} checked={!!checks[label]} onChange={value => setChecks(old => ({...old, [label]:value}))} />)}
        <Field label="Причина решения" type="textarea" value={reason} onChange={setReason} hint="Для отклонения и исправлений — не менее 10 символов." />
        <div className="form-actions">
          <Button disabled={busy || !requirements.every(label => checks[label])} onClick={() => decide("approved")}>Опубликовать</Button>
          <Button disabled={busy || reason.trim().length < 10} variant="secondary" onClick={() => decide("revisions")}>Запросить исправления</Button>
          <Button disabled={busy || reason.trim().length < 10} variant="danger" onClick={() => decide("rejected")}>Отклонить</Button>
          <Button variant="text" disabled={busy} onClick={() => setSelected("")}>К очереди</Button>
        </div>
      </section>
    </div> : cases.length ? <Table heads={["Проект", "Автор", "Статус", "Действие"]} rows={cases.map(item => [item.name, item.owner_handle, item.status,
      <Button onClick={() => { setSelected(item.public_id); setChecks({}); setReason(""); }}>Проверить {item.name}</Button>])} /> : <Empty title="Очередь пуста" text="Новые заявки появятся после отправки автором." />}
    {audit.length > 0 && <section><h2>Журнал действий</h2><Table heads={["Дата", "Действие", "Сотрудник", "Причина"]} rows={audit.map(row => [new Date(row.created_at).toLocaleString("ru-RU"), row.action, row.actor_email || "Система", row.reason || "—"])} /></section>}
  </main>;
}
