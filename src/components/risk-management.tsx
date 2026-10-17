import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";

const metrics = [
  { label: "Risk-to-reward ratio", value: "1.9 : 1" },
  { label: "Max drawdown", value: "−6.4%", tone: "negative" as const },
  { label: "Risk per trade", value: "0.75%" },
  { label: "Avg. exposure", value: "2 days" },
];

const drawdowns = [1.2, 2.4, 1.8, 3.1, 2.2, 4.6, 3.4, 2.0, 5.1, 3.8, 2.6, 6.4];

const chartTop = 24;
const chartHeight = 140;
const barWidth = 28;
const barGap = 19.6;
const chartPadding = 24;
const peak = Math.max(...drawdowns);

function DrawdownChart() {
  return (
    <svg
      viewBox="0 0 600 190"
      role="img"
      aria-label="Illustrative drawdown chart across the last twelve weeks, ending in the deepest drawdown"
      className="h-full w-full"
      preserveAspectRatio="none"
    >
      <line
        x1={chartPadding}
        x2={600 - chartPadding}
        y1={chartTop}
        y2={chartTop}
        stroke="var(--color-hairline)"
        strokeWidth="1"
      />
      {drawdowns.map((value, index) => {
        const height = (value / peak) * chartHeight;
        const isPeak = value === peak;
        const x = chartPadding + index * (barWidth + barGap);

        return (
          <rect
            key={index}
            className="chart-bar"
            x={x}
            y={chartTop}
            width={barWidth}
            height={height}
            rx="4"
            fill={isPeak ? "var(--color-negative)" : "var(--color-muted)"}
            fillOpacity={isPeak ? 0.9 : 0.24}
            style={{ animationDelay: `${index * 45}ms` }}
          />
        );
      })}
    </svg>
  );
}

export function RiskManagement() {
  return (
    <section
      id="risk"
      aria-labelledby="risk-heading"
      className="relative px-6 pb-24 md:pb-32"
    >
      <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <SectionHeading
            align="left"
            headingId="risk-heading"
            eyebrow="RISK MANAGEMENT"
            title="Profit Tells a Story. Risk Tells the Rest."
            description="Review the risks behind your results and better understand how each trade contributes to your overall performance."
          />

          <dl className="mt-8 max-w-md">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="flex items-baseline justify-between gap-4 border-t border-hairline py-3.5"
              >
                <dt className="text-sm text-muted">{metric.label}</dt>
                <dd
                  className={`text-sm font-medium tracking-tight sm:text-base ${
                    metric.tone === "negative" ? "text-negative" : "text-ink"
                  }`}
                >
                  {metric.value}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={140}>
          <div className="soft-frame rounded-2xl bg-surface p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink">Drawdown</p>
              <p className="text-xs text-muted">Last 12 weeks</p>
            </div>
            <div className="mt-6 h-40 w-full sm:h-44">
              <DrawdownChart />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
