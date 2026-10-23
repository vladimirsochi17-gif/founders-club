import { useEffect, useState } from "react";
import { api } from "./api";
import { projects, type Project } from "../components/generated/core";

export function useProjects() {
  const [items, setItems] = useState<Project[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    api.publicProjects().then(rows => {
      if (!alive) return;
      setItems(rows.map(row => ({
        slug: row.slug, name: row.name, tag: row.category, desc: row.short_description,
        owner: row.owner_handle || "founder", initials: row.name.slice(0, 2), color: "#315d6b",
        image: row.cover_url || (row.is_demo ? projects.find(p => p.slug === row.slug)?.image : null) || "/assets/uihunt.jpg",
        isDemo: row.is_demo, stage: row.stage, publishedAt: row.published_at, votes: row.votes,
      })));
    }).catch(error => { if (alive) setError(error.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);
  return { items, error, loading };
}
