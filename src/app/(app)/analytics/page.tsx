import { FeaturePlaceholder } from "@/components/app/feature-placeholder";
import { AnalyticsIcon } from "@/components/app/icons";

export const metadata = {
  title: "Analytics — Edgefolio",
  description: "Performance breakdowns and strategy statistics.",
};

export default function AnalyticsPage() {
  return (
    <FeaturePlaceholder
      eyebrow="ANALYTICS"
      title="Break down your performance."
      description="Analytics will surface performance breakdowns and strategy statistics across your trades."
      Icon={AnalyticsIcon}
      points={[
        "Performance breakdowns",
        "Strategy statistics",
        "Compare setups and instruments",
        "Identify where your edge is",
      ]}
    />
  );
}
