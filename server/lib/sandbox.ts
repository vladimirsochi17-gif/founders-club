import { randomBytes } from 'node:crypto';
import type { Request, Response } from 'express';
import { config } from '../config.js';
import { pool } from '../db/pool.js';
import { hashOpaqueToken } from './auth.js';
import { HttpError } from './http.js';

// Email is a test identifier, not verified identity. A secret HttpOnly browser
// capability owns each sandbox account; knowing its email or displayed OTP is insufficient.
export async function sandboxOwner(request: Request, response: Response, email: string, claim = false) {
  if (!config.PUBLIC_SANDBOX) return;
  const cookie = request.cookies?.fc_sandbox_owner;
  const token = typeof cookie === 'string' && /^[A-Za-z0-9_-]{43}$/.test(cookie) ? cookie : randomBytes(32).toString('base64url');
  const digest = hashOpaqueToken(token);
  if (claim) {
    await pool.query(`insert into sandbox_owners(email, browser_hash)
      select $1, $2 where not exists (select 1 from users where email = $1)
      on conflict (email) do nothing`, [email, digest]);
  }
  const result = await pool.query(`select 1 from sandbox_owners o where o.email = $1 and o.browser_hash = $2
    and not exists (select 1 from users where email = $1 and role <> 'user')`, [email, digest]);
  if (!result.rowCount) throw new HttpError(403,
    'Этот тестовый аккаунт недоступен в данном браузере. Зарегистрируйте новый вымышленный email. Восстановление реальной почтой в песочнице отключено.', 'sandbox_account_protected');
  response.cookie('fc_sandbox_owner', token, { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 30 * 86400000 });
}
