export type TradeDirection = "long" | "short";
export type TradeOutcome = "win" | "lose";

export type Trade = {
  id: string;
  symbol: string;
  direction: TradeDirection;
  // Free text carrying its unit ("$100", "0.5 SOL"); the number inside is
  // the $ risk for the trade.
  quantity: string;
  // Planned reward:risk multiple, e.g. 2 = reward 2x risk. Null when unset.
  plannedRR: number | null;
  outcome: TradeOutcome;
  strategy: string | null;
  notes: string | null;
  openedAt: string;
  closedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type TradeInput = {
  symbol: string;
  direction: TradeDirection;
  quantity: string;
  plannedRR: number | null;
  outcome: TradeOutcome;
  strategy: string | null;
  notes: string | null;
  openedAt: string;
  closedAt: string;
};

export const TRADE_DIRECTIONS: readonly TradeDirection[] = ["long", "short"];
export const TRADE_OUTCOMES: readonly TradeOutcome[] = ["win", "lose"];

export function isTradeDirection(value: unknown): value is TradeDirection {
  return value === "long" || value === "short";
}

export function isTradeOutcome(value: unknown): value is TradeOutcome {
  return value === "win" || value === "lose";
}

/**
 * Pull a number out of a free-text quantity such as "$100", "0.5 SOL",
 * "1.000.000", or "1,000.5". Returns 0 when no number can be found.
 */
export function parseQuantityNumber(value: string): number {
  let cleaned = value
    .trim()
    .replace(/,/g, ".")
    .replace(/[^0-9.]/g, "");

  const dots = cleaned.split(".").length - 1;
  if (dots > 1) {
    // Several dots: they are thousands separators ("1.000.000").
    cleaned = cleaned.replace(/\./g, "");
  } else if (cleaned.startsWith(".") && cleaned.length > 1) {
    // A leading dot is a decimal: ".5" -> 0.5.
    cleaned = `0${cleaned}`;
  }

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function hasDigits(value: string): boolean {
  return /[0-9]/.test(value);
}

/** True when the quantity carries a unit, e.g. "$100" or "0.5 SOL". */
export function quantityHasUnit(value: string): boolean {
  return /[^\d\s.,-]/.test(value);
}
