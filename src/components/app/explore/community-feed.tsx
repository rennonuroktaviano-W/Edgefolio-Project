"use client";

import Link from "next/link";
import { Button } from "@/components/app/button";
import { SegmentedControl } from "@/components/app/form";
import { EmptyState } from "@/components/app/page-header";
import { SectionHeading } from "@/components/app/explore/explore-section";
import { CompassIcon, CommunityIcon } from "@/components/app/icons";
import { RecapCard } from "@/components/app/recaps/recap-card";
import { FeedSkeleton } from "@/components/app/skeleton";
import { EDITORIAL } from "@/lib/editorial/content";
import {
  useExploreFeed,
  type ExploreSort,
} from "@/components/app/explore/explore-feed-context";

export function CommunityFeed() {
  const { sort, setSort, recaps, loadedCount, loading, symbol, query } =
    useExploreFeed();

  const filtering = symbol !== null || query.trim().length > 0;

  return (
    <section aria-label="Community feed" className="space-y-4">
      <SectionHeading
        Icon={CommunityIcon}
        title="Community feed"
        description="Public recaps shared by traders."
        action={
          <div className="flex items-center gap-3">
            {loading && loadedCount > 0 ? (
              <span className="text-xs text-faint">Updating…</span>
            ) : null}
            <SegmentedControl<ExploreSort>
              label="Feed order"
              value={sort}
              onChange={setSort}
              options={[
                { value: "latest", label: "Latest" },
                { value: "discussed", label: "Most discussed" },
              ]}
            />
          </div>
        }
      />

      {loading && loadedCount === 0 ? (
        <FeedSkeleton />
      ) : recaps.length === 0 ? (
        <div className="soft-frame rounded-2xl bg-surface-raised p-6 sm:p-8">
          {filtering ? (
            <EmptyState
              Icon={CompassIcon}
              title="No matching recaps"
              description="No public recaps match your search or topic. Try a different symbol or clear the filter."
            />
          ) : (
            <>
              <EmptyState
                Icon={CompassIcon}
                title="No public recaps yet"
                description="When traders publish a recap, it shows up here. Be the first — write a journal entry and set it to public."
                action={
                  <Link href="/journal">
                    <Button variant="primary">Write a recap</Button>
                  </Link>
                }
              />
              {EDITORIAL.length > 0 ? (
                <div className="mt-6 border-t border-hairline pt-5">
                  <p className="text-xs font-semibold tracking-[0.22em] text-faint">
                    MEANWHILE
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {EDITORIAL.slice(0, 2).map((article) => (
                      <Link
                        key={article.slug}
                        href={`/explore/insights/${article.slug}`}
                        className="group rounded-xl border border-hairline bg-night/40 p-4 transition-colors hover:border-hairline-strong"
                      >
                        <p className="text-sm font-medium text-ink group-hover:text-violet-ink">
                          {article.title}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted">
                          {article.summary}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {recaps.map((recap) => (
            <RecapCard
              key={recap.id}
              recap={recap}
              detailHref={`/explore/${recap.id}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
