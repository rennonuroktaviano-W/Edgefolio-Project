-- ---------------------------------------------------------------------------
-- Make trades outcome-based journal entries.
--
--   * No entry/exit prices, stop loss, or take profit. The result of a
--     trade is recorded as a win/lose outcome with a planned reward:risk
--     multiple (planned_rr, e.g. 2 = reward 2x risk).
--   * Quantity is free text that carries its unit ("$100", "0.5 SOL"); the
--     number inside it is the $ risk for that trade. A win pays
--     quantity x planned_rr, a loss costs quantity.
--   * The open/closed status and fees are gone (see previous cleanup).
--
-- Existing rows: outcome is derived from the old exit-vs-entry result
-- (anything not a clear win lands on "lose" and can be corrected via edit),
-- and planned_rr is derived from the old stop/target legs when both existed.
-- ---------------------------------------------------------------------------

alter table public.trades add column planned_rr numeric;

update public.trades
   set planned_rr = round(
     abs(take_profit - entry_price) / nullif(abs(entry_price - stop_loss), 0),
     2
   )
 where stop_loss is not null
   and take_profit is not null
   and entry_price <> stop_loss;

alter table public.trades
  add constraint trades_rr_check check (planned_rr is null or planned_rr > 0);

alter table public.trades add column outcome text;

update public.trades
   set outcome = case
     when exit_price is not null
       and (
         (direction = 'long' and exit_price > entry_price)
         or (direction = 'short' and exit_price < entry_price)
       )
     then 'win'
     else 'lose'
   end;

alter table public.trades
  alter column outcome set not null,
  add constraint trades_outcome_check check (outcome in ('win', 'lose'));

alter table public.trades drop constraint if exists trades_closed_needs_exit;
drop index if exists public.trades_user_status_idx;

alter table public.trades
  drop column status,
  drop column fees,
  drop column entry_price,
  drop column exit_price,
  drop column stop_loss,
  drop column take_profit;

alter table public.trades drop constraint if exists trades_quantity_check;
alter table public.trades
  alter column quantity type text using quantity::text;
