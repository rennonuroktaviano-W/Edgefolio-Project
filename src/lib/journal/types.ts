import type { TradeDirection } from "@/lib/trades/types";

export type JournalVisibility = "private" | "public";
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
  visibility: JournalVisibility;
  entryDate: string;
  // Author-reported, optionally-published recap details.
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
  visibility: JournalVisibility;
  entryDate: string;
  direction: TradeDirection | null;
  entryPrice: number | null;
  exitPrice: number | null;
  resultR: number | null;
  outcome: TradeOutcome | null;
};

export type RecapComment = {
  id: string;
  authorUsername: string | null;
  authorDisplayName: string | null;
  body: string;
  createdAt: string;
  isMine: boolean;
};

// A recap is a public journal entry plus real engagement. No fabricated counts.
export type Recap = JournalEntry & {
  likeCount: number;
  commentCount: number;
  savedCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
  isMine: boolean;
};

export const JOURNAL_VISIBILITIES: readonly JournalVisibility[] = [
  "private",
  "public",
];

export const TRADE_OUTCOMES: readonly TradeOutcome[] = [
  "win",
  "loss",
  "breakeven",
];

export function isJournalVisibility(
  value: unknown,
): value is JournalVisibility {
  return value === "private" || value === "public";
}

export function isTradeOutcome(value: unknown): value is TradeOutcome {
  return value === "win" || value === "loss" || value === "breakeven";
}
