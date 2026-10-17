import { Suspense } from "react";
import { PageHeader } from "@/components/app/page-header";
import { PanelSkeleton } from "@/components/app/skeleton";
import { TradesView } from "@/components/app/trades/trades-view";
import { listTrades } from "@/lib/trades/queries";

export const metadata = {
  title: "Trades — Edgefolio",
  description: "Your private trade history and performance.",
};

async function TradesData() {
  const trades = await listTrades();
  return <TradesView trades={trades} />;
}

export default function TradesPage() {
  return (
    <div>
      <PageHeader
        eyebrow="TRADES"
        title="Your trade history."
        description="Log every trade to build a private record of your execution, results, and risk. Only you can see this data."
      />

      <Suspense fallback={<PanelSkeleton height="h-96" />}>
        <TradesData />
      </Suspense>
    </div>
  );
}
