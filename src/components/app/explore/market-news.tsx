import { Badge } from "@/components/app/badge";
import { SectionHeading } from "@/components/app/explore/explore-section";
import { NewsIcon } from "@/components/app/icons";
import { getNews } from "@/lib/news/provider";
import { formatDateShort } from "@/lib/trading/format";

export async function MarketNews() {
  const items = await getNews(6);

  return (
    <section aria-label="Market news" className="space-y-4">
      <SectionHeading
        Icon={NewsIcon}
        iconTone="info"
        title="Market news"
        description="Headlines from the sources we syndicate — every item links to the publisher."
      />

      {items.length === 0 ? (
        <div className="soft-frame rounded-2xl bg-surface-raised p-6 sm:p-8">
          <p className="text-sm font-medium text-ink">
            Headlines are not available right now
          </p>
          <p className="mt-2 text-sm text-muted">
            We only show real news from connected sources. Nothing here is
            written or invented by us, so this section stays empty until the
            feed is reachable.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <li key={item.link} className="min-w-0">
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="soft-frame group flex h-full flex-col rounded-2xl bg-surface-raised p-5 transition-colors hover:border-hairline-strong"
              >
                <span className="text-sm font-medium tracking-tight text-ink transition-colors group-hover:text-info">
                  {item.title}
                </span>
                <span className="mt-auto flex flex-wrap items-center gap-2 pt-4 text-xs text-faint">
                  {item.source ? <Badge tone="muted">{item.source}</Badge> : null}
                  {item.publishedAt ? (
                    <time dateTime={item.publishedAt}>
                      {formatDateShort(item.publishedAt)}
                    </time>
                  ) : null}
                  <span className="ml-auto text-info opacity-0 transition-opacity group-hover:opacity-100">
                    Read →
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
