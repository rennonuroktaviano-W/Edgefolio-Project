import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";

const steps = [
  {
    step: "01",
    title: "Upload",
    detail: "Add a statement or CSV export from your journal.",
  },
  {
    step: "02",
    title: "Review",
    detail: "Check that dates, prices, and results line up.",
  },
  {
    step: "03",
    title: "Import",
    detail: "Consolidate everything into one organized view.",
  },
];

const rows = [
  { date: "Mar 02", instrument: "EURUSD", entry: "1.0842", exit: "1.0871", pnl: 1.8 },
  { date: "Mar 03", instrument: "BTCUSD", entry: "61,240", exit: "60,980", pnl: -1.0 },
  { date: "Mar 05", instrument: "NAS100", entry: "17,860", exit: "17,924", pnl: 2.3 },
  { date: "Mar 06", instrument: "XAUUSD", entry: "2,158", exit: "2,151", pnl: -0.7 },
  { date: "Mar 09", instrument: "GBPJPY", entry: "189.42", exit: "190.10", pnl: 1.4 },
];

const csvPreview = `date,instrument,entry,exit,pnl
2026-03-02,EURUSD,1.0842,1.0871,+1.8
2026-03-03,BTCUSD,61240,60980,-1.0
2026-03-05,NAS100,17860,17924,+2.3
2026-03-06,XAUUSD,2158,2151,-0.7
2026-03-09,GBPJPY,189.42,190.10,+1.4`;

function FileIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11.5 2.5H6a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 6 17.5h8a1.5 1.5 0 0 0 1.5-1.5V6.5z" />
      <path d="M11.5 2.5V6.5H15.5" />
    </svg>
  );
}

function formatPnl(value: number) {
  return `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(1)}R`;
}

export function ImportHistory() {
  return (
    <section
      id="import"
      aria-labelledby="import-heading"
      className="relative px-6 pb-24 md:pb-32"
    >
      <Reveal className="mx-auto max-w-3xl">
        <SectionHeading
          headingId="import-heading"
          eyebrow="IMPORT YOUR HISTORY"
          title="Your Trading History. One Clear View."
          description="Bring your trading records together to make your review process more organized."
        />
      </Reveal>

      <Reveal className="mx-auto mt-12 max-w-5xl" delay={120}>
        <div className="mockup-frame overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between px-5 py-3.5">
            <div className="flex items-center gap-2" aria-hidden="true">
              <span className="h-3 w-3 rounded-full bg-hairline-strong" />
              <span className="h-3 w-3 rounded-full bg-hairline-strong" />
              <span className="h-3 w-3 rounded-full bg-hairline-strong" />
            </div>
          </div>

          <div
            aria-hidden="true"
            className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
          />

          <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
            <div className="soft-frame rounded-xl bg-surface-raised p-4">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent/10 text-accent"
                >
                  <FileIcon />
                </span>
                <p className="truncate text-sm font-medium text-ink">
                  trades-2026-03.csv
                </p>
                <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 text-[0.65rem] font-medium tracking-wide text-muted">
                  CSV
                </span>
              </div>
              <pre
                aria-hidden="true"
                className="mt-3 overflow-x-auto text-[0.65rem] leading-5 text-muted sm:text-xs"
              >
                {csvPreview}
              </pre>
            </div>

            <div className="soft-frame overflow-hidden rounded-xl bg-surface-raised">
              <table className="w-full text-left">
                <caption className="sr-only">
                  Illustrative preview of imported trades with date, instrument,
                  entry price, exit price, and result.
                </caption>
                <thead>
                  <tr className="text-xs text-muted">
                    <th scope="col" className="px-4 py-3 font-medium">
                      Date
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      Instrument
                    </th>
                    <th
                      scope="col"
                      className="hidden px-4 py-3 font-medium sm:table-cell"
                    >
                      Entry
                    </th>
                    <th
                      scope="col"
                      className="hidden px-4 py-3 font-medium sm:table-cell"
                    >
                      Exit
                    </th>
                    <th scope="col" className="px-4 py-3 font-medium">
                      P&amp;L
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={`${row.date}-${row.instrument}`}
                      className="border-t border-hairline transition-colors duration-200 hover:bg-white/[0.04]"
                    >
                      <td className="px-4 py-3 text-muted">{row.date}</td>
                      <td className="px-4 py-3 font-medium text-ink">
                        {row.instrument}
                      </td>
                      <td className="hidden px-4 py-3 text-muted sm:table-cell">
                        {row.entry}
                      </td>
                      <td className="hidden px-4 py-3 text-muted sm:table-cell">
                        {row.exit}
                      </td>
                      <td
                        className={`px-4 py-3 font-medium ${
                          row.pnl >= 0 ? "text-positive" : "text-negative"
                        }`}
                      >
                        {formatPnl(row.pnl)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
          />

          <ol className="grid gap-5 p-5 sm:grid-cols-3 sm:p-6">
            {steps.map((item) => (
              <li key={item.step} className="flex items-start gap-3">
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-semibold text-accent">
                  {item.step}
                </span>
                <div>
                  <p className="text-sm font-medium text-ink">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    {item.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Reveal>
    </section>
  );
}
