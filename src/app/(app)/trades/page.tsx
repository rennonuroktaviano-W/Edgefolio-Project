import { FeaturePlaceholder } from "@/components/app/feature-placeholder";
import { TradesIcon } from "@/components/app/icons";

export const metadata = {
  title: "Trades — Edgefolio",
  description: "Your transaction history and detailed trade records.",
};

export default function TradesPage() {
  return (
    <FeaturePlaceholder
      eyebrow="TRADES"
      title="Your full transaction history."
      description="Trades will list your transaction history and detailed records for each trade."
      Icon={TradesIcon}
      points={[
        "Transaction history",
        "Detailed trade records",
        "Import your trade history",
        "Filter and search",
      ]}
    />
  );
}
