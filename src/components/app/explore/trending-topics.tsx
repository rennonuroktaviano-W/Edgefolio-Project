"use client";

import { FlameIcon } from "@/components/app/icons";
import { SectionHeading } from "@/components/app/explore/explore-section";
import { useExploreFeed } from "@/components/app/explore/explore-feed-context";

export function TrendingTopics({
  symbols,
}: {
  symbols: { symbol: string; count: number }[];
}) {
  const { symbol, setSymbol } = useExploreFeed();

  return (
    <section aria-label="Trending topics" className="space-y-4">
      <SectionHeading
        Icon={FlameIcon}
        title="Trending topics"
        description="Symbols shared most often in public recaps — derived from real posts, never from invented engagement."
      />

      <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
        {symbols.length === 0 ? (
          <p className="text-sm text-muted">
            No symbols have been published in public recaps yet. Share one to
            start a topic.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {symbols.map((item) => {
              const active = symbol === item.symbol;
              return (
                <li key={item.symbol}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      setSymbol(active ? null : item.symbol)
                    }
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "border-accent/40 bg-accent/10 text-accent"
                        : "border-hairline bg-surface text-muted hover:border-hairline-strong hover:text-ink"
                    }`}
                  >
                    <span className="text-ink">{item.symbol}</span>
                    <span
                      className={`rounded-full px-1.5 text-[0.65rem] ${
                        active
                          ? "bg-accent/15 text-accent"
                          : "bg-night/60 text-faint"
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
