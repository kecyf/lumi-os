-- Human-readable contract for the Lumi OS kernel.
-- The applied migration is supabase/migrations/20260904172446_workspace_kernel.sql.

create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists objects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  slug text not null,
  name text not null,
  primary_property text not null default 'name',
  created_at timestamptz not null default now(),
  unique (workspace_id, slug)
);

create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  object_id uuid not null references objects (id) on delete cascade,
  slug text not null,
  name text not null,
  type text not null,
  options jsonb not null default '[]'::jsonb,
  relation_object_id uuid references objects (id) on delete set null,
  position int not null default 0,
  unique (object_id, slug)
);

create table if not exists records (
  id uuid primary key default gen_random_uuid(),
  object_id uuid not null references objects (id) on delete cascade,
  values jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create index if not exists records_values_gin on records using gin (values);

create table if not exists views (
  id uuid primary key default gen_random_uuid(),
  object_id uuid not null references objects (id) on delete cascade,
  name text not null,
  kind text not null default 'grid',
  filters jsonb not null default '{}'::jsonb,
  visibility text not null default 'personal',
  owner_email text,
  icon text,
  icon_color text,
  position int not null default 0,
  created_at timestamptz not null default now()
);
