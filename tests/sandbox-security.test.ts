import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { beforeAll, afterAll, expect, it } from 'vitest';
import { createApp } from '../server/app.js';
import { config } from '../server/config.js';
import { pool, closePool } from '../server/db/pool.js';
import { migrate } from '../server/db/migrate.js';
import { seed } from '../server/db/seed.js';

const email = `sandbox-${randomUUID()}@example.test`;
beforeAll(async () => { await migrate(); await seed(); });
afterAll(async () => {
  await pool.query('delete from users where email = $1', [email]);
  await pool.query('delete from sandbox_owners where email = $1', [email]);
  await pool.query('delete from verification_codes where email = $1', [email]);
  await closePool();
});

it('binds sandbox registration to its browser and blocks seeded admin takeover', async () => {
  config.PUBLIC_SANDBOX = true;
  try {
    const app = createApp();
    await request(app).post('/api/auth/request-code').send({ email: 'demo-owner@founders.local', purpose: 'login' }).expect(403);
    await request(app).get('/api/admin/audit').expect(403);
    const issued = await request(app).post('/api/auth/request-code').send({ email, purpose: 'signup', name: 'Sandbox QA', termsAccepted: true }).expect(202);
    const ownerCookie = issued.headers['set-cookie'].find((value: string) => value.startsWith('fc_sandbox_owner='));
    expect(ownerCookie).toContain('HttpOnly');
    expect(ownerCookie).toContain('Secure');
    const verify = { email, purpose: 'signup', code: issued.body.data.devCode };
    await request(app).post('/api/auth/verify').send(verify).expect(403);
    const signedIn = await request(app).post('/api/auth/verify').set('Cookie', ownerCookie.split(';')[0]).send(verify).expect(200);
    const sessionCookie = signedIn.headers['set-cookie'].find((value: string) => value.startsWith(config.SESSION_COOKIE_NAME + '='));
    expect(sessionCookie).toContain('Secure');
    const session = await request(app).get('/api/auth/session').set('Cookie', sessionCookie.split(';')[0]).expect(200);
    expect(session.body.data.user.role).toBe('user');
    expect(session.body.data.sandbox).toBe(true);
    await request(app).post('/api/auth/request-code').send({ email, purpose: 'login' }).expect(403);
  } finally { config.PUBLIC_SANDBOX = false; }
});
