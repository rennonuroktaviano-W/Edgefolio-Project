import { ExploreDashboard } from "@/components/app/explore-dashboard";

export const metadata = {
  title: "Explore — Edgefolio",
  description:
    "Review performance, spot patterns, and keep your trading review process consistent.",
};

export default function ExplorePage() {
  return (
    <>
      <header className="reveal">
        <p className="text-xs font-semibold tracking-[0.28em] text-accent">
          EXPLORE
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Your trading, at a glance.
          </h1>
        </div>

        <p className="mt-4 max-w-2xl text-pretty text-base text-muted">
          Review performance, spot patterns, and keep your review process
          consistent.
        </p>
      </header>

      <ExploreDashboard />
    </>
  );
}
