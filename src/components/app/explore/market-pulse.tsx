"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TrendDownIcon, TrendUpIcon } from "@/components/app/icons";
import { SectionHeading } from "@/components/app/explore/explore-section";
import type { MarketSnapshot } from "@/lib/market/types";
import { MARKET_INSTRUMENTS } from "@/lib/market/types";
import { formatCompact, formatDateTime, formatPrice } from "@/lib/trading/format";

const REFRESH_MS = 60_000;

export function MarketPulse({
  initialSnapshot,
  configured,
}: {
  initialSnapshot: MarketSnapshot | null;
  configured: boolean;
}) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setRefreshing(true);
    try {
      const response = await fetch("/api/market/pulse", {
        cache: "no-store",
      });
      const body = (await response.json().catch(() => null)) as {
        snapshot?: MarketSnapshot;
        error?: string;
      } | null;
      if (!response.ok || !body?.snapshot) {
        setError(body?.error ?? "Live prices are unavailable right now.");
        return;
      }
      setSnapshot(body.snapshot);
      setError(null);
    } catch {
      setError("We could not reach the market data provider.");
    } finally {
      inFlight.current = false;
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!configured) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [configured, refresh]);

  useEffect(() => {
    if (!configured) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [configured, refresh]);

  return (
    <section aria-label="Market pulse" className="space-y-4">
      <SectionHeading
        Icon={TrendUpIcon}
        iconTone="info"
        title="Market pulse"
        description="A compact snapshot of the instruments you follow."
      />

      {!configured ? (
        <NotConnected />
      ) : snapshot ? (
        <SnapshotCard
          snapshot={snapshot}
          refreshing={refreshing}
          error={error}
          onRefresh={refresh}
        />
      ) : (
        <WaitingCard
          refreshing={refreshing}
          error={error}
          onRefresh={refresh}
        />
      )}
    </section>
  );
}

function StatusPill({
  tone,
  label,
}: {
  tone: "positive" | "warning";
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-xs text-muted">
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${
          tone === "positive" ? "bg-positive" : "bg-warning"
        }`}
      />
      {label}
    </span>
  );
}

function SnapshotCard({
  snapshot,
  refreshing,
  error,
  onRefresh,
}: {
  snapshot: MarketSnapshot;
  refreshing: boolean;
  error: string | null;
  onRefresh: () => void;
}) {
  return (
    <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-faint">
          Source: {snapshot.source} · updated{" "}
          <time dateTime={snapshot.updatedAt} suppressHydrationWarning>
            {formatDateTime(snapshot.updatedAt)}
          </time>
        </p>
        <div className="flex items-center gap-2">
          <StatusPill tone="positive" label="Live" />
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="rounded-full border border-hairline bg-surface px-3 py-1 text-xs font-medium text-muted transition-colors hover:border-hairline-strong hover:text-ink disabled:opacity-60"
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {error ? (
        <p className="mt-3 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
          {error} Showing the last successful update.
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {snapshot.quotes.map((quote) => {
          const up = (quote.changePercent ?? 0) >= 0;
          return (
            <div
              key={quote.symbol}
              className="rounded-xl border border-hairline bg-night/40 p-3.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-info">
                  {quote.symbol}
                </span>
                {quote.changePercent === null ? null : (
                  <span
                    className={`inline-flex items-center gap-1 text-xs ${
                      up ? "text-positive" : "text-negative"
                    }`}
                  >
                    {up ? (
                      <TrendUpIcon className="h-3.5 w-3.5" />
                    ) : (
                      <TrendDownIcon className="h-3.5 w-3.5" />
                    )}
                    {up ? "+" : ""}
                    {quote.changePercent.toFixed(2)}%
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-base font-semibold text-ink">
                {formatPrice(quote.price)}
                {quote.currency ? (
                  <span className="ml-1 text-xs font-normal text-faint">
                    {quote.currency}
                  </span>
                ) : null}
              </p>
              {quote.volume === null ? null : (
                <p className="mt-1 text-xs text-faint">
                  Vol {formatCompact(quote.volume)}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WaitingCard({
  refreshing,
  error,
  onRefresh,
}: {
  refreshing: boolean;
  error: string | null;
  onRefresh: () => void;
}) {
  return (
    <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink">
          {error ? "Market data unavailable" : "Connecting to market data…"}
        </p>
        <div className="flex items-center gap-2">
          <StatusPill tone="warning" label={error ? "Retrying" : "Loading"} />
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="rounded-full border border-hairline bg-surface px-3 py-1 text-xs font-medium text-muted transition-colors hover:border-hairline-strong hover:text-ink disabled:opacity-60"
          >
            {refreshing ? "Refreshing…" : "Try again"}
          </button>
        </div>
      </div>
      <p className="mt-3 text-sm text-muted">
        {error ??
          "Fetching the latest quotes. We only ever show real prices from the connected provider."}
      </p>
    </div>
  );
}

function NotConnected() {
  return (
    <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink">
          {MARKET_INSTRUMENTS.length} instruments ready
        </p>
        <StatusPill tone="warning" label="Not connected" />
      </div>
      <p className="mt-3 text-sm text-muted">
        Live prices are not connected yet, and we never show made-up quotes.
        When a market data provider is connected, a compact snapshot appears
        here.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MARKET_INSTRUMENTS.slice(0, 4).map((instrument) => (
          <div
            key={instrument}
            className="rounded-xl border border-dashed border-hairline bg-night/40 px-3 py-4 text-center"
          >
            <p className="text-xs text-faint">{instrument}</p>
            <p className="mt-1 text-sm text-faint">—</p>
          </div>
        ))}
      </div>
    </div>
  );
}
