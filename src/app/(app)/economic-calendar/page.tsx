import { Suspense } from "react";
import { PageHeader } from "@/components/app/page-header";
import { PanelSkeleton } from "@/components/app/skeleton";
import { EconomicCalendarContent } from "@/components/app/economic-calendar/economic-calendar-content";

export const metadata = {
  title: "Kalender Ekonomi — Edgefolio",
  description:
    "Jadwal rilis data ekonomi High dan Medium berdampak ke USD, langsung dari feed Forex Factory.",
};

export default function EconomicCalendarPage() {
  return (
    <div>
      <PageHeader
        eyebrow="ECONOMIC CALENDAR"
        title="Event penggerak pasar minggu ini."
        description="Rilis data ekonomi berdampak tinggi dan sedang, lengkap dengan prediksi dan rilis sebelumnya."
      />

      <Suspense fallback={<PanelSkeleton height="h-96" />}>
        <EconomicCalendarContent />
      </Suspense>
    </div>
  );
}
