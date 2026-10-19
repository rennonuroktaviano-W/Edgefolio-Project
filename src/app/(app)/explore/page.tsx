import { Suspense } from "react";
import { io } from "next/cache";
import { getCurrentUser } from "@/lib/auth/dal";
import {
  discoverTraders,
  featuredRecap,
  listRecapsPage,
  topSymbols,
} from "@/lib/recaps/queries";
import {
  getMarketSnapshot,
  isMarketConfigured,
  marketProviderName,
} from "@/lib/market/provider";
import { ExploreFeedProvider } from "@/components/app/explore/explore-feed-context";
import { ExploreHeader } from "@/components/app/explore/explore-header";
import { MarketPulse } from "@/components/app/explore/market-pulse";
import { MarketNews } from "@/components/app/explore/market-news";
import { TrendingTopics } from "@/components/app/explore/trending-topics";
import { FeaturedRecap } from "@/components/app/explore/featured-recap";
import { CommunityFeed } from "@/components/app/explore/community-feed";
import { TradingIntelligence } from "@/components/app/explore/trading-intelligence";
import { DiscoverTraders } from "@/components/app/explore/discover-traders";
import { WeeklyReview } from "@/components/app/explore/weekly-review";
import { ExploreMore } from "@/components/app/explore/explore-more";
import { FeedSkeleton, PanelSkeleton } from "@/components/app/skeleton";

export const metadata = {
  title: "Explore — Edgefolio",
  description:
    "Public trade recaps, trending topics, traders to discover, and educational insights.",
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

  const [feed, symbols, featured, traders, snapshot] = await Promise.all([
    listRecapsPage({ sort: "latest" }),
    topSymbols(),
    featuredRecap(),
    discoverTraders(),
    getMarketSnapshot(),
  ]);

  const name = user?.displayName ?? user?.username ?? "trader";
  const greeting = `${greetingFor(new Date().getHours())}, ${name}. Here is what the community is sharing.`;
  const rangeLabel = weekRangeLabel(new Date());
  const source = isMarketConfigured()
    ? (marketProviderName() ?? "Connected provider")
    : null;

  return (
    <ExploreFeedProvider
      initialRecaps={feed.recaps}
      initialHasMore={feed.hasMore}
    >
      <ExploreHeader greeting={greeting} symbols={symbols} />

      <div className="mt-8 space-y-10">
        <MarketPulse
          initialSnapshot={snapshot}
          configured={isMarketConfigured()}
        />
        <MarketNews />
        <TrendingTopics symbols={symbols} />
        <FeaturedRecap recap={featured} />
        <CommunityFeed />
        <TradingIntelligence />
        <DiscoverTraders traders={traders} />
        <WeeklyReview rangeLabel={rangeLabel} source={source} />
        <ExploreMore />
      </div>
    </ExploreFeedProvider>
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
        <FeedSkeleton />
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
