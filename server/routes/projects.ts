import { Router } from "express";
import { randomUUID } from "node:crypto";
import multer from "multer";
import sharp from "sharp";
import { z } from "zod";
import { config } from "../config.js";
import { pool } from "../db/pool.js";
import { requireAuth } from "../lib/auth.js";
import { asyncRoute, HttpError } from "../lib/http.js";
import { fileStore } from "../lib/storage.js";

export const projectsRouter = Router();
projectsRouter.use(requireAuth);

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 8, fields: 4 },
});

function detectImage(buffer: Buffer) {
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) return { mime: "image/png", extension: ".png" };
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff)
    return { mime: "image/jpeg", extension: ".jpg" };
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) return { mime: "image/webp", extension: ".webp" };
  return null;
}

const draftSchema = z.object({
  publicId: z.uuid().optional(),
  slug: z.string().regex(/^[a-z0-9-]{3,64}$/),
  name: z.string().trim().min(1).max(120),
  short: z.string().trim().max(240).default(""),
  description: z.string().trim().max(20_000).default(""),
  category: z.string().trim().min(1).max(80).default("Другое"),
  stage: z.string().trim().min(1).max(80).default("Идея"),
  url: z.url().max(2_000).refine(value => /^https?:\/\//i.test(value), "Используйте HTTP или HTTPS").optional().or(z.literal("")),
  proof: z.string().trim().max(4_000).default(""),
});
const projectKeySchema = z.union([
  z.uuid(),
  z.string().regex(/^[a-z0-9-]{3,64}$/),
]);

projectsRouter.get(
  "/",
  asyncRoute(async (request, response) => {
    const result = await pool.query(
      `
    select distinct p.public_id, p.slug::text, p.name, p.short_description, p.description,
           p.category, p.stage, p.website_url, p.ownership_proof, p.status, p.updated_at,
           (select coalesce(jsonb_agg(jsonb_build_object('id', pm.public_id, 'name', pm.alt_text, 'url', '/uploads/' || pm.storage_key) order by pm.sort_order, pm.id), '[]'::jsonb)
            from project_media pm where pm.project_id = p.id) as media
    from projects p
    left join project_members pm on pm.project_id = p.id
    where (p.owner_id = $1 or pm.user_id = $1) and p.deleted_at is null
    order by p.updated_at desc
  `,
      [request.auth!.id],
    );
    response.json({ data: result.rows });
  }),
);

projectsRouter.put(
  "/draft",
  asyncRoute(async (request, response) => {
    const input = draftSchema.parse(request.body);
    const client = await pool.connect();
    try {
      await client.query("begin");
      let result;
      if (input.publicId) {
        result = await client.query(
          `
        update projects set slug = $3, name = $4, short_description = $5, description = $6,
          category = $7, stage = $8, website_url = nullif($9, ''), ownership_proof = $10
        where public_id = $1 and owner_id = $2 and status in ('draft', 'revisions') and deleted_at is null
        returning public_id, status, updated_at
      `,
          [
            input.publicId,
            request.auth!.id,
            input.slug,
            input.name,
            input.short,
            input.description,
            input.category,
            input.stage,
            input.url || "",
            input.proof,
          ],
        );
        if (!result.rowCount)
          throw new HttpError(
            404,
            "Черновик не найден или недоступен.",
            "draft_not_found",
          );
      } else {
        result = await client.query(
          `
        insert into projects (owner_id, slug, name, short_description, description, category, stage, website_url, ownership_proof)
        values ($1, $2, $3, $4, $5, $6, $7, nullif($8, ''), $9)
        returning public_id, status, updated_at
      `,
          [
            request.auth!.id,
            input.slug,
            input.name,
            input.short,
            input.description,
            input.category,
            input.stage,
            input.url || "",
            input.proof,
          ],
        );
        const projectId = await client.query(
          "select id from projects where public_id = $1",
          [result.rows[0].public_id],
        );
        await client.query(
          `insert into project_members (project_id, user_id, role, accepted_at) values ($1, $2, 'owner', now())`,
          [projectId.rows[0].id, request.auth!.id],
        );
      }
      await client.query("commit");
      response.json({ data: result.rows[0] });
    } catch (error: unknown) {
      await client.query("rollback");
      if ((error as { code?: string }).code === "23505")
        throw new HttpError(
          409,
          "Такой адрес проекта уже занят.",
          "slug_taken",
        );
      throw error;
    } finally {
      client.release();
    }
  }),
);

projectsRouter.delete("/:publicId", asyncRoute(async (request, response) => {
  const id = z.uuid().parse(request.params.publicId);
  const result = await pool.query(`update projects set deleted_at = now() where public_id = $1 and owner_id = $2
    and status in ('draft','revisions') and deleted_at is null returning public_id`, [id, request.auth!.id]);
  if (!result.rowCount) throw new HttpError(404, "Черновик не найден или недоступен для удаления.", "not_found");
  response.status(204).end();
}));

projectsRouter.post(
  "/:publicId/media",
  imageUpload.array("files", 8),
  asyncRoute(async (request, response) => {
    const publicId = z.uuid().parse(request.params.publicId);
    const files = (request.files || []) as Express.Multer.File[];
    if (!files.length)
      throw new HttpError(400, "Выберите хотя бы одно изображение.", "files_required");

    const detected = files.map((file) => detectImage(file.buffer));
    if (detected.some((item) => !item))
      throw new HttpError(
        415,
        "Разрешены только настоящие PNG, JPEG и WebP изображения.",
        "unsupported_media",
      );
    // Decode all pixels and re-encode: reject corrupt files / pixel bombs,
    // strip metadata and trailing payloads instead of trusting MIME headers.
    try {
      for (let index = 0; index < files.length; index++) {
        const format = detected[index]!.extension === ".jpg" ? "jpeg" : detected[index]!.extension.slice(1) as "png" | "webp";
        files[index].buffer = await sharp(files[index].buffer, { limitInputPixels: 25_000_000, failOn: "warning" })
          .rotate().toFormat(format).toBuffer();
      }
    } catch {
      throw new HttpError(415, "Изображение повреждено или превышает 25 мегапикселей.", "unsupported_media");
    }

    const client = await pool.connect();
    const written: string[] = [];
    try {
      await client.query("begin");
      const project = await client.query<{ id: string }>(
        `select id from projects
         where public_id = $1 and owner_id = $2 and status in ('draft', 'revisions') and deleted_at is null
         for update`,
        [publicId, request.auth!.id],
      );
      if (!project.rowCount)
        throw new HttpError(404, "Черновик не найден или недоступен.", "draft_not_found");

      const count = await client.query<{ count: string }>(
        "select count(*)::text as count from project_media where project_id = $1",
        [project.rows[0].id],
      );
      const start = Number(count.rows[0].count);
      if (start + files.length > 8)
        throw new HttpError(409, "Можно добавить не больше 8 изображений.", "media_limit");

      const rows = [];
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        const kind = detected[index]!;
        const storageKey = `${randomUUID()}${kind.extension}`;
        await fileStore.put(storageKey, file.buffer, kind.mime);
        written.push(storageKey);
        const inserted = await client.query(
          `insert into project_media
            (project_id, kind, storage_key, mime_type, sort_order, alt_text)
           values ($1, $2, $3, $4, $5, $6)
           returning public_id, kind, storage_key, mime_type, sort_order, alt_text`,
          [
            project.rows[0].id,
            start + index === 0 ? "cover" : "gallery",
            storageKey,
            kind.mime,
            start + index,
            file.originalname.slice(0, 200),
          ],
        );
        rows.push({
          ...inserted.rows[0],
          name: file.originalname,
          url: `/uploads/${storageKey}`,
        });
      }
      await client.query("commit");
      response.status(201).json({ data: rows });
    } catch (error) {
      await client.query("rollback");
      await Promise.all(written.map((file) => fileStore.remove(file).catch(() => console.error("Storage rollback cleanup failed"))));
      throw error;
    } finally {
      client.release();
    }
  }),
);

