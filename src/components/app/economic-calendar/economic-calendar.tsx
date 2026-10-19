"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/app/badge";
import { SegmentedControl } from "@/components/app/form";
import { EmptyState } from "@/components/app/page-header";
import { CalendarIcon } from "@/components/app/icons";
import type { EconomicEvent, EventImpact } from "@/lib/calendar/types";
import {
  countdownLabel,
  dayKey,
  filterEvents,
  formatEventTime,
  groupByDay,
  type CurrencyScope,
  type ImpactScope,
} from "@/lib/calendar/filter";

const IMPACT_TONE: Record<EventImpact, "negative" | "warning" | "muted" | "violet"> =
  {
    high: "negative",
    medium: "warning",
    low: "muted",
    holiday: "violet",
  };

const IMPACT_LABEL: Record<EventImpact, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  holiday: "Holiday",
};

const REFRESH_MS = 30_000;

export function EconomicCalendar({ events }: { events: EconomicEvent[] }) {
  const [currency, setCurrency] = useState<CurrencyScope>("USD");
  const [scope, setScope] = useState<ImpactScope>("core");
  // Start as null so server render and hydration agree, then tick from the
  // browser: "now" only drives the live countdown and the "Hari ini" badge.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    // Kick off asynchronously so the first paint (and hydration) stays on the
    // server's null snapshot, then keep the countdown fresh from the browser.
    const kickoff = window.setTimeout(tick, 0);
    const interval = window.setInterval(tick, REFRESH_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(kickoff);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const filtered = useMemo(
    () => filterEvents(events, currency, scope),
    [events, currency, scope],
  );
  const days = useMemo(() => groupByDay(filtered), [filtered]);
  const feedEmpty = events.length === 0;

  const next = useMemo(() => {
    if (now === null) return null;
    return filtered.find((event) => new Date(event.at).getTime() > now) ?? null;
  }, [filtered, now]);

  const today = now === null ? null : dayKey(new Date(now));

  return (
    <div className="mt-8 space-y-6">
      <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ink">Kalender minggu ini</p>
            <p className="mt-1 text-xs text-muted">
              Data asli dari feed Forex Factory. Kami hanya menampilkan event
              yang benar-benar ada di sana.
            </p>
          </div>
          {next ? (
            <Badge tone="accent">
              {next.title} — {countdownLabel(new Date(next.at).getTime() - (now ?? 0))}
            </Badge>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <SegmentedControl
            label="Mata uang"
            value={currency}
            onChange={setCurrency}
            options={[
              { value: "USD", label: "USD" },
              { value: "ALL", label: "Semua" },
            ]}
          />
          <SegmentedControl
            label="Tingkat impact"
            value={scope}
            onChange={setScope}
            options={[
              { value: "core", label: "High + Medium" },
              { value: "all", label: "Semua" },
            ]}
          />
        </div>

        {!feedEmpty && next === null ? (
          <p className="mt-4 text-xs text-faint">
            Tidak ada event mendatang yang tersisa minggu ini.
          </p>
        ) : null}
      </div>

      {feedEmpty ? (
        <div className="soft-frame rounded-2xl bg-surface-raised p-6 sm:p-8">
          <EmptyState
            Icon={CalendarIcon}
            title="Kalender tidak tersedia saat ini"
            description="Feed tidak bisa dihubungi. Kami tidak pernah menampilkan event buatan, jadi bagian ini tetap kosong sampai datanya masuk."
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="soft-frame rounded-2xl bg-surface-raised p-6 sm:p-8">
          <EmptyState
            Icon={CalendarIcon}
            title="Tidak ada event sesuai filter"
            description="Coba ubah mata uang atau tingkat impact untuk melihat event lain minggu ini."
          />
        </div>
      ) : (
        days.map((day) => (
          <div
            key={day.key}
            className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-ink">{day.label}</p>
              {today === day.key ? <Badge tone="accent">Hari ini</Badge> : null}
            </div>

            <ul className="mt-4 space-y-2">
              {day.events.map((event) => {
                const timestamp = new Date(event.at).getTime();
                const past = now !== null && timestamp <= now;
                const details = [
                  event.forecast ? `Prediksi ${event.forecast}` : null,
                  event.previous ? `Sebelumnya ${event.previous}` : null,
                ].filter(Boolean) as string[];

                return (
                  <li
                    key={`${event.at}-${event.title}`}
                    className={`flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-hairline bg-night/40 px-3.5 py-3 ${
                      past ? "opacity-60" : ""
                    }`}
                  >
                    <span className="w-14 shrink-0 text-sm tabular-nums text-muted">
                      {formatEventTime(event.at)}
                    </span>
                    <Badge tone={IMPACT_TONE[event.impact]}>
                      {IMPACT_LABEL[event.impact]}
                    </Badge>
                    <span className="min-w-0 flex-1 text-sm text-ink">
                      {event.title}
                    </span>
                    <span className="shrink-0 text-xs font-medium text-faint">
                      {event.currency}
                    </span>
                    {details.length > 0 ? (
                      <span className="shrink-0 text-xs text-muted">
                        {details.join(" · ")}
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
