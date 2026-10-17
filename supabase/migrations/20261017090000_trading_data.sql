-- Edgefolio — trading data schema
-- Run this in the Supabase SQL editor (or `supabase db push`) once.
--
-- Creates the tables behind Trades, Journal, Explore, Community, Leaderboard,
-- and Saved Recaps, plus row-level security so a user can only ever read or
-- write their own rows. Public recap content is only readable when the author
-- explicitly sets visibility = 'public'.
--
-- Usernames live in auth.users.user_metadata; public recap rows keep a
-- denormalised copy of the author's username/display name so the public feed
-- never has to read auth.users (and never exposes emails).

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Trades
-- ---------------------------------------------------------------------------

create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  symbol text not null,
  direction text not null check (direction in ('long', 'short')),
  status text not null default 'closed' check (status in ('open', 'closed')),
  entry_price numeric not null check (entry_price >= 0),
  exit_price numeric check (exit_price is null or exit_price >= 0),
  quantity numeric not null check (quantity > 0),
  stop_loss numeric check (stop_loss is null or stop_loss >= 0),
  take_profit numeric check (take_profit is null or take_profit >= 0),
  fees numeric not null default 0 check (fees >= 0),
  strategy text,
  notes text,
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- A closed trade must carry an exit price; an open trade must not.
  constraint trades_closed_needs_exit check (
    (status = 'closed' and exit_price is not null)
    or (status = 'open' and exit_price is null)
  )
);

create index if not exists trades_user_opened_idx
  on public.trades (user_id, opened_at desc);
create index if not exists trades_user_status_idx
  on public.trades (user_id, status);
create index if not exists trades_user_strategy_idx
  on public.trades (user_id, strategy);

alter table public.trades enable row level security;

drop policy if exists "trades_select_own" on public.trades;
create policy "trades_select_own"
  on public.trades for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "trades_insert_own" on public.trades;
create policy "trades_insert_own"
  on public.trades for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "trades_update_own" on public.trades;
create policy "trades_update_own"
  on public.trades for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "trades_delete_own" on public.trades;
create policy "trades_delete_own"
  on public.trades for delete
  to authenticated
  using (auth.uid() = user_id);

drop trigger if exists trades_set_updated_at on public.trades;
create trigger trades_set_updated_at
  before update on public.trades
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Journal entries
-- ---------------------------------------------------------------------------

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  symbol text,
  strategy text,
  thesis text,
  psychology text,
  review text,
  mood text,
  trade_id uuid references public.trades (id) on delete set null,
  visibility text not null default 'private'
    check (visibility in ('private', 'public')),
  entry_date date not null default current_date,
  -- Optional, author-reported trade details that make a shared recap
  -- self-contained. The linked trade (trade_id) stays private; these are the
  -- curated numbers the author chooses to publish for a recap.
  direction text check (direction is null or direction in ('long', 'short')),
  entry_price numeric check (entry_price is null or entry_price >= 0),
  exit_price numeric check (exit_price is null or exit_price >= 0),
  result_r numeric,
  outcome text check (outcome is null or outcome in ('win', 'loss', 'breakeven')),
  -- Denormalised author identity so the public feed never reads auth.users.
  author_username text,
  author_display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists journal_entries_user_date_idx
  on public.journal_entries (user_id, entry_date desc, created_at desc);
create index if not exists journal_entries_public_idx
  on public.journal_entries (created_at desc)
  where visibility = 'public';
create index if not exists journal_entries_author_idx
  on public.journal_entries (author_username)
  where visibility = 'public';

alter table public.journal_entries enable row level security;

-- Owner sees everything; everyone signed in sees public entries.
drop policy if exists "journal_entries_select_visible" on public.journal_entries;
create policy "journal_entries_select_visible"
  on public.journal_entries for select
  to authenticated
  using (auth.uid() = user_id or visibility = 'public');

drop policy if exists "journal_entries_insert_own" on public.journal_entries;
create policy "journal_entries_insert_own"
  on public.journal_entries for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "journal_entries_update_own" on public.journal_entries;
create policy "journal_entries_update_own"
  on public.journal_entries for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "journal_entries_delete_own" on public.journal_entries;
create policy "journal_entries_delete_own"
  on public.journal_entries for delete
  to authenticated
  using (auth.uid() = user_id);

drop trigger if exists journal_entries_set_updated_at on public.journal_entries;
create trigger journal_entries_set_updated_at
  before update on public.journal_entries
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Journal attachments (chart screenshots)
-- ---------------------------------------------------------------------------

