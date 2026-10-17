import { FeaturePlaceholder } from "@/components/app/feature-placeholder";
import { JournalIcon } from "@/components/app/icons";

export const metadata = {
  title: "Journal — Edgefolio",
  description:
    "Trade notes, entry thesis, emotions, screenshots, and post-trade reviews.",
};

export default function JournalPage() {
  return (
    <FeaturePlaceholder
      eyebrow="JOURNAL"
      title="Capture every trade decision."
      description="Journal will hold your trade notes, entry thesis, emotions, screenshots, and post-trade reviews."
      Icon={JournalIcon}
      points={[
        "Trade notes and entry thesis",
        "Emotions and mindset",
        "Screenshots",
        "Post-trade reviews",
        "Always private to you",
      ]}
    />
  );
}
