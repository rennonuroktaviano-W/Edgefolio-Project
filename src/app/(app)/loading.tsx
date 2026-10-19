import {
  CardsSkeleton,
  FeedSkeleton,
  PanelSkeleton,
} from "@/components/app/skeleton";

export default function AppLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Memuat halaman">
      <div className="space-y-4">
        <div className="h-3 w-24 animate-pulse rounded bg-surface-strong" />
        <div className="h-9 w-2/3 max-w-md animate-pulse rounded-lg bg-surface-strong" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded bg-surface-strong" />
      </div>

      <CardsSkeleton />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <FeedSkeleton />
        </div>
        <PanelSkeleton />
      </div>
    </div>
  );
}
