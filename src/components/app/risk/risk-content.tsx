import { StatCard } from "@/components/app/stat-card";
import { Badge } from "@/components/app/badge";
import { EmptyState } from "@/components/app/page-header";
import { ShieldIcon } from "@/components/app/icons";
import { computeMetrics, deriveTrades } from "@/lib/analytics/metrics";
import { listTrades } from "@/lib/trades/queries";
import {
  formatMoney,
  formatPercent,
  formatR,
  formatRatio,
} from "@/lib/trading/format";

const R_BUCKETS = [
  { label: "≤ -2R", min: -Infinity, max: -2 },
  { label: "-2 to -1R", min: -2, max: -1 },
  { label: "-1 to 0R", min: -1, max: 0 },
  { label: "0 to 1R", min: 0, max: 1 },
  { label: "1 to 2R", min: 1, max: 2 },
  { label: "2 to 3R", min: 2, max: 3 },
  { label: "> 3R", min: 3, max: Infinity },
];

export async function RiskContent() {
  const trades = await listTrades();

  if (trades.length === 0) {
    return (
      <div className="mt-8 soft-frame rounded-2xl bg-surface-raised p-6 sm:p-8">
        <EmptyState
          Icon={ShieldIcon}
          title="No risk data yet"
          description="Record a stop loss (and target) on your trades to unlock risk and reward analysis."
        />
      </div>
    );
  }

  const metrics = computeMetrics(trades);
  const derived = deriveTrades(trades);

  const withStop = derived.filter((item) => item.riskAmount !== null);
  const withoutStop = derived.length - withStop.length;
  const avgRisk =
    withStop.length > 0
      ? withStop.reduce((sum, item) => sum + (item.riskAmount ?? 0), 0) /
        withStop.length
      : null;

  const rs = derived
    .map((item) => item.realizedR)
    .filter((value): value is number => value !== null);
  const bestR = rs.length > 0 ? Math.max(...rs) : null;
  const worstR = rs.length > 0 ? Math.min(...rs) : null;

  const bucketCounts = R_BUCKETS.map((bucket) => ({
    label: bucket.label,
    count: rs.filter((value) => value > bucket.min && value <= bucket.max).length,
  }));
  const maxBucket = Math.max(...bucketCounts.map((b) => b.count), 1);

  const riskPctOfTrades =
    derived.length > 0 ? withStop.length / derived.length : 0;

  return (
    <div className="mt-8 space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
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
        <StatCard
          label="Average R"
          value={metrics.avgR === null ? "—" : formatR(metrics.avgR)}
          hint="Mean realised R multiple"
          tone={metrics.avgR !== null && metrics.avgR >= 0 ? "positive" : "negative"}
        />
        <StatCard
          label="Largest loss"
          value={metrics.largestLoss === null ? "—" : formatMoney(metrics.largestLoss)}
          hint="Worst single trade"
          tone="negative"
        />
        <StatCard
          label="Trades with a stop"
          value={formatPercent(riskPctOfTrades)}
          hint={`${withStop.length} of ${derived.length}`}
          tone={riskPctOfTrades >= 0.8 ? "positive" : "neutral"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
          <p className="text-sm font-medium text-ink">Risk per trade</p>
          <p className="mt-1 text-xs text-muted">
            Average money at risk when a stop loss is recorded.
          </p>
          <p className="mt-4 text-3xl font-semibold tracking-tight text-ink">
            {avgRisk === null ? "—" : formatMoney(avgRisk)}
          </p>
          <dl className="mt-5 space-y-2.5 text-sm">
            <Line label="Best result" value={bestR === null ? "—" : formatR(bestR)} tone="positive" />
            <Line label="Worst result" value={worstR === null ? "—" : formatR(worstR)} tone="negative" />
            <Line
              label="Planned reward / risk"
              value={
                metrics.avgRewardRisk === null
                  ? "—"
                  : formatRatio(metrics.avgRewardRisk)
              }
            />
            <Line
              label="Expectancy"
              value={metrics.expectancy === null ? "—" : formatMoney(metrics.expectancy)}
              tone={metrics.expectancy !== null && metrics.expectancy >= 0 ? "positive" : "negative"}
            />
          </dl>
        </div>

        <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink">R-multiple distribution</p>
              <p className="mt-1 text-xs text-muted">Closed trades by realised R</p>
            </div>
            <Badge tone={withoutStop > 0 ? "warning" : "muted"}>
              {withoutStop} without stop
            </Badge>
          </div>

          {rs.length === 0 ? (
            <p className="mt-6 text-sm text-muted">
              Add stop losses to express results in R and see this distribution.
            </p>
          ) : (
            <ul className="mt-5 space-y-3">
              {bucketCounts.map((bucket) => (
                <li key={bucket.label} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-xs text-muted">
                    {bucket.label}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-strong">
                    <div
                      className="h-full rounded-full bg-violet/70"
                      style={{
                        width: `${(bucket.count / maxBucket) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right text-xs text-faint">
                    {bucket.count}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
        <p className="text-sm font-medium text-ink">Position sizing guidance</p>
        <p className="mt-1 text-xs text-muted">
          Based on your current max drawdown and average risk per trade.
        </p>
        <ul className="mt-4 grid gap-3 text-sm text-muted sm:grid-cols-2">
          <li className="rounded-xl border border-hairline bg-night/40 p-3.5">
            Your largest single loss was{" "}
            <span className="text-ink">
              {metrics.largestLoss === null
                ? "—"
                : formatMoney(Math.abs(metrics.largestLoss))}
            </span>
            . Keeping per-trade risk small relative to your account protects you
            from a single bad outcome.
          </li>
          <li className="rounded-xl border border-hairline bg-night/40 p-3.5">
            Your average result per trade is{" "}
            <span className="text-ink">
              {metrics.expectancy === null
                ? "—"
                : formatMoney(metrics.expectancy)}
            </span>
            . A positive expectancy over a large sample is what compounds.
          </li>
        </ul>
        <p className="mt-4 text-xs text-faint">
          These are calculated from your records only and are not financial
          advice.
        </p>
      </div>
    </div>
  );
}

function Line({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd
        className={
          tone === "positive"
            ? "text-positive"
            : tone === "negative"
              ? "text-negative"
              : "text-ink"
        }
      >
        {value}
      </dd>
    </div>
  );
}
