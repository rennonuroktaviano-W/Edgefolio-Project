import type { Trade } from "@/lib/trades/types";
import { parseQuantityNumber } from "@/lib/trades/types";

// ---------------------------------------------------------------------------
// Derivation
// ---------------------------------------------------------------------------

export type DerivedTrade = {
  trade: Trade;
  // Realised P/L: a win pays size x planned RR (RR unset counts as 1),
  // a loss costs the size.
  realizedPnl: number;
  // The $ risk recorded on the trade (the number inside the size).
  riskAmount: number | null;
  // Planned reward in $ (risk x planned RR). Null when no RR was recorded.
  rewardAmount: number | null;
  // Planned reward/risk multiple. Null when unset.
  plannedRR: number | null;
  // Realised result in R: +planned RR on a win, -1 on a loss.
  realizedR: number;
  outcome: "win" | "lose";
  rMultiple: number;
};

function round(value: number, digits = 8): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function deriveTrade(trade: Trade): DerivedTrade {
  const quantity = parseQuantityNumber(trade.quantity);
  const riskAmount = quantity > 0 ? round(quantity, 2) : null;
  const rr = trade.plannedRR;

  const realizedR = trade.outcome === "win" ? (rr ?? 1) : -1;
  const realizedPnl =
    riskAmount === null ? 0 : round(riskAmount * realizedR, 2);
  const rewardAmount =
    riskAmount !== null && rr !== null ? round(riskAmount * rr, 2) : null;

  return {
    trade,
    realizedPnl,
    riskAmount,
    rewardAmount,
    plannedRR: rr,
    realizedR,
    outcome: trade.outcome,
    rMultiple: realizedR,
  };
}

export function deriveTrades(trades: Trade[]): DerivedTrade[] {
  return trades.map(deriveTrade);
}

// ---------------------------------------------------------------------------
// Aggregates
// ---------------------------------------------------------------------------

export type GroupPerformance = {
  key: string;
  trades: number;
  netPnl: number;
  wins: number;
  winRate: number | null;
  avgR: number | null;
};

export type EquityPoint = { date: string; value: number };

export type PeriodBucket = {
  key: string;
  netPnl: number;
  trades: number;
  wins: number;
};

export type Metrics = {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number | null;
  netPnl: number;
  grossProfit: number;
  grossLoss: number; // positive magnitude
  profitFactor: number | null;
  expectancy: number | null; // average P/L per trade
  avgWin: number | null;
  avgLoss: number | null; // positive magnitude
  avgR: number | null;
  stdDevR: number | null;
  medianR: number | null;
  payoffRatio: number | null; // avg win / avg loss ($)
  avgRewardRisk: number | null;
  largestWin: number | null;
  largestLoss: number | null; // negative value
  maxDrawdown: number; // positive magnitude
  maxDrawdownPct: number | null;
  equityCurve: EquityPoint[];
  byAsset: GroupPerformance[];
  byStrategy: GroupPerformance[];
  byDay: PeriodBucket[];
  byWeek: PeriodBucket[];
  byMonth: PeriodBucket[];
  byWeekday: { weekday: number; netPnl: number; trades: number }[];
};

