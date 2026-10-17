import { Suspense } from "react";
import { PageHeader } from "@/components/app/page-header";
import { PanelSkeleton } from "@/components/app/skeleton";
import { DashboardContent } from "@/components/app/dashboard/dashboard-content";

export const metadata = {
  title: "My Dashboard — Edgefolio",
  description: "Your private performance statistics and equity curve.",
};

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        eyebrow="MY DASHBOARD"
        title="Your performance, privately."
        description="A private view of your statistics and equity curve, calculated from your own trades. Only you can see this page."
      />

      <Suspense fallback={<PanelSkeleton height="h-96" />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
