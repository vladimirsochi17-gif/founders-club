import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { asyncRoute, HttpError } from "../lib/http.js";

export const publicRouter = Router();

publicRouter.get("/profiles/:handle", asyncRoute(async (request, response) => {
  const handle = z.string().regex(/^[a-z0-9_]{3,30}$/).parse(request.params.handle);
  const result = await pool.query("select public_id, name, handle::text, bio from users where handle = $1 and deleted_at is null", [handle]);
  if (!result.rowCount) throw new HttpError(404, "Автор не найден.", "not_found");
  response.json({ data: result.rows[0] });
}));

publicRouter.get(
  "/projects",
  asyncRoute(async (request, response) => {
    const query = z
      .object({
        q: z.string().trim().max(100).default(""),
        category: z.string().trim().max(80).optional(),
        limit: z.coerce.number().int().min(1).max(48).default(24),
        cursor: z.coerce.number().int().min(0).default(0),
      })
      .parse(request.query);
    const values: unknown[] = [query.limit, query.cursor];
    const clauses = ["p.status = 'published'", "p.deleted_at is null"];
    if (query.q) {
      values.push(`%${query.q}%`);
      clauses.push(
        `(p.name ilike $${values.length} or p.short_description ilike $${values.length})`,
      );
    }
    if (query.category && query.category !== "Все проекты") {
      values.push(query.category);
      clauses.push(`p.category = $${values.length}`);
    }
    const result = await pool.query(
      `
    select p.public_id, p.slug::text, p.name, p.category, p.short_description, p.stage,
           p.website_url, p.is_demo, p.published_at, u.handle::text as owner_handle,
           count(v.user_id)::int as votes,
           case when media.storage_key is null then null else '/uploads/' || media.storage_key end as cover_url
    from projects p join users u on u.id = p.owner_id
    left join votes v on v.project_id = p.id
    left join lateral (
      select storage_key from project_media where project_id = p.id order by sort_order, id limit 1
    ) media on true
    where ${clauses.join(" and ")}
    group by p.id, u.handle, media.storage_key
    order by p.published_at desc, p.id desc
    limit $1 offset $2
  `,
      values,
    );
    response.json({
      data: result.rows,
      meta: {
        nextCursor:
          result.rows.length === query.limit
            ? query.cursor + query.limit
            : null,
      },
    });
  }),
);

publicRouter.get(
  "/projects/:slug",
  asyncRoute(async (request, response) => {
    const slug = z
      .string()
      .regex(/^[a-z0-9-]{3,64}$/)
      .parse(request.params.slug);
    const result = await pool.query(
      `
    select p.public_id, p.slug::text, p.name, p.category, p.short_description, p.description,
           p.stage, p.website_url, p.is_demo, p.published_at, u.handle::text as owner_handle,
           count(distinct v.user_id)::int as votes, count(distinct r.id)::int as reviews,
           case when media.storage_key is null then null else '/uploads/' || media.storage_key end as cover_url
    from projects p join users u on u.id = p.owner_id
    left join votes v on v.project_id = p.id
    left join reviews r on r.project_id = p.id and r.status = 'visible'
    left join lateral (
      select storage_key from project_media where project_id = p.id order by sort_order, id limit 1
    ) media on true
    where p.slug = $1 and p.status = 'published' and p.deleted_at is null
    group by p.id, u.handle, media.storage_key
  `,
      [slug],
    );
    if (!result.rowCount)
      throw new HttpError(404, "Проект не найден.", "not_found");
    const [media, reviews] = await Promise.all([
      pool.query(`select '/uploads/' || pm.storage_key as url, pm.alt_text from project_media pm
        join projects p on p.id = pm.project_id where p.public_id = $1 order by pm.sort_order, pm.id`, [result.rows[0].public_id]),
      pool.query(`select r.id, r.body, r.created_at, u.name, u.handle::text from reviews r
        join users u on u.id = r.user_id join projects p on p.id = r.project_id
        where p.public_id = $1 and r.status = 'visible' and u.deleted_at is null order by r.created_at desc limit 100`, [result.rows[0].public_id]),
    ]);
    response.json({ data: { ...result.rows[0], media: media.rows, reviewItems: reviews.rows } });
  }),
);

publicRouter.get(
  "/resources",
  asyncRoute(async (_request, response) => {
    const result = await pool.query(`
    select public_id, slug::text, name, resource_type, stack, description, access_plan,
           license_version, version, is_demo
    from resources where is_active = true order by created_at desc
  `);
    response.json({ data: result.rows });
  }),
);
