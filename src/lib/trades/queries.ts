import "server-only";

import { io } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Trade, TradeInput } from "@/lib/trades/types";

type TradeRow = {
  id: string;
  symbol: string;
  direction: string;
  quantity: string;
  planned_rr: number | string | null;
  outcome: string;
  strategy: string | null;
  notes: string | null;
  opened_at: string;
  closed_at: string;
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
    quantity: row.quantity,
    plannedRR: num(row.planned_rr),
    outcome: row.outcome === "win" ? "win" : "lose",
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
    quantity: input.quantity,
    planned_rr: input.plannedRR,
    outcome: input.outcome,
    strategy: input.strategy,
    notes: input.notes,
    opened_at: input.openedAt,
    closed_at: input.closedAt ?? input.openedAt,
  };
}

export { toTrade };