projectsRouter.delete(
  "/:publicId/media/:mediaId",
  asyncRoute(async (request, response) => {
    const publicId = z.uuid().parse(request.params.publicId);
    const mediaId = z.uuid().parse(request.params.mediaId);
    const client = await pool.connect();
    let storageKey = "";
    try {
    await client.query("begin");
    const project = await client.query("select id from projects where public_id = $1 and owner_id = $2 and deleted_at is null and status in ('draft','revisions') for update", [publicId, request.auth!.id]);
    if (!project.rowCount) throw new HttpError(404, "Черновик не найден.", "draft_not_found");
    const result = await client.query<{ storage_key: string }>(
      `delete from project_media pm using projects p
       where pm.public_id = $1 and pm.project_id = p.id and p.public_id = $2
         and p.owner_id = $3 and p.status in ('draft', 'revisions')
       returning pm.storage_key`,
      [mediaId, publicId, request.auth!.id],
    );
    if (!result.rowCount)
      throw new HttpError(404, "Изображение не найдено.", "media_not_found");
    storageKey = result.rows[0].storage_key;
    await client.query(
      `with ranked as (
         select pm.id, row_number() over (order by pm.sort_order, pm.id) - 1 as position
         from project_media pm join projects p on p.id = pm.project_id where p.public_id = $1
       )
       update project_media pm set sort_order = ranked.position,
         kind = case when ranked.position = 0 then 'cover' else 'gallery' end
       from ranked where pm.id = ranked.id`,
      [publicId],
    );
    await client.query("commit");
    } catch (error) { await client.query("rollback"); throw error; }
    finally { client.release(); }
    await fileStore.remove(storageKey).catch(() => console.error("Failed to remove orphaned project image"));
    response.status(204).end();
  }),
);

