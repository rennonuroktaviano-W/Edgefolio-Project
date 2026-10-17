const METRIC_LABELS = [
  "Net performance",
  "Win rate",
  "Total trades",
  "Avg. reward / risk",
] as const;

// Empty dashboard shell. The layout mirrors the intended design, but shows no
// numbers until trade data exists — we never render fabricated results.
export function MyDashboard() {
  return (
    <div className="mt-8 space-y-6">
      <div className="soft-frame flex flex-col gap-3 rounded-2xl bg-surface-raised p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-xs font-medium text-muted">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 rounded-full bg-warning"
            />
            Waiting for your data
          </span>
          <p className="mt-3 max-w-xl text-sm text-muted">
            Your private performance overview appears here once you add trades.
            Trade import is in development, so there is nothing to show yet.
          </p>
        </div>
        <p className="text-xs text-faint">Private — only visible to you</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {METRIC_LABELS.map((label) => (
          <div
            key={label}
            className="soft-frame rounded-2xl bg-surface-raised p-4 sm:p-5"
          >
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-faint sm:text-3xl">
              —
            </p>
            <p className="mt-2 text-xs text-faint">No data yet</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6 lg:col-span-2">
          <p className="text-sm font-medium text-ink">Equity curve</p>
          <p className="mt-1 text-xs text-muted">Cumulative R multiples</p>

          <div className="mt-6 grid h-48 place-items-center rounded-xl border border-dashed border-hairline bg-night/40 sm:h-60">
            <div className="px-6 text-center">
              <p className="text-sm font-medium text-ink">
                No equity data yet
              </p>
              <p className="mt-1 text-xs text-muted">
                Your curve will appear here once you log trades.
              </p>
            </div>
          </div>
        </div>

        <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
          <p className="text-sm font-medium text-ink">Performance breakdown</p>
          <p className="mt-1 text-xs text-muted">Wins vs losses</p>

          <div className="mt-6 grid h-36 place-items-center rounded-xl border border-dashed border-hairline bg-night/40">
            <p className="px-6 text-center text-xs text-muted">
              No performance data yet.
            </p>
          </div>
        </div>
      </div>

      <div className="soft-frame overflow-hidden rounded-2xl bg-surface-raised">
        <div className="border-b border-hairline p-5 sm:p-6">
          <p className="text-sm font-medium text-ink">Recent trades</p>
          <p className="mt-1 text-xs text-muted">Your latest activity</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] text-left">
            <caption className="sr-only">
              Your recent trades. No trades have been logged yet.
            </caption>
            <thead>
              <tr className="text-xs text-muted">
                <th scope="col" className="px-5 py-3 font-medium sm:px-6">
                  Symbol
                </th>
                <th scope="col" className="px-5 py-3 font-medium sm:px-6">
                  Side
                </th>
                <th scope="col" className="px-5 py-3 font-medium sm:px-6">
                  Date
                </th>
                <th scope="col" className="px-5 py-3 font-medium sm:px-6">
                  Result
                </th>
                <th scope="col" className="px-5 py-3 font-medium sm:px-6">
                  Outcome
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-hairline">
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-sm text-muted sm:px-6"
                >
                  No trades yet. Trades you log will show up here.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
