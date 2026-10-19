import "server-only";

import { io } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { RiskSettings } from "@/lib/risk/types";

type RiskSettingsRow = {
  user_id: string;
  account_equity: number | string | null;
  max_risk_per_trade: number | string | null;
  max_daily_loss: number | string | null;
  max_drawdown: number | string | null;
  min_reward_risk: number | string | null;
  max_open_positions: number | string | null;
};

function num(value: number | string | null): number | null {
  if (value === null || value === undefined) return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toSettings(row: RiskSettingsRow): RiskSettings {
  return {
    userId: row.user_id,
    accountEquity: num(row.account_equity),
    maxRiskPerTrade: num(row.max_risk_per_trade),
    maxDailyLoss: num(row.max_daily_loss),
    maxDrawdown: num(row.max_drawdown),
    minRewardRisk: num(row.min_reward_risk),
    maxOpenPositions: num(row.max_open_positions),
  };
}

export const EMPTY_RISK_SETTINGS: RiskSettings = {
  userId: null,
  accountEquity: null,
  maxRiskPerTrade: null,
  maxDailyLoss: null,
  maxDrawdown: null,
  minRewardRisk: null,
  maxOpenPositions: null,
};

export async function getRiskSettings(): Promise<RiskSettings> {
  // Mark the dynamic boundary before Supabase reads the session: the library's
  // internal token-expiry `Date.now()` check must run at request time, not while
  // prerendering the static shell (required with cacheComponents enabled).
  await io();
  const supabase = await createClient();
  if (!supabase) return EMPTY_RISK_SETTINGS;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return EMPTY_RISK_SETTINGS;

  const { data, error } = await supabase
    .from("risk_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) return EMPTY_RISK_SETTINGS;
  return toSettings(data as RiskSettingsRow);
}

export async function upsertRiskSettings(
  input: RiskSettings,
  userId: string,
): Promise<RiskSettings | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("risk_settings")
    .upsert(
      {
        user_id: userId,
        account_equity: input.accountEquity,
        max_risk_per_trade: input.maxRiskPerTrade,
        max_daily_loss: input.maxDailyLoss,
        max_drawdown: input.maxDrawdown,
        min_reward_risk: input.minRewardRisk,
        max_open_positions: input.maxOpenPositions,
      },
      { onConflict: "user_id" },
    )
    .select("*")
    .single();

  if (error || !data) return null;
  return toSettings(data as RiskSettingsRow);
}
