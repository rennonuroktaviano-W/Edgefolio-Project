import Link from "next/link";
import { Badge } from "@/components/app/badge";
import { Button } from "@/components/app/button";
import { EmptyState } from "@/components/app/page-header";
import { SectionHeading } from "@/components/app/explore/explore-section";
import { StarIcon } from "@/components/app/icons";
import type { Recap } from "@/lib/journal/types";
import { formatDateTime, formatPrice, formatR } from "@/lib/trading/format";

function initials(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "?";
}

export function FeaturedRecap({ recap }: { recap: Recap | null }) {
  return (
    <section aria-label="Featured trade recap" className="space-y-4">
      <SectionHeading
        Icon={StarIcon}
        iconTone="violet"
        title="Featured trade recap"
        description="A real recap from the community, chosen by engagement and a reported result."
      />

      {recap ? (
        <article className="soft-frame overflow-hidden rounded-2xl bg-surface-raised">
          <div className="grid lg:grid-cols-[1.15fr_1fr]">
            <div className="p-5 sm:p-6">
              <header className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-hairline bg-surface text-sm font-semibold text-accent">
                  {initials(
                    recap.authorDisplayName ??
                      recap.authorUsername ??
                      "Trader",
                  )}
                </span>
                <div className="min-w-0">
                  {recap.authorUsername ? (
                    <Link
                      href={`/community/${recap.authorUsername}`}
                      className="text-sm font-medium text-ink hover:text-accent"
                    >
                      {recap.authorDisplayName ?? `@${recap.authorUsername}`}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium text-ink">
                      {recap.authorDisplayName ?? "Trader"}
                    </span>
                  )}
                  <p className="text-xs text-faint">
                    {formatDateTime(recap.createdAt)}
                  </p>
                </div>
              </header>

              <h3 className="mt-4 text-lg font-semibold tracking-tight text-ink">
                {recap.title}
              </h3>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {recap.symbol ? (
                  <Badge tone="violet">{recap.symbol}</Badge>
                ) : null}
                {recap.direction ? (
                  <Badge
                    tone={recap.direction === "long" ? "positive" : "negative"}
                  >
                    {recap.direction === "long" ? "Long" : "Short"}
                  </Badge>
                ) : null}
                {recap.outcome ? (
                  <Badge
                    tone={
                      recap.outcome === "win"
                        ? "positive"
                        : recap.outcome === "loss"
                          ? "negative"
                          : "warning"
                    }
                  >
                    {recap.outcome === "win"
                      ? "Win"
                      : recap.outcome === "loss"
                        ? "Loss"
                        : "Breakeven"}
                  </Badge>
                ) : null}
                {recap.resultR !== null ? (
                  <Badge tone={recap.resultR >= 0 ? "positive" : "negative"}>
                    {formatR(recap.resultR)}
                  </Badge>
                ) : null}
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3">
                <Metric
                  label="Entry"
                  value={
                    recap.entryPrice === null
                      ? "—"
                      : formatPrice(recap.entryPrice)
                  }
                />
                <Metric
                  label="Exit"
                  value={
                    recap.exitPrice === null ? "—" : formatPrice(recap.exitPrice)
                  }
                />
              </dl>

              {recap.thesis ? (
                <div className="mt-4">
                  <p className="text-xs font-medium text-faint">Thesis</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted">
                    {recap.thesis}
                  </p>
                </div>
              ) : null}

              <div className="mt-5">
                <Link href={`/explore/${recap.id}`}>
                  <Button variant="secondary">Read full recap</Button>
                </Link>
              </div>
            </div>

            <div className="border-t border-hairline bg-night/30 p-5 sm:p-6 lg:border-l lg:border-t-0">
              {recap.psychology ? (
                <div>
                  <p className="text-xs font-medium text-faint">
                    Risk &amp; psychology
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted">
                    {recap.psychology}
                  </p>
                </div>
              ) : null}

              {recap.review ? (
                <div className={recap.psychology ? "mt-4" : ""}>
                  <p className="text-xs font-medium text-faint">Reflection</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted">
                    {recap.review}
                  </p>
                </div>
              ) : null}

              {recap.attachments.length > 0 ? (
                <ul className="mt-4 grid grid-cols-2 gap-3">
                  {recap.attachments.map((attachment) =>
                    attachment.url ? (
                      <li
                        key={attachment.id}
                        className="overflow-hidden rounded-xl border border-hairline"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={attachment.url}
                          alt="Chart screenshot"
                          className="h-28 w-full object-cover"
                        />
                      </li>
                    ) : null,
                  )}
                </ul>
              ) : null}

              {!recap.psychology &&
              !recap.review &&
              recap.attachments.length === 0 ? (
                <p className="text-sm text-faint">
                  This trader shared a result without extra notes.
                </p>
              ) : null}
            </div>
          </div>
        </article>
      ) : (
        <div className="soft-frame rounded-2xl bg-surface-raised p-6 sm:p-8">
          <EmptyState
            Icon={StarIcon}
            title="No featured recap yet"
            description="Featured recaps come from public posts that report a result. Once one is shared, it is highlighted here."
            action={
              <Link href="/journal">
                <Button variant="primary">Write a recap</Button>
              </Link>
            }
          />
        </div>
      )}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-hairline bg-night/40 px-3.5 py-3">
      <dt className="text-xs text-faint">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}
