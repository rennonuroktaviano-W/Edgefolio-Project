import { Suspense } from "react";
import { ExploreDashboard } from "@/components/app/explore-dashboard";
import { UsernameOnboarding } from "@/components/app/username-onboarding";

export const metadata = {
  title: "Explore — Edgefolio",
  description:
    "Review performance, spot patterns, and keep your trading review process consistent.",
};

export default function ExplorePage() {
  return (
    <>
      <Suspense fallback={null}>
        <UsernameOnboarding />
      </Suspense>

      <header className="reveal">
        <p className="text-xs font-semibold tracking-[0.28em] text-accent">
          EXPLORE
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Your trading, at a glance.
          </h1>
          <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-raised/70 px-3 py-1 text-[0.7rem] font-medium tracking-wide text-muted">
            <span
              aria-hidden="true"
              className="animate-dot h-1.5 w-1.5 rounded-full bg-accent"
            />
            Demo data
          </span>
        </div>

        <p className="mt-4 max-w-2xl text-pretty text-base text-muted">
          Review performance, spot patterns, and keep your review process
          consistent. Everything on this page is illustrative sample data.
        </p>
      </header>

      <ExploreDashboard />
    </>
  );
}
