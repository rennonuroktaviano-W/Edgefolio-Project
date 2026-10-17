import { SectionHeading } from "@/components/app/explore/explore-section";
import { CalendarIcon } from "@/components/app/icons";

export function WeeklyReview({
  rangeLabel,
  source,
}: {
  rangeLabel: string;
  source: string | null;
}) {
  const connected = source !== null;

  return (
    <section aria-label="Weekly market review" className="space-y-4">
      <SectionHeading
        Icon={CalendarIcon}
        title="Weekly market review"
        description="A short editorial recap of the week, with its date range and source."
      />

      <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-ink">{rangeLabel}</p>
          <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-xs text-muted">
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full ${
                connected ? "bg-positive" : "bg-warning"
              }`}
            />
            {connected ? `Source: ${source}` : "Source not connected"}
          </span>
        </div>

        <p className="mt-3 text-sm text-muted">
          A weekly review summarizes what the market did during the period. It
          is only available once a market data source is connected, and this
          page never invents price history.
        </p>

        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-hairline bg-night/40 px-3.5 py-3">
            <dt className="text-xs text-faint">Coverage period</dt>
            <dd className="mt-1 text-sm font-medium text-ink">{rangeLabel}</dd>
          </div>
          <div className="rounded-xl border border-hairline bg-night/40 px-3.5 py-3">
            <dt className="text-xs text-faint">Source</dt>
            <dd className="mt-1 text-sm font-medium text-ink">
              {connected ? source : "Not connected"}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
