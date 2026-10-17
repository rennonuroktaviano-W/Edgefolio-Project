import { Suspense } from "react";
import { PageHeader } from "@/components/app/page-header";
import { PanelSkeleton } from "@/components/app/skeleton";
import { RiskContent } from "@/components/app/risk/risk-content";

export const metadata = {
  title: "Risk Management — Edgefolio",
  description: "Drawdown, R-multiples, and position-sizing insight from your trades.",
};

export default function RiskPage() {
  return (
    <div>
      <PageHeader
        eyebrow="RISK MANAGEMENT"
        title="Protect the downside."
        description="Drawdown, risk per trade, and R-multiple distribution calculated from your own trades and stop losses."
      />

      <Suspense fallback={<PanelSkeleton height="h-96" />}>
        <RiskContent />
      </Suspense>
    </div>
  );
}
