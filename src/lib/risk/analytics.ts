import type { DerivedTrade } from "@/lib/analytics/metrics";
import type { Trade } from "@/lib/trades/types";

// ---------------------------------------------------------------------------
// Pure risk helpers. Everything here is computed from the user's own trades —
// no fabricated numbers. Functions that need an account equity return null
// when equity is missing so the UI can show an honest "—" instead.
// ---------------------------------------------------------------------------

function closedDate(trade: Trade): Date | null {
  const raw = trade.closedAt ?? trade.openedAt;
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export type DrawdownState = {
  // Current distance from the equity peak, as a positive magnitude.
  current: number;
  // current expressed as a fraction of the peak (null when peak <= 0).
  currentPct: number | null;
  // Peak value reached so far (cumulative P/L high-water mark).
  peak: number;
  // True when the equity curve sits at its high-water mark.
  atPeak: boolean;
};

export function currentDrawdown(
  equityCurve: { value: number }[],
): DrawdownState | null {
  if (equityCurve.length === 0) return null;

  let peak = -Infinity;
  for (const point of equityCurve) {
    if (point.value > peak) peak = point.value;
  }
  if (!Number.isFinite(peak)) return null;

  const last = equityCurve[equityCurve.length - 1].value;
  const current = Math.max(0, peak - last);
  return {
    current,
    currentPct: peak > 0 ? current / peak : null,
    peak,
    atPeak: current === 0,
  };
}

export type Streak = {
  length: number;
  // Index (into the ordered closed-trade list) where the streak starts.
  startIndex: number;
};

// Longest run of consecutive losses (or wins) over trades in time order.
export function maxConsecutiveStreak(
  items: DerivedTrade[],
  kind: "win" | "loss",
): Streak {
  const ordered = [...items].sort((a, b) => {
    const da = closedDate(a.trade)?.getTime() ?? 0;
    const db = closedDate(b.trade)?.getTime() ?? 0;
    return da - db;
  });

  let best = 0;
  let bestStart = 0;
  let current = 0;
  let currentStart = 0;

  for (let i = 0; i < ordered.length; i += 1) {
    const item = ordered[i];
    const isMatch = kind === "win" ? item.realizedPnl > 0 : item.realizedPnl < 0;

    if (isMatch) {
      if (current === 0) currentStart = i;
      current += 1;
      if (current > best) {
        best = current;
        bestStart = currentStart;
      }
    } else {
      current = 0;
    }
  }

  return { length: best, startIndex: bestStart };
}

export type DailyLoss = { date: string; loss: number };

// Net P/L for the calendar day (UTC) containing `day`. Positive on profit days.
export function pnlForDay(items: DerivedTrade[], day: Date): number {
  const key = dayKey(day);
  let total = 0;
  for (const item of items) {
    const date = closedDate(item.trade);
    if (date && dayKey(date) === key) total += item.realizedPnl;
  }
  return Math.round(total * 100) / 100;
}

// Number of trades closed on the calendar day (UTC) containing `day`.
export function tradesForDay(items: DerivedTrade[], day: Date): number {
  const key = dayKey(day);
  let count = 0;
  for (const item of items) {
    const date = closedDate(item.trade);
    if (date && dayKey(date) === key) count += 1;
  }
  return count;
}

// Net P/L for the current week (Monday 00:00 UTC through the given instant).
export function pnlThisWeek(items: DerivedTrade[], now: Date): number {
  const day = now.getUTCDay() || 7;
  const monday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  monday.setUTCDate(monday.getUTCDate() - (day - 1));
  const start = monday.getTime();
  const end = start + 7 * 86_400_000;

  let total = 0;
  for (const item of items) {
    const date = closedDate(item.trade);
    if (!date) continue;
    const time = date.getTime();
    if (time >= start && time < end) total += item.realizedPnl;
  }
  return Math.round(total * 100) / 100;
}

// Trailing run of wins/losses counting backwards from the most recent trade.
export function currentStreak(
  items: DerivedTrade[],
  kind: "win" | "loss",
): number {
  const ordered = [...items].sort((a, b) => {
    const da = closedDate(a.trade)?.getTime() ?? 0;
    const db = closedDate(b.trade)?.getTime() ?? 0;
    return db - da;
  });

  let streak = 0;
  for (const item of ordered) {
    const isMatch = kind === "win" ? item.realizedPnl > 0 : item.realizedPnl < 0;
    if (!isMatch) break;
    streak += 1;
  }
  return streak;
}

export type DrawdownDuration = {
  // Whole days since the equity curve last touched a new high-water mark.
  days: number;
  // True while the curve sits at its peak.
  atPeak: boolean;
};

// Days the account has been under water (measured from the last equity peak).
export function drawdownDuration(
  equityCurve: { date: string; value: number }[],
  now: Date,
): DrawdownDuration | null {
  if (equityCurve.length === 0) return null;

  let peak = -Infinity;
  let peakTime = 0;
  for (const point of equityCurve) {
    const time = new Date(point.date).getTime();
    if (point.value >= peak) {
      peak = point.value;
      peakTime = time;
    }
  }
  if (!Number.isFinite(peak)) return null;

  const last = equityCurve[equityCurve.length - 1].value;
  if (last >= peak) return { days: 0, atPeak: true };

  const days = Math.max(
    0,
    Math.floor((now.getTime() - peakTime) / 86_400_000),
  );
  return { days, atPeak: false };
}

// Net loss for each calendar day that ended negative, sorted worst-first.
export function worstDailyLosses(
  items: DerivedTrade[],
  limit = 5,
): DailyLoss[] {
  const map = new Map<string, number>();

  for (const item of items) {
    const date = closedDate(item.trade);
    if (!date) continue;
    const key = dayKey(date);
    map.set(key, (map.get(key) ?? 0) + item.realizedPnl);
  }

  return [...map.entries()]
    .map(([date, pnl]) => ({ date, loss: pnl }))
    .filter((day) => day.loss < 0)
    .sort((a, b) => a.loss - b.loss)
    .slice(0, limit);
}

export type RiskOfRuin = {
  // Probability of hitting the drawdown limit before an equal recovery, 0–1.
  probability: number | null;
  // Why we could not compute it (kept honest rather than guessing).
  reason: string | null;
};

// Risk-of-ruin estimate for fixed-fraction betting, using the classic
// asymmetric gambler's-ruin result. With win probability w, payoff ratio b
// (avg win / avg loss) and a drawdown limit D expressed as a fraction of
// equity, the trader survives ~n = D / f "risk units" of loss. Then:
//
//   rho  = q / (w * b)            q = 1 - w
//   ruin = rho^n / (1 + rho^n)  = sigmoid(n * ln rho)
//
// This is an estimate under fixed win rate/payoff and independent trades —
// a guide, not a prediction. We label it as such wherever it is shown.
export function riskOfRuin(
  winRate: number | null,
  payoffRatio: number | null,
  riskFraction: number | null,
  drawdownLimit: number | null,
): RiskOfRuin {
  if (winRate === null || winRate <= 0 || winRate >= 1) {
    return { probability: null, reason: "Butuh win rate antara 0% dan 100%." };
  }
  if (payoffRatio === null || payoffRatio <= 0) {
    return { probability: null, reason: "Butuh payoff ratio positif." };
  }
  if (riskFraction === null || riskFraction <= 0 || riskFraction >= 1) {
    return { probability: null, reason: "Butuh risiko per trade di bawah 100%." };
  }
  if (drawdownLimit === null || drawdownLimit <= 0 || drawdownLimit >= 1) {
    return {
      probability: null,
      reason: "Butuh batas drawdown di paket risiko kamu.",
    };
  }

  const q = 1 - winRate;
  const rho = q / (winRate * payoffRatio);
  const units = drawdownLimit / riskFraction;

  if (!Number.isFinite(rho) || !Number.isFinite(units) || units <= 0) {
    return { probability: null, reason: "Tidak bisa dihitung dari input ini." };
  }

  if (rho <= 0) return { probability: 0, reason: null };
  if (rho === 1) return { probability: 0.5, reason: null };

  const logRho = Math.log(rho);
  const logit = units * logRho;
  // sigmoid, overflow-safe.
  const probability =
    logit >= 0
      ? 1 / (1 + Math.exp(-logit))
      : 1 / (1 + Math.exp(logit));

  return { probability: Math.min(1, Math.max(0, probability)), reason: null };
}

