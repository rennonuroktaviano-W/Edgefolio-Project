import { Suspense } from "react";
import { PageHeader } from "@/components/app/page-header";
import { FeedSkeleton } from "@/components/app/skeleton";
import { CommunityView } from "@/components/app/community/community-view";
import { listRecaps } from "@/lib/recaps/queries";

export const metadata = {
  title: "Community — Edgefolio",
  description: "Public trade recaps and the traders behind them.",
};

async function CommunityData() {
  const recaps = await listRecaps("latest");
  return <CommunityView recaps={recaps} />;
}

export default function CommunityPage() {
  return (
    <div>
      <PageHeader
        eyebrow="COMMUNITY"
        title="Trade in the open."
        description="Browse public recaps, follow traders, and join the discussion. Only what people choose to publish appears here."
      />

      <div className="mt-8">
        <Suspense fallback={<FeedSkeleton />}>
          <CommunityData />
        </Suspense>
      </div>
    </div>
  );
}
