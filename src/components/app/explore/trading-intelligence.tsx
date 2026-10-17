import Link from "next/link";
import { Badge } from "@/components/app/badge";
import { SectionHeading } from "@/components/app/explore/explore-section";
import { ClockIcon, JournalIcon } from "@/components/app/icons";
import { EDITORIAL } from "@/lib/editorial/content";
import { formatDate } from "@/lib/trading/format";

export function TradingIntelligence() {
  return (
    <section aria-label="Trading intelligence" className="space-y-4">
      <SectionHeading
        Icon={JournalIcon}
        title="Trading intelligence"
        description="Editorial notes on process, psychology, and risk — clearly labeled, never market signals."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {EDITORIAL.map((article) => (
          <article
            key={article.slug}
            className="soft-frame group flex flex-col rounded-2xl bg-surface-raised p-5 transition-colors hover:border-hairline-strong"
          >
            <div className="flex items-center justify-between gap-2">
              <Badge tone="accent">{article.category}</Badge>
              <span className="inline-flex items-center gap-1.5 text-xs text-faint">
                <ClockIcon className="h-3.5 w-3.5" />
                {article.readingMinutes} min
              </span>
            </div>
            <h3 className="mt-3 text-base font-semibold tracking-tight text-ink">
              <Link
                href={`/explore/insights/${article.slug}`}
                className="hover:text-accent"
              >
                {article.title}
              </Link>
            </h3>
            <p className="mt-2 flex-1 text-sm text-muted">{article.summary}</p>
            <div className="mt-4 flex items-center justify-between border-t border-hairline pt-3">
              <span className="text-xs text-faint">
                {formatDate(article.date)}
              </span>
              <Link
                href={`/explore/insights/${article.slug}`}
                className="text-xs font-medium text-accent hover:underline"
              >
                Read article →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
