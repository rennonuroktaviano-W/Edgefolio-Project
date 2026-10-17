"use client";

import { useMemo, useState } from "react";
import { Reveal } from "@/components/reveal";
import { Select, type SelectOption } from "@/components/app/select";
import { SearchIcon, TrendDownIcon, TrendUpIcon } from "@/components/app/icons";

type Tone = "default" | "positive" | "negative";

type Trade = {
  symbol: string;
  side: "Long" | "Short";
  result: string;
  pnl: number;
  win: boolean;
  date: string;
};

type Range = "7d" | "30d" | "90d";

const RANGE_OPTIONS: SelectOption[] = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

const SIDE_OPTIONS: SelectOption[] = [
  { value: "all", label: "All sides" },
  { value: "long", label: "Long only" },
  { value: "short", label: "Short only" },
];

const metrics: {
  label: string;
  value: string;
  tone: Tone;
  delta: string;
  deltaTone: Tone;
}[] = [
  {
    label: "Net performance",
    value: "+18.4R",
    tone: "positive",
    delta: "+2.1R",
    deltaTone: "positive",
  },
  {
    label: "Win rate",
    value: "58%",
    tone: "default",
    delta: "+3.4%",
    deltaTone: "positive",
  },
  {
    label: "Total trades",
    value: "128",
    tone: "default",
    delta: "+12",
    deltaTone: "positive",
  },
  {
    label: "Avg. reward / risk",
    value: "1.9",
    tone: "default",
    delta: "−0.1",
    deltaTone: "negative",
  },
];

const EQUITY: Record<
  Range,
  { line: string; caption: string; net: string; netTone: Tone }
> = {
  "7d": {
    line: "M20,150 L80,138 L140,160 L200,120 L260,132 L320,96 L380,110 L440,72 L500,84 L560,54 L620,60",
    caption: "Last 7 days",
    net: "+4.2R",
    netTone: "positive",
  },
  "30d": {
    line: "M20,166 L60,150 L100,158 L140,132 L180,142 L220,112 L260,124 L300,96 L340,108 L380,80 L420,92 L460,64 L500,74 L540,52 L580,60 L620,44",
    caption: "Last 30 days",
    net: "+11.6R",
    netTone: "positive",
  },
  "90d": {
    line: "M20,178 L60,168 L100,172 L140,150 L180,158 L220,132 L260,140 L300,112 L340,122 L380,96 L420,104 L460,78 L500,86 L540,60 L580,66 L620,42",
    caption: "Last 90 days",
    net: "+18.4R",
    netTone: "positive",
  },
};

const TRADES: Trade[] = [
  { symbol: "EURUSD", side: "Long", result: "+2.1R", pnl: 2.1, win: true, date: "Mar 02" },
  { symbol: "BTCUSD", side: "Short", result: "−1.0R", pnl: -1, win: false, date: "Mar 03" },
  { symbol: "NAS100", side: "Long", result: "+1.6R", pnl: 1.6, win: true, date: "Mar 05" },
  { symbol: "XAUUSD", side: "Long", result: "+0.8R", pnl: 0.8, win: true, date: "Mar 06" },
  { symbol: "GBPJPY", side: "Short", result: "−1.0R", pnl: -1, win: false, date: "Mar 09" },
  { symbol: "EURUSD", side: "Short", result: "+1.4R", pnl: 1.4, win: true, date: "Mar 10" },
  { symbol: "USDCAD", side: "Long", result: "−0.6R", pnl: -0.6, win: false, date: "Mar 11" },
  { symbol: "NAS100", side: "Short", result: "+2.4R", pnl: 2.4, win: true, date: "Mar 12" },
  { symbol: "XAUUSD", side: "Short", result: "+0.5R", pnl: 0.5, win: true, date: "Mar 13" },
  { symbol: "BTCUSD", side: "Long", result: "−0.9R", pnl: -0.9, win: false, date: "Mar 16" },
];

const WIN_RATE = 0.58;
const WINS = 74;
const LOSSES = 54;

