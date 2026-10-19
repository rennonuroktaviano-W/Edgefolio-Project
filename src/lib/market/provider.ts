import "server-only";

import type { MarketQuote, MarketSnapshot } from "@/lib/market/types";
import { MARKET_INSTRUMENTS } from "@/lib/market/types";

// Market-data integration boundary.
//
// This module talks to a configured provider (default: Twelve Data) and
// normalizes the response into `MarketSnapshot`. It is deliberately OFF until
// `MARKET_DATA_API_KEY` is set, so the Explore "Market Pulse" renders an honest
// "not connected" state instead of fabricated quotes.
//
// The API key is read from a server-only env var and used in a server-side
// fetch. It is never sent to the browser. We never return placeholder values:
// any failure yields a typed error and the UI falls back to "not connected".

const DEFAULT_BASE_URL = "https://api.twelvedata.com";
const REVALIDATE_SECONDS = 60;
const TIMEOUT_MS = 8000;

// Map the UI instrument symbols to provider symbol ids.
const PROVIDER_SYMBOLS: Record<(typeof MARKET_INSTRUMENTS)[number], string> = {
  BTC: "BTC/USD",
  ETH: "ETH/USD",
  SOL: "SOL/USD",
  SPX: "SPX",
  NDX: "NDX",
  EURUSD: "EUR/USD",
  GOLD: "XAU/USD",
};

export type MarketDataResult =
  | { status: "ok"; snapshot: MarketSnapshot }
  | { status: "unconfigured" }
  | { status: "error"; message: string };

export function isMarketConfigured(): boolean {
  return Boolean(process.env.MARKET_DATA_API_KEY);
}

export function marketProviderName(): string | null {
  return process.env.MARKET_DATA_PROVIDER ?? null;
}

function baseUrl(): string {
  const raw = process.env.MARKET_DATA_BASE_URL?.trim();
  return raw ? raw.replace(/\/+$/, "") : DEFAULT_BASE_URL;
}

// Shape of a single Twelve Data quote. Every field is a string in the API.
type ProviderQuote = {
  symbol?: string;
  name?: string;
  currency?: string;
  close?: string;
  price?: string;
  percent_change?: string;
  volume?: string;
  status?: string;
  code?: number;
  message?: string;
};

function toNumber(value: string | undefined): number | null {
  if (value === undefined || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function getMarketData(): Promise<MarketDataResult> {
  const apiKey = process.env.MARKET_DATA_API_KEY?.trim();
  if (!apiKey) return { status: "unconfigured" };

  const symbols = MARKET_INSTRUMENTS.map((symbol) => PROVIDER_SYMBOLS[symbol]);
  const url = `${baseUrl()}/quote?symbol=${encodeURIComponent(
    symbols.join(","),
  )}&apikey=${encodeURIComponent(apiKey)}`;

  let payload: unknown;
  try {
    const response = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS, tags: ["market-pulse"] },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { accept: "application/json" },
    });
    if (!response.ok) {
      return {
        status: "error",
        message: `Market data provider responded with ${response.status}.`,
      };
    }
    payload = await response.json();
  } catch {
    return { status: "error", message: "Market data provider is unreachable." };
  }

  // A failed call returns a single error object rather than a map of quotes.
  if (
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    (payload as { status?: unknown }).status === "error"
  ) {
    return {
      status: "error",
      message: "Market data provider returned an error.",
    };
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { status: "error", message: "Unexpected provider response." };
  }

  const map = payload as Record<string, ProviderQuote>;
  const quotes: MarketQuote[] = [];

  for (const instrument of MARKET_INSTRUMENTS) {
    const raw = map[PROVIDER_SYMBOLS[instrument]];
    if (!raw || raw.status === "error") continue;
    const price = toNumber(raw.close) ?? toNumber(raw.price);
    if (price === null) continue;
    quotes.push({
      symbol: instrument,
      name: raw.name?.trim() || instrument,
      price,
      changePercent: toNumber(raw.percent_change),
      volume: toNumber(raw.volume),
      currency: raw.currency?.trim() || null,
    });
  }

  if (quotes.length === 0) {
    return { status: "error", message: "No quotes were returned." };
  }

  return {
    status: "ok",
    snapshot: {
      source: marketProviderName() ?? "Twelve Data",
      updatedAt: new Date().toISOString(),
      quotes,
    },
  };
}

// Server-component helper. Returns null unless a real snapshot was fetched.
export async function getMarketSnapshot(): Promise<MarketSnapshot | null> {
  const result = await getMarketData();
  return result.status === "ok" ? result.snapshot : null;
}
