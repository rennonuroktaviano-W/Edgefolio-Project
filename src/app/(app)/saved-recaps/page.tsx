import { FeaturePlaceholder } from "@/components/app/feature-placeholder";
import { SavedIcon } from "@/components/app/icons";

export const metadata = {
  title: "Saved Recaps — Edgefolio",
  description: "Bookmarked public trade recaps.",
};

export default function SavedRecapsPage() {
  return (
    <FeaturePlaceholder
      eyebrow="SAVED RECAPS"
      title="Bookmark recaps to revisit."
      description="Saved Recaps will hold the public trade recaps you bookmark from Explore and Community."
      Icon={SavedIcon}
      points={[
        "Bookmarked public recaps",
        "Revisit and reflect",
        "Organize by topic",
        "Only public recaps you saved",
      ]}
    />
  );
}
