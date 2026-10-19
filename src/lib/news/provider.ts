import "server-only";

import type { NewsItem } from "@/lib/news/types";

// Market-news integration boundary.
//
// We syndicate a public RSS/Atom feed server-side (no API key) and surface only
// real headlines: title, source, published date, and a link back to the
// publisher. If the feed is unreachable or unparseable we return an empty list
// and the UI shows an honest empty state. Nothing is ever fabricated.

const DEFAULT_FEED_URL = "https://cointelegraph.com/rss";
const TIMEOUT_MS = 8000;
const REVALIDATE_SECONDS = 300;

function decodeEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&#(\d+);/g, (_, code: string) => {
      const parsed = Number.parseInt(code, 10);
      return Number.isFinite(parsed) ? String.fromCodePoint(parsed) : "";
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => {
      const parsed = Number.parseInt(code, 16);
      return Number.isFinite(parsed) ? String.fromCodePoint(parsed) : "";
    })
    .replace(/&amp;/g, "&");
}

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, "");
}

function extractTag(block: string, name: string): string | null {
  const pattern = new RegExp(
    `<${name}\\b[^>]*>([\\s\\S]*?)<\\/${name}>`,
    "i",
  );
  const match = block.match(pattern);
  if (!match) return null;
  const text = decodeEntities(stripTags(match[1])).replace(/\s+/g, " ").trim();
  return text || null;
}

function extractLink(block: string): string | null {
  const textLink = block.match(/<link\b[^>]*>([\s\S]*?)<\/link>/i);
  if (textLink) {
    const value = decodeEntities(textLink[1]).trim();
    if (value) return value;
  }
  const hrefLink = block.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
  if (hrefLink) {
    const value = decodeEntities(hrefLink[1]).trim();
    if (value) return value;
  }
  return null;
}

function toIsoOrNull(value: string | null): string | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function hostOf(link: string): string | null {
  try {
    return new URL(link).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export async function getNews(limit = 6): Promise<NewsItem[]> {
  const feedUrl = process.env.NEWS_FEED_URL?.trim() || DEFAULT_FEED_URL;

  let xml: string;
  try {
    const response = await fetch(feedUrl, {
      next: { revalidate: REVALIDATE_SECONDS, tags: ["market-news"] },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
      },
    });
    if (!response.ok) return [];
    xml = await response.text();
  } catch {
    return [];
  }

  const channelTitle = extractTag(xml, "title");
  const rssItems = [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].map(
    (match) => match[0],
  );
  const atomEntries = rssItems.length
    ? []
    : [...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)].map((match) => match[0]);
  const blocks = rssItems.length ? rssItems : atomEntries;
  if (blocks.length === 0) return [];

  const items: NewsItem[] = [];
  for (const block of blocks) {
    const title = extractTag(block, "title");
    const link = extractLink(block);
    if (!title || !link) continue;

    const source =
      extractTag(block, "source") ?? channelTitle ?? hostOf(link) ?? null;
    const publishedAt = toIsoOrNull(
      extractTag(block, "pubDate") ??
        extractTag(block, "published") ??
        extractTag(block, "updated") ??
        extractTag(block, "dc:date"),
    );

    items.push({ title, link, source, publishedAt });
  }

  return items.slice(0, Math.max(limit, 0));
}
