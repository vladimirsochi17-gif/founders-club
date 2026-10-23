import { randomUUID } from 'node:crypto';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../server/app.js';
import { migrate } from '../server/db/migrate.js';
import { closePool, pool } from '../server/db/pool.js';
import { seed } from '../server/db/seed.js';
import { config } from '../server/config.js';
import { hashOpaqueToken } from '../server/lib/auth.js';

describe('production API flow', () => {
  const app = createApp();
  const agent = request.agent(app);
  const email = `qa-${randomUUID()}@example.test`;
  const slug = `qa-${randomUUID().slice(0, 12)}`;
  let projectId = '';
  let mediaId = '';
  let moderationCaseId = '';
  let moderationVersion = 0;

  beforeAll(async () => {
    await migrate();
    await seed();
  });

  afterAll(async () => {
    const user = await pool.query<{ id: string }>('select id from users where email = $1', [email]);
    if (user.rowCount) {
      const userId = user.rows[0].id;
      const media = await pool.query<{ storage_key: string }>(
        'select pm.storage_key from project_media pm join projects p on p.id = pm.project_id where p.owner_id = $1',
        [userId],
      );
      await Promise.all(
        media.rows.map((item) =>
          unlink(path.resolve(config.UPLOAD_DIR, item.storage_key)).catch(() => undefined),
        ),
      );
      await pool.query('delete from reports where reporter_id = $1', [userId]);
      await pool.query('delete from support_requests where user_id = $1', [userId]);
      await pool.query('delete from resource_downloads where user_id = $1', [userId]);
      await pool.query('delete from reviews where user_id = $1', [userId]);
      await pool.query('delete from promotion_orders where user_id = $1', [userId]);
      await pool.query('delete from votes where user_id = $1', [userId]);
      await pool.query('delete from moderation_cases where project_id in (select id from projects where owner_id = $1)', [userId]);
      await pool.query('delete from project_members where user_id = $1 or project_id in (select id from projects where owner_id = $1)', [userId]);
      await pool.query('delete from projects where owner_id = $1', [userId]);
      await pool.query('delete from payments where user_id = $1', [userId]);
      await pool.query('delete from subscriptions where user_id = $1', [userId]);
      await pool.query('delete from sessions where user_id = $1', [userId]);
      await pool.query('delete from audit_events where actor_user_id = $1', [userId]);
      await pool.query('delete from users where id = $1', [userId]);
    }
    await pool.query('delete from verification_codes where email = $1', [email]);
    await closePool();
  });

  it('reports database health', async () => {
    const response = await agent.get('/api/health').expect(200);
    expect(response.body.data).toMatchObject({ status: 'ok', database: 'ok' });
  });

  it('registers with an email code and establishes a cookie session', async () => {
    const requested = await agent.post('/api/auth/request-code').send({
      email,
      purpose: 'signup',
      name: 'QA Founder',
      termsAccepted: true,
    }).expect(202);
    expect(requested.body.data.devCode).toBe('123456');

    await agent.post('/api/auth/verify').send({ email, purpose: 'signup', code: '123456' }).expect(200);
    const session = await agent.get('/api/auth/session').expect(200);
    expect(session.body.data.authenticated).toBe(true);
    expect(session.body.data.user.email).toBe(email);
  });

  it('persists server-backed UI state', async () => {
    await agent.patch('/api/state').send({ onboardingGoal: 'publish', themeMotion: false }).expect(200);
    const session = await agent.get('/api/auth/session').expect(200);
    expect(session.body.data.state.onboardingGoal).toBe('publish');
  });

  it('does not trust client-side privileges and rejects cross-origin writes', async () => {
    await agent.patch('/api/state').send({ adminRole: 'superadmin', subscribed: true, verified: true, themeMotion: true }).expect(200);
    const session = await agent.get('/api/auth/session').expect(200);
    expect(session.body.data.state.adminRole).toBeUndefined();
    expect(session.body.data.state.subscribed).toBeUndefined();
    await agent.get('/api/admin/moderation').expect(403);
    await agent.patch('/api/state').set('Origin', 'https://attacker.example').send({ themeMotion: false }).expect(403);
    await agent.patch('/api/state').set('Content-Type', 'application/json').send('{bad').expect(400);
  });

  it('updates the public profile with a unique server-side handle', async () => {
    const handle = `qa_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
    const updated = await agent
      .patch('/api/state/profile')
      .send({ name: 'QA Founder', handle, bio: 'Профиль для интеграционной проверки.' })
      .expect(200);
    expect(updated.body.data).toMatchObject({ name: 'QA Founder', handle });
  });

  it('persists idempotent support requests with role-separated queues', async () => {
    const input = {kind:'resource',fields:{name:'QA resource',description:'Проверка серверного сохранения предложения.'},requestKey:randomUUID()};
    const first = await agent.post('/api/requests').send(input).expect(201);
    const retry = await agent.post('/api/requests').send(input).expect(201);
    expect(first.body.data.public_id).toBe(retry.body.data.public_id);
    const own = await agent.get('/api/requests').expect(200);
    expect(own.body.data).toHaveLength(1);
    await agent.get('/api/requests/admin').expect(403);
    await request(app).get('/api/requests').expect(401);
  });

  it('creates and confirms an idempotent local subscription payment', async () => {
    const idempotencyKey = randomUUID();
    const first = await agent.post('/api/billing/checkout').send({
      plan: 'plus', termsVersion: 'test-v1', recurringConsent: true, idempotencyKey,
    }).expect(201);
    const second = await agent.post('/api/billing/checkout').send({
      plan: 'plus', termsVersion: 'test-v1', recurringConsent: true, idempotencyKey,
    }).expect(200);
    expect(second.body.data.public_id).toBe(first.body.data.public_id);
    await agent.post(`/api/billing/mock-confirm/${first.body.data.public_id}`).expect(200);
    await agent.post(`/api/billing/mock-confirm/${first.body.data.public_id}`).expect(200);
    const session = await agent.get('/api/auth/session').expect(200);
    expect(session.body.data.subscription).toMatchObject({ status: 'active', plan: 'plus' });
  });

  it('preserves paid access during checkout and serializes concurrent retries', async () => {
    const input = { plan: 'founder', termsVersion: 'test-v1', recurringConsent: true, idempotencyKey: randomUUID() };
    const replies = await Promise.all([agent.post('/api/billing/checkout').send(input), agent.post('/api/billing/checkout').send(input)]);
    expect(replies.map(reply => reply.status).sort()).toEqual([200, 201]);
    expect(replies[0].body.data.public_id).toBe(replies[1].body.data.public_id);
    const session = await agent.get('/api/auth/session').expect(200);
    expect(session.body.data.subscription).toMatchObject({ status: 'active', plan: 'plus' });
    await agent.post('/api/billing/checkout').send({ ...input, plan: 'plus' }).expect(409);
  });

  it('rejects executable project URLs and missing vote targets', async () => {
    await agent.put('/api/projects/draft').send({ slug: 'bad-url', name: 'Bad', url: 'javascript:alert(1)' }).expect(400);
    await agent.post('/api/projects/does-not-exist/vote').expect(404);
  });

  it('saves a draft in PostgreSQL', async () => {
    const draft = await agent.put('/api/projects/draft').send({
      slug,
      name: 'QA Project',
      short: 'Проверка полного серверного сценария.',
      description: 'Подробное описание тестового проекта для интеграционной проверки.',
      category: 'SaaS',
      stage: 'MVP',
      url: 'https://example.test',
      proof: 'Ручное подтверждение для QA.',
    }).expect(200);
    projectId = draft.body.data.public_id;
  });

  it('validates, stores, serves, reorders and deletes project media', async () => {
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'base64',
    );
    const uploaded = await agent
      .post(`/api/projects/${projectId}/media`)
      .attach('files', png, { filename: 'cover.png', contentType: 'image/png' })
      .attach('files', png, { filename: 'gallery.png', contentType: 'image/png' })
      .expect(201);
    expect(uploaded.body.data).toHaveLength(2);
    await request(app).get(uploaded.body.data[0].url).expect(404);
    const before = await pool.query('select public_id, sort_order from project_media where project_id = (select id from projects where public_id = $1) order by public_id', [projectId]);
    await agent.put(`/api/projects/${projectId}/media-order`).send({ mediaIds: [uploaded.body.data[1].public_id, randomUUID()] }).expect(400);
    await agent.put(`/api/projects/${projectId}/media-order`).send({ mediaIds: [uploaded.body.data[1].public_id] }).expect(400);
    const after = await pool.query('select public_id, sort_order from project_media where project_id = (select id from projects where public_id = $1) order by public_id', [projectId]);
    expect(after.rows).toEqual(before.rows);
    await agent.post(`/api/projects/${projectId}/media`).attach('files', png.subarray(0, 8), { filename: 'corrupt.png', contentType: 'image/png' }).expect(415);
    mediaId = uploaded.body.data[0].public_id;
    await agent.get(uploaded.body.data[0].url).expect(200).expect('content-type', /image\/png/);
    await agent
      .put(`/api/projects/${projectId}/media-order`)
      .send({ mediaIds: uploaded.body.data.map((item: { public_id: string }) => item.public_id).reverse() })
      .expect(200);
    await agent.delete(`/api/projects/${projectId}/media/${mediaId}`).expect(204);
    await agent
      .post(`/api/projects/${projectId}/media`)
      .attach('files', Buffer.from('not-an-image'), {
        filename: 'fake.png',
        contentType: 'image/png',
      })
      .expect(415);
  });

  it('submits a project exactly once to moderation', async () => {
    const submitted = await agent.post(`/api/projects/${projectId}/submit`).expect(202);
    moderationCaseId = submitted.body.data.public_id;
    expect(submitted.body.data.status).toBe('pending');
    await agent.post(`/api/projects/${projectId}/submit`).expect(400);
  });

  it('isolates private drafts and media between accounts', async () => {
    const otherEmail = `qa-other-${randomUUID()}@example.test`;
    const user = await pool.query('insert into users(email,name) values ($1,$2) returning id', [otherEmail, 'Other QA']);
    const otherId = user.rows[0].id;
    const token = randomUUID();
    try {
      await pool.query("insert into sessions(user_id,token_hash,expires_at) values ($1,$2,now() + interval '1 hour')", [otherId, hashOpaqueToken(token)]);
      const cookie = `${config.SESSION_COOKIE_NAME}=${token}`;
      const media = await pool.query('select storage_key from project_media where project_id = (select id from projects where public_id = $1)', [projectId]);
      await request(app).get(`/uploads/${media.rows[0].storage_key}`).set('Cookie', cookie).expect(404);
      const own = await request(app).get('/api/projects').set('Cookie', cookie).expect(200);
      expect(own.body.data).toHaveLength(0);
      await request(app).put('/api/projects/draft').set('Cookie', cookie).send({ publicId: projectId, slug, name: 'Stolen' }).expect(404);
      await request(app).delete(`/api/projects/${projectId}`).set('Cookie', cookie).expect(404);
      await request(app).get('/api/admin/moderation').set('Cookie', cookie).expect(403);
    } finally {
      await pool.query('delete from users where id = $1', [otherId]);
    }
  });

  it('records a resource license and download history', async () => {
    const granted = await agent.post('/api/resources/editorial-ui/download').expect(200);
    expect(granted.body.data.licenseVersion).toBe('2026-10');
    const history = await agent.get('/api/resources/downloads').expect(200);
    expect(history.body.data.some((row: { slug: string }) => row.slug === 'editorial-ui')).toBe(true);
  });

  it('persists votes, reviews and moderation reports for public projects', async () => {
    const vote = await agent.post('/api/projects/mindflow/vote').expect(200);
    expect(vote.body.data.voted).toBe(true);
    const unvote = await agent.post('/api/projects/mindflow/vote').expect(200);
    expect(unvote.body.data.voted).toBe(false);
    await agent
      .post('/api/projects/mindflow/reviews')
      .send({ body: 'Проверочный отзыв с достаточным количеством символов.' })
      .expect(201);
    await agent
      .post('/api/projects/mindflow/reports')
      .send({ reason: 'Другая причина', details: 'Проверочная жалоба для очереди модерации.' })
      .expect(201);
  });

  it('enforces backend roles and optimistic moderation versioning', async () => {
    await agent.get('/api/admin/moderation').expect(403);
    await pool.query("update users set role = 'moderator' where email = $1", [email]);
    const claimed = await agent.post('/api/admin/moderation/claim-next').expect(200);
    expect(claimed.body.data.public_id).toBe(moderationCaseId);
    moderationVersion = claimed.body.data.version;
    await agent.post(`/api/admin/moderation/${moderationCaseId}/decision`).send({
      decision: 'approved', reason: '', version: moderationVersion,
    }).expect(200);
    await agent.post(`/api/admin/moderation/${moderationCaseId}/decision`).send({
      decision: 'rejected', reason: 'Повторное конфликтующее решение.', version: moderationVersion,
    }).expect(409);
  });

  it('publishes the approved project on its public endpoint', async () => {
    const response = await agent.get(`/api/public/projects/${slug}`).expect(200);
    expect(response.body.data).toMatchObject({ public_id: projectId, name: 'QA Project' });
  });

  it('prevents overlapping promotion reservations across day/week inventory', async () => {
    const start = new Date(Date.now() + 10 * 86400000).toISOString();
    await agent.post('/api/promotions/reserve').send({ projectId, placement: 'featured_week', startsAt: start }).expect(201);
    await agent.post('/api/promotions/reserve').send({ projectId, placement: 'featured_day', startsAt: new Date(Date.now() + 12 * 86400000).toISOString() }).expect(409);
  });

  it('returns saved reviews and real public profiles without email disclosure', async () => {
    const project = await agent.get('/api/public/projects/mindflow').expect(200);
    expect(project.body.data.reviewItems.some((item: {body: string}) => item.body.includes('Проверочный отзыв'))).toBe(true);
    const session = await agent.get('/api/auth/session').expect(200);
    const profile = await agent.get(`/api/public/profiles/${session.body.data.user.handle}`).expect(200);
    expect(profile.body.data.name).toBe('QA Founder');
    expect(profile.body.data.email).toBeUndefined();
    await agent.get('/api/public/profiles/does_not_exist').expect(404);
    await agent.get('/api/resources/editorial-ui/file').expect(404);
  });

  it('cancels future renewal but preserves the paid period', async () => {
    const cancelled = await agent.post('/api/billing/subscription/cancel').expect(200);
    await agent.post('/api/billing/subscription/cancel').expect(200);
    expect(cancelled.body.data).toMatchObject({ status: 'cancelled', cancel_at_period_end: true });
    const session = await agent.get('/api/auth/session').expect(200);
    expect(session.body.data.subscription.status).toBe('cancelled');
  });

  it('revokes sessions and makes logout safe to retry', async () => {
    await agent.post('/api/auth/logout').expect(204);
    await agent.post('/api/auth/logout').expect(204);
    const session = await agent.get('/api/auth/session').expect(200);
    expect(session.body.data.authenticated).toBe(false);
    await agent.patch('/api/state').send({themeMotion:true}).expect(401);
    await agent.get('/api/billing/history').expect(401);
  });
});
