import { Suspense } from "react";
import Link from "next/link";
import { PageHeader, EmptyState } from "@/components/app/page-header";
import { FeedSkeleton } from "@/components/app/skeleton";
import { StatCard } from "@/components/app/stat-card";
import { RecapCard } from "@/components/app/recaps/recap-card";
import { CommunityIcon } from "@/components/app/icons";
import { listPublicRecapsByAuthor } from "@/lib/recaps/queries";
import { formatPercent, formatR } from "@/lib/trading/format";

type Params = { params: Promise<{ username: string }> };

export const instant = false;

function initials(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "?";
}

async function ProfileData({ username }: { username: string }) {
  const { recaps, displayName } = await listPublicRecapsByAuthor(username);

  if (recaps.length === 0) {
    return (
      <div className="mt-8 soft-frame rounded-2xl bg-surface-raised p-6 sm:p-8">
        <EmptyState
          Icon={CommunityIcon}
          title={`No public recaps from @${username}`}
          description="This trader has not shared anything publicly yet."
          action={
            <Link href="/community" className="text-sm text-accent hover:underline">
              Back to Community
            </Link>
          }
        />
      </div>
    );
  }

  const rs = recaps
    .map((recap) => recap.resultR)
    .filter((value): value is number => value !== null);
  const totalR = rs.reduce((sum, value) => sum + value, 0);
  const wins = recaps.filter((recap) => recap.outcome === "win").length;
  const losses = recaps.filter((recap) => recap.outcome === "loss").length;
  const decided = wins + losses;
  const winRate = decided > 0 ? wins / decided : null;

  return (
    <div className="mt-8 space-y-6">
      <div className="soft-frame flex flex-col gap-4 rounded-2xl bg-surface-raised p-5 sm:flex-row sm:items-center sm:p-6">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-hairline bg-surface text-xl font-semibold text-accent">
          {initials(displayName ?? username)}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold tracking-tight text-ink">
            {displayName ?? `@${username}`}
          </h2>
          <p className="text-sm text-faint">@{username}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Public recaps" value={String(recaps.length)} hint="Shared with everyone" />
        <StatCard
          label="Reported R"
          value={formatR(totalR)}
          tone={totalR >= 0 ? "positive" : "negative"}
          hint="Sum of published results"
        />
        <StatCard
          label="Win rate"
          value={winRate === null ? "—" : formatPercent(winRate)}
          hint={`${wins}W / ${losses}L`}
        />
        <StatCard label="Average R" value={rs.length === 0 ? "—" : formatR(totalR / rs.length)} hint="Per published recap" />
      </div>

      <div className="space-y-4">
        {recaps.map((recap) => (
          <RecapCard
            key={recap.id}
            recap={recap}
            detailHref={`/explore/${recap.id}`}
          />
        ))}
      </div>
    </div>
  );
}

export default async function CommunityProfilePage({ params }: Params) {
  const { username } = await params;
  return (
    <div>
      <PageHeader
        eyebrow="TRADER"
        title={`@${username}`}
        description="Public recaps shared by this trader."
      />
      <Suspense fallback={<FeedSkeleton />}>
        <ProfileData username={username} />
      </Suspense>
    </div>
  );
}
