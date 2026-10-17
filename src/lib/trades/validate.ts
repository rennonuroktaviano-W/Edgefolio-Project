import type { TradeInput } from "@/lib/trades/types";
import { isTradeDirection, isTradeStatus } from "@/lib/trades/types";

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

  const status = body.status ?? "closed";
  if (!isTradeStatus(status)) {
    return { ok: false, error: "Choose open or closed.", field: "status" };
  }

  const entry = optionalNumber(body.entryPrice);
  if (!entry.ok || entry.value === null || entry.value < 0) {
    return { ok: false, error: "Enter a valid entry price.", field: "entryPrice" };
  }

  const quantity = optionalNumber(body.quantity);
  if (!quantity.ok || quantity.value === null || quantity.value <= 0) {
    return { ok: false, error: "Enter a quantity greater than 0.", field: "quantity" };
  }

  const stopLoss = optionalNumber(body.stopLoss);
  if (!stopLoss.ok || (stopLoss.value !== null && stopLoss.value < 0)) {
    return { ok: false, error: "Enter a valid stop loss.", field: "stopLoss" };
  }

  const takeProfit = optionalNumber(body.takeProfit);
  if (!takeProfit.ok || (takeProfit.value !== null && takeProfit.value < 0)) {
    return { ok: false, error: "Enter a valid take profit.", field: "takeProfit" };
  }

  const feesRaw = optionalNumber(body.fees);
  const fees = !feesRaw.ok || feesRaw.value === null ? 0 : feesRaw.value;
  if (fees < 0) {
    return { ok: false, error: "Fees cannot be negative.", field: "fees" };
  }

  let exitPrice: number | null = null;
  if (status === "closed") {
    const exit = optionalNumber(body.exitPrice);
    if (!exit.ok || exit.value === null || exit.value < 0) {
      return {
        ok: false,
        error: "A closed trade needs an exit price.",
        field: "exitPrice",
      };
    }
    exitPrice = exit.value;
  }

  const openedAt = isoOrNull(body.openedAt) ?? new Date().toISOString();
  const closedAt = status === "closed" ? isoOrNull(body.closedAt) ?? openedAt : null;

  return {
    ok: true,
    value: {
      symbol: symbol.toUpperCase(),
      direction,
      status,
      entryPrice: entry.value,
      exitPrice,
      quantity: quantity.value,
      stopLoss: stopLoss.value,
      takeProfit: takeProfit.value,
      fees,
      strategy: optionalString(body.strategy, 40),
      notes: optionalString(body.notes, 2000),
      openedAt,
      closedAt,
    },
  };
}
