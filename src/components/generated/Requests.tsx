import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { Action, Badge, Button, Empty, Field, Notice, PageHead, useApp } from "./core";
const labels: Record<string,string> = {contact:'Обращение',resource:'Предложение ресурса',tool:'Предложение инструмента',billing:'Вопрос по платежу',affiliate:'Партнёрская заявка',editorial:'Заявка на обзор',appeal:'Апелляция'};
export function Requests({admin = false}: {admin?:boolean}) {
  const a=useApp();
  const [rows,setRows]=useState<any[]>([]);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(true);
  const [editing,setEditing]=useState('');
  const [reply,setReply]=useState('');
  const [busy,setBusy]=useState(false);
  const load=async()=>{setLoading(true);try{setRows(await api.requests(admin));setError('');}catch(error){setError(error instanceof Error?error.message:'Ошибка загрузки.');}finally{setLoading(false);}};
  useEffect(()=>{if(a.model.logged) void load();},[a.model.logged,admin]);
  if(!a.model.logged) return <div className="container page"><Empty title="Войдите, чтобы увидеть обращения" to={102} cta="Войти" /></div>;
  return <div className="container page"><PageHead title={admin?'Очередь поддержки':'Мои обращения'} back={admin?174:131}><Button onClick={load}>Обновить</Button><Action to={19}>Новое обращение</Action></PageHead>
    {error&&<Notice tone="danger">{error}</Notice>}
    {loading?<Notice>Загрузка…</Notice>:rows.length?rows.map(row=><article className="panel" key={row.public_id}>
      <div className="inline"><h2>{labels[row.kind]}</h2><Badge>{({open:'Открыто',reviewing:'На рассмотрении',resolved:'Рассмотрено'} as Record<string,string>)[row.status]}</Badge></div>
      <p>{row.public_id} · {new Date(row.created_at).toLocaleString('ru-RU')}{admin?` · ${row.email}`:''}</p>
      {Object.entries(row.fields).filter(([,value])=>value).map(([key,value])=><p key={key} style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}><strong>{key}: </strong>{String(value)}</p>)}
      {row.response&&<Notice title="Ответ поддержки">{row.response}</Notice>}
      {admin&&(editing===row.public_id?<><Field label="Ответ в личном кабинете" type="textarea" value={reply} onChange={setReply}/><Button disabled={busy||reply.trim().length<3} onClick={async()=>{setBusy(true);try{await api.updateRequest(row.public_id,'resolved',reply);setEditing('');await load();a.notify('Ответ сохранён.');}catch(error){setError(error instanceof Error?error.message:'Ошибка сохранения.');}finally{setBusy(false);}}}>Сохранить ответ</Button></>:<Button onClick={()=>{setEditing(row.public_id);setReply(row.response);}}>Ответить</Button>)}
    </article>):<Empty title="Обращений пока нет" text="Ваши отправленные заявки и ответы будут собраны здесь." />}
  </div>;
}
