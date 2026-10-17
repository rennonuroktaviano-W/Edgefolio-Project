import { FeaturePlaceholder } from "@/components/app/feature-placeholder";
import { CompassIcon } from "@/components/app/icons";

export const metadata = {
  title: "Explore — Edgefolio",
  description:
    "Public trade recaps, market information, and trading insights.",
};

export default function ExplorePage() {
  return (
    <FeaturePlaceholder
      eyebrow="EXPLORE"
      title="Discover public recaps and insights."
      description="Explore is where publicly shared trade recaps, market information, and trading insights will live."
      Icon={CompassIcon}
      points={[
        "Browse publicly shared trade recaps",
        "Market information and context",
        "Curated trading insights",
        "Save recaps to revisit later",
      ]}
    />
  );
}
