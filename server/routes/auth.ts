import { randomInt, timingSafeEqual } from "node:crypto";
import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { config } from "../config.js";
import { pool } from "../db/pool.js";
import {
  hashOpaqueToken,
  hashShortCode,
  issueSession,
  requireAuth,
  sessionCookieOptions,
} from "../lib/auth.js";
import { asyncRoute, HttpError } from "../lib/http.js";
import { sendAuthCode } from "../lib/mailer.js";
import { safePreferences } from "../lib/preferences.js";
import { sandboxOwner } from "../lib/sandbox.js";

export const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: 10 * 60_000,
  limit: 12,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: {
      code: "rate_limited",
      message: "Слишком много попыток. Попробуйте позже.",
    },
  },
});

const requestSchema = z.object({
  email: z
    .email()
    .max(320)
    .transform((value) => value.toLowerCase()),
  purpose: z.enum(["login", "signup", "recover", "reauth"]).default("login"),
  name: z.string().trim().min(1).max(120).optional(),
  termsAccepted: z.boolean().default(false),
});

authRouter.post(
  "/request-code",
  authLimiter,
  asyncRoute(async (request, response) => {
    const input = requestSchema.parse(request.body);
    if (input.purpose === "reauth" && request.auth?.email !== input.email)
      throw new HttpError(401, "Повторно подтвердите текущий аккаунт.", "authentication_required");
    if (input.purpose === "signup" && !input.termsAccepted) {
      throw new HttpError(
        400,
        "Примите условия и политику обработки данных.",
        "terms_required",
      );
    }

    await sandboxOwner(request, response, input.email, input.purpose === "signup");

    const account = await pool.query(
      "select 1 from users where email = $1 and deleted_at is null",
      [input.email],
    );
    if (input.purpose === "signup" && account.rowCount) {
      throw new HttpError(
        409,
        "Аккаунт с этим email уже существует.",
        "email_taken",
      );
    }

    const code =
      config.NODE_ENV !== "production" && config.LOCAL_AUTH_DEV_CODE
        ? config.LOCAL_AUTH_DEV_CODE
        : String(randomInt(100_000, 1_000_000));

    const codeClient = await pool.connect();
    try {
    await codeClient.query("begin");
    await codeClient.query("select pg_advisory_xact_lock(hashtextextended($1, 0))", [input.email]);
    const recent = await codeClient.query("select 1 from verification_codes where email = $1 and created_at > now() - interval '60 seconds' limit 1", [input.email]);
    if (recent.rowCount) throw new HttpError(429, "Подождите минуту перед повторной отправкой кода.", "rate_limited");
    await codeClient.query(
      "update verification_codes set consumed_at = now() where email = $1 and purpose = $2 and consumed_at is null",
      [input.email, input.purpose],
    );
    await codeClient.query(
      `
    insert into verification_codes (email, code_hash, purpose, name, expires_at)
    values ($1, $2, $3, $4, now() + interval '10 minutes')
  `,
      [
        input.email,
        hashShortCode(input.email, input.purpose, code),
        input.purpose,
        input.name || null,
      ],
    );
    await codeClient.query("commit");
    } catch (error) { await codeClient.query("rollback"); throw error; }
    finally { codeClient.release(); }
    await sendAuthCode(input.email, code);
    response.status(202).json({
      data: {
        sent: true,
        expiresInSeconds: 600,
        ...(config.NODE_ENV !== "production" ? { devCode: code } : {}),
      },
    });
  }),
);

const verifySchema = z.object({
  email: z
    .email()
    .max(320)
    .transform((value) => value.toLowerCase()),
  code: z.string().regex(/^\d{6}$/),
  purpose: z.enum(["login", "signup", "recover", "reauth"]).default("login"),
});