projectsRouter.put(
  "/:publicId/media-order",
  asyncRoute(async (request, response) => {
    const publicId = z.uuid().parse(request.params.publicId);
    const mediaIds = z.array(z.uuid()).min(1).max(8).parse(request.body.mediaIds);
    if (new Set(mediaIds).size !== mediaIds.length)
      throw new HttpError(400, "Порядок содержит дубликаты.", "invalid_media_order");
    const client = await pool.connect();
    try {
      await client.query("begin");
      const project = await client.query("select id from projects where public_id = $1 and owner_id = $2 and status in ('draft','revisions') and deleted_at is null for update", [publicId, request.auth!.id]);
      if (!project.rowCount) throw new HttpError(404, "Черновик не найден.", "draft_not_found");
      const media = await client.query("select public_id::text from project_media where project_id = $1", [project.rows[0].id]);
      if (media.rows.length !== mediaIds.length || media.rows.some(row => !mediaIds.includes(row.public_id)))
        throw new HttpError(400, "Передан неполный или чужой список изображений.", "invalid_media_order");
    const result = await client.query(
      `with requested as (
         select value::uuid as public_id, ordinality - 1 as position
         from unnest($1::text[]) with ordinality as input(value, ordinality)
       ), owned as (
         select pm.id, requested.position
         from requested
         join project_media pm on pm.public_id = requested.public_id
         join projects p on p.id = pm.project_id
         where p.public_id = $2 and p.owner_id = $3 and p.status in ('draft', 'revisions')
       )
       update project_media pm set sort_order = owned.position,
         kind = case when owned.position = 0 then 'cover' else 'gallery' end
       from owned where pm.id = owned.id
       returning pm.public_id, pm.sort_order`,
      [mediaIds, publicId, request.auth!.id],
    );
    if (result.rowCount !== mediaIds.length)
      throw new HttpError(400, "Передан неполный или чужой список изображений.", "invalid_media_order");
    await client.query("commit");
    response.json({ data: result.rows });
    } catch (error) { await client.query("rollback"); throw error; }
    finally { client.release(); }
  }),
);

