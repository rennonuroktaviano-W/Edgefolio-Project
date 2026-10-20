import type { TradeInput } from "@/lib/trades/types";
import {
  hasDigits,
  isTradeDirection,
  isTradeOutcome,
  quantityHasUnit,
} from "@/lib/trades/types";

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; field?: string };

const SYMBOL_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._/-]{0,23}$/;

function asRecord(payload: unknown): Record<string, unknown> {
  return payload && typeof payload === "object"
    ? (payload as Record<string, unknown>)
    : {};
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

function optionalString(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function isoOrNull(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function validateTrade(payload: unknown): ValidationResult<TradeInput> {
  const body = asRecord(payload);

  const symbol = typeof body.symbol === "string" ? body.symbol.trim() : "";
  if (!SYMBOL_PATTERN.test(symbol)) {
    return {
      ok: false,
      error: "Enter a valid symbol (letters, numbers, . _ / -).",
      field: "symbol",
    };
  }

  const direction = body.direction;
  if (!isTradeDirection(direction)) {
    return { ok: false, error: "Choose long or short.", field: "direction" };
  }

  const outcome = body.outcome;
  if (!isTradeOutcome(outcome)) {
    return { ok: false, error: "Choose win or lose.", field: "outcome" };
  }

  const quantity =
    typeof body.quantity === "string"
      ? body.quantity.trim().slice(0, 40)
      : typeof body.quantity === "number"
        ? String(body.quantity)
        : "";
  if (!quantity || !hasDigits(quantity) || !quantityHasUnit(quantity)) {
    return {
      ok: false,
      error: "Add a unit to the size, e.g. $100 or 0.5 SOL.",
      field: "quantity",
    };
  }

  const plannedRR = optionalNumber(body.plannedRR);
  if (!plannedRR.ok) {
    return { ok: false, error: "Enter a valid reward/risk.", field: "plannedRR" };
  }
  if (plannedRR.value !== null && (plannedRR.value <= 0 || plannedRR.value > 100)) {
    return {
      ok: false,
      error: "Reward/risk must be greater than 0 (e.g. 2 for 2:1).",
      field: "plannedRR",
    };
  }

  const openedAt = isoOrNull(body.openedAt) ?? new Date().toISOString();
  const closedAt = isoOrNull(body.closedAt) ?? openedAt;

  return {
    ok: true,
    value: {
      symbol: symbol.toUpperCase(),
      direction,
      quantity,
      plannedRR: plannedRR.value,
      outcome,
      strategy: optionalString(body.strategy, 40),
      notes: optionalString(body.notes, 2000),
      openedAt,
      closedAt,
    },
  };
}
