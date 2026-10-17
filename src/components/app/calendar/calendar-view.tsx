"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/app/button";
import { EmptyState } from "@/components/app/page-header";
import { CalendarIcon } from "@/components/app/icons";
import { deriveTrade } from "@/lib/analytics/metrics";
import type { Trade } from "@/lib/trades/types";
import { formatSignedMoney } from "@/lib/trading/format";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function CalendarView({
  trades,
  initialYear,
  initialMonth,
  todayIso,
}: {
  trades: Trade[];
  initialYear: number;
  initialMonth: number;
  todayIso: string;
}) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);

  const daily = useMemo(() => {
    const map = new Map<string, { netPnl: number; count: number }>();
    for (const trade of trades) {
      const derived = deriveTrade(trade);
      if (derived.realizedPnl === null) continue;
      const date = trade.closedAt ?? trade.openedAt;
      const key = date.slice(0, 10);
      const bucket = map.get(key) ?? { netPnl: 0, count: 0 };
      bucket.netPnl += derived.realizedPnl;
      bucket.count += 1;
      map.set(key, bucket);
    }
    return map;
  }, [trades]);

  const monthPrefix = `${year}-${pad(month + 1)}`;
  const monthStats = useMemo(() => {
    let netPnl = 0;
    let count = 0;
    for (const [key, value] of daily) {
      if (key.startsWith(monthPrefix)) {
        netPnl += value.netPnl;
        count += value.count;
      }
    }
    return { netPnl, count };
  }, [daily, monthPrefix]);

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function shift(delta: number) {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  if (trades.length === 0) {
    return (
      <div className="mt-8 soft-frame rounded-2xl bg-surface-raised p-6 sm:p-8">
        <EmptyState
          Icon={CalendarIcon}
          title="No calendar data yet"
          description="Your monthly P/L calendar is built from your closed trades. Log trades to populate it."
        />
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => shift(-1)}>
            Prev
          </Button>
          <span className="min-w-40 text-center text-sm font-medium text-ink">
            {MONTHS[month]} {year}
          </span>
          <Button size="sm" variant="secondary" onClick={() => shift(1)}>
            Next
          </Button>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted">
            {monthStats.count} trade{monthStats.count === 1 ? "" : "s"}
          </span>
          <span
            className={
              monthStats.netPnl >= 0 ? "text-positive" : "text-negative"
            }
          >
            {formatSignedMoney(monthStats.netPnl)}
          </span>
        </div>
      </div>

      <div className="soft-frame rounded-2xl bg-surface-raised p-3 sm:p-5">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="pb-1 text-center text-xs font-medium text-faint"
            >
              {day.slice(0, 1)}
            </div>
          ))}

          {cells.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} />;
            }
            const key = `${monthPrefix}-${pad(day)}`;
            const bucket = daily.get(key);
            const isToday = key === todayIso;

            return (
              <div
                key={key}
                className={`min-h-16 rounded-xl border p-2 text-left sm:min-h-20 ${
                  bucket
                    ? bucket.netPnl >= 0
                      ? "border-positive/30 bg-positive/5"
                      : "border-negative/30 bg-negative/5"
                    : "border-hairline bg-night/30"
                } ${isToday ? "ring-1 ring-accent/50" : ""}`}
              >
                <span className="text-xs text-faint">{day}</span>
                {bucket ? (
                  <div className="mt-1">
                    <p
                      className={`text-xs font-medium ${
                        bucket.netPnl >= 0 ? "text-positive" : "text-negative"
                      }`}
                    >
                      {formatSignedMoney(bucket.netPnl)}
                    </p>
                    <p className="text-[0.6rem] text-faint">
                      {bucket.count} trade{bucket.count === 1 ? "" : "s"}
                    </p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-faint">
        Days are grouped by the date each trade closed, in UTC.
      </p>
    </div>
  );
}
