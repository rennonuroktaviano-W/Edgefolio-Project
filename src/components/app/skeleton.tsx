export function PanelSkeleton({ height = "h-64" }: { height?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`soft-frame animate-pulse rounded-2xl bg-surface-raised ${height}`}
    />
  );
}

export function CardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="h-28 animate-pulse rounded-2xl bg-surface-raised"
        />
      ))}
    </div>
  );
}

export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="h-44 animate-pulse rounded-2xl bg-surface-raised"
        />
      ))}
    </div>
  );
}
