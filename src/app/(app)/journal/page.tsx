import { Suspense } from "react";
import { PageHeader } from "@/components/app/page-header";
import { PanelSkeleton } from "@/components/app/skeleton";
import { JournalView } from "@/components/app/journal/journal-view";
import { listJournalEntries } from "@/lib/journal/queries";

export const metadata = {
  title: "Journal — Edgefolio",
  description: "Your private trading journal: thesis, psychology, and reviews.",
};

async function JournalData() {
  const entries = await listJournalEntries();
  return <JournalView entries={entries} />;
}

export default function JournalPage() {
  return (
    <div>
      <PageHeader
        eyebrow="JOURNAL"
        title="Document your edge."
        description="Capture the thesis, the psychology, and the lesson behind every trade. Entries stay private until you choose to share one."
      />

      <Suspense fallback={<PanelSkeleton height="h-96" />}>
        <JournalData />
      </Suspense>
    </div>
  );
}
