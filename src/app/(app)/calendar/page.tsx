import { Suspense } from "react";
import { PageHeader } from "@/components/app/page-header";
import { PanelSkeleton } from "@/components/app/skeleton";
import { CalendarView } from "@/components/app/calendar/calendar-view";
import { listTrades } from "@/lib/trades/queries";

export const metadata = {
  title: "Calendar — Edgefolio",
  description: "Your monthly profit and loss calendar.",
};

async function CalendarData() {
  const trades = await listTrades();
  const now = new Date();
  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0",
  )}-${String(now.getDate()).padStart(2, "0")}`;
  return (
    <CalendarView
      trades={trades}
      initialYear={now.getFullYear()}
      initialMonth={now.getMonth()}
      todayIso={todayIso}
    />
  );
}

export default function CalendarPage() {
  return (
    <div>
      <PageHeader
        eyebrow="CALENDAR"
        title="Your month at a glance."
        description="See the days you traded and how each one closed, built from your own trade records."
      />

      <Suspense fallback={<PanelSkeleton height="h-96" />}>
        <CalendarData />
      </Suspense>
    </div>
  );
}
