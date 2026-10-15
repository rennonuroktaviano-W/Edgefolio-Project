import { Reveal } from "@/components/reveal";
import { Spotlight } from "@/components/spotlight";

const metrics = [
  { label: "Net performance", value: "+18.4R", tone: "positive" as const },
  { label: "Win rate", value: "58%", tone: "default" as const },
  { label: "Total trades", value: "128", tone: "default" as const },
  { label: "Avg. reward / risk", value: "1.9", tone: "default" as const },
];

const trades = [
  { symbol: "EURUSD", side: "Long", result: "+2.1R", win: true },
  { symbol: "BTCUSD", side: "Short", result: "-1.0R", win: false },
  { symbol: "NAS100", side: "Long", result: "+1.6R", win: true },
  { symbol: "XAUUSD", side: "Long", result: "+0.8R", win: true },
  { symbol: "GBPJPY", side: "Short", result: "-1.0R", win: false },
];

function EquityCurve() {
  const linePath =
    "M20,178 L60,168 L100,172 L140,150 L180,158 L220,132 L260,140 L300,112 L340,122 L380,96 L420,104 L460,78 L500,86 L540,60 L580,66 L620,42";
  const areaPath = `${linePath} L620,206 L20,206 Z`;

  return (
    <svg
      viewBox="0 0 640 220"
      role="img"
      aria-label="Demonstration equity curve trending upward over the last 90 days"
      className="h-full w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="equity-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.32" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[42, 82, 122, 162, 206].map((y) => (
        <line
          key={y}
          x1="20"
          x2="620"
          y1={y}
          y2={y}
          stroke="var(--color-hairline)"
          strokeWidth="1"
          strokeOpacity="0.6"
        />
      ))}

      <path className="equity-area" d={areaPath} fill="url(#equity-fill)" />
      <path
        className="equity-line"
        d={linePath}
        pathLength={1}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        className="equity-dot"
        cx="620"
        cy="42"
        r="4"
        fill="var(--color-accent)"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function ProductPreview() {
  return (
    <section
      id="preview"
      aria-labelledby="preview-heading"
      className="relative px-6 pb-24 md:pb-32"
    >
      <Reveal className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-medium tracking-[0.28em] text-accent">
          PRODUCT PREVIEW
        </p>
        <h2
          id="preview-heading"
          className="mt-4 text-balance text-3xl font-semibold tracking-tight text-ink sm:text-4xl"
        >
          A clearer view of your trading.
        </h2>
        <p className="mt-4 text-pretty text-base text-muted">
          Review performance at a glance with a journal built for deliberate
          decisions.
        </p>
      </Reveal>

      <Reveal className="mx-auto mt-12 max-w-5xl" delay={120}>
        <Spotlight className="mockup-frame overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-2" aria-hidden="true">
              <span className="h-3 w-3 rounded-full bg-hairline-strong" />
              <span className="h-3 w-3 rounded-full bg-hairline-strong" />
              <span className="h-3 w-3 rounded-full bg-hairline-strong" />
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-[0.7rem] font-medium tracking-wide text-muted">
              <span
                aria-hidden="true"
                className="animate-dot h-1.5 w-1.5 rounded-full bg-accent"
              />
              Demo data
            </span>
          </div>

          <div
            aria-hidden="true"
            className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
          />

          <div className="space-y-6 p-5 sm:p-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="soft-frame rounded-xl bg-surface-raised p-4 transition-transform duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_20px_45px_-24px_rgba(200,255,61,0.5)]"
                >
                  <p className="text-xs text-muted">{metric.label}</p>
                  <p
                    className={`mt-2 text-2xl font-semibold tracking-tight ${
                      metric.tone === "positive"
                        ? "text-positive"
                        : "text-ink"
                    }`}
                  >
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="soft-frame rounded-xl bg-surface-raised p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-ink">Equity curve</p>
                <p className="text-xs text-muted">Last 90 days</p>
              </div>
              <div className="mt-5 h-44 w-full sm:h-52">
                <EquityCurve />
              </div>
            </div>

            <div className="soft-frame overflow-hidden rounded-xl bg-surface-raised">
              <table className="w-full text-left">
                <caption className="sr-only">
                  Illustrative sample trades shown to preview the interface.
                </caption>
                <thead>
                  <tr className="text-xs text-muted">
                    <th scope="col" className="px-5 py-3 font-medium">
                      Symbol
                    </th>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Side
                    </th>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Result
                    </th>
                    <th scope="col" className="px-5 py-3 font-medium">
                      Outcome
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade) => (
                    <tr
                      key={trade.symbol}
                      className="transition-colors duration-200 hover:bg-white/[0.04]"
                    >
                      <td className="px-5 py-3.5 font-medium text-ink">
                        {trade.symbol}
                      </td>
                      <td className="px-5 py-3.5 text-muted">{trade.side}</td>
                      <td
                        className={`px-5 py-3.5 font-medium ${
                          trade.win ? "text-positive" : "text-negative"
                        }`}
                      >
                        {trade.result}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            trade.win ? "text-positive" : "text-negative"
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`h-1.5 w-1.5 rounded-full ${
                              trade.win ? "bg-positive" : "bg-negative"
                            }`}
                          />
                          {trade.win ? "Win" : "Loss"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Spotlight>
      </Reveal>

      <Reveal className="mx-auto mt-6 max-w-5xl text-center" delay={200}>
        <p className="text-xs text-muted">
          Illustrative sample data shown to preview the interface. It does not
          represent real accounts or results.
        </p>
      </Reveal>
    </section>
  );
}
