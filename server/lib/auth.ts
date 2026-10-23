import { createHash, createHmac, randomBytes } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { config, isProduction } from "../config.js";
import { pool } from "../db/pool.js";
import { HttpError } from "./http.js";

export type AuthUser = {
  id: string;
  publicId: string;
  email: string;
  name: string;
  handle: string | null;
  role: "user" | "moderator" | "admin" | "superadmin";
};

export const hashOpaqueToken = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export const hashShortCode = (email: string, purpose: string, code: string) =>
  createHmac("sha256", config.AUTH_HASH_SECRET)
    .update(`${email.toLowerCase()}\0${purpose}\0${code}`)
    .digest("hex");

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProduction || config.PUBLIC_SANDBOX,
    path: "/",
    maxAge: config.SESSION_TTL_DAYS * 86_400_000,
  };
}

export async function issueSession(userId: string, request: Request) {
  const token = randomBytes(32).toString("base64url");
  const ip = request.ip || "";
  const ipHash = ip
    ? createHmac("sha256", config.AUTH_HASH_SECRET).update(ip).digest("hex")
    : null;
  await pool.query(
    `insert into sessions (user_id, token_hash, user_agent, ip_hash, expires_at)
     values ($1, $2, $3, $4, now() + ($5::text || ' days')::interval)`,
    [
      userId,
      hashOpaqueToken(token),
      request.get("user-agent")?.slice(0, 500) || null,
      ipHash,
      config.SESSION_TTL_DAYS,
    ],
  );
  return token;
}

export async function loadAuth(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  try {
    const raw = request.cookies?.[config.SESSION_COOKIE_NAME];
    if (!raw || typeof raw !== "string") {
      next();
      return;
    }
    const result = await pool.query<{
      id: string;
      public_id: string;
      email: string;
      name: string;
      handle: string | null;
      role: AuthUser["role"];
    }>(
      `
      select u.id, u.public_id, u.email::text, u.name, u.handle::text, u.role
      from sessions s
      join users u on u.id = s.user_id
      where s.token_hash = $1 and s.revoked_at is null and s.expires_at > now() and u.deleted_at is null
    `,
      [hashOpaqueToken(raw)],
    );
    const user = result.rows[0];
    if (user) {
      request.auth = {
        id: user.id,
        publicId: user.public_id,
        email: user.email,
        name: user.name,
        handle: user.handle,
        role: user.role,
      };
    }
    next();
  } catch (error) {
    next(error);
  }
}

export function requireAuth(
  request: Request,
  _response: Response,
  next: NextFunction,
) {
  if (!request.auth)
    throw new HttpError(
      401,
      "Сначала войдите в аккаунт.",
      "authentication_required",
    );
  next();
}

export function requireRole(...roles: AuthUser["role"][]) {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (!request.auth)
      throw new HttpError(
        401,
        "Сначала войдите в аккаунт.",
        "authentication_required",
      );
    if (!roles.includes(request.auth.role))
      throw new HttpError(403, "Недостаточно прав.", "forbidden");
    next();
  };
}
