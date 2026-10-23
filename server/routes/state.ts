import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool.js";
import { requireAuth } from "../lib/auth.js";
import { asyncRoute, HttpError } from "../lib/http.js";
import { preferencesSchema, safePreferences } from "../lib/preferences.js";

export const stateRouter = Router();
stateRouter.use(requireAuth);

stateRouter.get(
  "/",
  asyncRoute(async (request, response) => {
    const result = await pool.query(
      "select ui_state from users where id = $1",
      [request.auth!.id],
    );
    response.json({ data: safePreferences(result.rows[0]?.ui_state) });
  }),
);

stateRouter.patch(
  "/profile",
  asyncRoute(async (request, response) => {
    const input = z
      .object({
        name: z.string().trim().min(1).max(120),
        handle: z.string().regex(/^[a-z0-9_]{3,30}$/),
        bio: z.string().trim().max(1200),
      })
      .parse(request.body);
    try {
      const result = await pool.query(
        `update users set name = $2, handle = $3, bio = $4, updated_at = now()
         where id = $1 and deleted_at is null
         returning name, handle::text, bio`,
        [request.auth!.id, input.name, input.handle, input.bio],
      );
      response.json({ data: result.rows[0] });
    } catch (error) {
      if ((error as { code?: string }).code === "23505")
        throw new HttpError(409, "Этот публичный адрес уже занят.", "handle_taken");
      throw error;
    }
  }),
);

stateRouter.patch(
  "/",
  asyncRoute(async (request, response) => {
    const patch = preferencesSchema.parse(request.body);
    const encoded = JSON.stringify(patch);
    if (Buffer.byteLength(encoded) > 128_000)
      throw new HttpError(413, "Состояние слишком большое.", "state_too_large");
    const result = await pool.query<{ ui_state: Record<string, unknown> }>(
      `
    update users set ui_state = ui_state || $2::jsonb where id = $1 returning ui_state
  `,
      [request.auth!.id, encoded],
    );
    response.json({ data: safePreferences(result.rows[0].ui_state) });
  }),
);
