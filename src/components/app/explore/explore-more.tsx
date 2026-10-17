"use client";

import { Button } from "@/components/app/button";
import { useExploreFeed } from "@/components/app/explore/explore-feed-context";

export function ExploreMore() {
  const { hasMore, loading, error, loadMore, loadedCount } = useExploreFeed();

  if (loadedCount === 0 && !hasMore && !error) {
    return null;
  }

  return (
    <section aria-label="Explore more">
      <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
        <div className="flex flex-col items-center gap-3 text-center">
          {error ? (
            <>
              <p className="text-sm text-negative">{error}</p>
              <Button variant="secondary" onClick={loadMore} loading={loading}>
                Try again
              </Button>
            </>
          ) : hasMore ? (
            <>
              <p className="text-xs text-faint">
                Showing {loadedCount}{" "}
                {loadedCount === 1 ? "recap" : "recaps"}
              </p>
              <Button variant="secondary" onClick={loadMore} loading={loading}>
                Load more recaps
              </Button>
            </>
          ) : (
            <p className="text-sm text-muted">
              That is every public recap for now. You have reached the end of
              the feed.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
