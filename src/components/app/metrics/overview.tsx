import { Badge } from "@/components/app/badge";
import { StatCard, type StatTone } from "@/components/app/stat-card";
import { EmptyState } from "@/components/app/page-header";
import { EquityChart, PeriodBars, WinLossBar } from "@/components/app/charts";
import { deriveTrade, type GroupPerformance, type Metrics } from "@/lib/analytics/metrics";
import type { Trade } from "@/lib/trades/types";
import {
  formatDate,
  formatMoney,
  formatPercent,
  formatR,
  formatRatio,
  formatSignedMoney,
} from "@/lib/trading/format";

function pnlTone(value: number): StatTone {
  return value > 0 ? "positive" : value < 0 ? "negative" : "neutral";
}

export function MetricsGrid({ metrics }: { metrics: Metrics }) {
  const winTone: StatTone =
    metrics.winRate === null
      ? "neutral"
      : metrics.winRate >= 0.5
        ? "positive"
        : "negative";

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <StatCard
        label="Net performance"
        value={formatSignedMoney(metrics.netPnl)}
        hint={`${metrics.closedTrades} closed trade${metrics.closedTrades === 1 ? "" : "s"}`}
        tone={pnlTone(metrics.netPnl)}
      />
      <StatCard
        label="Win rate"
        value={metrics.winRate === null ? "—" : formatPercent(metrics.winRate)}
        hint={`${metrics.wins}W · ${metrics.losses}L · ${metrics.breakeven}BE`}
        tone={winTone}
      />
      <StatCard
        label="Total trades"
        value={String(metrics.totalTrades)}
        hint={`${metrics.openTrades} open`}
      />
      <StatCard
        label="Avg. reward / risk"
        value={metrics.avgRewardRisk === null ? "—" : formatRatio(metrics.avgRewardRisk)}
        hint="Planned, from stop & target"
      />
    </div>
  );
}

export function EquityPanel({
  metrics,
  title = "Equity curve",
  subtitle = "Cumulative realised P/L from closed trades",
}: {
  metrics: Metrics;
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6 lg:col-span-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink">{title}</p>
          <p className="mt-1 text-xs text-muted">{subtitle}</p>
        </div>
        <span className="text-xs text-faint">Peak-to-trough −{formatMoney(metrics.maxDrawdown)}</span>
      </div>

      <div className="mt-4">
        {metrics.equityCurve.length >= 2 ? (
          <EquityChart points={metrics.equityCurve} />
        ) : (
          <EmptyState
            compact
            title="Not enough closed trades"
            description="Close at least two trades to plot your equity curve."
          />
        )}
      </div>
    </div>
  );
}

export function WinLossPanel({ metrics }: { metrics: Metrics }) {
  const decided = metrics.wins + metrics.losses;
  return (
    <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
      <p className="text-sm font-medium text-ink">Wins vs losses</p>
      <p className="mt-1 text-xs text-muted">Across {decided} decided trades</p>

      <div className="mt-6">
        <WinLossBar
          wins={metrics.wins}
          losses={metrics.losses}
          breakeven={metrics.breakeven}
        />
        <dl className="mt-5 space-y-2.5 text-sm">
          <Row label="Wins" value={String(metrics.wins)} tone="positive" />
          <Row label="Losses" value={String(metrics.losses)} tone="negative" />
          <Row label="Breakeven" value={String(metrics.breakeven)} />
          <Row
            label="Avg. win"
            value={metrics.avgWin === null ? "—" : formatMoney(metrics.avgWin)}
            tone="positive"
          />
          <Row
            label="Avg. loss"
            value={metrics.avgLoss === null ? "—" : formatMoney(metrics.avgLoss)}
            tone="negative"
          />
        </dl>
      </div>
    </div>
  );
}

