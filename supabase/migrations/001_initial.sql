create extension if not exists pgcrypto;

create type public.center_role as enum ('admin', 'room_lead', 'staff', 'guardian');
create type public.incident_status as enum ('draft_review_required', 'finalized', 'guardian_notified');
create type public.pickup_attempt_status as enum ('blocked', 'verified', 'completed');

create table public.centers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  timezone text not null default 'America/Los_Angeles',
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  created_at timestamptz not null default now()
);

create table public.center_memberships (
  center_id uuid not null references public.centers(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.center_role not null,
  primary key (center_id, user_id)
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  name text not null,
  ratio_limit integer not null check (ratio_limit > 0),
  licensed_capacity integer not null check (licensed_capacity > 0),
  created_at timestamptz not null default now()
);

create table public.staff_assignments (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  room_id uuid not null references public.rooms(id) on delete cascade,
  staff_user_id uuid not null references public.profiles(id) on delete cascade,
  active_from timestamptz not null default now(),
  active_until timestamptz
);

create table public.children (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  room_id uuid not null references public.rooms(id),
  full_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.guardian_links (
  center_id uuid not null references public.centers(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  guardian_user_id uuid not null references public.profiles(id) on delete cascade,
  relationship text not null,
  primary key (child_id, guardian_user_id)
);

create table public.pickup_authorizations (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  child_id uuid not null references public.children(id) on delete cascade,
  guardian_user_id uuid not null references public.profiles(id) on delete cascade,
  is_authorized_pickup boolean not null default false,
  revoked_at timestamptz,
  updated_by uuid not null references public.profiles(id),
  updated_at timestamptz not null default now(),
  unique (child_id, guardian_user_id)
);

create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  child_id uuid not null references public.children(id),
  room_id uuid not null references public.rooms(id),
  checked_in_at timestamptz not null default now(),
  checked_out_at timestamptz,
  recorded_by uuid not null references public.profiles(id)
);

create unique index one_active_check_in_per_child on public.check_ins(child_id) where checked_out_at is null;

create table public.pickup_attempts (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  child_id uuid not null references public.children(id),
  guardian_user_id uuid references public.profiles(id),
  status public.pickup_attempt_status not null,
  reason_code text not null,
  verified_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  center_id uuid not null references public.centers(id) on delete cascade,
  child_id uuid not null references public.children(id),
  raw_observation text not null,
  drafted_report text not null,
  status public.incident_status not null default 'draft_review_required',
  drafted_by uuid not null references public.profiles(id),
  reviewed_by uuid references public.profiles(id),
  finalized_at timestamptz,
  guardian_notified_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id bigint generated always as identity primary key,
  center_id uuid not null references public.centers(id) on delete cascade,
  actor_user_id uuid references public.profiles(id),
  event_name text not null,
  entity_type text not null,
  entity_id uuid,
  reason_code text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.has_center_role(target_center uuid, allowed_roles public.center_role[])
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.center_memberships
    where center_id = target_center and user_id = auth.uid() and role = any(allowed_roles)
  );
$$;

alter table public.centers enable row level security;
alter table public.rooms enable row level security;
alter table public.staff_assignments enable row level security;
alter table public.children enable row level security;
alter table public.guardian_links enable row level security;
alter table public.pickup_authorizations enable row level security;
alter table public.check_ins enable row level security;
alter table public.pickup_attempts enable row level security;
alter table public.incidents enable row level security;
alter table public.audit_events enable row level security;

create policy center_staff_read_rooms on public.rooms for select using (
  public.has_center_role(center_id, array['admin','room_lead','staff']::public.center_role[])
);

create policy staff_read_children on public.children for select using (
  public.has_center_role(center_id, array['admin','room_lead','staff']::public.center_role[])
);

create policy guardian_read_linked_children on public.children for select using (
  exists (select 1 from public.guardian_links link where link.child_id = children.id and link.guardian_user_id = auth.uid())
);

create policy staff_manage_check_ins on public.check_ins for all using (
  public.has_center_role(center_id, array['admin','room_lead','staff']::public.center_role[])
) with check (
  public.has_center_role(center_id, array['admin','room_lead','staff']::public.center_role[])
);

create policy guardian_read_own_check_ins on public.check_ins for select using (
  exists (select 1 from public.guardian_links link where link.child_id = check_ins.child_id and link.guardian_user_id = auth.uid())
);

create policy staff_read_pickup_authorizations on public.pickup_authorizations for select using (
  public.has_center_role(center_id, array['admin','room_lead','staff']::public.center_role[])
);

create policy admin_manage_pickup_authorizations on public.pickup_authorizations for all using (
  public.has_center_role(center_id, array['admin']::public.center_role[])
) with check (
  public.has_center_role(center_id, array['admin']::public.center_role[])
);

create policy staff_manage_pickup_attempts on public.pickup_attempts for all using (
  public.has_center_role(center_id, array['admin','room_lead','staff']::public.center_role[])
) with check (
  public.has_center_role(center_id, array['admin','room_lead','staff']::public.center_role[])
);

create policy staff_manage_incidents on public.incidents for all using (
  public.has_center_role(center_id, array['admin','room_lead','staff']::public.center_role[])
) with check (
  public.has_center_role(center_id, array['admin','room_lead','staff']::public.center_role[])
);

create policy guardian_read_finalized_incidents on public.incidents for select using (
  status in ('finalized','guardian_notified') and exists (
    select 1 from public.guardian_links link where link.child_id = incidents.child_id and link.guardian_user_id = auth.uid()
  )
);

create policy admins_read_audit_events on public.audit_events for select using (
  public.has_center_role(center_id, array['admin']::public.center_role[])
);
