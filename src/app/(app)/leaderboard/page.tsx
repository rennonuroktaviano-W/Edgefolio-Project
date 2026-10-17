import { Suspense } from "react";
import { PageHeader } from "@/components/app/page-header";
import { PanelSkeleton } from "@/components/app/skeleton";
import { LeaderboardView } from "@/components/app/leaderboard/leaderboard-view";
import { getLeaderboard, type LeaderboardPeriod } from "@/lib/recaps/queries";

export const metadata = {
  title: "Leaderboard — Edgefolio",
  description: "Traders ranked by the results they publish in public recaps.",
};

async function LeaderboardData() {
  const periods: LeaderboardPeriod[] = ["all", "month", "week"];
  const results = await Promise.all(periods.map((period) => getLeaderboard(period)));

  const data = {
    all: results[0],
    month: results[1],
    week: results[2],
  };

  return <LeaderboardView data={data} />;
}

export default function LeaderboardPage() {
  return (
    <div>
      <PageHeader
        eyebrow="LEADERBOARD"
        title="Ranked by published results."
        description="A transparent ranking built only from what traders share publicly — no hidden data, no estimates."
      />

      <div className="mt-8">
        <Suspense fallback={<PanelSkeleton height="h-96" />}>
          <LeaderboardData />
        </Suspense>
      </div>
    </div>
  );
}