function Row({
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

export function BreakdownPanel({
  title,
  subtitle,
  groups,
  emptyCopy,
}: {
  title: string;
  subtitle: string;
  groups: GroupPerformance[];
  emptyCopy: string;
}) {
  return (
    <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
      <p className="text-sm font-medium text-ink">{title}</p>
      <p className="mt-1 text-xs text-muted">{subtitle}</p>

      {groups.length === 0 ? (
        <p className="mt-6 text-sm text-muted">{emptyCopy}</p>
      ) : (
        <ul className="mt-5 space-y-4">
          {groups.slice(0, 6).map((group) => {
            const total = groups.reduce((sum, g) => sum + g.closed, 0) || 1;
            return (
              <li key={group.key}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium text-ink">{group.key}</span>
                  <span
                    className={
                      group.netPnl >= 0 ? "text-positive" : "text-negative"
                    }
                  >
                    {formatSignedMoney(group.netPnl)}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-strong">
                    <div
                      className={`h-full rounded-full ${
                        group.netPnl >= 0 ? "bg-positive/70" : "bg-negative/70"
                      }`}
                      style={{
                        width: `${Math.max(6, (group.closed / total) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="w-28 shrink-0 text-right text-xs text-faint">
                    {group.winRate === null
                      ? "—"
                      : `${formatPercent(group.winRate)} win`}{" "}
                    · {group.trades}t
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function PeriodPanel({
  buckets,
  title,
  subtitle,
  labelFormatter,
}: {
  buckets: Metrics["byMonth"];
  title: string;
  subtitle: string;
  labelFormatter?: (key: string) => string;
}) {
  return (
    <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
      <p className="text-sm font-medium text-ink">{title}</p>
      <p className="mt-1 text-xs text-muted">{subtitle}</p>
      <div className="mt-6">
        {buckets.length === 0 ? (
          <p className="text-sm text-muted">No closed trades in this range yet.</p>
        ) : (
          <PeriodBars buckets={buckets} labelFormatter={labelFormatter} />
        )}
      </div>
    </div>
  );
}

export function RecentTrades({
  trades,
  limit = 5,
}: {
  trades: Trade[];
  limit?: number;
}) {
  const recent = [...trades]
    .sort(
      (a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime(),
    )
    .slice(0, limit);

  return (
    <div className="soft-frame overflow-hidden rounded-2xl bg-surface-raised">
      <div className="border-b border-hairline p-5 sm:p-6">
        <p className="text-sm font-medium text-ink">Recent trades</p>
        <p className="mt-1 text-xs text-muted">Your latest activity</p>
      </div>

      {recent.length === 0 ? (
        <div className="p-6">
          <EmptyState compact title="No trades yet" description="Trades you log will show up here." />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left">
            <caption className="sr-only">Your recent trades</caption>
            <thead>
              <tr className="text-xs text-muted">
                <th scope="col" className="px-5 py-3 font-medium sm:px-6">Symbol</th>
                <th scope="col" className="px-5 py-3 font-medium sm:px-6">Side</th>
                <th scope="col" className="px-5 py-3 font-medium sm:px-6">Date</th>
                <th scope="col" className="px-5 py-3 font-medium sm:px-6">Result</th>
                <th scope="col" className="px-5 py-3 font-medium sm:px-6">R</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((trade) => {
                const derived = deriveTrade(trade);
                return (
                  <tr key={trade.id} className="border-t border-hairline">
                    <td className="px-5 py-3.5 text-sm font-medium text-ink sm:px-6">
                      {trade.symbol}
                    </td>
                    <td className="px-5 py-3.5 sm:px-6">
                      <Badge tone={trade.direction === "long" ? "positive" : "negative"}>
                        {trade.direction === "long" ? "Long" : "Short"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted sm:px-6">
                      {formatDate(trade.openedAt)}
                    </td>
                    <td className="px-5 py-3.5 text-sm sm:px-6">
                      {derived.realizedPnl === null ? (
                        <Badge tone="info">Open</Badge>
                      ) : (
                        <span
                          className={
                            derived.realizedPnl >= 0
                              ? "text-positive"
                              : "text-negative"
                          }
                        >
                          {formatSignedMoney(derived.realizedPnl)}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted sm:px-6">
                      {derived.realizedR === null ? "—" : formatR(derived.realizedR)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
