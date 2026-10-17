"use client";

import { useState } from "react";
import Link from "next/link";
import { SegmentedControl } from "@/components/app/form";
import { EmptyState } from "@/components/app/page-header";
import { Badge } from "@/components/app/badge";
import { LeaderboardIcon } from "@/components/app/icons";
import type { LeaderboardPeriod, LeaderboardRow } from "@/lib/recaps/queries";
import { formatPercent, formatR, formatSignedR } from "@/lib/trading/format";

export function LeaderboardView({
  data,
}: {
  data: Record<LeaderboardPeriod, LeaderboardRow[]>;
}) {
  const [period, setPeriod] = useState<LeaderboardPeriod>("all");
  const rows = data[period];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-ink">Ranking</h2>
        <SegmentedControl
          label="Leaderboard period"
          value={period}
          onChange={setPeriod}
          options={[
            { value: "all", label: "All time" },
            { value: "month", label: "30 days" },
            { value: "week", label: "7 days" },
          ]}
        />
      </div>

      {rows.length === 0 ? (
        <div className="soft-frame rounded-2xl bg-surface-raised p-6 sm:p-8">
          <EmptyState
            Icon={LeaderboardIcon}
            title="No ranked traders yet"
            description="The leaderboard ranks only the results traders publish in public recaps. Once recaps with reported results are shared, they appear here."
            action={
              <Link href="/journal">
                <span className="text-sm text-accent hover:underline">
                  Publish a recap
                </span>
              </Link>
            }
          />
        </div>
      ) : (
        <div className="soft-frame overflow-hidden rounded-2xl bg-surface-raised">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-hairline text-xs text-faint">
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Trader</th>
                  <th className="px-4 py-3 text-right font-medium">Recaps</th>
                  <th className="px-4 py-3 text-right font-medium">W / L</th>
                  <th className="px-4 py-3 text-right font-medium">Win rate</th>
                  <th className="px-4 py-3 text-right font-medium">Avg R</th>
                  <th className="px-4 py-3 text-right font-medium">Total R</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row.username}
                    className="border-b border-hairline/60 last:border-0 hover:bg-surface-strong/40"
                  >
                    <td className="px-4 py-3 text-faint">{index + 1}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/community/${row.username}`}
                        className="inline-flex items-center gap-2 font-medium text-ink hover:text-accent"
                      >
                        <span className="grid h-7 w-7 place-items-center rounded-full border border-hairline bg-surface text-[0.65rem] font-semibold text-accent">
                          {(row.displayName ?? row.username)
                            .replace(/[^a-zA-Z0-9]/g, "")
                            .slice(0, 2)
                            .toUpperCase() || "?"}
                        </span>
                        {row.displayName ?? `@${row.username}`}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-right text-muted">{row.recaps}</td>
                    <td className="px-4 py-3 text-right text-muted">
                      {row.wins} / {row.losses}
                    </td>
                    <td className="px-4 py-3 text-right text-muted">
                      {row.winRate === null ? "—" : formatPercent(row.winRate)}
                    </td>
                    <td className="px-4 py-3 text-right text-muted">
                      {row.avgR === null ? "—" : formatR(row.avgR)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge tone={row.totalR >= 0 ? "positive" : "negative"}>
                        {formatSignedR(row.totalR)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-xs text-faint">
        Rankings use only the results traders choose to publish in public recaps.
        Private trades never contribute, and no performance is estimated or
        fabricated. Total R is the sum of published R multiples.
      </p>
    </div>
  );
}
