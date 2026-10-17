"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SegmentedControl } from "@/components/app/form";
import { EmptyState } from "@/components/app/page-header";
import { Button } from "@/components/app/button";
import { RecapCard } from "@/components/app/recaps/recap-card";
import { CompassIcon } from "@/components/app/icons";
import type { Recap } from "@/lib/journal/types";

type FeedSort = "foryou" | "latest";

export function ExploreFeed({ recaps }: { recaps: Recap[] }) {
  const [sort, setSort] = useState<FeedSort>("foryou");

  const ordered = useMemo(() => {
    const copy = [...recaps];
    if (sort === "latest") {
      return copy.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    }
    return copy.sort((a, b) => {
      const scoreA = a.likeCount * 2 + a.commentCount * 3 + a.savedCount * 2;
      const scoreB = b.likeCount * 2 + b.commentCount * 3 + b.savedCount * 2;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return a.createdAt < b.createdAt ? 1 : -1;
    });
  }, [recaps, sort]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-ink">Public recaps</h2>
        <SegmentedControl
          label="Feed order"
          value={sort}
          onChange={setSort}
          options={[
            { value: "foryou", label: "For You" },
            { value: "latest", label: "Latest" },
          ]}
        />
      </div>

      {recaps.length === 0 ? (
        <div className="soft-frame rounded-2xl bg-surface-raised p-6 sm:p-8">
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
        </div>
      ) : (
        <div className="space-y-4">
          {ordered.map((recap) => (
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
