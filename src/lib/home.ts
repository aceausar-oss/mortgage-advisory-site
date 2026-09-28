import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import pricing from "../../content/data/pricing.json";
import stats from "../../content/data/stats.json";

export { pricing };

// Homepage stats band (CLAUDE.md §4.1): only real, sourced numbers. Empty file = band hidden.
export type Stat = { value: string; label: string; detail?: string; source: string; sourceUrl: string; asOf: string };
export const verifiedStats = (stats.stats as Stat[]).filter((s) => s.value && s.source && s.sourceUrl && s.asOf);

// Go High Level booking calendars (CLAUDE.md §7).
export const bookingTypes = [
  {
    key: "reverse",
    title: "Reverse Mortgage",
    blurb: "Explore a reverse mortgage or a reverse mortgage second, and see what fits your retirement.",
    calendarId: "8HkkWeAMaZ5lJbiZDK70",
    url: "https://api.leadconnectorhq.com/widget/bookings/reversemortgagerelief",
  },
  {
    key: "equity",
    title: "HELOC & Refinance",
    blurb: "Tap your equity, consolidate debt, or lower your payment, and keep your low first-mortgage rate.",
    calendarId: "4Ah4Rs8f6GtPS2YwvIpS",
    url: "https://api.leadconnectorhq.com/widget/bookings/heloc_refi",
  },
  {
    key: "purchase",
    title: "Home Buyers",
    blurb: "Get pre-approved, compare FHA, VA, and conventional loans, and find down payment help.",
    calendarId: "LuDajKl5AlreCcwVzXd2",
    url: "https://api.leadconnectorhq.com/widget/bookings/thaconsultation",
  },
] as const;

export const bookingEmbedUrl = (calendarId: string) => `https://api.leadconnectorhq.com/widget/booking/${calendarId}`;

// Client stories (CLAUDE.md §4.4): rendered only with written consent on file.
export type Story = { goal: string; title: string; body: string; image?: string };
export function consentedStories(): Story[] {
  const dir = path.join(process.cwd(), "content", "stories");
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .map((f) => matter(fs.readFileSync(path.join(dir, f), "utf8")))
    .filter(({ data }) => data.consent === true && typeof data.goal === "string" && typeof data.title === "string")
    .map(({ data, content }) => ({ goal: data.goal, title: data.title, body: content.trim(), image: data.image }));
}
