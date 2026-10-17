import { Suspense } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { FeedSkeleton } from "@/components/app/skeleton";
import { ExploreFeed } from "@/components/app/explore/explore-feed";
import { Button } from "@/components/app/button";
import { getCurrentUser } from "@/lib/auth/dal";
import { listRecaps } from "@/lib/recaps/queries";

export const metadata = {
  title: "Explore — Edgefolio",
  description: "Public trade recaps, market context, and trading insights.",
};

const INSIGHTS = [
  {
    title: "Process over outcome",
    body: "Judge a trade by whether you followed your plan, not by whether it won. Good process produces good results over a large sample.",
  },
  {
    title: "Write it down",
    body: "A journal entry written before the exit is worth ten written after. Capture the thesis while the pressure is real.",
  },
  {
    title: "Size for survival",
    body: "Risk a small, fixed fraction per trade so no single loss can set you back. Consistency is what lets edge compound.",
  },
];

async function ExploreGreeting() {
  const user = await getCurrentUser();
  const name = user?.displayName ?? user?.username ?? "trader";
  const hour = new Date().getHours();
  const part =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <p className="mt-1 text-sm text-muted">
      {part}, {name}. Here is what the community is sharing.
    </p>
  );
}

async function ExploreData() {
  const recaps = await listRecaps("latest");
  return <ExploreFeed recaps={recaps} />;
}

export default function ExplorePage() {
  return (
    <div>
      <PageHeader
        eyebrow="EXPLORE"
        title="Discover public recaps and insights."
        description="Trade recaps shared publicly by other traders, alongside market context and educational notes."
        actions={
          <Link href="/journal">
            <Button variant="primary">Share a recap</Button>
          </Link>
        }
      />

      <div className="mt-3">
        <Suspense fallback={null}>
          <ExploreGreeting />
        </Suspense>
      </div>

      <section className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-ink">Market overview</p>
            <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-xs text-muted">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-warning"
              />
              Not connected
            </span>
          </div>
          <p className="mt-3 text-sm text-muted">
            Live prices are not connected yet, and we never show made-up quotes.
            When a market data provider is connected, a compact snapshot of the
            instruments you follow will appear here.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {["Indices", "Crypto", "FX", "Commodities"].map((label) => (
              <div
                key={label}
                className="rounded-xl border border-dashed border-hairline bg-night/40 px-3 py-4 text-center"
              >
                <p className="text-xs text-faint">{label}</p>
                <p className="mt-1 text-sm text-faint">—</p>
              </div>
            ))}
          </div>
        </div>

        <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
          <p className="text-sm font-medium text-ink">Trading insights</p>
          <p className="mt-1 text-xs text-muted">Timeless notes, not signals.</p>
          <ul className="mt-4 space-y-4">
            {INSIGHTS.map((insight) => (
              <li key={insight.title}>
                <p className="text-sm font-medium text-ink">{insight.title}</p>
                <p className="mt-1 text-xs text-muted">{insight.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="mt-8">
        <Suspense fallback={<FeedSkeleton />}>
          <ExploreData />
        </Suspense>
      </div>
    </div>
  );
}
