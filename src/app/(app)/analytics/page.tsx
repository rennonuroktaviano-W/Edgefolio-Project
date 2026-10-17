import { Suspense } from "react";
import { PageHeader } from "@/components/app/page-header";
import { PanelSkeleton } from "@/components/app/skeleton";
import { AnalyticsContent } from "@/components/app/analytics/analytics-content";

export const metadata = {
  title: "Analytics — Edgefolio",
  description: "Performance analytics calculated from your own trades.",
};

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="ANALYTICS"
        title="See what your data says."
        description="Equity, profit factor, expectancy, drawdown, and performance by asset, strategy, and period — all computed from your own trade history."
      />

      <Suspense fallback={<PanelSkeleton height="h-96" />}>
        <AnalyticsContent />
      </Suspense>
    </div>
  );
}
