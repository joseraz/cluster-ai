-- Cluster AI - Supabase/Postgres schema
-- Apply this in Supabase Dashboard -> SQL Editor -> New query.
--
-- This mirrors the current SQLite/Drizzle app schema, but uses Postgres-native
-- UUID, JSONB, boolean, timestamptz, foreign keys, indexes, and RLS policies.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- User/account tables
-- ---------------------------------------------------------------------------

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'standard_user'
    check (role in ('super_admin', 'standard_user')),
  username text unique,
  display_name text,
  bio text,
  first_name text,
  last_name text,
  location text,
  contact_voice_input_enabled boolean not null default true,
  mr_fox_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.impersonation_sessions (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references public.user_profiles(id) on delete cascade,
  target_user_id uuid not null references public.user_profiles(id) on delete cascade,
  reason text not null,
  status text not null default 'active'
    check (status in ('active', 'ended')),
  started_at timestamptz not null default now(),
  ended_at timestamptz
);

create index if not exists impersonation_sessions_actor_idx
  on public.impersonation_sessions(actor_user_id);

create index if not exists impersonation_sessions_target_idx
  on public.impersonation_sessions(target_user_id);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references public.user_profiles(id) on delete cascade,
  target_user_id uuid references public.user_profiles(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_events_actor_idx
  on public.audit_events(actor_user_id);

create index if not exists audit_events_target_idx
  on public.audit_events(target_user_id);

create index if not exists audit_events_action_idx
  on public.audit_events(action);

-- ---------------------------------------------------------------------------
-- Contact graph tables
-- ---------------------------------------------------------------------------

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  lives_in text,
  company text,
  social_links jsonb not null default '[]'::jsonb,

  connection_type text,
  connection_strength integer check (
    connection_strength is null
    or connection_strength between 1 and 5
  ),
  how_we_met text,

  interests jsonb,
  career_and_work jsonb,
  education jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contacts_user_id_idx
  on public.contacts(user_id);

create table if not exists public.relationship_stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  body text not null,
  summary text,
  summary_status text,
  occurred_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists relationship_stories_user_contact_idx
  on public.relationship_stories(user_id, contact_id);

create table if not exists public.relationships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_id uuid not null,
  source_type text not null default 'contact',
  target_id uuid not null,
  target_type text not null default 'contact',
  relationship_type text,
  connection_strength integer check (
    connection_strength is null
    or connection_strength between 1 and 5
  ),
  how_we_met text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, target_id, relationship_type)
);

create index if not exists relationships_user_id_idx
  on public.relationships(user_id);

create index if not exists relationships_source_idx
  on public.relationships(source_id);

create index if not exists relationships_target_idx
  on public.relationships(target_id);

create table if not exists public.node_positions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  angle double precision not null,
  ring integer check (ring is null or ring between 0 and 4),
  updated_at timestamptz not null default now(),
  unique (contact_id),
  unique (user_id, contact_id)
);

create index if not exists node_positions_user_id_idx
  on public.node_positions(user_id);

create index if not exists node_positions_contact_idx
  on public.node_positions(contact_id);

create table if not exists public.clusters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create index if not exists clusters_user_id_idx
  on public.clusters(user_id);

create table if not exists public.cluster_members (
  cluster_id uuid not null references public.clusters(id) on delete cascade,
  contact_id uuid not null references public.contacts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (cluster_id, contact_id)
);

create index if not exists cluster_members_user_id_idx
  on public.cluster_members(user_id);

create index if not exists cluster_members_contact_idx
  on public.cluster_members(contact_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

drop trigger if exists user_profiles_updated_at on public.user_profiles;
create trigger user_profiles_updated_at
  before update on public.user_profiles
  for each row execute function public.set_updated_at();

drop trigger if exists contacts_updated_at on public.contacts;
create trigger contacts_updated_at
  before update on public.contacts
  for each row execute function public.set_updated_at();

drop trigger if exists relationship_stories_updated_at on public.relationship_stories;
create trigger relationship_stories_updated_at
  before update on public.relationship_stories
  for each row execute function public.set_updated_at();

drop trigger if exists relationships_updated_at on public.relationships;
create trigger relationships_updated_at
  before update on public.relationships
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.user_profiles enable row level security;
alter table public.impersonation_sessions enable row level security;
alter table public.audit_events enable row level security;
alter table public.contacts enable row level security;
alter table public.relationship_stories enable row level security;
alter table public.relationships enable row level security;
alter table public.node_positions enable row level security;
alter table public.clusters enable row level security;
alter table public.cluster_members enable row level security;

drop policy if exists "Users can read own profile" on public.user_profiles;
create policy "Users can read own profile"
  on public.user_profiles
  for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "Users can insert own profile" on public.user_profiles;
create policy "Users can insert own profile"
  on public.user_profiles
  for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "Users can update own profile" on public.user_profiles;
create policy "Users can update own profile"
  on public.user_profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "Users can manage own contacts" on public.contacts;
create policy "Users can manage own contacts"
  on public.contacts
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can manage own relationship stories" on public.relationship_stories;
create policy "Users can manage own relationship stories"
  on public.relationship_stories
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can manage own relationships" on public.relationships;
create policy "Users can manage own relationships"
  on public.relationships
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can manage own node positions" on public.node_positions;
create policy "Users can manage own node positions"
  on public.node_positions
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can manage own clusters" on public.clusters;
create policy "Users can manage own clusters"
  on public.clusters
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can manage own cluster members" on public.cluster_members;
create policy "Users can manage own cluster members"
  on public.cluster_members
  for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "Users can read own impersonation sessions" on public.impersonation_sessions;
create policy "Users can read own impersonation sessions"
  on public.impersonation_sessions
  for select
  to authenticated
  using (actor_user_id = auth.uid() or target_user_id = auth.uid());

drop policy if exists "Users can read own audit events" on public.audit_events;
create policy "Users can read own audit events"
  on public.audit_events
  for select
  to authenticated
  using (actor_user_id = auth.uid() or target_user_id = auth.uid());
