import "server-only";

import type { MarketSnapshot } from "@/lib/market/types";

// Market-data integration boundary.
//
// This module is deliberately OFF until a provider is configured, so the
// Explore "Market Pulse" can render an honest "not connected" state instead of
// fabricated quotes. There is no network call and no invented price here.
//
// To connect a provider:
//   1. Set MARKET_DATA_API_KEY (and optionally MARKET_DATA_BASE_URL).
//   2. Implement `getMarketSnapshot` to fetch and normalize a real response
//      into `MarketSnapshot`. Never return placeholder values.
//
// Until that ships, `getMarketSnapshot` returns null and the UI stays in the
// "not connected" state.

export function isMarketConfigured(): boolean {
  return Boolean(process.env.MARKET_DATA_API_KEY);
}

export function marketProviderName(): string | null {
  return process.env.MARKET_DATA_PROVIDER ?? null;
}

export async function getMarketSnapshot(): Promise<MarketSnapshot | null> {
  if (!isMarketConfigured()) return null;
  // Configured but no provider adapter is implemented yet. Return null rather
  // than showing stale or made-up numbers.
  return null;
}
