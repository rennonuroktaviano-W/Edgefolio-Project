"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/app/page-header";
import { Button } from "@/components/app/button";
import { RecapCard } from "@/components/app/recaps/recap-card";
import { SavedIcon } from "@/components/app/icons";
import type { Recap } from "@/lib/journal/types";

export function SavedRecapsView({ recaps }: { recaps: Recap[] }) {
  const router = useRouter();

  if (recaps.length === 0) {
    return (
      <div className="soft-frame rounded-2xl bg-surface-raised p-6 sm:p-8">
        <EmptyState
          Icon={SavedIcon}
          title="No saved recaps"
          description="Bookmark recaps from Explore or Community and they will collect here for easy reference."
          action={
            <Link href="/explore">
              <Button variant="primary">Browse Explore</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recaps.map((recap) => (
        <RecapCard
          key={recap.id}
          recap={recap}
          detailHref={`/explore/${recap.id}`}
          onSavedChange={() => router.refresh()}
        />
      ))}
    </div>
  );
}
