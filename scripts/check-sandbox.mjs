import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';

const base = process.argv[2];
if (!base || (!base.startsWith('https://') && !['http://127.0.0.1:8791', 'http://127.0.0.1:8792'].includes(base))) throw new Error('Pass the HTTPS sandbox origin or local sandbox address');
const origin = process.argv[3] || base;
const cookies = new Map();
async function api(path, method = 'GET', body, authenticated = true) {
  const response = await fetch(base + '/api' + path, {
    method, headers: { Origin: origin, 'Content-Type': 'application/json',
      ...(authenticated ? { Cookie: [...cookies].map(([key,value]) => `${key}=${value}`).join('; ') } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(20000),
  });
  if (authenticated) for (const cookie of response.headers.getSetCookie()) {
    const pair = cookie.split(';')[0]; const i = pair.indexOf('=');
    cookies.set(pair.slice(0,i), pair.slice(i+1));
  }
  return { status: response.status, body: await response.json().catch(() => ({})) };
}
const initial = await api('/auth/session');
assert.equal(initial.body.data?.sandbox, true, `Refuse to test a non-sandbox/unavailable site (HTTP ${initial.status})`);
const email = `qa-external-${randomUUID()}@example.test`;
const issued = await api('/auth/request-code', 'POST', {email,purpose:'signup',name:'External QA',termsAccepted:true});
assert.equal(issued.status, 202, JSON.stringify(issued.body));
const verification = {email,purpose:'signup',code:issued.body.data.devCode};
assert.equal((await api('/auth/verify','POST',verification,false)).status,403);
assert.equal((await api('/auth/verify','POST',verification)).status,200);
assert.equal((await api('/auth/session')).body.data.user.email,email);
const slug = `qa-public-${randomUUID().slice(0,12)}`;
const draft = await api('/projects/draft','PUT',{slug,name:'Проверка внешнего доступа',short:'Тест сохранения в отдельной базе',category:'SaaS',stage:'MVP',url:'https://example.com'});
assert.equal(draft.status,200,JSON.stringify(draft.body));
assert.equal((await api('/projects')).body.data.some(item=>item.slug===slug),true);
const imageBytes = await sharp({create:{width:32,height:32,channels:3,background:'#e8ddd0'}}).png().toBuffer();
const form = new FormData();
form.append('files',new Blob([imageBytes],{type:'image/png'}),'sandbox-qa.png');
const cookieHeader = [...cookies].map(([key,value]) => `${key}=${value}`).join('; ');
const uploaded = await fetch(`${base}/api/projects/${draft.body.data.public_id}/media`, {
  method:'POST',headers:{Origin:origin,Cookie:cookieHeader},body:form,signal:AbortSignal.timeout(30000),
});
assert.equal(uploaded.status,201,`Image upload failed: HTTP ${uploaded.status}`);
const media = (await uploaded.json()).data[0];
const privateImage = await fetch(base+media.url,{headers:{Cookie:cookieHeader},signal:AbortSignal.timeout(30000)});
assert.equal(privateImage.status,200);
assert.ok((await privateImage.arrayBuffer()).byteLength > 0);
assert.equal((await fetch(base+media.url,{signal:AbortSignal.timeout(20000)})).status,404,'Draft image must not be public');
assert.equal((await api(`/projects/${draft.body.data.public_id}/media/${media.public_id}`,'DELETE')).status,204);
assert.equal((await fetch(base+media.url,{headers:{Cookie:cookieHeader},signal:AbortSignal.timeout(20000)})).status,404);
assert.equal((await api('/admin/audit')).status,403);
const checkout = await api('/billing/checkout','POST',{plan:'founder',termsVersion:'sandbox-test-v1',recurringConsent:true,idempotencyKey:randomUUID()});
assert.equal(checkout.status,201,JSON.stringify(checkout.body));
assert.equal(checkout.body.data.mode,'mock');
assert.equal((await api(`/billing/mock-confirm/${checkout.body.data.public_id}`,'POST',{})).status,200);
assert.equal((await api('/auth/session')).body.data.subscription.status,'active');
await api('/auth/logout','POST',{});
assert.equal((await api('/auth/session')).body.data.authenticated,false);
console.log(`PASS at ${base}: signup, browser-bound code, session, project database persistence, private image upload/read/delete, mock checkout, admin isolation, logout`);