function toDate(value: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function closedDate(trade: Trade): Date | null {
  return toDate(trade.closedAt) ?? toDate(trade.openedAt);
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function monthKey(date: Date): string {
  return date.toISOString().slice(0, 7);
}

function weekKey(date: Date): string {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7,
  );
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function stdDev(values: number[]): number | null {
  if (values.length < 2) return null;
  const avg = mean(values) as number;
  const variance =
    values.reduce((sum, value) => sum + (value - avg) ** 2, 0) /
    (values.length - 1);
  return Math.sqrt(variance);
}

function groupBy(
  derived: DerivedTrade[],
  keyOf: (trade: Trade) => string | null,
): GroupPerformance[] {
  const map = new Map<string, DerivedTrade[]>();

  for (const item of derived) {
    const key = keyOf(item.trade);
    if (!key) continue;
    const bucket = map.get(key);
    if (bucket) bucket.push(item);
    else map.set(key, [item]);
  }

  const groups: GroupPerformance[] = [];
  for (const [key, items] of map) {
    const pnls = items.map((item) => item.realizedPnl);
    const rs = items.map((item) => item.realizedR);
    const wins = items.filter((item) => item.outcome === "win").length;

    groups.push({
      key,
      trades: items.length,
      netPnl: round(
        pnls.reduce((sum, value) => sum + value, 0),
        2,
      ),
      wins,
      winRate: items.length > 0 ? wins / items.length : null,
      avgR: mean(rs),
    });
  }

  return groups.sort((a, b) => b.netPnl - a.netPnl);
}

function bucketBy(
  items: DerivedTrade[],
  keyOf: (date: Date) => string,
): PeriodBucket[] {
  const map = new Map<string, PeriodBucket>();

  for (const item of items) {
    const date = closedDate(item.trade);
    if (!date) continue;
    const key = keyOf(date);
    const bucket = map.get(key) ?? { key, netPnl: 0, trades: 0, wins: 0 };
    bucket.netPnl = round(bucket.netPnl + item.realizedPnl, 2);
    bucket.trades += 1;
    if (item.outcome === "win") bucket.wins += 1;
    map.set(key, bucket);
  }

  return [...map.values()].sort((a, b) => (a.key < b.key ? 1 : -1));
}

export function computeMetrics(trades: Trade[]): Metrics {
  const derived = deriveTrades(trades);

  const pnls = derived.map((item) => item.realizedPnl);
  const winsArr = derived
    .filter((item) => item.outcome === "win")
    .map((item) => item.realizedPnl);
  const lossesArr = derived
    .filter((item) => item.outcome === "lose")
    .map((item) => item.realizedPnl);
  const rs = derived.map((item) => item.realizedR);
  const rrs = derived
    .map((item) => item.plannedRR)
    .filter((value): value is number => value !== null);

  const netPnl = round(
    pnls.reduce((sum, value) => sum + value, 0),
    2,
  );
  const grossProfit = round(
    winsArr.reduce((sum, value) => sum + value, 0),
    2,
  );
  const grossLoss = round(
    Math.abs(lossesArr.reduce((sum, value) => sum + value, 0)),
    2,
  );

  // Equity curve from trades ordered by close time.
  const ordered = derived
    .map((item) => ({ item, date: closedDate(item.trade) }))
    .filter(
      (entry): entry is { item: DerivedTrade; date: Date } =>
        entry.date !== null,
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const equityCurve: EquityPoint[] = [];
  let cumulative = 0;
  for (const { item, date } of ordered) {
    cumulative = round(cumulative + item.realizedPnl, 2);
    equityCurve.push({ date: date.toISOString(), value: cumulative });
  }

  let peak = 0;
  let maxDrawdown = 0;
  let maxDrawdownPct: number | null = null;
  for (const point of equityCurve) {
    if (point.value > peak) peak = point.value;
    const drawdown = peak - point.value;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
      maxDrawdownPct = peak > 0 ? drawdown / peak : null;
    }
  }

  const weekdayTotals = new Map<number, { netPnl: number; trades: number }>();
  for (const item of ordered) {
    const weekday = item.date.getUTCDay();
    const bucket = weekdayTotals.get(weekday) ?? { netPnl: 0, trades: 0 };
    bucket.netPnl = round(bucket.netPnl + item.item.realizedPnl, 2);
    bucket.trades += 1;
    weekdayTotals.set(weekday, bucket);
  }

  const worst = [...pnls].sort((a, b) => a - b)[0];

  const avgWinValue = mean(winsArr);
  const avgLossValue =
    lossesArr.length > 0 ? Math.abs(mean(lossesArr) as number) : null;

  return {
    totalTrades: trades.length,
    wins: winsArr.length,
    losses: lossesArr.length,
    winRate: derived.length > 0 ? winsArr.length / derived.length : null,
    netPnl,
    grossProfit,
    grossLoss,
    profitFactor: grossLoss > 0 ? round(grossProfit / grossLoss, 2) : null,
    expectancy: derived.length > 0 ? round(netPnl / derived.length, 2) : null,
    avgWin: avgWinValue,
    avgLoss: avgLossValue,
    avgR: mean(rs),
    stdDevR: stdDev(rs),
    medianR: median(rs),
    payoffRatio:
      avgWinValue !== null && avgLossValue !== null && avgLossValue > 0
        ? round(avgWinValue / avgLossValue, 2)
        : null,
    avgRewardRisk: mean(rrs),
    largestWin: winsArr.length > 0 ? Math.max(...winsArr) : null,
    largestLoss: worst !== undefined ? worst : null,
    maxDrawdown,
    maxDrawdownPct,
    equityCurve,
    byAsset: groupBy(derived, (trade) => trade.symbol),
    byStrategy: groupBy(derived, (trade) => trade.strategy),
    byDay: bucketBy(derived, dayKey),
    byWeek: bucketBy(derived, weekKey),
    byMonth: bucketBy(derived, monthKey),
    byWeekday: [...weekdayTotals.entries()]
      .map(([weekday, value]) => ({ weekday, ...value }))
      .sort((a, b) => a.weekday - b.weekday),
  };
}

export const EMPTY_METRICS: Metrics = computeMetrics([]);
