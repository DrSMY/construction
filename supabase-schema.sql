-- ============================================================
-- Site Punch List — Supabase schema (multi-project, roles, RLS)
-- Run ONCE in your project: SQL Editor → paste → Run.
-- Roles per project: owner / consultant / contractor.
-- Super Admin = whoever signs up with the email below.
-- ============================================================

-- >>> CHANGE THIS to your super-admin email if different <<<
create or replace function public.super_email() returns text
  language sql immutable as $$ select 'drsamimoha2018@gmail.com'::text $$;

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  is_super_admin boolean not null default false,
  created_at timestamptz default now()
);

-- ---------- projects ----------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null default 'Project',
  doc_title text, doc_description text, villa text, location text,
  client text, prepared_by text, report_date date, ref text,
  photos jsonb default '[]'::jsonb,
  created_by uuid default auth.uid(),
  created_at timestamptz default now()
);

-- ---------- memberships ----------
create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  email text,
  role text not null check (role in ('owner','consultant','contractor')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz default now(),
  unique(project_id, user_id)
);

-- ---------- items ----------
create table if not exists public.items (
  id text primary key,
  project_id uuid references public.projects(id) on delete cascade,
  room text, description text, type text, status text, priority text,
  contact text, expected_date date,
  before_photos jsonb default '[]'::jsonb,
  after_photos jsonb default '[]'::jsonb,
  history jsonb default '[]'::jsonb,
  created_by uuid default auth.uid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- Helpers
-- ============================================================
create or replace function public.is_super() returns boolean
  language sql stable security definer set search_path=public as $$
  select coalesce((select is_super_admin from public.profiles where id = auth.uid()), false) $$;

create or replace function public.my_role_in(p uuid) returns text
  language sql stable security definer set search_path=public as $$
  select case when public.is_super() then 'owner'
    else (select role from public.memberships where project_id = p and user_id = auth.uid() and status='approved') end $$;

create or replace function public.can_edit_items(p uuid) returns boolean
  language sql stable security definer set search_path=public as $$
  select public.is_super() or public.my_role_in(p) in ('owner','consultant') $$;

-- ============================================================
-- New-user trigger: profile + (project create OR join request)
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
declare meta jsonb; rrole text; pname text; pcode text; pid uuid; sup boolean;
begin
  meta := new.raw_user_meta_data;
  sup  := lower(new.email) = lower(public.super_email());
  insert into public.profiles(id,email,is_super_admin) values (new.id, new.email, sup);
  if sup then return new; end if;

  rrole := coalesce(meta->>'requested_role','contractor');
  pname := coalesce(meta->>'project_name','My Project');
  pcode := upper(coalesce(meta->>'project_code',''));

  if rrole = 'owner' then
    insert into public.projects(code,name,created_by)
      values (upper(substr(md5(random()::text),1,6)), pname, new.id) returning id into pid;
    insert into public.memberships(project_id,user_id,email,role,status)
      values (pid, new.id, new.email, 'owner','approved');
  else
    select id into pid from public.projects where code = pcode;
    if pid is not null then
      insert into public.memberships(project_id,user_id,email,role,status)
        values (pid, new.id, new.email, case when rrole='consultant' then 'consultant' else 'contractor' end, 'pending');
    end if;
  end if;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ============================================================
-- RLS
-- ============================================================
alter table public.profiles    enable row level security;
alter table public.projects    enable row level security;
alter table public.memberships enable row level security;
alter table public.items       enable row level security;

drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated using (true);

drop policy if exists projects_read on public.projects;
create policy projects_read on public.projects for select to authenticated using (
  public.is_super() or exists(select 1 from public.memberships m where m.project_id=projects.id and m.user_id=auth.uid() and m.status='approved'));
drop policy if exists projects_write on public.projects;
create policy projects_write on public.projects for all to authenticated using (
  public.is_super() or public.my_role_in(projects.id)='owner'
) with check (public.is_super() or public.my_role_in(projects.id)='owner');

drop policy if exists memberships_read on public.memberships;
create policy memberships_read on public.memberships for select to authenticated using (
  public.is_super() or user_id=auth.uid() or public.my_role_in(project_id)='owner');
-- writes happen through SECURITY DEFINER functions below

drop policy if exists items_read on public.items;
create policy items_read on public.items for select to authenticated using (
  public.is_super() or exists(select 1 from public.memberships m where m.project_id=items.project_id and m.user_id=auth.uid() and m.status='approved'));
drop policy if exists items_write on public.items;
create policy items_write on public.items for all to authenticated using (
  public.can_edit_items(items.project_id)) with check (public.can_edit_items(items.project_id));

-- ============================================================
-- RPCs used by the app
-- ============================================================
create or replace function public.my_projects() returns setof public.projects
  language sql stable security definer set search_path=public as $$
  select * from public.projects p where public.is_super()
    or exists(select 1 from public.memberships m where m.project_id=p.id and m.user_id=auth.uid() and m.status='approved')
  order by created_at $$;

create or replace function public.create_project(p_name text) returns public.projects
  language plpgsql security definer set search_path=public as $$
  declare pr public.projects;
  begin
    insert into public.projects(code,name,created_by)
      values (upper(substr(md5(random()::text),1,6)), coalesce(p_name,'New Project'), auth.uid()) returning * into pr;
    insert into public.memberships(project_id,user_id,email,role,status)
      values (pr.id, auth.uid(), (select email from public.profiles where id=auth.uid()), 'owner','approved');
    return pr;
  end; $$;

create or replace function public.pending_memberships()
  returns table(id uuid, email text, role text, status text, project_id uuid, "projectName" text)
  language sql stable security definer set search_path=public as $$
  select m.id, m.email, m.role, m.status, m.project_id, p.name
  from public.memberships m join public.projects p on p.id=m.project_id
  where m.status='pending' and (public.is_super() or public.my_role_in(m.project_id)='owner') $$;

create or replace function public.set_membership_status(p_id uuid, p_status text) returns void
  language plpgsql security definer set search_path=public as $$
  declare proj uuid;
  begin
    select project_id into proj from public.memberships where id=p_id;
    if proj is null then raise exception 'Not found'; end if;
    if not (public.is_super() or public.my_role_in(proj)='owner') then raise exception 'Not allowed'; end if;
    update public.memberships set status=p_status where id=p_id;
  end; $$;

-- owner/super: change a member's role (governs what they can edit)
create or replace function public.set_membership_role(p_id uuid, p_role text) returns void
  language plpgsql security definer set search_path=public as $$
  declare proj uuid;
  begin
    if p_role not in ('owner','consultant','contractor') then raise exception 'Invalid role'; end if;
    select project_id into proj from public.memberships where id=p_id;
    if proj is null then raise exception 'Not found'; end if;
    if not (public.is_super() or public.my_role_in(proj)='owner') then raise exception 'Not allowed'; end if;
    update public.memberships set role=p_role where id=p_id;
  end; $$;

create or replace function public.admin_projects()
  returns table(id uuid, code text, name text, "memberCount" bigint, "itemCount" bigint)
  language sql stable security definer set search_path=public as $$
  select p.id, p.code, p.name,
    (select count(*) from public.memberships m where m.project_id=p.id and m.status='approved'),
    (select count(*) from public.items it where it.project_id=p.id)
  from public.projects p where public.is_super() order by p.created_at $$;

-- contractor (or any approved member) limited update: comment / ETA / after-photos
create or replace function public.contractor_update(p_item text, p_comment text default null, p_expected_date date default null, p_after_photos jsonb default null)
  returns public.items language plpgsql security definer set search_path=public as $$
  declare proj uuid; r text; result public.items; note jsonb;
  begin
    select project_id into proj from public.items where id=p_item;
    if proj is null then raise exception 'Item not found'; end if;
    r := public.my_role_in(proj);
    if r is null then raise exception 'Not a member of this project'; end if;
    if p_comment is not null and length(trim(p_comment))>0 then
      note := jsonb_build_object('date',(extract(epoch from now())*1000)::bigint,'text',p_comment,
        'by',(select email from public.profiles where id=auth.uid()),'role',r);
      update public.items set history = note || coalesce(history,'[]'::jsonb) where id=p_item;
    end if;
    if p_expected_date is not null then update public.items set expected_date=p_expected_date where id=p_item; end if;
    if p_after_photos is not null then update public.items set after_photos=p_after_photos where id=p_item; end if;
    update public.items set updated_at=now() where id=p_item returning * into result;
    return result;
  end; $$;

grant execute on function public.my_projects, public.create_project(text), public.pending_memberships,
  public.set_membership_status(uuid,text), public.set_membership_role(uuid,text), public.admin_projects,
  public.contractor_update(text,text,date,jsonb) to authenticated;

-- ============================================================
-- Table privileges (Row-Level Security still controls WHICH rows).
-- Needed so signed-in users can read/write at all.
-- ============================================================
grant usage on schema public to anon, authenticated;
grant all on public.profiles, public.projects, public.memberships, public.items to authenticated;
grant all on all sequences in schema public to authenticated;
