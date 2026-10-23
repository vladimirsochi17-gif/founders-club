-- Isolated backend-only schema. No browser/Data API access.
create schema founders_sandbox;
create extension if not exists citext with schema extensions;
set local search_path = founders_sandbox, extensions, pg_catalog;
create table schema_migrations (name text primary key, applied_at timestamptz not null default now());


create table users (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  email citext not null,
  email_verified_at timestamptz,
  name text not null default 'Автор проекта',
  handle citext,
  bio text not null default '',
  role text not null default 'user' check (role in ('user', 'moderator', 'admin', 'superadmin')),
  onboarding_goal text,
  ui_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint users_email_not_blank check (length(trim(email::text)) between 3 and 320),
  constraint users_handle_format check (handle is null or handle::text ~ '^[a-z0-9_]{3,30}$')
);

create unique index users_active_email_uidx on users (email) where deleted_at is null;
create unique index users_active_handle_uidx on users (handle) where handle is not null and deleted_at is null;

create table sessions (
  id bigint generated always as identity primary key,
  user_id bigint not null references users(id) on delete cascade,
  token_hash text not null unique,
  user_agent text,
  ip_hash text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  last_seen_at timestamptz not null default now()
);
create index sessions_user_id_idx on sessions (user_id);
create index sessions_active_idx on sessions (token_hash, expires_at) where revoked_at is null;

create table verification_codes (
  id bigint generated always as identity primary key,
  email citext not null,
  code_hash text not null,
  purpose text not null check (purpose in ('login', 'signup', 'recover', 'reauth')),
  name text,
  attempts smallint not null default 0 check (attempts between 0 and 10),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  consumed_at timestamptz
);
create index verification_codes_lookup_idx on verification_codes (email, purpose, created_at desc) where consumed_at is null;

