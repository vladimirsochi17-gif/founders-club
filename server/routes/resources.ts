import { Router } from "express";
import { z } from "zod";
import path from "node:path";
import { pool } from "../db/pool.js";
import { requireAuth } from "../lib/auth.js";
import { asyncRoute, HttpError } from "../lib/http.js";
import { fileStore } from "../lib/storage.js";

export const resourcesRouter = Router();
resourcesRouter.use(requireAuth);

resourcesRouter.post(
  "/:slug/download",
  asyncRoute(async (request, response) => {
    const slug = z
      .string()
      .regex(/^[a-z0-9-]{3,80}$/)
      .parse(request.params.slug);
    const client = await pool.connect();
    try {
      await client.query("begin");
      const resource = await client.query<{
        id: string;
        public_id: string;
        name: string;
        version: string;
        license_version: string;
        access_plan: string;
        storage_key: string | null;
        is_demo: boolean;
      }>(
        "select id, public_id, name, version, license_version, access_plan, storage_key, is_demo from resources where slug = $1 and is_active = true for share",
        [slug],
      );
      if (!resource.rowCount)
        throw new HttpError(404, "Ресурс недоступен.", "resource_unavailable");
      const item = resource.rows[0];
      if (!item.is_demo && !item.storage_key)
        throw new HttpError(503, "Файл ресурса пока не загружен.", "resource_unavailable");
      if (item.storage_key) {
        if (path.basename(item.storage_key) !== item.storage_key)
          throw new HttpError(503, "Файл ресурса недоступен.", "resource_unavailable");
        if (!await fileStore.exists(item.storage_key)) throw new HttpError(503, "Файл ресурса недоступен.", "resource_unavailable");
      }
      if (item.access_plan !== "public") {
        const subscription = await client.query<{ plan: string }>(
          `
        select plan from subscriptions where user_id = $1 and status in ('active', 'cancelled') and current_period_end > now()
        order by created_at desc limit 1
      `,
          [request.auth!.id],
        );
        if (
          !subscription.rowCount ||
          (item.access_plan === "plus" && subscription.rows[0].plan !== "plus")
        ) {
          throw new HttpError(
            402,
            "Для скачивания нужен подходящий активный тариф.",
            "subscription_required",
          );
        }
      }
      await client.query(
        `
      insert into resource_downloads (user_id, resource_id, resource_version, license_version)
      values ($1, $2, $3, $4)
      on conflict (user_id, resource_id, resource_version) do update
      set last_downloaded_at = now(), download_count = resource_downloads.download_count + 1
    `,
        [request.auth!.id, item.id, item.version, item.license_version],
      );
      await client.query(
        `insert into app_events (user_id, event_type, source, metadata) values ($1, 'download', 'vault', $2::jsonb)`,
        [request.auth!.id, JSON.stringify({ resourceId: item.public_id })],
      );
      await client.query("commit");
      response.json({
        data: {
          resource: item.name,
          version: item.version,
          licenseVersion: item.license_version,
          isDemo: item.is_demo,
          downloadUrl: item.storage_key
            ? `/api/resources/${slug}/file`
            : null,
        },
      });
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }),
);

resourcesRouter.get("/:slug/file", asyncRoute(async (request, response) => {
  const slug = z.string().regex(/^[a-z0-9-]{3,80}$/).parse(request.params.slug);
  const resource = await pool.query(`select r.storage_key from resources r join resource_downloads d on d.resource_id = r.id
    where r.slug = $1 and r.is_active and d.user_id = $2 and d.resource_version = r.version`, [slug, request.auth!.id]);
  const key = resource.rows[0]?.storage_key;
  if (!key || path.basename(key) !== key) throw new HttpError(404, "Файл недоступен.", "not_found");
  response.setHeader("Cache-Control", "private, no-store");
  await fileStore.send(key, response, true);
}));

resourcesRouter.get(
  "/downloads",
  asyncRoute(async (request, response) => {
    const result = await pool.query(
      `
    select r.slug::text, r.name, d.resource_version, d.license_version, d.granted_at,
           d.last_downloaded_at, d.download_count
    from resource_downloads d join resources r on r.id = d.resource_id
    where d.user_id = $1 order by d.granted_at desc
  `,
      [request.auth!.id],
    );
    response.json({ data: result.rows });
  }),
);
