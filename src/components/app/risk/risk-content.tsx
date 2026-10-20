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
  currentStreak,
  drawdownDuration,
  maxConsecutiveStreak,
  pnlForDay,
  pnlThisWeek,
  riskOfRuin,
  tradesForDay,
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

  const now = new Date();
  const todayPnl = pnlForDay(derived, now);
  const weekPnl = pnlThisWeek(derived, now);
  const tradesToday = tradesForDay(derived, now);
  const lossStreakNow = currentStreak(derived, "loss");
  const ddDuration = drawdownDuration(metrics.equityCurve, now);

  const equity = settings.accountEquity;
  const hasEquity = equity !== null && equity > 0;

  const dailyBreached =
    settings.maxDailyLoss !== null &&
    hasEquity &&
    -todayPnl >= equity * settings.maxDailyLoss;
  const weeklyBreached =
    settings.maxWeeklyLoss !== null &&
    hasEquity &&
    -weekPnl >= equity * settings.maxWeeklyLoss;
  const tradesBreached =
    settings.maxTradesPerDay !== null && tradesToday >= settings.maxTradesPerDay;
  const streakBreached =
    settings.maxConsecutiveLosses !== null &&
    lossStreakNow >= settings.maxConsecutiveLosses;

  const breachNotice = dailyBreached
    ? "Loss hari ini sudah menyentuh limit harian kamu — sebaiknya berhenti trading hari ini."
    : weeklyBreached
      ? "Loss minggu ini sudah menyentuh limit mingguan kamu — rehat sampai minggu depan."
      : streakBreached
        ? `Kamu sudah ${lossStreakNow}x loss beruntun — jeda dulu sebelum trade berikutnya.`
        : tradesBreached
          ? "Jumlah trade hari ini sudah mentok di batas kamu — besok lagi."
          : null;

  const byStrategy = groupRisk(derived, (item) => item.trade.strategy || "Tanpa strategi");
  const byAsset = groupRisk(derived, (item) => item.trade.symbol);

  const scorecardRows = buildScorecard({
    settings,
    metrics,
    withStop,
    todayPnl,
    weekPnl,
  });

  return (
    <div className="mt-8 space-y-6">
      <Scorecard rows={scorecardRows} />

      <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-ink">Batas langsung hari ini</p>
            <p className="mt-1 text-xs text-muted">
              Progress terhadap batas harian, mingguan, dan aturan jeda kamu —
              dihitung dari trade yang sudah dicatat.
            </p>
          </div>
          <Badge tone={dailyBreached ? "negative" : "muted"}>
            {dailyBreached ? "Limit harian tercapai" : "Dalam batas"}
          </Badge>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <LimitBar
            label="Loss hari ini"
            detail={`${formatMoney(todayPnl)} · ${tradesToday} trade hari ini`}
            used={hasEquity ? Math.max(0, -todayPnl) : null}
            limit={
              hasEquity && settings.maxDailyLoss !== null
                ? equity * settings.maxDailyLoss
                : null
            }
            usedText={formatMoney(Math.max(0, -todayPnl))}
            limitText={
              settings.maxDailyLoss === null || equity === null
                ? "Batas harian belum diatur"
                : `Limit ${formatMoney(equity * settings.maxDailyLoss)}`
            }
          />
          <LimitBar
            label="Loss minggu ini"
            detail={formatMoney(weekPnl)}
            used={hasEquity ? Math.max(0, -weekPnl) : null}
            limit={
              hasEquity && settings.maxWeeklyLoss !== null
                ? equity * settings.maxWeeklyLoss
                : null
            }
            usedText={formatMoney(Math.max(0, -weekPnl))}
            limitText={
              settings.maxWeeklyLoss === null || equity === null
                ? "Batas mingguan belum diatur"
                : `Limit ${formatMoney(equity * settings.maxWeeklyLoss)}`
            }
          />
          <LimitBar
            label="Trade hari ini"
            detail={`${tradesToday} dari ${settings.maxTradesPerDay ?? "—"} trade`}
            used={tradesToday}
            limit={settings.maxTradesPerDay}
            usedText={`${tradesToday} trade`}
            limitText={
              settings.maxTradesPerDay === null
                ? "Batas trade/hari belum diatur"
                : `Limit ${settings.maxTradesPerDay} trade/hari`
            }
          />
          <LimitBar
            label="Loss beruntun"
            detail={`${lossStreakNow} beruntun (terpanjang ${lossStreak.length}x)`}
            used={lossStreakNow}
            limit={settings.maxConsecutiveLosses}
            usedText={`${lossStreakNow}x beruntun`}
            limitText={
              settings.maxConsecutiveLosses === null
                ? "Batas loss beruntun belum diatur"
                : `Istirahat setelah ${settings.maxConsecutiveLosses}x`
            }
          />
        </div>

        {breachNotice ? (
          <p className="mt-4 rounded-xl border border-negative/30 bg-negative/10 p-3 text-sm text-negative">
            {breachNotice}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PositionCalculator settings={settings} />
        <PlanForm initial={settings} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Drawdown maksimal"
          value={`−${formatMoney(metrics.maxDrawdown)}`}
          hint={
            metrics.maxDrawdownPct === null
              ? "Dari puncak ke titik terendah"
              : `${formatPercent(metrics.maxDrawdownPct)} dari puncak`
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
              label="Lama di bawah puncak"
              value={
                ddDuration === null
                  ? "—"
                  : ddDuration.atPeak
                    ? "Sedang di puncak"
                    : `${ddDuration.days} hari`
              }
              tone={ddDuration !== null && ddDuration.atPeak ? "positive" : "negative"}
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
              label="Payoff ratio"
              value={payoff === null ? "—" : formatRatio(payoff)}
              tone={payoff !== null && payoff >= 1 ? "positive" : "negative"}
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

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
          <p className="text-sm font-medium text-ink">Statistik R-multiple</p>
          <p className="mt-1 text-xs text-muted">
            Kualitas ekspektasi dan konsistensi dari R yang terealisasi.
          </p>
          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Line
              label="Expectancy per trade"
              value={
                metrics.expectancy === null ? "—" : formatMoney(metrics.expectancy)
              }
              tone={
                metrics.expectancy !== null && metrics.expectancy >= 0
                  ? "positive"
                  : "negative"
              }
            />
            <Line
              label="Expectancy dalam R"
              value={metrics.avgR === null ? "—" : formatR(metrics.avgR)}
              tone={
                metrics.avgR !== null && metrics.avgR >= 0 ? "positive" : "negative"
              }
            />
            <Line
              label="Median R"
              value={metrics.medianR === null ? "—" : formatR(metrics.medianR)}
              tone={
                metrics.medianR !== null && metrics.medianR >= 0
                  ? "positive"
                  : "negative"
              }
            />
            <Line
              label="Volatilitas R (σ)"
              value={metrics.stdDevR === null ? "—" : formatR(metrics.stdDevR)}
            />
            <Line
              label="Payoff ratio"
              value={metrics.payoffRatio === null ? "—" : formatRatio(metrics.payoffRatio)}
              tone={
                metrics.payoffRatio !== null && metrics.payoffRatio >= 1
                  ? "positive"
                  : "negative"
              }
            />
            <Line
              label="Rata-rata RR direncanakan"
              value={
                metrics.avgRewardRisk === null
                  ? "—"
                  : formatRatio(metrics.avgRewardRisk)
              }
            />
          </dl>
          <p className="mt-4 text-xs text-faint">
            Expectancy = rata-rata hasil per trade. σ(R) makin kecil makin
            konsisten.
          </p>
        </div>

        <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
          <p className="text-sm font-medium text-ink">Panduan position sizing</p>
          <p className="mt-1 text-xs text-muted">
            Berdasarkan drawdown maksimal dan rata-rata risiko per trade kamu.
          </p>
          <ul className="mt-4 space-y-3 text-sm text-muted">
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
  todayPnl,
  weekPnl,
}: {
  settings: RiskSettings;
  metrics: ReturnType<typeof computeMetrics>;
  withStop: DerivedTrade[];
  todayPnl: number;
  weekPnl: number;
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
      note: "Rata-rata $ risk dibanding modal.",
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
      label: "Drawdown maksimal",
      note: "Penurunan puncak-to-trough dibanding modal.",
      actual: `−${formatMoney(metrics.maxDrawdown)}`,
      actualRatio: hasEquity && metrics.maxDrawdown > 0
        ? metrics.maxDrawdown / equity
        : hasEquity
          ? 0
          : null,
      limit: settings.maxDrawdown,
      limitLabel:
        settings.maxDrawdown === null ? "—" : formatPercent(settings.maxDrawdown),
    }),
  );

  rows.push(
    limitRow({
      label: "Loss hari ini",
      note: "P/L hari ini dibanding limit harian.",
      actual: formatMoney(todayPnl),
      actualRatio: hasEquity ? Math.max(0, -todayPnl) / equity : null,
      limit: settings.maxDailyLoss,
      limitLabel:
        settings.maxDailyLoss === null
          ? "—"
          : formatPercent(settings.maxDailyLoss),
    }),
  );

  rows.push(
    limitRow({
      label: "Loss minggu ini",
      note: "P/L minggu ini dibanding limit mingguan.",
      actual: formatMoney(weekPnl),
      actualRatio: hasEquity ? Math.max(0, -weekPnl) / equity : null,
      limit: settings.maxWeeklyLoss,
      limitLabel:
        settings.maxWeeklyLoss === null
          ? "—"
          : formatPercent(settings.maxWeeklyLoss),
    }),
  );

  rows.push(
    limitRow({
      label: "Reward / risk direncanakan",
      note: "Rata-rata planned R:R dari semua trade.",
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

function LimitBar({
  label,
  detail,
  used,
  limit,
  usedText,
  limitText,
}: {
  label: string;
  detail: string;
  // null = the plan has no limit for this metric (or we cannot measure it).
  used: number | null;
  limit: number | null;
  usedText: string;
  limitText: string;
}) {
  const hasLimit = limit !== null && limit > 0 && used !== null;
  const ratio = hasLimit ? Math.min(1, Math.max(0, used / limit)) : 0;
  const tone = !hasLimit
    ? "muted"
    : ratio >= 1
      ? "negative"
      : ratio >= 0.8
        ? "warning"
        : "positive";

  const barColor =
    tone === "negative"
      ? "bg-negative"
      : tone === "warning"
        ? "bg-warning"
        : "bg-positive";

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-xs text-muted">{usedText}</p>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-strong">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${(hasLimit ? ratio : 0) * 100}%` }}
        />
      </div>
      <div className="mt-1.5 flex items-baseline justify-between gap-3">
        <p className="text-xs text-faint">{limitText}</p>
        <p className="text-xs text-muted">{detail}</p>
      </div>
    </div>
  );
}

