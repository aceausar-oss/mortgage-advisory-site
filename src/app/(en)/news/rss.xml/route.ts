import { getEditions, NEWS_NAME } from "@/lib/news";
import { siteUrl } from "@/lib/site";

// RSS feed for The Advisory Report, so readers, feed tools, and AI crawlers pick up each new edition.
export const revalidate = 3600;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function GET() {
  const base = `${siteUrl}/news`;
  const items = getEditions("en")
    .filter((e) => !e.isDraft)
    .map(
      (e) => `<item><title>${esc(e.title)}</title><link>${base}/${e.slug}</link><guid>${base}/${e.slug}</guid><pubDate>${new Date(`${e.date}T14:00:00Z`).toUTCString()}</pubDate><description>${esc(e.tldr)}</description></item>`,
    )
    .join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${NEWS_NAME}</title><link>${base}</link><description>Weekly housing and market news from The Mortgage Advisory, Inc. (NMLS #1549739).</description><language>en-us</language>${items}</channel></rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
