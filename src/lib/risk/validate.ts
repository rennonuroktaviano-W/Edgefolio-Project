import type { RiskSettingsInput } from "@/lib/risk/types";

type Parsed<T> = { ok: true; value: T } | { ok: false; error: string; field: string };

// The settings payload has exactly these fields. Anything else is a client bug,
// and silently dropping it would answer "saved" while writing an empty plan
// over the user's real one.
const KNOWN_FIELDS = new Set([
  "accountEquity",
  "maxRiskPerTrade",
  "maxDailyLoss",
  "maxDrawdown",
  "minRewardRisk",
  "maxOpenPositions",
]);

function optionalNumber(
  raw: unknown,
): { ok: true; value: number | null } | { ok: false } {
  if (raw === null || raw === undefined || raw === "") {
    return { ok: true, value: null };
  }
  const parsed = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(parsed)) return { ok: false };
  return { ok: true, value: parsed };
}

function field(
  value: number | null,
  max: number,
  label: string,
): Parsed<number | null> {
  if (value === null) return { ok: true, value: null };
  if (value <= 0 || value > max) {
    return {
      ok: false,
      error: `${label} must be greater than 0 and at most ${Math.round(max * 100)}%.`,
      field: label,
    };
  }
  return { ok: true, value };
}

export function validateRiskSettings(
  payload: unknown,
): Parsed<RiskSettingsInput> {
  const body = (payload ?? {}) as Record<string, unknown>;

  const unknown = Object.keys(body).find((key) => !KNOWN_FIELDS.has(key));
  if (unknown) {
    return {
      ok: false,
      error: `Unexpected field: ${unknown}.`,
      field: unknown,
    };
  }

  const equity = optionalNumber(body.accountEquity);
  if (!equity.ok) {
    return { ok: false, error: "Enter a valid account equity.", field: "accountEquity" };
  }
  if (equity.value !== null && equity.value <= 0) {
    return { ok: false, error: "Account equity must be greater than 0.", field: "accountEquity" };
  }

  const maxRisk = optionalNumber(body.maxRiskPerTrade);
  if (!maxRisk.ok) {
    return { ok: false, error: "Enter a valid max risk per trade.", field: "maxRiskPerTrade" };
  }

  const maxDaily = optionalNumber(body.maxDailyLoss);
  if (!maxDaily.ok) {
    return { ok: false, error: "Enter a valid max daily loss.", field: "maxDailyLoss" };
  }

  const maxDd = optionalNumber(body.maxDrawdown);
  if (!maxDd.ok) {
    return { ok: false, error: "Enter a valid max drawdown.", field: "maxDrawdown" };
  }

  const minRr = optionalNumber(body.minRewardRisk);
  if (!minRr.ok) {
    return { ok: false, error: "Enter a valid minimum reward/risk.", field: "minRewardRisk" };
  }

  const maxOpen = optionalNumber(body.maxOpenPositions);
  if (!maxOpen.ok) {
    return { ok: false, error: "Enter a valid max open positions.", field: "maxOpenPositions" };
  }

  const riskChecked = field(maxRisk.value, 1, "Max risk per trade");
  if (!riskChecked.ok) return riskChecked as Parsed<RiskSettingsInput>;

  const dailyChecked = field(maxDaily.value, 1, "Max daily loss");
  if (!dailyChecked.ok) return dailyChecked as Parsed<RiskSettingsInput>;

  const ddChecked = field(maxDd.value, 1, "Max drawdown");
  if (!ddChecked.ok) return ddChecked as Parsed<RiskSettingsInput>;

  if (minRr.value !== null && (minRr.value <= 0 || minRr.value > 100)) {
    return {
      ok: false,
      error: "Minimum reward/risk must be greater than 0 and at most 100.",
      field: "minRewardRisk",
    };
  }

  if (
    maxOpen.value !== null &&
    (!Number.isInteger(maxOpen.value) || maxOpen.value <= 0 || maxOpen.value > 500)
  ) {
    return {
      ok: false,
      error: "Max open positions must be a whole number between 1 and 500.",
      field: "maxOpenPositions",
    };
  }

  return {
    ok: true,
    value: {
      accountEquity: equity.value,
      maxRiskPerTrade: riskChecked.value,
      maxDailyLoss: dailyChecked.value,
      maxDrawdown: ddChecked.value,
      minRewardRisk: minRr.value,
      maxOpenPositions: maxOpen.value,
    },
  };
}