create table subscriptions (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  user_id bigint not null references users(id) on delete cascade,
  plan text not null check (plan in ('founder', 'plus')),
  status text not null check (status in ('pending', 'active', 'past_due', 'cancelled', 'expired')),
  provider text not null default 'mock',
  provider_customer_id text,
  provider_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  terms_version text not null,
  recurring_consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index subscriptions_user_status_idx on subscriptions (user_id, status, current_period_end desc);
create unique index subscriptions_one_live_uidx on subscriptions (user_id) where status in ('pending', 'active', 'past_due', 'cancelled');

create table payments (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  user_id bigint not null references users(id) on delete restrict,
  subscription_id bigint references subscriptions(id) on delete set null,
  kind text not null check (kind in ('subscription', 'promotion', 'refund')),
  status text not null check (status in ('pending', 'succeeded', 'failed', 'refunded', 'partially_refunded')),
  amount numeric(12,2) not null check (amount >= 0),
  currency char(3) not null default 'RUB',
  provider text not null default 'mock',
  provider_payment_id text,
  idempotency_key text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);
create index payments_user_created_idx on payments (user_id, created_at desc);
create index payments_subscription_id_idx on payments (subscription_id);
create index payments_pending_idx on payments (created_at) where status = 'pending';

create table projects (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  owner_id bigint not null references users(id) on delete restrict,
  slug citext not null,
  name text not null,
  short_description text not null default '',
  description text not null default '',
  category text not null default 'Другое',
  stage text not null default 'Идея',
  website_url text,
  ownership_proof text,
  status text not null default 'draft' check (status in ('draft', 'pending', 'revisions', 'published', 'rejected', 'archived')),
  is_demo boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint projects_slug_format check (slug::text ~ '^[a-z0-9-]{3,64}$'),
  constraint projects_name_length check (length(trim(name)) between 1 and 120)
);
create unique index projects_active_slug_uidx on projects (slug) where deleted_at is null;
create index projects_owner_status_idx on projects (owner_id, status, updated_at desc) where deleted_at is null;
create index projects_public_feed_idx on projects (published_at desc) where status = 'published' and deleted_at is null;

create table project_members (
  project_id bigint not null references projects(id) on delete cascade,
  user_id bigint not null references users(id) on delete cascade,
  role text not null check (role in ('owner', 'editor', 'analyst', 'promotion_manager')),
  invited_email citext,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);
create index project_members_user_id_idx on project_members (user_id);

create table project_media (
  id bigint generated always as identity primary key,
  project_id bigint not null references projects(id) on delete cascade,
  kind text not null check (kind in ('cover', 'gallery', 'logo')),
  storage_key text not null,
  mime_type text not null check (mime_type in ('image/png', 'image/jpeg', 'image/webp', 'image/svg+xml')),
  width integer,
  height integer,
  sort_order integer not null default 0,
  alt_text text not null default '',
  created_at timestamptz not null default now()
);
create index project_media_project_id_idx on project_media (project_id, sort_order);

create table moderation_cases (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  project_id bigint not null references projects(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'claimed', 'approved', 'revisions', 'rejected', 'appealed')),
  claimed_by bigint references users(id) on delete set null,
  claimed_at timestamptz,
  decided_by bigint references users(id) on delete set null,
  decision_reason text,
  decided_at timestamptz,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index moderation_cases_project_id_idx on moderation_cases (project_id);
create index moderation_cases_claimed_by_idx on moderation_cases (claimed_by);
create index moderation_cases_decided_by_idx on moderation_cases (decided_by);
create index moderation_cases_queue_idx on moderation_cases (created_at) where status = 'pending';
create unique index moderation_cases_open_project_uidx on moderation_cases (project_id) where status in ('pending', 'claimed', 'appealed');

create table votes (
  project_id bigint not null references projects(id) on delete cascade,
  user_id bigint not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);
create index votes_user_id_idx on votes (user_id);

create table reviews (
  id bigint generated always as identity primary key,
  project_id bigint not null references projects(id) on delete cascade,
  user_id bigint not null references users(id) on delete cascade,
  body text not null check (length(trim(body)) between 10 and 4000),
  status text not null default 'visible' check (status in ('visible', 'hidden', 'pending')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, user_id)
);
create index reviews_project_created_idx on reviews (project_id, created_at desc) where status = 'visible';
create index reviews_user_id_idx on reviews (user_id);

create table resources (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  slug citext not null unique,
  name text not null,
  resource_type text not null,
  stack text not null default '',
  description text not null default '',
  access_plan text not null default 'founder' check (access_plan in ('public', 'founder', 'plus')),
  license_version text not null,
  version text not null,
  storage_key text,
  is_active boolean not null default true,
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table resource_downloads (
  id bigint generated always as identity primary key,
  user_id bigint not null references users(id) on delete restrict,
  resource_id bigint not null references resources(id) on delete restrict,
  resource_version text not null,
  license_version text not null,
  granted_at timestamptz not null default now(),
  last_downloaded_at timestamptz not null default now(),
  download_count integer not null default 1 check (download_count > 0),
  unique (user_id, resource_id, resource_version)
);
create index resource_downloads_user_created_idx on resource_downloads (user_id, granted_at desc);
create index resource_downloads_resource_id_idx on resource_downloads (resource_id);

create table reports (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  reporter_id bigint not null references users(id) on delete restrict,
  project_id bigint references projects(id) on delete set null,
  reason text not null,
  details text not null check (length(trim(details)) between 10 and 4000),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  assigned_to bigint references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index reports_status_created_idx on reports (status, created_at);
create index reports_reporter_id_idx on reports (reporter_id);
create index reports_project_id_idx on reports (project_id);
create index reports_assigned_to_idx on reports (assigned_to);

create table promotion_orders (
  id bigint generated always as identity primary key,
  public_id uuid not null default gen_random_uuid() unique,
  user_id bigint not null references users(id) on delete restrict,
  project_id bigint not null references projects(id) on delete restrict,
  payment_id bigint references payments(id) on delete set null,
  placement text not null check (placement in ('highlight', 'boost', 'featured_day', 'featured_week')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  amount numeric(12,2) not null check (amount >= 0),
  status text not null default 'reserved' check (status in ('reserved', 'pending_payment', 'moderation', 'active', 'rejected', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint promotion_time_order check (ends_at > starts_at)
);
create index promotion_orders_user_id_idx on promotion_orders (user_id, created_at desc);
create index promotion_orders_project_id_idx on promotion_orders (project_id);
create index promotion_orders_payment_id_idx on promotion_orders (payment_id);
create unique index promotion_slot_uidx on promotion_orders (placement, starts_at) where status in ('reserved', 'pending_payment', 'moderation', 'active');

create table telegram_invites (
  id bigint generated always as identity primary key,
  user_id bigint not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create index telegram_invites_user_id_idx on telegram_invites (user_id, created_at desc);

create table audit_events (
  id bigint generated always as identity primary key,
  actor_user_id bigint references users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_events_entity_idx on audit_events (entity_type, entity_id, created_at desc);
create index audit_events_actor_id_idx on audit_events (actor_user_id, created_at desc);

create table app_events (
  id bigint generated always as identity primary key,
  user_id bigint references users(id) on delete set null,
  project_id bigint references projects(id) on delete set null,
  event_type text not null check (event_type in ('impression', 'view', 'outbound_click', 'search', 'download')),
  source text,
  happened_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);
create index app_events_project_type_time_idx on app_events (project_id, event_type, happened_at desc);
create index app_events_user_id_idx on app_events (user_id, happened_at desc);

create or replace function set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at before update on users for each row execute function set_updated_at();
create trigger subscriptions_set_updated_at before update on subscriptions for each row execute function set_updated_at();
create trigger payments_set_updated_at before update on payments for each row execute function set_updated_at();
create trigger projects_set_updated_at before update on projects for each row execute function set_updated_at();
create trigger moderation_cases_set_updated_at before update on moderation_cases for each row execute function set_updated_at();
create trigger reviews_set_updated_at before update on reviews for each row execute function set_updated_at();
create trigger resources_set_updated_at before update on resources for each row execute function set_updated_at();
create trigger reports_set_updated_at before update on reports for each row execute function set_updated_at();
create trigger promotion_orders_set_updated_at before update on promotion_orders for each row execute function set_updated_at();


insert into schema_migrations (name) values ('001_initial.sql');
alter table project_media
  add column if not exists public_id uuid not null default gen_random_uuid();

create unique index if not exists project_media_public_id_idx
  on project_media (public_id);


insert into schema_migrations (name) values ('002_project_media_public_id.sql');
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


insert into schema_migrations (name) values ('003_support_requests.sql');
-- Used only in an isolated PUBLIC_SANDBOX database. Never grants access by email alone.
create table sandbox_owners (
  email citext primary key,
  browser_hash text not null,
  created_at timestamptz not null default now()
);


insert into schema_migrations (name) values ('004_sandbox_owners.sql');

alter function set_updated_at() set search_path = pg_catalog;
do $$
declare item record;
begin
  for item in select tablename from pg_tables where schemaname = 'founders_sandbox'
  loop execute format('alter table founders_sandbox.%I enable row level security', item.tablename); end loop;
end;
$$;
revoke all on schema founders_sandbox from public, anon, authenticated, service_role;
revoke all on all tables in schema founders_sandbox from public, anon, authenticated, service_role;
revoke all on all sequences in schema founders_sandbox from public, anon, authenticated, service_role;
revoke all on all functions in schema founders_sandbox from public, anon, authenticated, service_role;
alter default privileges in schema founders_sandbox revoke all on tables from public, anon, authenticated, service_role;
alter default privileges in schema founders_sandbox revoke all on sequences from public, anon, authenticated, service_role;
alter default privileges in schema founders_sandbox revoke execute on functions from public;
