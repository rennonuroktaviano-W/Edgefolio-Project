import { TrendDownIcon, TrendUpIcon } from "@/components/app/icons";
import { SectionHeading } from "@/components/app/explore/explore-section";
import type { MarketSnapshot } from "@/lib/market/types";
import { MARKET_INSTRUMENTS } from "@/lib/market/types";
import { formatCompact, formatPrice } from "@/lib/trading/format";

export function MarketPulse({ snapshot }: { snapshot: MarketSnapshot | null }) {
  return (
    <section aria-label="Market pulse" className="space-y-4">
      <SectionHeading
        Icon={TrendUpIcon}
        iconTone="info"
        title="Market pulse"
        description="A compact snapshot of the instruments you follow."
      />

      {snapshot ? (
        <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-faint">
              Source: {snapshot.source} · updated{" "}
              {new Date(snapshot.updatedAt).toLocaleString()}
            </p>
          </div>
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
      ) : (
        <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-ink">
              {MARKET_INSTRUMENTS.length} instruments ready
            </p>
            <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-xs text-muted">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-warning"
              />
              Not connected
            </span>
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
      )}
    </section>
  );
}
