import { Suspense } from "react";
import { PageHeader } from "@/components/app/page-header";
import { FeedSkeleton } from "@/components/app/skeleton";
import { SavedRecapsView } from "@/components/app/saved/saved-recaps-view";
import { listSavedRecaps } from "@/lib/recaps/queries";

export const metadata = {
  title: "Saved Recaps — Edgefolio",
  description: "Public recaps you have bookmarked.",
};

async function SavedData() {
  const recaps = await listSavedRecaps();
  return <SavedRecapsView recaps={recaps} />;
}

export default function SavedRecapsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="SAVED RECAPS"
        title="Your reading list."
        description="Recaps you bookmarked while browsing the community."
      />

      <div className="mt-8">
        <Suspense fallback={<FeedSkeleton />}>
          <SavedData />
        </Suspense>
      </div>
    </div>
  );
}
