import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useProjects } from "../../lib/useProjects";
import { Action, Empty, Notice, PageHead, ProjectGrid, useApp } from "./core";
export function PublicProfile() {
  const a = useApp();
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState("");
  const {items} = useProjects();
  useEffect(() => {
    let alive = true; setProfile(null); setError("");
    api.profile(a.params.handle).then(row => { if (alive) setProfile(row); })
      .catch(error => { if (alive) setError(error.message); });
    return () => { alive = false; };
  }, [a.params.handle]);
  if (error) return <div className="container page"><Empty title="Профиль недоступен" text={error} to={2} /></div>;
  if (!profile) return <div className="container page"><Notice>Загружаем профиль…</Notice></div>;
  const published = items.filter(item => item.owner === profile.handle);
  return <div className="container page"><PageHead title={profile.name} description={`@${profile.handle}`} back={2}>
    {a.model.handle === profile.handle && a.model.logged && <Action to={51}>Редактировать профиль</Action>}
  </PageHead><p style={{whiteSpace:"pre-wrap"}}>{profile.bio}</p><h2>Опубликованные проекты</h2>
    {published.length ? <ProjectGrid items={published} /> : <Empty title="Пока нет публикаций" text="Публичные проекты автора появятся здесь." />}
  </div>;
}
