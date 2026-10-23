import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Action, Badge, Button, Empty, initial, Notice, PageHead, Table, Tabs, useApp } from "./core";
const labels: Record<string,string> = { draft: "Черновик", pending: "На проверке", published: "Опубликован", revisions: "Нужны исправления", rejected: "Отклонён", archived: "В архиве" };
export function MyProjects() {
  const a = useApp();
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = async () => {
    try { setItems(await api.myProjects()); setError(""); }
    catch (error) { setError(error instanceof Error ? error.message : "Не удалось загрузить проекты."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);
  const select = (project: any) => {
    a.setModel({ draftServerId: project.public_id, draftStep: 120, media: project.media,
      projectStatus: labels[project.status], draft: { name: project.name, slug: project.slug, short: project.short_description,
        description: project.description, category: project.category, stage: project.stage, url: project.website_url || "", proof: project.ownership_proof || "" } });
    a.go(["draft", "revisions"].includes(project.status) ? 120 : 136, { project: project.public_id });
  };
  const visible = items.filter(item => Number(a.id) !== 135 || ["draft", "revisions"].includes(item.status));
  return <>
    <PageHead title="Мои проекты"><Button onClick={() => { a.setModel({ draft: { ...initial.draft }, draftServerId: undefined, media: [], draftStep: 120, projectStatus: "Черновик" }); a.go(120); }}>Создать новый проект</Button></PageHead>
    <Tabs items={[[133,"Все проекты"],[134,"По статусам"],[135,"Черновики"]]} />
    {error && <Notice tone="danger">{error}<Button onClick={load}>Повторить</Button></Notice>}
    {loading ? <Notice>Загрузка…</Notice> : visible.length ? <Table heads={["Название", "Статус", "Обновлён", "Действия"]} rows={visible.map(item => [item.name, <Badge>{labels[item.status]}</Badge>, new Date(item.updated_at).toLocaleString("ru-RU"),
      <div className="inline"><Button onClick={() => select(item)}>Открыть</Button>
        {item.status === "published" && <Action to={35} params={{slug:item.slug}}>На сайт</Action>}
        {["draft","revisions"].includes(item.status) && <Button variant="text" onClick={() => a.modal(<><h2>Удалить черновик «{item.name}»?</h2><p>Он исчезнет из списка проектов. Опубликованные проекты не затрагиваются.</p><Button variant="danger" onClick={async () => {
          try { await api.deleteDraft(item.public_id); await load(); if (a.model.draftServerId === item.public_id) a.setModel({ draft: { ...initial.draft }, draftServerId: undefined, media: [], projectStatus: "Черновик" }); a.close(); a.notify("Черновик удалён."); }
          catch (error) { a.notify(error instanceof Error ? error.message : "Не удалось удалить."); }
        }}>Удалить черновик</Button></>)}>Удалить</Button>}
      </div>])} /> : <Empty title="Проектов пока нет" text="Создайте первый черновик — он будет сохранён в вашем аккаунте." />}
  </>;
}
