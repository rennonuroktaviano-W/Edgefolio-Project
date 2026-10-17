import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/app/badge";
import { getArticle } from "@/lib/editorial/content";
import { formatDate } from "@/lib/trading/format";

type Params = { params: Promise<{ slug: string }> };

export const instant = false;

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const article = getArticle(slug);
  return {
    title: article ? `${article.title} — Edgefolio` : "Insight — Edgefolio",
    description: article?.summary ?? "An Edgefolio editorial note.",
  };
}

export default async function InsightArticlePage({ params }: Params) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  return (
    <article className="mx-auto max-w-2xl">
      <Link
        href="/explore"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink"
      >
        <span aria-hidden="true">←</span> Back to Explore
      </Link>

      <header className="reveal mt-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent">{article.category}</Badge>
          <span className="text-xs text-faint">
            {formatDate(article.date)} · {article.readingMinutes} min read
          </span>
        </div>
        <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {article.title}
        </h1>
        <p className="mt-4 text-pretty text-base text-muted">
          {article.summary}
        </p>
      </header>

      <div className="mt-8 space-y-5 border-t border-hairline pt-8">
        {article.body.map((paragraph, index) => (
          <p key={index} className="text-pretty text-base leading-relaxed text-muted">
            {paragraph}
          </p>
        ))}
      </div>

      <p className="mt-8 rounded-xl border border-hairline bg-night/30 p-4 text-xs text-faint">
        Editorial note. This article is educational commentary on process and
        psychology. It contains no market data, price levels, or performance
        claims.
      </p>
    </article>
  );
}