create table if not exists public.journal_attachments (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.journal_entries (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists journal_attachments_entry_idx
  on public.journal_attachments (entry_id);

alter table public.journal_attachments enable row level security;

-- Readable when the attachment is yours or its parent entry is public.
drop policy if exists "journal_attachments_select" on public.journal_attachments;
create policy "journal_attachments_select"
  on public.journal_attachments for select
  to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.journal_entries e
      where e.id = entry_id and e.visibility = 'public'
    )
  );

drop policy if exists "journal_attachments_insert_own" on public.journal_attachments;
create policy "journal_attachments_insert_own"
  on public.journal_attachments for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.journal_entries e
      where e.id = entry_id and e.user_id = auth.uid()
    )
  );

drop policy if exists "journal_attachments_delete_own" on public.journal_attachments;
create policy "journal_attachments_delete_own"
  on public.journal_attachments for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Recap engagement: likes, saves, comments
-- ---------------------------------------------------------------------------

create table if not exists public.recap_likes (
  entry_id uuid not null references public.journal_entries (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (entry_id, user_id)
);

create table if not exists public.recap_saves (
  entry_id uuid not null references public.journal_entries (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (entry_id, user_id)
);

create table if not exists public.recap_comments (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.journal_entries (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  author_username text,
  author_display_name text,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists recap_comments_entry_idx
  on public.recap_comments (entry_id, created_at);
create index if not exists recap_likes_entry_idx on public.recap_likes (entry_id);
create index if not exists recap_saves_user_idx on public.recap_saves (user_id, created_at desc);

alter table public.recap_likes enable row level security;
alter table public.recap_saves enable row level security;
alter table public.recap_comments enable row level security;

-- Likes: readable for public entries or your own; you manage only your own.
drop policy if exists "recap_likes_select" on public.recap_likes;
create policy "recap_likes_select"
  on public.recap_likes for select
  to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.journal_entries e
      where e.id = entry_id and e.visibility = 'public'
    )
  );

drop policy if exists "recap_likes_insert_own" on public.recap_likes;
create policy "recap_likes_insert_own"
  on public.recap_likes for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "recap_likes_delete_own" on public.recap_likes;
create policy "recap_likes_delete_own"
  on public.recap_likes for delete
  to authenticated
  using (auth.uid() = user_id);

-- Saves: always private to the user who saved.
drop policy if exists "recap_saves_select_own" on public.recap_saves;
create policy "recap_saves_select_own"
  on public.recap_saves for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "recap_saves_insert_own" on public.recap_saves;
create policy "recap_saves_insert_own"
  on public.recap_saves for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.journal_entries e
      where e.id = entry_id and e.visibility = 'public'
    )
  );

drop policy if exists "recap_saves_delete_own" on public.recap_saves;
create policy "recap_saves_delete_own"
  on public.recap_saves for delete
  to authenticated
  using (auth.uid() = user_id);

-- Comments: readable for public entries or your own; write/delete your own.
drop policy if exists "recap_comments_select" on public.recap_comments;
create policy "recap_comments_select"
  on public.recap_comments for select
  to authenticated
  using (
    auth.uid() = user_id
    or exists (
      select 1 from public.journal_entries e
      where e.id = entry_id and e.visibility = 'public'
    )
  );

drop policy if exists "recap_comments_insert_own" on public.recap_comments;
create policy "recap_comments_insert_own"
  on public.recap_comments for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.journal_entries e
      where e.id = entry_id and e.visibility = 'public'
    )
  );

drop policy if exists "recap_comments_delete_own" on public.recap_comments;
create policy "recap_comments_delete_own"
  on public.recap_comments for delete
  to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Storage: private bucket for journal chart screenshots
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('journal-attachments', 'journal-attachments', false)
on conflict (id) do nothing;

-- Objects live under a folder named after the owner's user id. Public recap
-- images are delivered to other users through short-lived signed URLs the
-- server generates, so we never make the bucket (or private entries) public.
drop policy if exists "journal_attachments_storage_insert" on storage.objects;
create policy "journal_attachments_storage_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'journal-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "journal_attachments_storage_select" on storage.objects;
create policy "journal_attachments_storage_select"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'journal-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "journal_attachments_storage_update" on storage.objects;
create policy "journal_attachments_storage_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'journal-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "journal_attachments_storage_delete" on storage.objects;
create policy "journal_attachments_storage_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'journal-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
