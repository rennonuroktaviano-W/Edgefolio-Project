import { FeaturePlaceholder } from "@/components/app/feature-placeholder";
import { LeaderboardIcon } from "@/components/app/icons";

export const metadata = {
  title: "Leaderboard — Edgefolio",
  description: "Transparent performance rankings with privacy controls.",
};

export default function LeaderboardPage() {
  return (
    <FeaturePlaceholder
      eyebrow="LEADERBOARD"
      title="Transparent performance rankings."
      description="Leaderboard will rank traders by verified, opt-in performance with clear privacy controls."
      Icon={LeaderboardIcon}
      points={[
        "Opt-in performance rankings",
        "Privacy controls for every trader",
        "Transparent ranking methodology",
        "No private data exposed",
      ]}
    />
  );
}
