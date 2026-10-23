create table support_requests (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  request_key uuid not null unique,
  user_id bigint references users(id) on delete set null,
  email text not null,
  kind text not null check (kind in ('contact','resource','tool','billing','affiliate','editorial','appeal')),
  fields jsonb not null,
  status text not null default 'open' check (status in ('open','reviewing','resolved')),
  response text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index support_requests_user_idx on support_requests(user_id,created_at desc);
create trigger support_requests_updated before update on support_requests for each row execute function set_updated_at();