function toneClass(tone: Tone) {
  if (tone === "positive") return "text-positive";
  if (tone === "negative") return "text-negative";
  return "text-ink";
}

function EquityChart({ line }: { line: string }) {
  const area = `${line} L620,206 L20,206 Z`;

  return (
    <svg
      viewBox="0 0 640 220"
      role="img"
      aria-label="Demonstration equity curve for the selected period"
      className="h-full w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="explore-equity-fill" x1="0" y1="0" x2="0" y2="1">
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

      <path className="equity-area" d={area} fill="url(#explore-equity-fill)" />
      <path
        className="equity-line"
        d={line}
        pathLength={1}
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

function WinRateDonut() {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg
      viewBox="0 0 140 140"
      role="img"
      aria-label={`Win rate ${Math.round(WIN_RATE * 100)} percent: ${WINS} wins and ${LOSSES} losses out of ${WINS + LOSSES} trades`}
      className="h-36 w-36"
    >
      <circle
        cx="70"
        cy="70"
        r={radius}
        fill="none"
        stroke="var(--color-hairline)"
        strokeWidth="14"
      />
      <circle
        cx="70"
        cy="70"
        r={radius}
        fill="none"
        stroke="var(--color-positive)"
        strokeWidth="14"
        strokeLinecap="round"
        strokeDasharray={`${circumference * WIN_RATE} ${circumference}`}
        transform="rotate(-90 70 70)"
      />
    </svg>
  );
}

function exportCsv(rows: Trade[]) {
  const header = "date,symbol,side,result";
  const body = rows
    .map((row) => `${row.date},${row.symbol},${row.side},${row.result}`)
    .join("\n");
  const blob = new Blob([`${header}\n${body}`], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "edgefolio-demo-trades.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function ExploreDashboard() {
  const [range, setRange] = useState<Range>("90d");
  const [side, setSide] = useState("all");
  const [query, setQuery] = useState("");

  const filteredTrades = useMemo(() => {
    const search = query.trim().toUpperCase();
    return TRADES.filter((trade) => {
      const matchesSide =
        side === "all" || trade.side.toLowerCase() === side;
      const matchesQuery =
        search.length === 0 || trade.symbol.includes(search);
      return matchesSide && matchesQuery;
    });
  }, [side, query]);

  const equity = EQUITY[range];

  return (
    <div className="mt-8 space-y-6">
      <Reveal>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="soft-frame rounded-2xl bg-surface-raised p-4 transition-transform duration-300 ease-out hover:-translate-y-1 sm:p-5"
            >
              <p className="text-xs text-muted">{metric.label}</p>
              <p
                className={`mt-2 text-2xl font-semibold tracking-tight sm:text-3xl ${toneClass(
                  metric.tone,
                )}`}
              >
                {metric.value}
              </p>
              <p
                className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${toneClass(
                  metric.deltaTone,
                )}`}
              >
                {metric.deltaTone === "negative" ? (
                  <TrendDownIcon className="h-3.5 w-3.5" />
                ) : (
                  <TrendUpIcon className="h-3.5 w-3.5" />
                )}
                {metric.delta}
                <span className="text-faint">vs prev.</span>
              </p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={80}>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6 lg:col-span-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-ink">Equity curve</p>
                <p className="mt-1 text-xs text-muted">
                  Cumulative R multiples · {equity.caption}
                </p>
              </div>
              <Select
                value={range}
                onChange={(value) => setRange(value as Range)}
                options={RANGE_OPTIONS}
                label="Select time range"
                className="w-40"
              />
            </div>

            <div className="mt-6 h-48 w-full sm:h-60">
              <EquityChart key={range} line={equity.line} />
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-hairline pt-4">
              <span className="text-xs text-muted">Net for period</span>
              <span
                className={`text-sm font-semibold tracking-tight ${toneClass(
                  equity.netTone,
                )}`}
              >
                {equity.net}
              </span>
            </div>
          </div>

          <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
            <p className="text-sm font-medium text-ink">Performance breakdown</p>
            <p className="mt-1 text-xs text-muted">Wins vs losses</p>

            <div className="mt-6 flex justify-center">
              <div className="relative grid place-items-center">
                <WinRateDonut />
                <div className="absolute text-center">
                  <p className="text-2xl font-semibold tracking-tight text-ink">
                    {Math.round(WIN_RATE * 100)}%
                  </p>
                  <p className="text-[0.7rem] uppercase tracking-widest text-faint">
                    Win rate
                  </p>
                </div>
              </div>
            </div>

            <dl className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <dt className="inline-flex items-center gap-2 text-sm text-muted">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full bg-positive"
                  />
                  Wins
                </dt>
                <dd className="text-sm font-medium text-ink">{WINS}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="inline-flex items-center gap-2 text-sm text-muted">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full bg-negative"
                  />
                  Losses
                </dt>
                <dd className="text-sm font-medium text-ink">{LOSSES}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-hairline pt-3">
                <dt className="text-sm text-muted">Avg. hold</dt>
                <dd className="text-sm font-medium text-ink">2.4 days</dd>
              </div>
            </dl>
          </div>
        </div>
      </Reveal>

      <Reveal delay={140}>
        <div className="soft-frame overflow-hidden rounded-2xl bg-surface-raised">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline p-5 sm:p-6">
            <div>
              <p className="text-sm font-medium text-ink">Recent trades</p>
              <p className="mt-1 text-xs text-muted">
                Showing {filteredTrades.length} of {TRADES.length} demo trades
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint">
                  <SearchIcon className="h-4 w-4" />
                </span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search symbol"
                  aria-label="Search trades by symbol"
                  className="w-full rounded-xl border border-hairline bg-night/60 py-2.5 pl-10 pr-3 text-sm text-ink outline-none transition-all duration-150 placeholder:text-faint focus:border-accent/70 focus:bg-night/80 focus:ring-2 focus:ring-accent/20 sm:w-52"
                />
              </div>

              <Select
                value={side}
                onChange={setSide}
                options={SIDE_OPTIONS}
                label="Filter by side"
                className="w-36"
              />

              <button
                type="button"
                onClick={() => exportCsv(filteredTrades)}
                disabled={filteredTrades.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-night transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left">
              <caption className="sr-only">
                Illustrative demo trades with date, symbol, side, and result.
              </caption>
              <thead>
                <tr className="text-xs text-muted">
                  <th scope="col" className="px-5 py-3 font-medium sm:px-6">
                    Symbol
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium sm:px-6">
                    Side
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium sm:px-6">
                    Date
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium sm:px-6">
                    Result
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium sm:px-6">
                    Outcome
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.map((trade) => (
                  <tr
                    key={`${trade.date}-${trade.symbol}-${trade.side}`}
                    className="border-t border-hairline transition-colors duration-200 hover:bg-white/[0.04]"
                  >
                    <td className="px-5 py-3.5 font-medium text-ink sm:px-6">
                      {trade.symbol}
                    </td>
                    <td className="px-5 py-3.5 text-muted sm:px-6">
                      {trade.side}
                    </td>
                    <td className="px-5 py-3.5 text-muted sm:px-6">
                      {trade.date}
                    </td>
                    <td
                      className={`px-5 py-3.5 font-medium sm:px-6 ${
                        trade.win ? "text-positive" : "text-negative"
                      }`}
                    >
                      {trade.result}
                    </td>
                    <td className="px-5 py-3.5 sm:px-6">
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

                {filteredTrades.length === 0 ? (
                  <tr className="border-t border-hairline">
                    <td
                      colSpan={5}
                      className="px-5 py-10 text-center text-sm text-muted sm:px-6"
                    >
                      No trades match your filters.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>

      <Reveal delay={180}>
        <p className="text-xs text-muted">
          Illustrative sample data shown to preview the interface. It does not
          represent real accounts or results.
        </p>
      </Reveal>
    </div>
  );
}
