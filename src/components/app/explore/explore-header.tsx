"use client";

import Link from "next/link";
import { Button } from "@/components/app/button";
import { SearchField } from "@/components/app/form";
import { FlameIcon } from "@/components/app/icons";
import { useExploreFeed } from "@/components/app/explore/explore-feed-context";

export function ExploreHeader({
  greeting,
  symbols,
}: {
  greeting: string;
  symbols: { symbol: string; count: number }[];
}) {
  const { symbol, setSymbol, query, setQuery } = useExploreFeed();

  return (
    <header className="reveal">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.28em] text-accent">
            EXPLORE
          </p>
          <h1 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Discover public recaps.
          </h1>
          <p className="mt-2 text-sm text-muted">{greeting}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link href="/journal">
            <Button variant="primary">Share a recap</Button>
          </Link>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchField
          label="Search recaps"
          placeholder="Search by symbol, title, or trader"
          value={query}
          onChange={setQuery}
          className="sm:max-w-sm sm:flex-1"
        />

        {symbols.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs text-faint">
              <FlameIcon className="h-3.5 w-3.5" />
              Topics
            </span>
            <CategoryChip
              label="All"
              active={symbol === null}
              onClick={() => setSymbol(null)}
            />
            {symbols.slice(0, 6).map((item) => (
              <CategoryChip
                key={item.symbol}
                label={item.symbol}
                active={symbol === item.symbol}
                onClick={() =>
                  setSymbol(symbol === item.symbol ? null : item.symbol)
                }
              />
            ))}
          </div>
        ) : null}
      </div>
    </header>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-accent/40 bg-accent/10 text-accent"
          : "border-hairline bg-surface text-muted hover:border-hairline-strong hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}
