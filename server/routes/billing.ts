import { randomUUID } from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { config } from "../config.js";
import { pool } from "../db/pool.js";
import { requireAuth } from "../lib/auth.js";
import { asyncRoute, HttpError } from "../lib/http.js";

export const billingRouter = Router();
billingRouter.use(requireAuth);

const prices = { founder: 299, plus: 699 } as const;

billingRouter.post(
  "/checkout",
  asyncRoute(async (request, response) => {
    const input = z
      .object({
        plan: z.enum(["founder", "plus"]),
        termsVersion: z.string().trim().min(1).max(80),
        recurringConsent: z.literal(true),
        idempotencyKey: z
          .string()
          .min(8)
          .max(120)
          .default(() => randomUUID()),
      })
      .parse(request.body);
    if (config.PAYMENTS_MODE === "disabled")
      throw new HttpError(
        503,
        "Платёжный провайдер ещё не настроен.",
        "payments_disabled",
      );

    const client = await pool.connect();
    try {
      await client.query("begin");
      // Serialize checkouts even before the first subscription exists.
      await client.query("select id from users where id = $1 for update", [request.auth!.id]);
      const existingPayment = await client.query(
        `
      select public_id, status, amount, currency, metadata from payments where user_id = $1 and idempotency_key = $2
    `,
        [request.auth!.id, input.idempotencyKey],
      );
      if (existingPayment.rowCount) {
        if (existingPayment.rows[0].metadata.plan !== input.plan ||
            existingPayment.rows[0].metadata.termsVersion !== input.termsVersion)
          throw new HttpError(409, "Этот ключ уже использован для другого платежа.", "idempotency_conflict");
        await client.query("commit");
        response.json({ data: { ...existingPayment.rows[0], mode: config.PAYMENTS_MODE } });
        return;
      }
      const live = await client.query<{ id: string; public_id: string }>(
        `
      select id, public_id from subscriptions
      where user_id = $1 and status in ('pending', 'active', 'past_due', 'cancelled')
      order by created_at desc limit 1 for update
    `,
        [request.auth!.id],
      );
      let subscriptionId: string;
      if (live.rowCount) {
        subscriptionId = live.rows[0].id;
        // Existing entitlement changes only after successful payment.
      } else {
        const created = await client.query<{ id: string }>(
          `
        insert into subscriptions (user_id, plan, status, terms_version, recurring_consent_at)
        values ($1, $2, 'pending', $3, now()) returning id
      `,
          [request.auth!.id, input.plan, input.termsVersion],
        );
        subscriptionId = created.rows[0].id;
      }
      const payment = await client.query(
        `
      insert into payments (user_id, subscription_id, kind, status, amount, idempotency_key, metadata)
      values ($1, $2, 'subscription', 'pending', $3, $4, $5::jsonb)
      returning public_id, status, amount, currency
    `,
        [
          request.auth!.id,
          subscriptionId,
          prices[input.plan],
          input.idempotencyKey,
          JSON.stringify({
            plan: input.plan,
            termsVersion: input.termsVersion,
          }),
        ],
      );
      await client.query("commit");
      response
        .status(201)
        .json({ data: { ...payment.rows[0], mode: config.PAYMENTS_MODE } });
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }),
);

billingRouter.post(
  "/mock-confirm/:paymentId",
  asyncRoute(async (request, response) => {
    if (config.PAYMENTS_MODE !== "mock" || config.NODE_ENV === "production") {
      throw new HttpError(404, "Маршрут недоступен.", "not_found");
    }
    const paymentId = z.uuid().parse(request.params.paymentId);
    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query("select id from users where id = $1 for update", [request.auth!.id]);
      const payment = await client.query<{
        id: string;
        subscription_id: string;
        status: string;
        metadata: { plan: string; termsVersion: string };
      }>(
        `
      select id, subscription_id, status, metadata from payments
      where public_id = $1 and user_id = $2 for update
    `,
        [paymentId, request.auth!.id],
      );
      if (!payment.rowCount)
        throw new HttpError(
          404,
          "Платёж не найден.",
          "payment_state",
        );
      if (payment.rows[0].status === "succeeded") {
        await client.query("commit");
        response.json({ data: { status: "succeeded" } });
        return;
      }
      if (payment.rows[0].status !== "pending")
        throw new HttpError(409, "Платёж уже закрыт.", "payment_state");
      await client.query("update payments set status = 'succeeded', provider_payment_id = 'mock:' || public_id::text where id = $1", [payment.rows[0].id]);
      await client.query(
        `
      update subscriptions set status = 'active', plan = $2, terms_version = $3,
        recurring_consent_at = now(), current_period_start = now(),
        current_period_end = greatest(coalesce(current_period_end, now()), now()) + interval '1 month', cancel_at_period_end = false
      where id = $1
    `,
        [payment.rows[0].subscription_id, payment.rows[0].metadata.plan, payment.rows[0].metadata.termsVersion],
      );
      await client.query(
        `
      insert into audit_events (actor_user_id, action, entity_type, entity_id, metadata)
      values ($1, 'payment.mock_confirm', 'payment', $2, '{"environment":"local"}')
    `,
        [request.auth!.id, paymentId],
      );
      await client.query("commit");
      response.json({ data: { status: "succeeded" } });
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }),
);

billingRouter.post(
  "/subscription/cancel",
  asyncRoute(async (request, response) => {
    const result = await pool.query(
      `
    update subscriptions set status = 'cancelled', cancel_at_period_end = true
    where id = (
      select id from subscriptions where user_id = $1 and status in ('active', 'past_due', 'cancelled')
      order by created_at desc limit 1
    )
    returning public_id, status, current_period_end, cancel_at_period_end
  `,
      [request.auth!.id],
    );
    if (!result.rowCount)
      throw new HttpError(
        409,
        "Активная подписка не найдена.",
        "subscription_state",
      );
    response.json({ data: result.rows[0] });
  }),
);

billingRouter.get(
  "/history",
  asyncRoute(async (request, response) => {
    const result = await pool.query(
      `
    select public_id, kind, status, amount, currency, provider, created_at, updated_at
    from payments where user_id = $1 order by created_at desc limit 100
  `,
      [request.auth!.id],
    );
    response.json({ data: result.rows });
  }),
);
