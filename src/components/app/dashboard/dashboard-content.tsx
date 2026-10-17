import { MyDashboard } from "@/components/app/my-dashboard";
import {
  BreakdownPanel,
  EquityPanel,
  MetricsGrid,
  RecentTrades,
  WinLossPanel,
} from "@/components/app/metrics/overview";
import { computeMetrics } from "@/lib/analytics/metrics";
import { listTrades } from "@/lib/trades/queries";

export async function DashboardContent() {
  const trades = await listTrades();

  if (trades.length === 0) {
    return <MyDashboard />;
  }

  const metrics = computeMetrics(trades);

  return (
    <div className="mt-8 space-y-6">
      <div className="soft-frame flex flex-col gap-2 rounded-2xl bg-surface-raised p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <p className="text-sm text-muted">
          Private overview across {metrics.totalTrades} logged trade
          {metrics.totalTrades === 1 ? "" : "s"}.
        </p>
        <p className="text-xs text-faint">Only you can see this page</p>
      </div>

      <MetricsGrid metrics={metrics} />

      <div className="grid gap-4 lg:grid-cols-3">
        <EquityPanel metrics={metrics} />
        <WinLossPanel metrics={metrics} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BreakdownPanel
          title="Performance by asset"
          subtitle="Net P/L per symbol"
          groups={metrics.byAsset}
          emptyCopy="Close trades to see a per-asset breakdown."
        />
        <BreakdownPanel
          title="Performance by strategy"
          subtitle="Net P/L per strategy"
          groups={metrics.byStrategy}
          emptyCopy="Add a strategy to your trades to compare them here."
        />
      </div>

      <RecentTrades trades={trades} />
    </div>
  );
}
