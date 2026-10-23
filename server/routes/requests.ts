import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { pool } from '../db/pool.js';
import { requireAuth, requireRole } from '../lib/auth.js';
import { asyncRoute, HttpError } from '../lib/http.js';
export const requestsRouter = Router();
requestsRouter.post('/', rateLimit({windowMs: 600_000, limit:10, standardHeaders:'draft-8', legacyHeaders:false,
  message:{error:{code:'rate_limited',message:'Слишком много обращений. Повторите позже.'}}}), asyncRoute(async (request,response) => {
  const input = z.object({ requestKey:z.uuid(), kind:z.enum(['contact','resource','tool','billing','affiliate','editorial','appeal']),
    fields:z.record(z.string().max(80),z.string().trim().max(4000)).refine(fields=>Object.keys(fields).length<=20) }).parse(request.body);
  if (input.kind !== 'contact' && !request.auth) throw new HttpError(401,'Войдите, чтобы отправить обращение.','authentication_required');
  const email = z.email().max(320).parse(request.auth?.email || input.fields.email);
  const message = input.fields.message || input.fields.description || input.fields.reason || input.fields.brief || input.fields.appeal || '';
  if (message.length < 10) throw new HttpError(400,'Добавьте описание не короче 10 символов.','description_required');
  if (input.kind === 'billing') {
    const payment = await pool.query('select 1 from payments where public_id::text = $1 and user_id = $2',[input.fields.payment,request.auth!.id]);
    if (!payment.rowCount) throw new HttpError(404,'Платёж в вашем аккаунте не найден.','payment_not_found');
  }
  const result = await pool.query(`insert into support_requests(request_key,user_id,email,kind,fields) values ($1,$2,$3,$4,$5::jsonb)
    on conflict(request_key) do update set request_key=excluded.request_key where support_requests.email = excluded.email
    returning public_id,status`,[input.requestKey,request.auth?.id||null,email,input.kind,JSON.stringify(input.fields)]);
  if (!result.rowCount) throw new HttpError(409,'Повторите отправку с новой страницы.','request_conflict');
  response.status(201).json({data:result.rows[0]});
}));
requestsRouter.get('/',requireAuth,asyncRoute(async(request,response)=>{
  const result=await pool.query('select public_id,kind,fields,status,response,created_at from support_requests where user_id=$1 order by created_at desc limit 100',[request.auth!.id]);
  response.json({data:result.rows});
}));
requestsRouter.get('/admin',requireRole('moderator','admin','superadmin'),asyncRoute(async(_request,response)=>{
  const result=await pool.query('select public_id,email,kind,fields,status,response,created_at from support_requests order by created_at desc limit 200');
  response.json({data:result.rows});
}));
requestsRouter.patch('/:id',requireRole('moderator','admin','superadmin'),asyncRoute(async(request,response)=>{
  const id=z.uuid().parse(request.params.id);
  const input=z.object({status:z.enum(['open','reviewing','resolved']),response:z.string().trim().max(4000)}).parse(request.body);
  const client=await pool.connect();
  try {
    await client.query('begin');
    const result=await client.query('update support_requests set status=$2,response=$3 where public_id=$1 returning public_id,status',[id,input.status,input.response]);
    if(!result.rowCount) throw new HttpError(404,'Обращение не найдено.','not_found');
    await client.query("insert into audit_events(actor_user_id,action,entity_type,entity_id,reason) values ($1,'support.update','support_request',$2,$3)",[request.auth!.id,id,input.status]);
    await client.query('commit'); response.json({data:result.rows[0]});
  } catch(error) {await client.query('rollback');throw error;} finally {client.release();}
}));
