import "server-only";

import { io } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { RiskSettings, RiskSettingsInput } from "@/lib/risk/types";

// The risk plan is a per-user settings blob. Rather than a table + RLS, it
// lives in the auth user's `user_metadata` alongside `display_name`/`username`
// — already the established pattern in this codebase. It is readable and
// writable only by the owner (via their own session), needs no migration, and
// is small enough to be a single field.
const PLAN_KEY = "risk_plan";

type PlanBlob = Partial<Record<keyof RiskSettingsInput, number | null>>;

type AuthUser = {
  id: string;
  user_metadata: Record<string, unknown> | null;
};

function empty(userId: string | null = null): RiskSettings {
  return {
    userId,
    accountEquity: null,
    maxRiskPerTrade: null,
    maxDailyLoss: null,
    maxDrawdown: null,
    minRewardRisk: null,
  };
}

function num(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function readPlan(metadata: Record<string, unknown> | null, userId: string): RiskSettings {
  const blob = metadata?.[PLAN_KEY];
  if (!blob || typeof blob !== "object") return empty(userId);

  const plan = blob as PlanBlob;
  return {
    userId,
    accountEquity: num(plan.accountEquity),
    maxRiskPerTrade: num(plan.maxRiskPerTrade),
    maxDailyLoss: num(plan.maxDailyLoss),
    maxDrawdown: num(plan.maxDrawdown),
    minRewardRisk: num(plan.minRewardRisk),
  };
}

function toBlob(input: RiskSettingsInput): PlanBlob {
  return {
    accountEquity: input.accountEquity,
    maxRiskPerTrade: input.maxRiskPerTrade,
    maxDailyLoss: input.maxDailyLoss,
    maxDrawdown: input.maxDrawdown,
    minRewardRisk: input.minRewardRisk,
  };
}

export async function getRiskSettings(): Promise<RiskSettings> {
  // Mark the dynamic boundary before Supabase reads the session: the library's
  // internal token-expiry `Date.now()` check must run at request time, not while
  // prerendering the static shell (required with cacheComponents enabled).
  try {
    await io();
    const supabase = await createClient();
    if (!supabase) return empty();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return empty();

    return readPlan(user.user_metadata ?? null, user.id);
  } catch {
    return empty();
  }
}

// We rebuild the whole `user_metadata` object here instead of relying on how
// GoTrue treats a partial `data` payload, so other fields (`display_name`,
// `username`) are always preserved.
export async function saveRiskSettings(
  input: RiskSettingsInput,
  user: AuthUser,
): Promise<RiskSettings | null> {
  try {
    const supabase = await createClient();
    if (!supabase) return null;

    const merged: Record<string, unknown> = {
      ...(user.user_metadata ?? {}),
      [PLAN_KEY]: toBlob(input),
    };

    const { error } = await supabase.auth.updateUser({ data: merged });
    if (error) return null;

    return readPlan(merged, user.id);
  } catch {
    return null;
  }
}
