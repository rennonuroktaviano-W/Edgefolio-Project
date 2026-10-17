export type MarketQuote = {
  symbol: string;
  name: string;
  price: number;
  changePercent: number | null;
  volume: number | null;
  currency: string | null;
};

export type MarketSnapshot = {
  source: string;
  updatedAt: string;
  quotes: MarketQuote[];
};

// Instruments the Explore "Market Pulse" is designed to show once a provider is
// connected. Until then the UI renders an honest "not connected" state.
export const MARKET_INSTRUMENTS = [
  "BTC",
  "ETH",
  "SOL",
  "SPX",
  "NDX",
  "EURUSD",
  "GOLD",
] as const;
