-- Used only in an isolated PUBLIC_SANDBOX database. Never grants access by email alone.
create table sandbox_owners (
  email citext primary key,
  browser_hash text not null,
  created_at timestamptz not null default now()
);
