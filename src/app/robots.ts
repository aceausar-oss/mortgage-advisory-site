import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Explicitly welcome search and AI crawlers (CLAUDE.md §12).
const AI_AND_SEARCH_BOTS = [
  "Googlebot",
  "Bingbot",
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "ClaudeBot",
  "Claude-User",
  "Google-Extended",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // The chat endpoint costs money per call and has nothing to index; the knowledge API is open to everyone.
      { userAgent: AI_AND_SEARCH_BOTS, allow: "/", disallow: "/api/chat" },
      { userAgent: "*", allow: "/", disallow: "/api/chat" },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
