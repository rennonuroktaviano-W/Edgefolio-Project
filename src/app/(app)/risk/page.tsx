import { Suspense } from "react";
import { PageHeader } from "@/components/app/page-header";
import { PanelSkeleton } from "@/components/app/skeleton";
import { RiskContent } from "@/components/app/risk/risk-content";

export const metadata = {
  title: "Manajemen Risiko — Edgefolio",
  description: "Drawdown, R-multiple, dan insight sizing posisi dari trade kamu.",
};

export default function RiskPage() {
  return (
    <div>
      <PageHeader
        eyebrow="RISK MANAGEMENT"
        title="Kelola risiko dan batas aman."
        description="Drawdown, risk per trade, dan distribusi R-multiple dari trade kamu."
      />

      <Suspense fallback={<PanelSkeleton height="h-96" />}>
        <RiskContent />
      </Suspense>
    </div>
  );
}
