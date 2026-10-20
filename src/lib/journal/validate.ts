import { isTradeOutcome, type JournalInput } from "@/lib/journal/types";
import type { ValidationResult } from "@/lib/trades/validate";
import { isTradeDirection } from "@/lib/trades/types";

function asRecord(payload: unknown): Record<string, unknown> {
  return payload && typeof payload === "object"
    ? (payload as Record<string, unknown>)
    : {};
}

function optionalString(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function optionalNumber(
  value: unknown,
): { ok: true; value: number | null } | { ok: false } {
  if (value === null || value === undefined || value === "") {
    return { ok: true, value: null };
  }
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) return { ok: false };
  return { ok: true, value: parsed };
}

function dateOnly(value: unknown): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const parsed = typeof value === "string" ? new Date(value) : null;
  if (parsed && !Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

export function validateJournal(
  payload: unknown,
): ValidationResult<JournalInput> {
  const body = asRecord(payload);

  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (title.length < 2 || title.length > 120) {
    return {
      ok: false,
      error: "Give your entry a title between 2 and 120 characters.",
      field: "title",
    };
  }

  // Journal entries are always private; ignore any client-supplied visibility.
  const visibility = "private" as const;

  const directionRaw = body.direction;
  let direction: JournalInput["direction"] = null;
  if (directionRaw !== null && directionRaw !== undefined && directionRaw !== "") {
    if (!isTradeDirection(directionRaw)) {
      return { ok: false, error: "Direction must be long or short.", field: "direction" };
    }
    direction = directionRaw;
  }

  const outcomeRaw = body.outcome;
  let outcome: JournalInput["outcome"] = null;
  if (outcomeRaw !== null && outcomeRaw !== undefined && outcomeRaw !== "") {
    if (!isTradeOutcome(outcomeRaw)) {
      return { ok: false, error: "Invalid outcome.", field: "outcome" };
    }
    outcome = outcomeRaw;
  }

  const entryPrice = optionalNumber(body.entryPrice);
  const exitPrice = optionalNumber(body.exitPrice);
  const resultR = optionalNumber(body.resultR);
  if (!entryPrice.ok || !exitPrice.ok || !resultR.ok) {
    return { ok: false, error: "Reported prices must be numbers.", field: "entryPrice" };
  }

  return {
    ok: true,
    value: {
      title,
      symbol: optionalString(body.symbol, 24)?.toUpperCase() ?? null,
      strategy: optionalString(body.strategy, 40),
      thesis: optionalString(body.thesis, 4000),
      psychology: optionalString(body.psychology, 4000),
      review: optionalString(body.review, 4000),
      mood: optionalString(body.mood, 40),
      tradeId:
        typeof body.tradeId === "string" && body.tradeId.trim()
          ? body.tradeId.trim()
          : null,
      visibility,
      entryDate: dateOnly(body.entryDate),
      direction,
      entryPrice: entryPrice.value,
      exitPrice: exitPrice.value,
      resultR: resultR.value,
      outcome,
    },
  };
}
