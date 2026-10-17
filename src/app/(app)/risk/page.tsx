import { FeaturePlaceholder } from "@/components/app/feature-placeholder";
import { ShieldIcon } from "@/components/app/icons";

export const metadata = {
  title: "Risk Management — Edgefolio",
  description: "Position risk, risk/reward, drawdown, and loss limits.",
};

export default function RiskPage() {
  return (
    <FeaturePlaceholder
      eyebrow="RISK MANAGEMENT"
      title="Keep risk in check."
      description="Risk Management will cover position risk, risk/reward, drawdown, and loss limits."
      Icon={ShieldIcon}
      points={[
        "Position risk",
        "Risk/reward per trade",
        "Drawdown monitoring",
        "Loss limits and discipline rules",
      ]}
    />
  );
}
