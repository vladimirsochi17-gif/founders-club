import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { requireRole } from "../lib/auth.js";
import { asyncRoute, HttpError } from "../lib/http.js";

export const adminRouter = Router();
adminRouter.use(requireRole("moderator", "admin", "superadmin"));

adminRouter.get(
  "/moderation",
  asyncRoute(async (_request, response) => {
    const result = await pool.query(`
    select m.public_id, m.status, m.claimed_at, m.version, m.created_at,
           p.public_id as project_public_id, p.slug::text, p.name, p.short_description, p.description, p.category, p.ownership_proof, p.website_url,
           (select coalesce(jsonb_agg('/uploads/' || pm.storage_key order by pm.sort_order), '[]') from project_media pm where pm.project_id = p.id) as media,
           u.handle::text as owner_handle
    from moderation_cases m
    join projects p on p.id = m.project_id
    join users u on u.id = p.owner_id
    where m.status in ('pending', 'claimed', 'appealed') and p.deleted_at is null
    order by case when m.status = 'appealed' then 0 else 1 end, m.created_at
    limit 100
  `);
    response.json({ data: result.rows });
  }),
);

adminRouter.post(
  "/moderation/claim-next",
  asyncRoute(async (request, response) => {
    const client = await pool.connect();
    try {
      await client.query("begin");
      const result = await client.query(
        `
      update moderation_cases set status = 'claimed', claimed_by = $1, claimed_at = now(), version = version + 1
      where id = (
        select id from moderation_cases
        where status = 'pending'
        order by created_at
        limit 1 for update skip locked
      )
      returning public_id, status, version
    `,
        [request.auth!.id],
      );
      await client.query("commit");
      if (!result.rowCount) {
        response.status(204).end();
        return;
      }
      response.json({ data: result.rows[0] });
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }),
);

adminRouter.post(
  "/moderation/:caseId/decision",
  asyncRoute(async (request, response) => {
    const caseId = z.uuid().parse(request.params.caseId);
    const input = z
      .object({
        decision: z.enum(["approved", "revisions", "rejected"]),
        reason: z.string().trim().max(4000).default(""),
        version: z.number().int().positive(),
      })
      .superRefine((value, ctx) => {
        if (value.decision !== "approved" && value.reason.length < 10) {
          ctx.addIssue({
            code: "custom",
            path: ["reason"],
            message: "Укажите конкретную причину решения.",
          });
        }
      })
      .parse(request.body);

    const client = await pool.connect();
    try {
      await client.query("begin");
      const moderation = await client.query<{ id: string; project_id: string }>(
        `
      update moderation_cases
      set status = $3, decided_by = $2, decision_reason = nullif($4, ''), decided_at = now(), version = version + 1
      where public_id = $1 and version = $5 and status in ('claimed', 'pending', 'appealed')
        and (claimed_by is null or claimed_by = $2)
      returning id, project_id
    `,
        [caseId, request.auth!.id, input.decision, input.reason, input.version],
      );
      if (!moderation.rowCount)
        throw new HttpError(
          409,
          "Заявка уже изменилась. Обновите страницу.",
          "moderation_conflict",
        );
      const projectStatus =
        input.decision === "approved" ? "published" : input.decision;
      const project = await client.query<{ public_id: string }>(
        `
      update projects set status = $2, published_at = case when $2 = 'published' then coalesce(published_at, now()) else published_at end
      where id = $1 returning public_id
    `,
        [moderation.rows[0].project_id, projectStatus],
      );
      await client.query(
        `
      insert into audit_events (actor_user_id, action, entity_type, entity_id, reason, metadata)
      values ($1, 'moderation.decision', 'project', $2, nullif($3, ''), $4::jsonb)
    `,
        [
          request.auth!.id,
          project.rows[0].public_id,
          input.reason,
          JSON.stringify({ decision: input.decision, caseId }),
        ],
      );
      await client.query("commit");
      response.json({
        data: { projectId: project.rows[0].public_id, status: projectStatus },
      });
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }),
);

adminRouter.get(
  "/audit",
  requireRole("admin", "superadmin"),
  asyncRoute(async (_request, response) => {
    const result = await pool.query(`
    select a.action, a.entity_type, a.entity_id, a.reason, a.metadata, a.created_at,
           u.email::text as actor_email
    from audit_events a left join users u on u.id = a.actor_user_id
    order by a.created_at desc limit 200
  `);
    response.json({ data: result.rows });
  }),
);
