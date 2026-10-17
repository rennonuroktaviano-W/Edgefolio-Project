import { FeaturePlaceholder } from "@/components/app/feature-placeholder";
import { CommunityIcon } from "@/components/app/icons";

export const metadata = {
  title: "Community — Edgefolio",
  description: "Publicly shared trading discussions and trader profiles.",
};

export default function CommunityPage() {
  return (
    <FeaturePlaceholder
      eyebrow="COMMUNITY"
      title="Learn from other traders."
      description="Community is where publicly shared trading discussions and trader profiles will live."
      Icon={CommunityIcon}
      points={[
        "Public trading discussions",
        "Trader profiles",
        "Follow topics and threads",
        "Share your own recaps when you opt in",
        "Private journal entries are never shown here",
      ]}
    />
  );
}
