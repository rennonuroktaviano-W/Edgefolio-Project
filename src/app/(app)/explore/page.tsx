import { Suspense } from "react";
import { io } from "next/cache";
import { getCurrentUser } from "@/lib/auth/dal";
import {
  getMarketSnapshot,
  isMarketConfigured,
  marketProviderName,
} from "@/lib/market/provider";
import { ExploreHeader } from "@/components/app/explore/explore-header";
import { MarketPulse } from "@/components/app/explore/market-pulse";
import { MarketNews } from "@/components/app/explore/market-news";
import { TradingIntelligence } from "@/components/app/explore/trading-intelligence";
import { WeeklyReview } from "@/components/app/explore/weekly-review";
import { PanelSkeleton } from "@/components/app/skeleton";

export const metadata = {
  title: "Explore — Edgefolio",
  description: "Market pulse, news, and educational trading insights.",
};

function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// Monday-based coverage range for the weekly review, derived from the current
// date. No price history is implied or invented.
function weekRangeLabel(now: Date): string {
  const diffToMonday = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (value: Date) =>
    value.toLocaleDateString("en-US", {
      timeZone: "Asia/Jakarta",
      month: "short",
      day: "numeric",
    });
  return `${fmt(monday)} – ${fmt(sunday)}, ${sunday.getFullYear()}`;
}

async function ExploreContent() {
  await io();
  const user = await getCurrentUser();

  const snapshot = await getMarketSnapshot();

  const name = user?.displayName ?? user?.username ?? "trader";
  const greeting = `${greetingFor(new Date().getHours())}, ${name}. Here is your market briefing.`;
  const rangeLabel = weekRangeLabel(new Date());
  const source = isMarketConfigured()
    ? (marketProviderName() ?? "Connected provider")
    : null;

  return (
    <div>
      <ExploreHeader greeting={greeting} />

      <div className="mt-8 space-y-10">
        <MarketPulse
          initialSnapshot={snapshot}
          configured={isMarketConfigured()}
        />
        <MarketNews />
        <TradingIntelligence />
        <WeeklyReview rangeLabel={rangeLabel} source={source} />
      </div>
    </div>
  );
}

function ExploreSkeleton() {
  return (
    <div>
      <PanelSkeleton height="h-28" />
      <div className="mt-8 space-y-10">
        <PanelSkeleton height="h-48" />
        <PanelSkeleton height="h-32" />
        <PanelSkeleton height="h-72" />
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<ExploreSkeleton />}>
      <ExploreContent />
    </Suspense>
  );
}
