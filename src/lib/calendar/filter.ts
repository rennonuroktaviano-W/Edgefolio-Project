import type { EconomicEvent, EventImpact } from "@/lib/calendar/types";

// Shared, isomorphic helpers for the economic calendar. This module is imported
// by a client component, so it must never pull in "server-only".

export type CurrencyScope = "USD" | "ALL";
export type ImpactScope = "core" | "all";

// Every date in this module is rendered on the server (UTC) and read back by
// the browser (the viewer's machine). Without a pinned zone the calendar day,
// the day groups and the printed times would disagree between the two, which
// React reports as a hydration mismatch. Everything below therefore renders in
// Asia/Jakarta on both sides.
const TIME_ZONE = "Asia/Jakarta";

export const CORE_IMPACTS: readonly EventImpact[] = ["high", "medium"];
export const ALL_IMPACTS: readonly EventImpact[] = [
  "high",
  "medium",
  "low",
  "holiday",
];

export function impactsFor(scope: ImpactScope): readonly EventImpact[] {
  return scope === "core" ? CORE_IMPACTS : ALL_IMPACTS;
}

export function filterEvents(
  events: EconomicEvent[],
  currency: CurrencyScope,
  scope: ImpactScope,
): EconomicEvent[] {
  const impacts = impactsFor(scope);
  return events.filter((event) => {
    if (currency !== "ALL" && event.currency !== currency) return false;
    return impacts.includes(event.impact);
  });
}

// Calendar day in Asia/Jakarta (YYYY-MM-DD, sortable) — built with a pinned
// zone rather than getDate()/getMonth(), which resolve in the local zone.
const KEY_FORMAT = new Intl.DateTimeFormat("sv-SE", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function dayKey(date: Date): string {
  return KEY_FORMAT.format(date);
}

const DAY_FORMAT = new Intl.DateTimeFormat("id-ID", {
  timeZone: TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const TIME_FORMAT = new Intl.DateTimeFormat("id-ID", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
});

export function formatEventTime(iso: string): string {
  return TIME_FORMAT.format(new Date(iso));
}

export type DayGroup = {
  key: string;
  label: string;
  events: EconomicEvent[];
};

export function groupByDay(events: EconomicEvent[]): DayGroup[] {
  const groups = new Map<string, DayGroup>();

  for (const event of events) {
    const date = new Date(event.at);
    const key = dayKey(date);
    const group = groups.get(key) ?? {
      key,
      label: DAY_FORMAT.format(date),
      events: [],
    };
    group.events.push(event);
    groups.set(key, group);
  }

  const list = [...groups.values()];
  for (const group of list) {
    group.events.sort(
      (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
    );
  }
  return list.sort((a, b) => a.key.localeCompare(b.key));
}

// "dalam 2 hari 5 jam" / "dalam 4 jam 12 menit" / "dalam 7 menit".
export function countdownLabel(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);

  if (days > 0) return `dalam ${days} hari ${hours} jam`;
  if (hours > 0) return `dalam ${hours} jam ${minutes} menit`;
  return `dalam ${Math.max(1, minutes)} menit`;
}
