import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";

type CalendarDay = { day: number; value: number };

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const weeks: (CalendarDay | null)[][] = [
  [null, null, { day: 1, value: 1.2 }, { day: 2, value: -0.8 }, { day: 3, value: 2.4 }],
  [
    { day: 6, value: 0.6 },
    { day: 7, value: -1.0 },
    { day: 8, value: 1.8 },
    { day: 9, value: 0.9 },
    { day: 10, value: -0.5 },
  ],
  [
    { day: 13, value: 2.1 },
    { day: 14, value: 0.4 },
    { day: 15, value: -1.2 },
    { day: 16, value: 1.5 },
    { day: 17, value: 0.7 },
  ],
  [
    { day: 20, value: -0.6 },
    { day: 21, value: 1.9 },
    { day: 22, value: 0.3 },
    { day: 23, value: -0.9 },
    { day: 24, value: 2.6 },
  ],
  [
    { day: 27, value: 0.8 },
    { day: 28, value: 1.1 },
    { day: 29, value: -0.4 },
    { day: 30, value: 1.4 },
    null,
  ],
];

const summary = [
  { label: "Net performance", value: "+14.3R", tone: "positive" as const },
  { label: "Green days", value: "15", tone: "default" as const },
  { label: "Red days", value: "7", tone: "default" as const },
  { label: "Best day", value: "+2.6R", tone: "positive" as const },
];

function formatResult(value: number) {
  return `${value >= 0 ? "+" : "−"}${Math.abs(value).toFixed(1)}R`;
}

export function TradingCalendar() {
  return (
    <section
      id="calendar"
      aria-labelledby="calendar-heading"
      className="relative px-6 pb-24 md:pb-32"
    >
      <Reveal className="mx-auto max-w-3xl">
        <SectionHeading
          headingId="calendar-heading"
          eyebrow="TRADING CALENDAR"
          title="See Your Trading Performance at a Glance."
          description="Review your trading activity over time and identify patterns across your trading days."
        />
      </Reveal>

      <Reveal className="mx-auto mt-12 max-w-5xl" delay={120}>
        <div className="mockup-frame overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between px-5 py-3.5">
            <p className="text-sm font-medium text-ink">March 2026</p>
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

          <div className="p-4 sm:p-6">
            <table className="w-full table-fixed border-separate border-spacing-1.5 sm:border-spacing-2">
              <caption className="sr-only">
                Illustrative monthly trading calendar with example daily
                results measured in R multiples.
              </caption>
              <thead>
                <tr className="text-[0.7rem] font-medium text-muted">
                  {weekdays.map((weekday) => (
                    <th key={weekday} scope="col" className="pb-2 text-left">
                      <span className="pl-1 sm:pl-2">{weekday}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week) => (
                  <tr key={week.find(Boolean)?.day}>
                    {week.map((cell, dayIndex) => (
                      <td
                        key={cell?.day ?? `blank-${dayIndex}`}
                        className="align-top"
                        aria-hidden={cell ? undefined : true}
                      >
                        {cell ? (
                          <div
                            className={`soft-frame flex h-full min-h-14 flex-col justify-between rounded-lg p-1.5 sm:min-h-20 sm:p-2.5 ${
                              cell.value >= 0
                                ? "bg-positive/10"
                                : "bg-negative/10"
                            }`}
                          >
                            <span className="text-[0.65rem] text-muted sm:text-xs">
                              {cell.day}
                            </span>
                            <span
                              className={`text-[0.7rem] font-medium tracking-tight sm:text-sm ${
                                cell.value >= 0
                                  ? "text-positive"
                                  : "text-negative"
                              }`}
                            >
                              {formatResult(cell.value)}
                            </span>
                          </div>
                        ) : null}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {summary.map((item) => (
                <div
                  key={item.label}
                  className="soft-frame rounded-xl bg-surface-raised p-4"
                >
                  <p className="text-xs text-muted">{item.label}</p>
                  <p
                    className={`mt-2 text-xl font-semibold tracking-tight sm:text-2xl ${
                      item.tone === "positive"
                        ? "text-positive"
                        : "text-ink"
                    }`}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal className="mx-auto mt-6 max-w-5xl text-center" delay={200}>
        <p className="text-xs text-muted">
          Illustrative sample data shown to preview the calendar. It does not
          represent real accounts or results.
        </p>
      </Reveal>
    </section>
  );
}