projectsRouter.post(
  "/:publicId/submit",
  asyncRoute(async (request, response) => {
    const publicId = z.uuid().parse(request.params.publicId);
    const client = await pool.connect();
    try {
      await client.query("begin");
      const subscription = await client.query<{ plan: "founder" | "plus" }>(
        `
      select plan from subscriptions
      where user_id = $1 and status in ('active', 'cancelled') and current_period_end > now()
      order by created_at desc limit 1 for update
    `,
        [request.auth!.id],
      );
      if (!subscription.rowCount)
        throw new HttpError(
          402,
          "Для отправки проекта нужна активная подписка.",
          "subscription_required",
        );
      const limit =
        subscription.rows[0].plan === "plus"
          ? config.PLUS_PROJECT_LIMIT
          : config.FOUNDER_PROJECT_LIMIT;
      const active = await client.query<{ count: string }>(
        `
      select count(*)::text as count from projects
      where owner_id = $1 and status in ('pending', 'revisions', 'published') and deleted_at is null and public_id <> $2
    `,
        [request.auth!.id, publicId],
      );
      if (Number(active.rows[0].count) >= limit)
        throw new HttpError(
          409,
          `Лимит тарифа — ${limit} активных проектов.`,
          "project_limit",
        );

      const project = await client.query<{ id: string }>(
        `
      update projects set status = 'pending'
      where public_id = $1 and owner_id = $2 and status in ('draft', 'revisions') and deleted_at is null
        and length(trim(name)) > 0 and length(trim(short_description)) > 0
        and length(trim(description)) > 0 and length(trim(ownership_proof)) > 0
        and exists (select 1 from project_media where project_id = projects.id)
      returning id
    `,
        [publicId, request.auth!.id],
      );
      if (!project.rowCount)
        throw new HttpError(
          400,
          "Заполните обязательные поля и подтверждение авторства.",
          "project_incomplete",
        );
      const moderation = await client.query(
        `
      insert into moderation_cases (project_id) values ($1)
      on conflict (project_id) where status in ('pending', 'claimed', 'appealed') do update set updated_at = now()
      returning public_id, status
    `,
        [project.rows[0].id],
      );
      await client.query(
        `
      insert into audit_events (actor_user_id, action, entity_type, entity_id)
      values ($1, 'project.submit', 'project', $2)
    `,
        [request.auth!.id, publicId],
      );
      await client.query("commit");
      response.status(202).json({ data: moderation.rows[0] });
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }),
);

projectsRouter.post(
  "/:publicId/vote",
  asyncRoute(async (request, response) => {
    const publicId = projectKeySchema.parse(request.params.publicId);
    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query("select id from users where id = $1 for update", [request.auth!.id]);
      const target = await client.query("select id from projects where (public_id::text = $1 or slug = $1) and status = 'published' and deleted_at is null", [publicId]);
      if (!target.rowCount) throw new HttpError(404, "Проект не найден.", "not_found");
      const removed = await client.query("delete from votes where project_id = $1 and user_id = $2 returning user_id", [target.rows[0].id, request.auth!.id]);
      if (!removed.rowCount) await client.query("insert into votes (project_id,user_id) values ($1,$2)", [target.rows[0].id, request.auth!.id]);
      await client.query("commit");
      response.json({ data: { voted: !removed.rowCount } });
    } catch (error) { await client.query("rollback"); throw error; }
    finally { client.release(); }
  }),
);

projectsRouter.post(
  "/:publicId/reviews",
  asyncRoute(async (request, response) => {
    const publicId = projectKeySchema.parse(request.params.publicId);
    const input = z
      .object({ body: z.string().trim().min(10).max(4000) })
      .parse(request.body);
    const result = await pool.query(
      `
    insert into reviews (project_id, user_id, body)
    select id, $2, $3 from projects where (public_id::text = $1 or slug = $1) and status = 'published' and deleted_at is null
    on conflict (project_id, user_id) do update set body = excluded.body, status = 'visible'
    returning id, body, status, created_at
  `,
      [publicId, request.auth!.id, input.body],
    );
    if (!result.rowCount)
      throw new HttpError(404, "Проект не найден.", "not_found");
    response.status(201).json({ data: result.rows[0] });
  }),
);

projectsRouter.post(
  "/:publicId/reports",
  asyncRoute(async (request, response) => {
    const publicId = projectKeySchema.parse(request.params.publicId);
    const input = z
      .object({
        reason: z.string().trim().min(1).max(120),
        details: z.string().trim().min(10).max(4000),
      })
      .parse(request.body);
    const result = await pool.query(
      `
    insert into reports (reporter_id, project_id, reason, details)
    select $2, id, $3, $4 from projects where (public_id::text = $1 or slug = $1) and status = 'published' and deleted_at is null
    returning public_id, status, created_at
  `,
      [publicId, request.auth!.id, input.reason, input.details],
    );
    if (!result.rowCount)
      throw new HttpError(404, "Проект не найден.", "not_found");
    response.status(201).json({ data: result.rows[0] });
  }),
);
