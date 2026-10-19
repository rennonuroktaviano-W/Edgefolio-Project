-- Edgefolio — risk settings (user-defined risk plan)
-- Run this in the Supabase SQL editor (or `supabase db push`) once.
--
-- Each user gets a single row of risk limits that drive the risk scorecard,
-- the position-size calculator defaults, and the guardrail checks on the
-- Risk page. All values are NULLable so a user can save a partial plan.
-- RLS ensures a user only ever reads/updates their own row.

create table if not exists public.risk_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  -- Account equity in the user's base currency, used for % of account math.
  account_equity numeric check (account_equity is null or account_equity > 0),
  -- Max fraction of account equity to risk on a single trade (0–0.1 typical).
  max_risk_per_trade numeric
    check (max_risk_per_trade is null or (max_risk_per_trade > 0 and max_risk_per_trade <= 1)),
  -- Max fraction of account equity to lose in a single day.
  max_daily_loss numeric
    check (max_daily_loss is null or (max_daily_loss > 0 and max_daily_loss <= 1)),
  -- Max fraction of account equity to lose in total (drawdown stop).
  max_drawdown numeric
    check (max_drawdown is null or (max_drawdown > 0 and max_drawdown <= 1)),
  -- Minimum acceptable planned reward/risk for a new trade.
  min_reward_risk numeric
    check (min_reward_risk is null or (min_reward_risk > 0 and min_reward_risk <= 100)),
  -- Max number of trades that may be open at the same time.
  max_open_positions integer
    check (max_open_positions is null or (max_open_positions > 0 and max_open_positions <= 500)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.risk_settings enable row level security;

drop policy if exists "risk_settings_select_own" on public.risk_settings;
create policy "risk_settings_select_own"
  on public.risk_settings for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "risk_settings_upsert_own" on public.risk_settings;
create policy "risk_settings_upsert_own"
  on public.risk_settings for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "risk_settings_update_own" on public.risk_settings;
create policy "risk_settings_update_own"
  on public.risk_settings for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "risk_settings_delete_own" on public.risk_settings;
create policy "risk_settings_delete_own"
  on public.risk_settings for delete
  to authenticated
  using (auth.uid() = user_id);

drop trigger if exists risk_settings_set_updated_at on public.risk_settings;
create trigger risk_settings_set_updated_at
  before update on public.risk_settings
  for each row
  execute function public.set_updated_at();
