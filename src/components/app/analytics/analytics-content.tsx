import { StatCard, type StatTone } from "@/components/app/stat-card";
import { EmptyState } from "@/components/app/page-header";
import { AnalyticsIcon } from "@/components/app/icons";
import {
  BreakdownPanel,
  EquityPanel,
  PeriodPanel,
} from "@/components/app/metrics/overview";
import { computeMetrics } from "@/lib/analytics/metrics";
import { listTrades } from "@/lib/trades/queries";
import {
  formatMoney,
  formatPercent,
  formatR,
  formatRatio,
  formatSignedMoney,
} from "@/lib/trading/format";

function tone(value: number | null): StatTone {
  if (value === null) return "neutral";
  return value > 0 ? "positive" : value < 0 ? "negative" : "neutral";
}

export async function AnalyticsContent() {
  const trades = await listTrades();

  if (trades.length === 0) {
    return (
      <div className="mt-8 soft-frame rounded-2xl bg-surface-raised p-6 sm:p-8">
        <EmptyState
          Icon={AnalyticsIcon}
          title="No analytics yet"
          description="Analytics are calculated entirely from your own trade records. Log a few trades and this page fills in automatically."
        />
      </div>
    );
  }

  const metrics = computeMetrics(trades);

  return (
    <div className="mt-8 space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Net performance"
          value={formatSignedMoney(metrics.netPnl)}
          tone={tone(metrics.netPnl)}
          hint={`${metrics.totalTrades} trades`}
        />
        <StatCard
          label="Profit factor"
          value={metrics.profitFactor === null ? "—" : formatRatio(metrics.profitFactor)}
          hint="Gross profit ÷ gross loss"
          tone={metrics.profitFactor !== null && metrics.profitFactor >= 1 ? "positive" : "negative"}
        />
        <StatCard
          label="Expectancy"
          value={metrics.expectancy === null ? "—" : formatSignedMoney(metrics.expectancy)}
          hint="Average P/L per trade"
          tone={tone(metrics.expectancy)}
        />
        <StatCard
          label="Win rate"
          value={metrics.winRate === null ? "—" : formatPercent(metrics.winRate)}
          hint={`${metrics.wins}W · ${metrics.losses}L`}
          tone={metrics.winRate !== null && metrics.winRate >= 0.5 ? "positive" : "negative"}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Average R"
          value={metrics.avgR === null ? "—" : formatR(metrics.avgR)}
          tone={tone(metrics.avgR)}
          hint="Mean realised R multiple"
        />
        <StatCard
          label="Avg. win"
          value={metrics.avgWin === null ? "—" : formatMoney(metrics.avgWin)}
          tone="positive"
        />
        <StatCard
          label="Avg. loss"
          value={metrics.avgLoss === null ? "—" : formatMoney(metrics.avgLoss)}
          tone="negative"
        />
        <StatCard
          label="Max drawdown"
          value={`−${formatMoney(metrics.maxDrawdown)}`}
          hint={
            metrics.maxDrawdownPct === null
              ? "Peak-to-trough"
              : `${formatPercent(metrics.maxDrawdownPct)} of peak`
          }
          tone={metrics.maxDrawdown > 0 ? "negative" : "neutral"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <EquityPanel metrics={metrics} />
        <PeriodPanel
          title="Monthly performance"
          subtitle="Net P/L per month"
          buckets={metrics.byMonth}
          labelFormatter={(key) => key.slice(5)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PeriodPanel
          title="Weekly performance"
          subtitle="Net P/L per week"
          buckets={metrics.byWeek}
          labelFormatter={(key) => key.slice(-2)}
        />
        <PeriodPanel
          title="Daily performance"
          subtitle="Net P/L per day"
          buckets={metrics.byDay}
          labelFormatter={(key) => key.slice(5)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BreakdownPanel
          title="Performance by asset"
          subtitle="Net P/L per symbol"
          groups={metrics.byAsset}
          emptyCopy="Log trades to see a per-asset breakdown."
        />
        <BreakdownPanel
          title="Performance by strategy"
          subtitle="Net P/L per strategy"
          groups={metrics.byStrategy}
          emptyCopy="Tag your trades with a strategy to compare them here."
        />
      </div>

      <WeekdayPanel metrics={metrics} />

      <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
        <p className="text-sm font-medium text-ink">How these are calculated</p>
        <ul className="mt-3 grid gap-2 text-xs text-muted sm:grid-cols-2">
          <li>Net performance = Σ per trade: menang = size × planned R:R, kalah = −size.</li>
          <li>Win rate = menang ÷ total trade.</li>
          <li>Profit factor = total profit ÷ total loss (— when there are no losses).</li>
          <li>Expectancy = net performance ÷ trades.</li>
          <li>R multiple = +planned R:R saat menang, −1 saat kalah.</li>
          <li>Max drawdown = largest peak-to-trough drop of the equity curve.</li>
        </ul>
      </div>
    </div>
  );
}

function WeekdayPanel({
  metrics,
}: {
  metrics: ReturnType<typeof computeMetrics>;
}) {
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const max = Math.max(...metrics.byWeekday.map((d) => Math.abs(d.netPnl)), 1);

  if (metrics.byWeekday.length === 0) {
    return null;
  }

  return (
    <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
      <p className="text-sm font-medium text-ink">Performance by weekday</p>
      <p className="mt-1 text-xs text-muted">Net P/L by the day trades closed</p>

      <div className="mt-6 flex items-end gap-2">
        {labels.map((label, weekday) => {
          const bucket = metrics.byWeekday.find((d) => d.weekday === weekday);
          const netPnl = bucket?.netPnl ?? 0;
          const pct = bucket ? Math.max(4, (Math.abs(netPnl) / max) * 100) : 0;
          return (
            <div key={label} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-28 w-full items-end">
                <div
                  className={`w-full rounded-t-md ${
                    netPnl >= 0 ? "bg-positive/70" : "bg-negative/70"
                  }`}
                  style={{ height: `${pct}%` }}
                  title={bucket ? `${label}: ${netPnl}` : `${label}: no data`}
                />
              </div>
              <span className="text-xs text-faint">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
