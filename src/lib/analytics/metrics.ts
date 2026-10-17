import type { Trade } from "@/lib/trades/types";

// ---------------------------------------------------------------------------
// Derivation
// ---------------------------------------------------------------------------

export type DerivedTrade = {
  trade: Trade;
  // Realised profit/loss for closed trades (fees subtracted). Null while open.
  realizedPnl: number | null;
  // Money at risk based on the stop loss. Null when no stop was recorded.
  riskAmount: number | null;
  // Planned reward based on the take profit. Null when none was recorded.
  rewardAmount: number | null;
  // Planned reward/risk ratio. Null when either leg is missing.
  plannedRR: number | null;
  // Realised result expressed in R (multiples of risk). Null when no risk.
  realizedR: number | null;
  // Win/loss/breakeven for closed trades. Null while open.
  outcome: "win" | "loss" | "breakeven" | null;
  rMultiple: number | null;
};

function round(value: number, digits = 8): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function deriveTrade(trade: Trade): DerivedTrade {
  const isClosed = trade.status === "closed" && trade.exitPrice !== null;

  let realizedPnl: number | null = null;
  let outcome: DerivedTrade["outcome"] = null;

  if (isClosed && trade.exitPrice !== null) {
    const gross =
      trade.direction === "long"
        ? (trade.exitPrice - trade.entryPrice) * trade.quantity
        : (trade.entryPrice - trade.exitPrice) * trade.quantity;
    realizedPnl = round(gross - trade.fees, 2);
    outcome =
      realizedPnl > 0 ? "win" : realizedPnl < 0 ? "loss" : "breakeven";
  }

  let riskAmount: number | null = null;
  if (trade.stopLoss !== null) {
    const perUnit = Math.abs(trade.entryPrice - trade.stopLoss);
    if (perUnit > 0) {
      riskAmount = round(perUnit * trade.quantity, 2);
    }
  }

  let rewardAmount: number | null = null;
  if (trade.takeProfit !== null) {
    const perUnit = Math.abs(trade.takeProfit - trade.entryPrice);
    if (perUnit > 0) {
      rewardAmount = round(perUnit * trade.quantity, 2);
    }
  }

  const plannedRR =
    riskAmount && rewardAmount ? round(rewardAmount / riskAmount, 2) : null;

  const realizedR =
    realizedPnl !== null && riskAmount
      ? round(realizedPnl / riskAmount, 2)
      : null;

  return {
    trade,
    realizedPnl,
    riskAmount,
    rewardAmount,
    plannedRR,
    realizedR,
    outcome,
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
  closed: number;
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
  closedTrades: number;
  openTrades: number;
  wins: number;
  losses: number;
  breakeven: number;
  winRate: number | null;
  netPnl: number;
  grossProfit: number;
  grossLoss: number; // positive magnitude
  profitFactor: number | null;
  expectancy: number | null; // average P/L per closed trade
  avgWin: number | null;
  avgLoss: number | null; // positive magnitude
  avgR: number | null;
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
    const closed = items.filter((item) => item.realizedPnl !== null);
    const pnls = closed.map((item) => item.realizedPnl as number);
    const rs = closed
      .map((item) => item.realizedR)
      .filter((value): value is number => value !== null);
    const wins = closed.filter((item) => item.outcome === "win").length;

    groups.push({
      key,
      trades: items.length,
      closed: closed.length,
      netPnl: round(
        pnls.reduce((sum, value) => sum + value, 0),
        2,
      ),
      wins,
      winRate: closed.length > 0 ? wins / closed.length : null,
      avgR: mean(rs),
    });
  }

  return groups.sort((a, b) => b.netPnl - a.netPnl);
}

function bucketBy(
  closed: DerivedTrade[],
  keyOf: (date: Date) => string,
): PeriodBucket[] {
  const map = new Map<string, PeriodBucket>();

  for (const item of closed) {
    const date = closedDate(item.trade);
    if (!date) continue;
    const key = keyOf(date);
    const bucket = map.get(key) ?? { key, netPnl: 0, trades: 0, wins: 0 };
    bucket.netPnl = round(bucket.netPnl + (item.realizedPnl ?? 0), 2);
    bucket.trades += 1;
    if (item.outcome === "win") bucket.wins += 1;
    map.set(key, bucket);
  }

  return [...map.values()].sort((a, b) => (a.key < b.key ? 1 : -1));
}

export function computeMetrics(trades: Trade[]): Metrics {
  const derived = deriveTrades(trades);
  const closed = derived.filter((item) => item.realizedPnl !== null);

  const pnls = closed.map((item) => item.realizedPnl as number);
  const winsArr = pnls.filter((value) => value > 0);
  const lossesArr = pnls.filter((value) => value < 0);
  const rs = closed
    .map((item) => item.realizedR)
    .filter((value): value is number => value !== null);
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

  // Equity curve from closed trades ordered by close time.
  const ordered = [...closed]
    .map((item) => ({
      item,
      date: closedDate(item.trade),
    }))
    .filter(
      (entry): entry is { item: DerivedTrade; date: Date } =>
        entry.date !== null,
    )
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const equityCurve: EquityPoint[] = [];
  let cumulative = 0;
  for (const { item, date } of ordered) {
    cumulative = round(cumulative + (item.realizedPnl ?? 0), 2);
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
    bucket.netPnl = round(bucket.netPnl + (item.item.realizedPnl ?? 0), 2);
    bucket.trades += 1;
    weekdayTotals.set(weekday, bucket);
  }

  const worst = [...pnls].sort((a, b) => a - b)[0];

  return {
    totalTrades: trades.length,
    closedTrades: closed.length,
    openTrades: trades.length - closed.length,
    wins: winsArr.length,
    losses: lossesArr.length,
    breakeven: closed.length - winsArr.length - lossesArr.length,
    winRate: closed.length > 0 ? winsArr.length / closed.length : null,
    netPnl,
    grossProfit,
    grossLoss,
    profitFactor: grossLoss > 0 ? round(grossProfit / grossLoss, 2) : null,
    expectancy: closed.length > 0 ? round(netPnl / closed.length, 2) : null,
    avgWin: mean(winsArr),
    avgLoss: lossesArr.length > 0 ? Math.abs(mean(lossesArr) as number) : null,
    avgR: mean(rs),
    avgRewardRisk: mean(rrs),
    largestWin: winsArr.length > 0 ? Math.max(...winsArr) : null,
    largestLoss: worst !== undefined ? worst : null,
    maxDrawdown,
    maxDrawdownPct,
    equityCurve,
    byAsset: groupBy(derived, (trade) => trade.symbol),
    byStrategy: groupBy(derived, (trade) => trade.strategy),
    byDay: bucketBy(closed, dayKey),
    byWeek: bucketBy(closed, weekKey),
    byMonth: bucketBy(closed, monthKey),
    byWeekday: [...weekdayTotals.entries()]
      .map(([weekday, value]) => ({ weekday, ...value }))
      .sort((a, b) => a.weekday - b.weekday),
  };
}

export const EMPTY_METRICS: Metrics = computeMetrics([]);
