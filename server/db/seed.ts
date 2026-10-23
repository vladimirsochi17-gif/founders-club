import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool, closePool } from "./pool.js";

const demoProjects = [
  [
    "mindflow",
    "MindFlow",
    "AI",
    "Пространство для заметок, в котором мысли находят связи.",
    "https://mindflow.demo",
    "Идея",
  ],
  [
    "flowstreak",
    "FlowStreak",
    "Мобильные",
    "Маленькие привычки. Понятный ритм. Ваш личный прогресс.",
    "https://flowstreak.demo",
    "Прототип",
  ],
  [
    "uihunt",
    "UIHunt",
    "Дизайн",
    "Коллекция продуманных интерфейсов для новых продуктов.",
    "https://uihunt.demo",
    "Beta",
  ],
  [
    "paymio",
    "Paymio",
    "SaaS",
    "Платёжная инфраструктура для независимых digital-продуктов.",
    "https://paymio.demo",
    "MVP",
  ],
  [
    "gamewiki",
    "GameWiki",
    "Игры",
    "Место, где собираются знания о любимых инди-играх.",
    "https://gamewiki.demo",
    "Идея",
  ],
  [
    "quickqr",
    "QuickQR",
    "Инструменты",
    "Создавайте QR-коды и управляйте ссылками в одном месте.",
    "https://quickqr.demo",
    "Запущен",
  ],
] as const;

const demoResources = [
  [
    "editorial-ui",
    "Editorial UI",
    "UI-компоненты",
    "React · TypeScript",
    "Спокойная интерфейсная система для содержательных продуктов.",
    "founder",
  ],
  [
    "focus-dashboard",
    "Focus Dashboard",
    "Готовые страницы",
    "React · TypeScript",
    "Рабочее пространство с ясной иерархией и доступной навигацией.",
    "founder",
  ],
  [
    "subscription-flow",
    "Subscription Flow",
    "UI-блоки",
    "React · TypeScript",
    "Тарифы, прозрачные согласия и управление подпиской.",
    "plus",
  ],
  [
    "daily-planner",
    "Daily Planner",
    "Шаблоны",
    "React · TypeScript",
    "Календарь и трекер задач с мобильной адаптацией.",
    "founder",
  ],
] as const;

export async function seed() {
  const client = await pool.connect();
  try {
    await client.query("begin");
    const owner = await client.query<{ id: string }>(`
      insert into users (email, email_verified_at, name, handle, bio, role)
      values ('demo-owner@founders.local', now(), 'Демо-редакция', 'demo_founders', 'Системный владелец демонстрационного контента.', 'admin')
      on conflict (email) where deleted_at is null do update set name = excluded.name
      returning id
    `);
    const ownerId = owner.rows[0].id;

    for (const project of demoProjects) {
      await client.query(
        `
        insert into projects (owner_id, slug, name, category, short_description, description, website_url, stage, status, is_demo, published_at)
        values ($1, $2, $3, $4, $5, $5, $6, $7, 'published', true, now() - interval '1 day')
        on conflict (slug) where deleted_at is null do nothing
      `,
        [ownerId, ...project],
      );
    }

    for (const resource of demoResources) {
      await client.query(
        `
        insert into resources (slug, name, resource_type, stack, description, access_plan, license_version, version, is_demo)
        values ($1, $2, $3, $4, $5, $6, '2026-10', '1.0.0-demo', true)
        on conflict (slug) do nothing
      `,
        [...resource],
      );
    }
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

const isDirect =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirect) {
  seed()
    .then(() => closePool())
    .catch(async (error) => {
      console.error(error);
      await closePool();
      process.exitCode = 1;
    });
}