authRouter.post(
  "/verify",
  authLimiter,
  asyncRoute(async (request, response) => {
    const input = verifySchema.parse(request.body);
    await sandboxOwner(request, response, input.email);
    if (input.purpose === "reauth" && request.auth?.email !== input.email)
      throw new HttpError(401, "Повторно подтвердите текущий аккаунт.", "authentication_required");
    const client = await pool.connect();
    try {
      await client.query("begin");
      const found = await client.query<{
        id: string;
        code_hash: string;
        attempts: number;
        name: string | null;
      }>(
        `
      select id, code_hash, attempts, name
      from verification_codes
      where email = $1 and purpose = $2 and consumed_at is null and expires_at > now()
      order by created_at desc
      limit 1
      for update
    `,
        [input.email, input.purpose],
      );
      const record = found.rows[0];
      if (
        !record ||
        record.attempts >= 5 ||
        !timingSafeEqual(Buffer.from(record.code_hash, "hex"),
          Buffer.from(hashShortCode(input.email, input.purpose, input.code), "hex"))
      ) {
        if (record)
          await client.query(
            "update verification_codes set attempts = least(attempts + 1, 5) where id = $1",
            [record.id],
          );
        await client.query("commit");
        throw new HttpError(400, "Код неверен или истёк.", "invalid_code");
      }
      await client.query(
        "update verification_codes set consumed_at = now() where id = $1",
        [record.id],
      );

      let user = await client.query<{ id: string }>(
        "select id from users where email = $1 and deleted_at is null for update",
        [input.email],
      );
      if (!user.rowCount && input.purpose !== "signup") {
        await client.query("commit");
        throw new HttpError(
          400,
          "Не удалось подтвердить вход.",
          "invalid_code",
        );
      }
      if (!user.rowCount) {
        user = await client.query<{ id: string }>(
          `
        insert into users (email, email_verified_at, name, handle)
        values ($1, now(), $2, 'founder_' || substr(md5(random()::text), 1, 8))
        returning id
      `,
          [input.email, record.name || "Автор проекта"],
        );
      } else {
        await client.query(
          "update users set email_verified_at = coalesce(email_verified_at, now()) where id = $1",
          [user.rows[0].id],
        );
      }
      await client.query("commit");

      const token = await issueSession(user.rows[0].id, request);
      response.cookie(
        config.SESSION_COOKIE_NAME,
        token,
        sessionCookieOptions(),
      );
      response.json({ data: { authenticated: true } });
    } catch (error) {
      if (client.query) {
        try {
          await client.query("rollback");
        } catch {
          /* transaction may already be committed */
        }
      }
      throw error;
    } finally {
      client.release();
    }
  }),
);

authRouter.get(
  "/session",
  asyncRoute(async (request, response) => {
    if (!request.auth) {
      response.json({ data: { authenticated: false, sandbox: config.PUBLIC_SANDBOX } });
      return;
    }
    const result = await pool.query<{
      ui_state: Record<string, unknown>;
      bio: string;
      subscription_status: string | null;
      plan: string | null;
      current_period_end: Date | null;
      cancel_at_period_end: boolean | null;
    }>(
      `
    select u.ui_state, u.bio, s.status as subscription_status, s.plan, s.current_period_end, s.cancel_at_period_end
    from users u
    left join lateral (
      select status, plan, current_period_end, cancel_at_period_end
      from subscriptions where user_id = u.id order by created_at desc limit 1
    ) s on true
    where u.id = $1
  `,
      [request.auth.id],
    );
    const details = result.rows[0];
    const [votes, downloads] = await Promise.all([
      pool.query("select p.slug::text from votes v join projects p on p.id = v.project_id where v.user_id = $1", [request.auth.id]),
      pool.query("select distinct r.slug::text from resource_downloads d join resources r on r.id = d.resource_id where d.user_id = $1", [request.auth.id]),
    ]);
    response.json({
      data: {
        authenticated: true,
        sandbox: config.PUBLIC_SANDBOX,
        user: { ...request.auth, bio: details.bio },
        state: { ...safePreferences(details.ui_state), vote: votes.rows.map(row => row.slug), downloads: downloads.rows.map(row => row.slug) },
        subscription: details.subscription_status
          ? {
              status: details.subscription_status,
              plan: details.plan,
              currentPeriodEnd: details.current_period_end,
              cancelAtPeriodEnd: details.cancel_at_period_end,
            }
          : null,
      },
    });
  }),
);

authRouter.post(
  "/logout",
  asyncRoute(async (request, response) => {
    const raw = request.cookies?.[config.SESSION_COOKIE_NAME];
    if (raw)
      await pool.query(
        "update sessions set revoked_at = now() where token_hash = $1",
        [hashOpaqueToken(raw)],
      );
    response.clearCookie(config.SESSION_COOKIE_NAME, { path: "/" });
    response.status(204).end();
  }),
);
