"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SearchField } from "@/components/app/form";
import { Badge } from "@/components/app/badge";
import { EmptyState } from "@/components/app/page-header";
import { Button } from "@/components/app/button";
import { RecapCard } from "@/components/app/recaps/recap-card";
import { CommunityIcon } from "@/components/app/icons";
import type { Recap } from "@/lib/journal/types";
import { formatR } from "@/lib/trading/format";

type AuthorSummary = {
  username: string;
  displayName: string | null;
  recaps: number;
  totalR: number;
};

export function CommunityView({ recaps }: { recaps: Recap[] }) {
  const [query, setQuery] = useState("");

  const authors = useMemo<AuthorSummary[]>(() => {
    const map = new Map<string, AuthorSummary>();
    for (const recap of recaps) {
      if (!recap.authorUsername) continue;
      const row =
        map.get(recap.authorUsername) ??
        ({
          username: recap.authorUsername,
          displayName: recap.authorDisplayName,
          recaps: 0,
          totalR: 0,
        } satisfies AuthorSummary);
      row.recaps += 1;
      if (recap.resultR !== null) row.totalR += recap.resultR;
      map.set(recap.authorUsername, row);
    }
    return [...map.values()].sort((a, b) => b.totalR - a.totalR).slice(0, 8);
  }, [recaps]);

  const term = query.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!term) return recaps;
    return recaps.filter((recap) => {
      return [recap.title, recap.symbol, recap.authorUsername, recap.authorDisplayName]
        .filter(Boolean)
        .some((value) => (value as string).toLowerCase().includes(term));
    });
  }, [recaps, term]);

  return (
    <div className="space-y-6">
      <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
        <SearchField
          label=""
          placeholder="Search recaps by symbol, title, or trader"
          value={query}
          onChange={setQuery}
        />
        {authors.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-medium text-faint">Active traders</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {authors.map((author) => (
                <li key={author.username}>
                  <Link
                    href={`/community/${author.username}`}
                    className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1.5 text-xs text-muted transition-colors hover:border-accent/60 hover:text-ink"
                  >
                    <span className="font-medium text-ink">
                      {author.displayName ?? `@${author.username}`}
                    </span>
                    <Badge tone={author.totalR >= 0 ? "positive" : "negative"}>
                      {formatR(author.totalR)}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="soft-frame rounded-2xl bg-surface-raised p-6 sm:p-8">
          <EmptyState
            Icon={CommunityIcon}
            title={term ? "No matching recaps" : "The community is quiet"}
            description={
              term
                ? "Try a different symbol, title, or trader name."
                : "No public recaps have been shared yet. Publish a journal entry to start the conversation."
            }
            action={
              term ? undefined : (
                <Link href="/journal">
                  <Button variant="primary">Write a recap</Button>
                </Link>
              )
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((recap) => (
            <RecapCard
              key={recap.id}
              recap={recap}
              detailHref={`/explore/${recap.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
