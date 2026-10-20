import { StatCard } from "@/components/app/stat-card";
import { Badge } from "@/components/app/badge";
import { EmptyState } from "@/components/app/page-header";
import { ShieldIcon } from "@/components/app/icons";
import { computeMetrics, deriveTrades, type DerivedTrade } from "@/lib/analytics/metrics";
import { listTrades } from "@/lib/trades/queries";
import { getRiskSettings } from "@/lib/risk/queries";
import type { RiskSettings } from "@/lib/risk/types";
import {
  currentDrawdown,
  maxConsecutiveStreak,
  riskOfRuin,
  worstDailyLosses,
} from "@/lib/risk/analytics";
import { PlanForm } from "@/components/app/risk/plan-form";
import { PositionCalculator } from "@/components/app/risk/position-calculator";
import { Scorecard, type ScorecardRow } from "@/components/app/risk/scorecard";
import {
  formatMoney,
  formatPercent,
  formatR,
  formatRatio,
  formatDateShort,
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

type GroupRisk = {
  key: string;
  trades: number;
  avgRisk: number | null;
  avgR: number | null;
  netPnl: number;
};

export async function RiskContent() {
  const [trades, settings] = await Promise.all([
    listTrades(),
    getRiskSettings(),
  ]);

  if (trades.length === 0) {
    return (
      <div className="mt-8 space-y-6">
        <PlanForm initial={settings} />
        <div className="soft-frame rounded-2xl bg-surface-raised p-6 sm:p-8">
          <EmptyState
            Icon={ShieldIcon}
            title="Belum ada data risiko"
            description="Isi size (mis. $100 atau 0.5 SOL) dan hasil trade untuk membuka analisis risiko."
          />
        </div>
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

  const rs = derived.map((item) => item.realizedR);
  const bestR = rs.length > 0 ? Math.max(...rs) : null;
  const worstR = rs.length > 0 ? Math.min(...rs) : null;

  const bucketCounts = R_BUCKETS.map((bucket) => ({
    label: bucket.label,
    count: rs.filter((value) => value > bucket.min && value <= bucket.max).length,
  }));
  const maxBucket = Math.max(...bucketCounts.map((b) => b.count), 1);

  const drawdown = currentDrawdown(metrics.equityCurve);
  const lossStreak = maxConsecutiveStreak(derived, "loss");
  const winStreak = maxConsecutiveStreak(derived, "win");
  const dailyLosses = worstDailyLosses(derived, 3);
  const payoff =
    metrics.avgWin !== null && metrics.avgLoss !== null && metrics.avgLoss > 0
      ? metrics.avgWin / metrics.avgLoss
      : null;
  const ruin = riskOfRuin(
    metrics.winRate,
    payoff,
    settings.maxRiskPerTrade,
    settings.maxDrawdown,
  );

  const byStrategy = groupRisk(derived, (item) => item.trade.strategy || "Tanpa strategi");
  const byAsset = groupRisk(derived, (item) => item.trade.symbol);

  const scorecardRows = buildScorecard({
    settings,
    metrics,
    withStop,
    dailyLosses,
  });

  return (
    <div className="mt-8 space-y-6">
      <Scorecard rows={scorecardRows} />

      <div className="grid gap-4 lg:grid-cols-2">
        <PositionCalculator settings={settings} />
        <PlanForm initial={settings} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Max drawdown"
          value={`−${formatMoney(metrics.maxDrawdown)}`}
          hint={
            metrics.maxDrawdownPct === null
              ? "Peak-to-trough"
              : `${formatPercent(metrics.maxDrawdownPct)} dari peak`
          }
          tone={metrics.maxDrawdown > 0 ? "negative" : "neutral"}
        />
        <StatCard
          label="R-rata-rata"
          value={metrics.avgR === null ? "—" : formatR(metrics.avgR)}
          hint="Rata-rata R multiple terealisasi"
          tone={metrics.avgR !== null && metrics.avgR >= 0 ? "positive" : "negative"}
        />
        <StatCard
          label="Loss terbesar"
          value={metrics.largestLoss === null ? "—" : formatMoney(metrics.largestLoss)}
          hint="Trade tunggal terburuk"
          tone="negative"
        />
        <StatCard
          label="RR direncanakan"
          value={
            metrics.avgRewardRisk === null ? "—" : formatRatio(metrics.avgRewardRisk)
          }
          hint="Rata-rata planned reward/risk"
          tone={metrics.avgRewardRisk !== null && metrics.avgRewardRisk >= 1 ? "positive" : "neutral"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
          <p className="text-sm font-medium text-ink">Drawdown & streak</p>
          <p className="mt-1 text-xs text-muted">
            Jarak dari peak equity dan beruntun menang/kalah terpanjang.
          </p>

          <dl className="mt-5 space-y-2.5 text-sm">
            <Line
              label="Drawdown saat ini"
              value={
                drawdown === null
                  ? "—"
                  : drawdown.atPeak
                    ? "Di puncak"
                    : `−${formatMoney(drawdown.current)}`
              }
              tone={drawdown !== null && drawdown.atPeak ? "positive" : "negative"}
            />
            <Line
              label="Max drawdown tercatat"
              value={`−${formatMoney(metrics.maxDrawdown)}`}
              tone="negative"
            />
            <Line
              label="Beruntun kalah terpanjang"
              value={`${lossStreak.length}x`}
              tone="negative"
            />
            <Line
              label="Beruntun menang terpanjang"
              value={`${winStreak.length}x`}
              tone="positive"
            />
            <Line
              label="Risk of ruin (estimasi)"
              value={
                ruin.probability === null
                  ? "—"
                  : formatPercent(ruin.probability, 1)
              }
              tone={ruin.probability !== null && ruin.probability < 0.1 ? "positive" : "negative"}
            />
            <Line
              label="Risiko rata-rata per trade"
              value={avgRisk === null ? "—" : formatMoney(avgRisk)}
            />
            <Line
              label="R terbaik / terburuk"
              value={
                bestR === null || worstR === null
                  ? "—"
                  : `${formatR(worstR)} / ${formatR(bestR)}`
              }
              tone={worstR !== null && worstR < 0 ? "negative" : "positive"}
            />
            {ruin.reason ? (
              <p className="text-xs text-faint">{ruin.reason}</p>
            ) : null}
          </dl>

          {dailyLosses.length > 0 ? (
            <div className="mt-5 border-t border-hairline pt-4">
              <p className="text-xs font-medium text-muted">Hari loss terburuk</p>
              <ul className="mt-2 space-y-1.5 text-sm">
                {dailyLosses.map((day) => (
                  <li key={day.date} className="flex items-center justify-between">
                    <span className="text-muted">{formatDateShort(day.date)}</span>
                    <span className="text-negative">{formatMoney(day.loss)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-ink">Distribusi R-multiple</p>
              <p className="mt-1 text-xs text-muted">Berdasarkan R multiple terealisasi</p>
            </div>
            <Badge tone={withoutStop > 0 ? "warning" : "muted"}>
              {withoutStop} tanpa angka size
            </Badge>
          </div>

          {rs.length === 0 ? (
            <p className="mt-6 text-sm text-muted">
              Isi size trade dengan angka (mis. $100) untuk mengekspresikan
              hasil dalam R dan melihat distribusi ini.
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

      <div className="grid gap-4 lg:grid-cols-2">
        <RiskBreakdown title="Risiko per strategi" groups={byStrategy} />
        <RiskBreakdown title="Risiko per aset" groups={byAsset} />
      </div>

      <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
        <p className="text-sm font-medium text-ink">Panduan position sizing</p>
        <p className="mt-1 text-xs text-muted">
          Berdasarkan max drawdown dan rata-rata risiko per trade kamu.
        </p>
        <ul className="mt-4 grid gap-3 text-sm text-muted sm:grid-cols-2">
          <li className="rounded-xl border border-hairline bg-night/40 p-3.5">
            Loss tunggal terbesar kamu{" "}
            <span className="text-ink">
              {metrics.largestLoss === null
                ? "—"
                : formatMoney(Math.abs(metrics.largestLoss))}
            </span>
            . Menjaga risiko per trade kecil terhadap akun melindungi kamu dari
            satu hasil buruk.
          </li>
          <li className="rounded-xl border border-hairline bg-night/40 p-3.5">
            Hasil rata-rata per trade kamu{" "}
            <span className="text-ink">
              {metrics.expectancy === null
                ? "—"
                : formatMoney(metrics.expectancy)}
            </span>
            . Ekspektasi positif pada sampel besar yang membuat akun tumbuh.
          </li>
        </ul>
        <p className="mt-4 text-xs text-faint">
          Semua dihitung dari catatan kamu sendiri dan bukan saran finansial.
        </p>
      </div>
    </div>
  );
}

function groupRisk(
  items: DerivedTrade[],
  keyOf: (item: DerivedTrade) => string,
): GroupRisk[] {
  const map = new Map<string, GroupRisk>();

  for (const item of items) {
    const key = keyOf(item);
    const entry =
      map.get(key) ?? { key, trades: 0, avgRisk: null, avgR: null, netPnl: 0 };
    entry.trades += 1;
    entry.netPnl += item.realizedPnl;

    if (item.riskAmount !== null) {
      entry.avgRisk =
        entry.avgRisk === null
          ? item.riskAmount
          : (entry.avgRisk * (entry.trades - 1) + item.riskAmount) / entry.trades;
    }
    if (item.realizedR !== null) {
      entry.avgR =
        entry.avgR === null
          ? item.realizedR
          : (entry.avgR * (entry.trades - 1) + item.realizedR) / entry.trades;
    }

    map.set(key, entry);
  }

  return [...map.values()].sort((a, b) => b.trades - a.trades);
}

function RiskBreakdown({
  title,
  groups,
}: {
  title: string;
  groups: GroupRisk[];
}) {
  const shown = groups.slice(0, 6);
  const maxRisk = Math.max(
    ...shown.map((group) => Math.abs(group.avgRisk ?? 0)),
    1,
  );

  return (
    <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
      <p className="text-sm font-medium text-ink">{title}</p>
      <p className="mt-1 text-xs text-muted">
        Rata-rata $ yang berisiko per trade, dibandingkan R-rata-rata.
      </p>

      {shown.length === 0 ? (
        <p className="mt-6 text-sm text-muted">
          Belum ada size dengan angka pada trade untuk membentuk grup.
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {shown.map((group) => (
            <li key={group.key} className="flex items-center gap-3">
              <span className="w-28 shrink-0 truncate text-xs text-muted">
                {group.key}
              </span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-strong">
                <div
                  className="h-full rounded-full bg-accent/70"
                  style={{
                    width: `${((group.avgRisk ?? 0) / maxRisk) * 100}%`,
                  }}
                />
              </div>
              <span className="w-24 shrink-0 text-right text-xs text-ink">
                {group.avgRisk === null ? "—" : formatMoney(group.avgRisk)}
              </span>
              <span className="w-16 shrink-0 text-right text-xs text-faint">
                {group.avgR === null ? "—" : formatR(group.avgR)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function buildScorecard({
  settings,
  metrics,
  withStop,
  dailyLosses,
}: {
  settings: RiskSettings;
  metrics: ReturnType<typeof computeMetrics>;
  withStop: DerivedTrade[];
  dailyLosses: { date: string; loss: number }[];
}): ScorecardRow[] {
  const rows: ScorecardRow[] = [];
  const equity = settings.accountEquity;
  const hasEquity = equity !== null && equity > 0;

  const avgRisk =
    withStop.length > 0
      ? withStop.reduce((sum, item) => sum + (item.riskAmount ?? 0), 0) /
        withStop.length
      : null;

  rows.push(
    limitRow({
      label: "Risiko rata-rata per trade",
      note: "Rata-rata $ risk dibanding equity.",
      actual: avgRisk === null ? "—" : formatMoney(avgRisk),
      actualRatio: hasEquity && avgRisk !== null ? avgRisk / equity : null,
      limit: settings.maxRiskPerTrade,
      limitLabel:
        settings.maxRiskPerTrade === null
          ? "—"
          : formatPercent(settings.maxRiskPerTrade),
    }),
  );

  rows.push(
    limitRow({
      label: "Loss terbesar",
      note: "Satu trade terburuk dibanding equity.",
      actual:
        metrics.largestLoss === null ? "—" : formatMoney(metrics.largestLoss),
      actualRatio:
        hasEquity && metrics.largestLoss !== null
          ? Math.abs(metrics.largestLoss) / equity
          : null,
      limit: settings.maxDrawdown,
      limitLabel:
        settings.maxDrawdown === null ? "—" : formatPercent(settings.maxDrawdown),
    }),
  );

  const worstDay = dailyLosses[0];
  rows.push(
    limitRow({
      label: "Hari loss terburuk",
      note: worstDay ? formatDateShort(worstDay.date) : "Belum ada hari loss.",
      actual: worstDay ? formatMoney(worstDay.loss) : "—",
      actualRatio:
        hasEquity && worstDay ? Math.abs(worstDay.loss) / equity : null,
      limit: settings.maxDailyLoss,
      limitLabel:
        settings.maxDailyLoss === null
          ? "—"
          : formatPercent(settings.maxDailyLoss),
    }),
  );

  rows.push(
    limitRow({
      label: "Reward / risk direncanakan",
      note: "Rata-rata planned R:R dari trade yang punya stop dan target.",
      actual:
        metrics.avgRewardRisk === null ? "—" : formatRatio(metrics.avgRewardRisk),
      actualRatio: null,
      actualValue: metrics.avgRewardRisk,
      limit: settings.minRewardRisk,
      limitLabel:
        settings.minRewardRisk === null
          ? "—"
          : formatRatio(settings.minRewardRisk),
      compareMin: true,
    }),
  );

  return rows;
}

function limitRow({
  label,
  note,
  actual,
  actualRatio,
  actualValue,
  limit,
  limitLabel,
  compareMin,
}: {
  label: string;
  note?: string;
  actual: string;
  actualRatio: number | null;
  actualValue?: number | null;
  limit: number | null;
  limitLabel: string;
  compareMin?: boolean;
}): ScorecardRow {
  if (limit === null) {
    return { label, note, actual, limit: limitLabel, status: "skip" };
  }

  let pass: boolean | null = null;
  if (compareMin) {
    pass = actualValue === null || actualValue === undefined ? null : actualValue >= limit;
  } else if (actualRatio !== null) {
    pass = actualRatio <= limit;
  }

  if (pass === null) {
    return { label, note, actual, limit: limitLabel, status: "skip" };
  }

  return {
    label,
    note,
    actual,
    limit: limitLabel,
    status: pass ? "pass" : "fail",
  };
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

