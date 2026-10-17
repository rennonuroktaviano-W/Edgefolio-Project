import Link from "next/link";
import { Badge } from "@/components/app/badge";
import { EmptyState } from "@/components/app/page-header";
import { SectionHeading } from "@/components/app/explore/explore-section";
import { CommunityIcon } from "@/components/app/icons";
import type { LeaderboardRow } from "@/lib/recaps/queries";
import { formatPercent, formatSignedR } from "@/lib/trading/format";

function initials(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "?";
}

export function DiscoverTraders({ traders }: { traders: LeaderboardRow[] }) {
  return (
    <section aria-label="Discover traders" className="space-y-4">
      <SectionHeading
        Icon={CommunityIcon}
        title="Discover traders"
        description="Traders ranked only by the results they publish. No followers, balances, or badges are shown."
        action={
          <Link
            href="/leaderboard"
            className="text-xs font-medium text-accent hover:underline"
          >
            Full leaderboard →
          </Link>
        }
      />

      {traders.length === 0 ? (
        <div className="soft-frame rounded-2xl bg-surface-raised p-6 sm:p-8">
          <EmptyState
            Icon={CommunityIcon}
            title="No traders to show yet"
            description="This list fills up as traders publish recaps that report real results."
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {traders.map((trader) => (
            <Link
              key={trader.username}
              href={`/community/${trader.username}`}
              className="soft-frame group rounded-2xl bg-surface-raised p-5 transition-colors hover:border-hairline-strong"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-hairline bg-surface text-sm font-semibold text-accent">
                  {initials(trader.displayName ?? trader.username)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink group-hover:text-accent">
                    {trader.displayName ?? `@${trader.username}`}
                  </p>
                  <p className="truncate text-xs text-faint">
                    @{trader.username}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge tone="muted">
                  {trader.recaps}{" "}
                  {trader.recaps === 1 ? "recap" : "recaps"}
                </Badge>
                {trader.winRate === null ? null : (
                  <Badge tone="info">{formatPercent(trader.winRate)} win</Badge>
                )}
                <Badge tone={trader.totalR >= 0 ? "positive" : "negative"}>
                  {formatSignedR(trader.totalR)}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
