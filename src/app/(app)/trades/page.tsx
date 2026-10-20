import { Suspense } from "react";
import { PageHeader } from "@/components/app/page-header";
import { PanelSkeleton } from "@/components/app/skeleton";
import { TradesView, type Prefill } from "@/components/app/trades/trades-view";
import { listTrades } from "@/lib/trades/queries";
import { getRiskSettings } from "@/lib/risk/queries";
import { deriveTrades } from "@/lib/analytics/metrics";
import {
  currentStreak,
  pnlForDay,
  pnlThisWeek,
  tradesForDay,
} from "@/lib/risk/analytics";
import type { TradeRiskContext } from "@/components/app/trades/trade-form";

export const metadata = {
  title: "Trades — Edgefolio",
  description: "Your private trade history and performance.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

async function TradesData({ prefill }: { prefill: Prefill | undefined }) {
  const [trades, settings] = await Promise.all([
    listTrades(),
    getRiskSettings(),
  ]);

  const derived = deriveTrades(trades);
  const now = new Date();
  const todayPnl = pnlForDay(derived, now);
  const weekPnl = pnlThisWeek(derived, now);
  const tradesToday = tradesForDay(derived, now);
  const lossStreakNow = currentStreak(derived, "loss");

  const equity = settings.accountEquity;
  const hasEquity = equity !== null && equity > 0;

  const riskContext: TradeRiskContext = {
    maxRiskAmount:
      hasEquity && settings.maxRiskPerTrade !== null
        ? equity * settings.maxRiskPerTrade
        : null,
    maxRiskLabel:
      settings.maxRiskPerTrade === null || equity === null
        ? null
        : `${settings.maxRiskPerTrade * 100}% dari modal (${equity})`,
    todayPnl,
    dailyBreached:
      settings.maxDailyLoss !== null &&
      hasEquity &&
      -todayPnl >= equity * settings.maxDailyLoss,
    weeklyBreached:
      settings.maxWeeklyLoss !== null &&
      hasEquity &&
      -weekPnl >= equity * settings.maxWeeklyLoss,
    tradesBreached:
      settings.maxTradesPerDay !== null &&
      tradesToday >= settings.maxTradesPerDay,
    streakBreached:
      settings.maxConsecutiveLosses !== null &&
      lossStreakNow >= settings.maxConsecutiveLosses,
    lossStreakNow,
  };

  return (
    <TradesView trades={trades} prefill={prefill} risk={riskContext} />
  );
}

export default async function TradesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const size = first(params.size);
  const rr = first(params.rr);
  const prefill: Prefill | undefined =
    size || rr ? { size, rr } : undefined;

  return (
    <div>
      <PageHeader
        eyebrow="TRADES"
        title="Your trade history."
        description="Log every trade to build a private record of your execution, results, and risk. Only you can see this data."
      />

      <Suspense fallback={<PanelSkeleton height="h-96" />}>
        <TradesData prefill={prefill} />
      </Suspense>
    </div>
  );
}
