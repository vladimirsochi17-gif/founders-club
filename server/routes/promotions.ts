import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { requireAuth } from "../lib/auth.js";
import { asyncRoute, HttpError } from "../lib/http.js";

export const promotionsRouter = Router();
promotionsRouter.use(requireAuth);

const prices = {
  highlight: 490,
  boost: 790,
  featured_day: 1490,
  featured_week: 6990,
} as const;

promotionsRouter.post(
  "/reserve",
  asyncRoute(async (request, response) => {
    const input = z
      .object({
        projectId: z.uuid(),
        placement: z.enum([
          "highlight",
          "boost",
          "featured_day",
          "featured_week",
        ]),
        startsAt: z.iso.datetime(),
      })
      .parse(request.body);
    const start = new Date(input.startsAt);
    if (start <= new Date())
      throw new HttpError(400, "Выберите будущую дату.", "invalid_date");
    const durationDays = input.placement === "featured_week" ? 7 : 1;
    const end = new Date(start.getTime() + durationDays * 86_400_000);
    const client = await pool.connect();
    try {
      await client.query("begin");
      const group = input.placement.startsWith("featured_") ? "featured" : input.placement;
      await client.query("select pg_advisory_xact_lock(hashtextextended($1, 1))", [group]);
      await client.query("update promotion_orders set status = 'cancelled' where status = 'reserved' and created_at < now() - interval '15 minutes'");
      const overlap = await client.query(`select 1 from promotion_orders where
        (case when placement in ('featured_day','featured_week') then 'featured' else placement end) = $1
        and status in ('reserved','pending_payment','moderation','active') and starts_at < $3 and ends_at > $2 limit 1`, [group, start, end]);
      if (overlap.rowCount) throw new HttpError(409, "Этот рекламный период уже занят.", "slot_conflict");
      const result = await client.query(
        `
      insert into promotion_orders (user_id, project_id, placement, starts_at, ends_at, amount)
      select $2, id, $3, $4, $5, $6
      from projects where public_id = $1 and owner_id = $2 and deleted_at is null and status = 'published'
      returning public_id, placement, starts_at, ends_at, amount, status
    `,
        [
          input.projectId,
          request.auth!.id,
          input.placement,
          start,
          end,
          prices[input.placement],
        ],
      );
      if (!result.rowCount)
        throw new HttpError(
          404,
          "Проект не найден или недоступен.",
          "not_found",
        );
      await client.query("commit");
      response.status(201).json({ data: result.rows[0] });
    } catch (error: unknown) {
      await client.query("rollback");
      if ((error as { code?: string }).code === "23505")
        throw new HttpError(
          409,
          "Этот рекламный слот уже занят.",
          "slot_conflict",
        );
      throw error;
    } finally {
      client.release();
    }
  }),
);
