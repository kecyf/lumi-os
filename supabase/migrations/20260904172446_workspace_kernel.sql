-- Lumi OS v0 — metadata tables + JSONB records.
-- Applied by `supabase db push` against the linked project.

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
create index if not exists records_object_id_idx on records (object_id);

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

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists records_set_updated_at on records;
create trigger records_set_updated_at
before update on records
for each row
execute function public.set_updated_at();

alter table workspaces enable row level security;
alter table objects enable row level security;
alter table properties enable row level security;
alter table records enable row level security;
alter table views enable row level security;

-- No policies: anon/authenticated cannot read or write through the Data API.
-- Next.js uses the secret key on the server (bypasses RLS).

revoke all on table workspaces from anon, authenticated;
revoke all on table objects from anon, authenticated;
revoke all on table properties from anon, authenticated;
revoke all on table records from anon, authenticated;
revoke all on table views from anon, authenticated;

grant all on table workspaces to service_role;
grant all on table objects to service_role;
grant all on table properties to service_role;
grant all on table records to service_role;
grant all on table views to service_role;
