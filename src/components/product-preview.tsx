const metrics = [
  { label: "Net performance", value: "+18.4R", tone: "accent" as const },
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
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.28" />
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
        />
      ))}

      <path d={areaPath} fill="url(#equity-fill)" />
      <path
        d={linePath}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
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
      className="px-6 pb-24 md:pb-32"
    >
      <div className="mx-auto max-w-3xl text-center">
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
      </div>

      <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-2xl border border-hairline bg-surface shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-3.5">
          <div className="flex items-center gap-2" aria-hidden="true">
            <span className="h-3 w-3 rounded-full bg-hairline-strong" />
            <span className="h-3 w-3 rounded-full bg-hairline-strong" />
            <span className="h-3 w-3 rounded-full bg-hairline-strong" />
          </div>
          <span className="rounded-full border border-hairline px-3 py-1 text-[0.7rem] font-medium tracking-wide text-muted">
            Demo data
          </span>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-xl border border-hairline bg-surface-raised p-4"
              >
                <p className="text-xs text-muted">{metric.label}</p>
                <p
                  className={`mt-2 text-2xl font-semibold tracking-tight ${
                    metric.tone === "accent" ? "text-accent" : "text-ink"
                  }`}
                >
                  {metric.value}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-hairline bg-surface-raised p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink">Equity curve</p>
              <p className="text-xs text-muted">Last 90 days</p>
            </div>
            <div className="mt-4 h-40 w-full sm:h-48">
              <EquityCurve />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-hairline bg-surface-raised">
            <table className="w-full min-w-[420px] border-collapse text-left text-sm">
              <caption className="sr-only">
                Recent trades, demonstration data
              </caption>
              <thead>
                <tr className="text-xs text-muted">
                  <th scope="col" className="px-5 py-3 font-medium">
                    Symbol
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    Direction
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
                  <tr key={trade.symbol} className="border-t border-hairline">
                    <td className="px-5 py-3 font-medium text-ink">
                      {trade.symbol}
                    </td>
                    <td className="px-5 py-3 text-muted">{trade.side}</td>
                    <td
                      className={`px-5 py-3 font-medium ${
                        trade.win ? "text-accent" : "text-ink"
                      }`}
                    >
                      {trade.result}
                    </td>
                    <td className="px-5 py-3 text-muted">
                      {trade.win ? "Win" : "Loss"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <p className="mx-auto mt-5 max-w-5xl text-center text-xs text-muted">
        Illustrative sample data shown to preview the interface. It does not
        represent real accounts or results.
      </p>
    </section>
  );
}
