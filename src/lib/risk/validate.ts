import type { RiskSettingsInput } from "@/lib/risk/types";

type Parsed<T> = { ok: true; value: T } | { ok: false; error: string; field: string };

// The settings payload has exactly these fields. Anything else is a client bug,
// and silently dropping it would answer "saved" while writing an empty plan
// over the user's real one.
const KNOWN_FIELDS = new Set([
  "accountEquity",
  "maxRiskPerTrade",
  "maxDailyLoss",
  "maxWeeklyLoss",
  "maxDrawdown",
  "minRewardRisk",
  "maxTradesPerDay",
  "maxConsecutiveLosses",
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

function percentField(
  value: number | null,
  label: string,
): Parsed<number | null> {
  if (value === null) return { ok: true, value: null };
  if (value <= 0 || value > 1) {
    return {
      ok: false,
      error: `${label} harus lebih besar dari 0 dan maksimal 100%.`,
      field: label,
    };
  }
  return { ok: true, value };
}

function countField(
  value: number | null,
  label: string,
): Parsed<number | null> {
  if (value === null) return { ok: true, value: null };
  if (!Number.isInteger(value) || value <= 0 || value > 1000) {
    return {
      ok: false,
      error: `${label} harus berupa bilangan bulat antara 1 dan 1000.`,
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
      error: `Field tidak dikenal: ${unknown}.`,
      field: unknown,
    };
  }

  const equity = optionalNumber(body.accountEquity);
  if (!equity.ok) {
    return { ok: false, error: "Masukkan modal akun yang valid.", field: "accountEquity" };
  }
  if (equity.value !== null && equity.value <= 0) {
    return { ok: false, error: "Modal akun harus lebih besar dari 0.", field: "accountEquity" };
  }

  const maxRisk = optionalNumber(body.maxRiskPerTrade);
  if (!maxRisk.ok) {
    return { ok: false, error: "Masukkan batas risiko per trade yang valid.", field: "maxRiskPerTrade" };
  }

  const maxDaily = optionalNumber(body.maxDailyLoss);
  if (!maxDaily.ok) {
    return { ok: false, error: "Masukkan batas loss harian yang valid.", field: "maxDailyLoss" };
  }

  const maxWeekly = optionalNumber(body.maxWeeklyLoss);
  if (!maxWeekly.ok) {
    return { ok: false, error: "Masukkan batas loss mingguan yang valid.", field: "maxWeeklyLoss" };
  }

  const maxDd = optionalNumber(body.maxDrawdown);
  if (!maxDd.ok) {
    return { ok: false, error: "Masukkan batas drawdown maksimal yang valid.", field: "maxDrawdown" };
  }

  const minRr = optionalNumber(body.minRewardRisk);
  if (!minRr.ok) {
    return { ok: false, error: "Masukkan R:R minimum yang valid.", field: "minRewardRisk" };
  }

  const tradesPerDay = optionalNumber(body.maxTradesPerDay);
  if (!tradesPerDay.ok) {
    return { ok: false, error: "Masukkan maksimum trade per hari yang valid.", field: "maxTradesPerDay" };
  }

  const consecutive = optionalNumber(body.maxConsecutiveLosses);
  if (!consecutive.ok) {
    return { ok: false, error: "Masukkan maksimum loss beruntun yang valid.", field: "maxConsecutiveLosses" };
  }

  const riskChecked = percentField(maxRisk.value, "Batas risiko per trade");
  if (!riskChecked.ok) return riskChecked as Parsed<RiskSettingsInput>;

  const dailyChecked = percentField(maxDaily.value, "Batas loss harian");
  if (!dailyChecked.ok) return dailyChecked as Parsed<RiskSettingsInput>;

  const weeklyChecked = percentField(maxWeekly.value, "Batas loss mingguan");
  if (!weeklyChecked.ok) return weeklyChecked as Parsed<RiskSettingsInput>;

  const ddChecked = percentField(maxDd.value, "Batas drawdown maksimal");
  if (!ddChecked.ok) return ddChecked as Parsed<RiskSettingsInput>;

  if (minRr.value !== null && (minRr.value <= 0 || minRr.value > 100)) {
    return {
      ok: false,
      error: "R:R minimum harus lebih besar dari 0 dan maksimal 100.",
      field: "minRewardRisk",
    };
  }

  const tradesChecked = countField(tradesPerDay.value, "Maksimum trade per hari");
  if (!tradesChecked.ok) return tradesChecked as Parsed<RiskSettingsInput>;

  const consecutiveChecked = countField(consecutive.value, "Maksimum loss beruntun");
  if (!consecutiveChecked.ok) return consecutiveChecked as Parsed<RiskSettingsInput>;

  return {
    ok: true,
    value: {
      accountEquity: equity.value,
      maxRiskPerTrade: riskChecked.value,
      maxDailyLoss: dailyChecked.value,
      maxWeeklyLoss: weeklyChecked.value,
      maxDrawdown: ddChecked.value,
      minRewardRisk: minRr.value,
      maxTradesPerDay: tradesChecked.value,
      maxConsecutiveLosses: consecutiveChecked.value,
    },
  };
}
