-- Edgefolio — user profiles
-- Run this in the Supabase SQL editor (or `supabase db push`). It creates the
-- public profile row that mirrors each auth user, keeps usernames unique, and
-- enables RLS so a user can only read/update their own profile.
--
-- The user's email is NEVER stored here; it stays in auth.users. Username-only
-- sign-in resolves the email on the server with the service-role key.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_format check (username ~ '^[a-z0-9_]{3,24}$')
);

-- Case-insensitive uniqueness for usernames.
create unique index if not exists profiles_username_lower_key
  on public.profiles (lower(username));

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No insert policy: rows are created by the trigger below (security definer).
-- No public select policy: profiles are not enumerable by anonymous visitors.

-- Keep updated_at fresh.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- Create a profile row whenever an auth user is created. Username comes from
-- raw_user_meta_data (set by sign-up). If it is missing or clashes, fall back
-- to a safe derived value so sign-up never breaks on the trigger.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  uname text;
begin
  uname := lower(coalesce(new.raw_user_meta_data ->> 'username', ''));

  if uname !~ '^[a-z0-9_]{3,24}$' then
    uname := lower(regexp_replace(split_part(coalesce(new.email, 'user'), '@', 1), '[^a-z0-9_]', '', 'g'));
    if length(uname) < 3 then
      uname := 'user';
    end if;
    uname := uname || '_' || substr(replace(new.id::text, '-', ''), 1, 4);
  end if;

  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    uname,
    nullif(new.raw_user_meta_data ->> 'display_name', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
