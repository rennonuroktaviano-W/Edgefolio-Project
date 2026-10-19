import "server-only";

import type { EconomicEvent, EventImpact } from "@/lib/calendar/types";

// Economic calendar integration boundary.
//
// We read Forex Factory's public weekly calendar feed (hosted by Fair Economy)
// server-side, no API key. Only what the feed actually contains is shown —
// title, currency, impact, forecast, previous, and the real timestamp. If the
// feed is unreachable or malformed we return an empty list and the UI shows an
// honest empty state. Nothing is ever fabricated.

const DEFAULT_FEED_URL =
  "https://nfs.faireconomy.media/ff_calendar_thisweek.json";
const TIMEOUT_MS = 8000;
const REVALIDATE_SECONDS = 900;

const KNOWN_IMPACTS: readonly string[] = ["high", "medium", "low", "holiday"];

function toTextOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function toImpact(value: unknown): EventImpact {
  const raw = typeof value === "string" ? value.trim().toLowerCase() : "";
  return KNOWN_IMPACTS.includes(raw) ? (raw as EventImpact) : "low";
}

function toIsoOrNull(value: unknown): string | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export async function getEconomicEvents(): Promise<EconomicEvent[]> {
  const feedUrl =
    process.env.ECONOMIC_CALENDAR_URL?.trim() || DEFAULT_FEED_URL;

  let payload: unknown;
  try {
    const response = await fetch(feedUrl, {
      next: { revalidate: REVALIDATE_SECONDS, tags: ["economic-calendar"] },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { accept: "application/json" },
    });
    if (!response.ok) return [];
    payload = await response.json();
  } catch {
    return [];
  }

  if (!Array.isArray(payload)) return [];

  const events: EconomicEvent[] = [];
  for (const row of payload) {
    if (!row || typeof row !== "object") continue;
    const source = row as Record<string, unknown>;

    const title = toTextOrNull(source.title);
    const at = toIsoOrNull(source.date);
    if (!title || !at) continue;

    events.push({
      title,
      currency: (toTextOrNull(source.country) ?? "ALL").toUpperCase(),
      impact: toImpact(source.impact),
      at,
      forecast: toTextOrNull(source.forecast),
      previous: toTextOrNull(source.previous),
    });
  }

  events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  return events;
}
