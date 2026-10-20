import type { TradeDirection } from "@/lib/trades/types";

export type TradeOutcome = "win" | "loss" | "breakeven";

export type JournalAttachment = {
  id: string;
  storagePath: string;
  // Signed URL for display; generated server-side and short-lived.
  url: string | null;
};

export type JournalEntry = {
  id: string;
  title: string;
  symbol: string | null;
  strategy: string | null;
  thesis: string | null;
  psychology: string | null;
  review: string | null;
  mood: string | null;
  tradeId: string | null;
  visibility: "private";
  entryDate: string;
  // Legacy reported-trade fields kept for existing rows.
  direction: TradeDirection | null;
  entryPrice: number | null;
  exitPrice: number | null;
  resultR: number | null;
  outcome: TradeOutcome | null;
  authorUsername: string | null;
  authorDisplayName: string | null;
  createdAt: string;
  updatedAt: string;
  attachments: JournalAttachment[];
};

export type JournalInput = {
  title: string;
  symbol: string | null;
  strategy: string | null;
  thesis: string | null;
  psychology: string | null;
  review: string | null;
  mood: string | null;
  tradeId: string | null;
  visibility: "private";
  entryDate: string;
  direction: TradeDirection | null;
  entryPrice: number | null;
  exitPrice: number | null;
  resultR: number | null;
  outcome: TradeOutcome | null;
};

export const TRADE_OUTCOMES: readonly TradeOutcome[] = [
  "win",
  "loss",
  "breakeven",
];

export function isTradeOutcome(value: unknown): value is TradeOutcome {
  return value === "win" || value === "loss" || value === "breakeven";
}
