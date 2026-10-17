export type TradeDirection = "long" | "short";
export type TradeStatus = "open" | "closed";

export type Trade = {
  id: string;
  symbol: string;
  direction: TradeDirection;
  status: TradeStatus;
  entryPrice: number;
  exitPrice: number | null;
  quantity: number;
  stopLoss: number | null;
  takeProfit: number | null;
  fees: number;
  strategy: string | null;
  notes: string | null;
  openedAt: string;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TradeInput = {
  symbol: string;
  direction: TradeDirection;
  status: TradeStatus;
  entryPrice: number;
  exitPrice: number | null;
  quantity: number;
  stopLoss: number | null;
  takeProfit: number | null;
  fees: number;
  strategy: string | null;
  notes: string | null;
  openedAt: string;
  closedAt: string | null;
};

export const TRADE_DIRECTIONS: readonly TradeDirection[] = ["long", "short"];
export const TRADE_STATUSES: readonly TradeStatus[] = ["open", "closed"];

export function isTradeDirection(value: unknown): value is TradeDirection {
  return value === "long" || value === "short";
}

export function isTradeStatus(value: unknown): value is TradeStatus {
  return value === "open" || value === "closed";
}
