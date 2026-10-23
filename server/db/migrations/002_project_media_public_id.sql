alter table project_media
  add column if not exists public_id uuid not null default gen_random_uuid();

create unique index if not exists project_media_public_id_idx
  on project_media (public_id);
