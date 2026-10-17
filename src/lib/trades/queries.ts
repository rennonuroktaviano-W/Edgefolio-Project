import "server-only";

import { io } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Trade, TradeInput } from "@/lib/trades/types";

type TradeRow = {
  id: string;
  symbol: string;
  direction: string;
  status: string;
  entry_price: number | string;
  exit_price: number | string | null;
  quantity: number | string;
  stop_loss: number | string | null;
  take_profit: number | string | null;
  fees: number | string;
  strategy: string | null;
  notes: string | null;
  opened_at: string;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
};

function num(value: number | string | null): number | null {
  if (value === null) return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toTrade(row: TradeRow): Trade {
  return {
    id: row.id,
    symbol: row.symbol,
    direction: row.direction === "short" ? "short" : "long",
    status: row.status === "open" ? "open" : "closed",
    entryPrice: num(row.entry_price) ?? 0,
    exitPrice: num(row.exit_price),
    quantity: num(row.quantity) ?? 0,
    stopLoss: num(row.stop_loss),
    takeProfit: num(row.take_profit),
    fees: num(row.fees) ?? 0,
    strategy: row.strategy,
    notes: row.notes,
    openedAt: row.opened_at,
    closedAt: row.closed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getSupabase(): Promise<SupabaseClient | null> {
  return createClient();
}

export async function listTrades(): Promise<Trade[]> {
  // Mark the dynamic boundary before Supabase reads the session: the library's
  // internal token-expiry `Date.now()` check must run at request time, not while
  // prerendering the static shell (required with cacheComponents enabled).
  await io();
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .order("opened_at", { ascending: false });

  if (error || !data) return [];
  return (data as TradeRow[]).map(toTrade);
}

export async function getTrade(id: string): Promise<Trade | null> {
  await io();
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return toTrade(data as TradeRow);
}

export function toTradeRow(input: TradeInput) {
  return {
    symbol: input.symbol,
    direction: input.direction,
    status: input.status,
    entry_price: input.entryPrice,
    exit_price: input.status === "closed" ? input.exitPrice : null,
    quantity: input.quantity,
    stop_loss: input.stopLoss,
    take_profit: input.takeProfit,
    fees: input.fees,
    strategy: input.strategy,
    notes: input.notes,
    opened_at: input.openedAt,
    closed_at: input.status === "closed" ? input.closedAt ?? input.openedAt : null,
  };
}

export { toTrade };
