"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import type { Recap } from "@/lib/journal/types";

export type ExploreSort = "latest" | "discussed";

type ExploreFeedValue = {
  sort: ExploreSort;
  symbol: string | null;
  query: string;
  // Recaps after applying the client-side text search.
  recaps: Recap[];
  // Total recaps loaded (before the text search), used for pagination offsets.
  loadedCount: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  setSort: (sort: ExploreSort) => void;
  setSymbol: (symbol: string | null) => void;
  setQuery: (query: string) => void;
  loadMore: () => void;
};

const ExploreFeedContext = createContext<ExploreFeedValue | null>(null);

const PAGE_LIMIT = 6;

export function ExploreFeedProvider({
  initialRecaps,
  initialHasMore,
  initialSort = "latest",
  initialSymbol = null,
  children,
}: {
  initialRecaps: Recap[];
  initialHasMore: boolean;
  initialSort?: ExploreSort;
  initialSymbol?: string | null;
  children: ReactNode;
}) {
  const [sort, setSortState] = useState<ExploreSort>(initialSort);
  const [symbol, setSymbolState] = useState<string | null>(initialSymbol);
  const [query, setQueryState] = useState("");
  const [items, setItems] = useState<Recap[]>(initialRecaps);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef(0);

  const fetchPage = useCallback(
    async (
      nextSort: ExploreSort,
      nextSymbol: string | null,
      offset: number,
      replace: boolean,
    ) => {
      const token = ++requestRef.current;
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          sort: nextSort,
          offset: String(offset),
          limit: String(PAGE_LIMIT),
        });
        if (nextSymbol) params.set("symbol", nextSymbol);

        const response = await fetch(`/api/explore/feed?${params.toString()}`);
        if (!response.ok) throw new Error("request failed");
        const data = (await response.json()) as {
          recaps: Recap[];
          hasMore: boolean;
        };
        if (token !== requestRef.current) return;

        setItems((current) => {
          if (replace) return data.recaps;
          const seen = new Set(current.map((recap) => recap.id));
          return [
            ...current,
            ...data.recaps.filter((recap) => !seen.has(recap.id)),
          ];
        });
        setHasMore(data.hasMore);
      } catch {
        if (token === requestRef.current) {
          setError("Couldn't load recaps. Please try again.");
        }
      } finally {
        if (token === requestRef.current) setLoading(false);
      }
    },
    [],
  );

  const setSort = useCallback(
    (next: ExploreSort) => {
      setSortState(next);
      void fetchPage(next, symbol, 0, true);
    },
    [symbol, fetchPage],
  );

  const setSymbol = useCallback(
    (next: string | null) => {
      setSymbolState(next);
      void fetchPage(sort, next, 0, true);
    },
    [sort, fetchPage],
  );

  const setQuery = useCallback((next: string) => {
    setQueryState(next);
  }, []);

  const loadMore = useCallback(() => {
    if (loading) return;
    void fetchPage(sort, symbol, items.length, false);
  }, [loading, fetchPage, sort, symbol, items.length]);

  const recaps = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return items;
    return items.filter((recap) =>
      [
        recap.title,
        recap.symbol,
        recap.authorUsername,
        recap.authorDisplayName,
        recap.strategy,
      ]
        .filter(Boolean)
        .some((value) => (value as string).toLowerCase().includes(term)),
    );
  }, [items, query]);

  const value = useMemo<ExploreFeedValue>(
    () => ({
      sort,
      symbol,
      query,
      recaps,
      loadedCount: items.length,
      hasMore,
      loading,
      error,
      setSort,
      setSymbol,
      setQuery,
      loadMore,
    }),
    [
      sort,
      symbol,
      query,
      recaps,
      items.length,
      hasMore,
      loading,
      error,
      setSort,
      setSymbol,
      setQuery,
      loadMore,
    ],
  );

  return (
    <ExploreFeedContext.Provider value={value}>
      {children}
    </ExploreFeedContext.Provider>
  );
}

export function useExploreFeed(): ExploreFeedValue {
  const context = useContext(ExploreFeedContext);
  if (!context) {
    throw new Error("useExploreFeed must be used within ExploreFeedProvider");
  }
  return context;
}
