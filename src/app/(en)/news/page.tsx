import type { Metadata } from "next";
import { NewsHubView } from "@/components/news/NewsViews";
import { alternates } from "@/lib/i18n";

// The Advisory Report hub (Ace, Nov 2026). Refreshed daily so the upcoming event dates stay current.
export const revalidate = 86400;

export const metadata: Metadata = {
  title: { absolute: "The Advisory Report: Weekly Housing & Market News" },
  description: "Every Monday: sourced housing and market numbers, fun facts, and what they mean for homeowners, buyers, retirees, and investors. From The Mortgage Advisory.",
  alternates: { ...alternates("/news", "en"), types: { "application/rss+xml": "/news/rss.xml" } },
  openGraph: { type: "website", url: "/news" },
};

export default function NewsPage() {
  return <NewsHubView lang="en" />;
}
