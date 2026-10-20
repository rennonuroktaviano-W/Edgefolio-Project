import type { EquityPoint, PeriodBucket } from "@/lib/analytics/metrics";

// All charts are hand-rolled SVG/CSS so we add no charting dependency and stay
// on the existing Edgefolio palette.

export function EquityChart({ points }: { points: EquityPoint[] }) {
  if (points.length < 2) return null;

  const values = points.map((point) => point.value);
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const range = max - min || 1;

  const W = 600;
  const H = 200;
  const padX = 8;
  const padY = 16;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;

  const x = (index: number) =>
    padX + (index / (points.length - 1)) * innerW;
  const y = (value: number) => padY + ((max - value) / range) * innerH;

  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${x(index).toFixed(1)} ${y(point.value).toFixed(1)}`)
    .join(" ");

  const area = `${line} L${x(points.length - 1).toFixed(1)} ${y(min).toFixed(1)} L${x(0).toFixed(1)} ${y(min).toFixed(1)} Z`;

  const positive = values[values.length - 1] >= 0;
  const stroke = positive ? "var(--color-positive)" : "var(--color-negative)";
  const zeroY = y(0);

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="Equity curve of cumulative profit and loss"
        className="h-48 w-full sm:h-60"
      >
        <defs>
          <linearGradient id="equity-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>

        <line
          x1={padX}
          y1={zeroY}
          x2={W - padX}
          y2={zeroY}
          stroke="var(--color-hairline)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        <path d={area} fill="url(#equity-fill)" stroke="none" />
        <path
          d={line}
          fill="none"
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="mt-2 flex justify-between text-xs text-faint">
        <span>{points[0].date.slice(0, 10)}</span>
        <span>{points[points.length - 1].date.slice(0, 10)}</span>
      </div>
    </div>
  );
}

export function PeriodBars({
  buckets,
  labelFormatter,
}: {
  buckets: PeriodBucket[];
  labelFormatter?: (key: string) => string;
}) {
  if (buckets.length === 0) return null;

  const shown = [...buckets].reverse().slice(-14);
  const maxAbs = Math.max(
    ...shown.map((bucket) => Math.abs(bucket.netPnl)),
    1,
  );

  return (
    <div className="flex items-end gap-1.5" aria-hidden="true">
      {shown.map((bucket) => {
        const pct = Math.max(4, (Math.abs(bucket.netPnl) / maxAbs) * 100);
        const positive = bucket.netPnl >= 0;
        return (
          <div key={bucket.key} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex h-32 w-full items-end">
              <div
                className={`w-full rounded-t-md ${
                  positive ? "bg-positive/70" : "bg-negative/70"
                }`}
                style={{ height: `${pct}%` }}
                title={`${bucket.key}: ${bucket.netPnl}`}
              />
            </div>
            <span className="w-full truncate text-center text-[0.6rem] text-faint">
              {labelFormatter ? labelFormatter(bucket.key) : bucket.key.slice(-2)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function WinLossBar({ wins, losses }: { wins: number; losses: number }) {
  const total = wins + losses;
  if (total === 0) return null;

  const segments = [
    { value: wins, className: "bg-positive" },
    { value: losses, className: "bg-negative" },
  ];

  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full bg-surface-strong">
      {segments.map((segment, index) =>
        segment.value > 0 ? (
          <div
            key={index}
            className={segment.className}
            style={{ width: `${(segment.value / total) * 100}%` }}
          />
        ) : null,
      )}
    </div>
  );
}
