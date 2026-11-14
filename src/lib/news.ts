import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { z } from "zod";
import { DidYouKnowList, PRODUCTS, Source, showDrafts } from "@/lib/kb";
import type { Lang } from "@/lib/i18n";

// The Advisory Report (Ace, Nov 2026): a weekly market edition every Monday, in English (content/news/) and Spanish
// (content/es/news/, same slug). Every number on the page comes from the `stats` list, each with its source and date.
// Market data only: never our rates, never a payment. Drafts show on preview deploys, never on the live site.
// Every published English edition needs its Spanish twin (the language toggle relies on it); the build fails otherwise.

const BRAND = "The Mortgage Advisory";
const DIR: Record<Lang, string> = {
  en: path.join(process.cwd(), "content", "news"),
  es: path.join(process.cwd(), "content", "es", "news"),
};

export const NEWS_NAME = "The Advisory Report";

const Stat = z.object({
  value: z.string().min(1).max(24),
  label: z.string().min(3).max(80),
  detail: z.string().max(200).optional(),
  source: z.string().min(2),
  sourceUrl: z.url(),
  asOf: z.string().min(4), // e.g. "September 2026", "Q3 2026"
});

const Frontmatter = z
  .object({
    title: z.string().min(10).max(110), // phrased as a question people ask
    seoTitle: z.string().max(60).optional(),
    slug: z.string().regex(/^[a-z0-9-]+$/, "slug: lowercase letters, numbers and dashes only"),
    date: z.coerce.date(), // edition date (a Monday)
    description: z.string().min(50).max(155),
    tldr: z.string().min(40),
    stats: z.array(Stat).min(3).max(6),
    didYouKnow: DidYouKnowList,
    // Show the 10-year Treasury close for the edition week (from the U.S. Treasury feed).
    treasury: z.boolean().default(true),
    // Loan products the edition talks about: each adds its required disclosure (hecm → HUD notice, heloc → HELOC terms).
    products: z.array(z.enum(PRODUCTS)).default([]),
    sources: z.array(Source).default([]),
    reviewed_by: z.string().optional(),
    status: z.enum(["draft", "published"]),
  })
  .refine((d) => (d.seoTitle ?? d.title).length <= 60, { message: "title is over 60 characters: add a seoTitle of 60 or fewer" })
  .refine((d) => d.tldr.includes(BRAND), { message: `tldr must name the brand ("${BRAND}")` })
  .refine((d) => d.status !== "published" || !!d.reviewed_by?.trim(), { message: "published editions need reviewed_by (Ace's review)" });

export type Edition = Omit<z.infer<typeof Frontmatter>, "date"> & {
  date: string; // YYYY-MM-DD
  html: string;
  isDraft: boolean;
  lang: Lang;
};

const cache = new Map<Lang, Edition[]>();

function loadAll(lang: Lang): Edition[] {
  const hit = cache.get(lang);
  if (hit) return hit;
  const dir = DIR[lang];
  const list: Edition[] = [];
  const errors: string[] = [];
  if (fs.existsSync(dir)) {
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort()) {
      const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
      const parsed = Frontmatter.safeParse(data);
      if (!parsed.success) {
        errors.push(`${lang}/${file}: ${parsed.error.issues.map((i) => `${i.path.join(".") || "file"} — ${i.message}`).join("; ")}`);
        continue;
      }
      if (`${parsed.data.slug}.md` !== file) errors.push(`${lang}/${file}: slug must match the file name`);
      list.push({
        ...parsed.data,
        date: parsed.data.date.toISOString().slice(0, 10),
        html: marked.parse(content, { async: false }),
        isDraft: parsed.data.status === "draft",
        lang,
      });
    }
  }
  if (lang === "es") {
    const en = new Set(loadAll("en").map((e) => e.slug));
    for (const e of list) if (!en.has(e.slug)) errors.push(`es/${e.slug}.md has no English edition with the same slug`);
  } else {
    const esDir = DIR.es;
    const es = new Set(fs.existsSync(esDir) ? fs.readdirSync(esDir).map((f) => f.replace(/\.md$/, "")) : []);
    for (const e of list) if (!e.isDraft && !es.has(e.slug)) errors.push(`news/${e.slug}.md is published but has no Spanish edition in content/es/news/`);
  }
  if (errors.length) throw new Error(`The Advisory Report has invalid files:\n${errors.join("\n")}`);
  list.sort((a, b) => b.date.localeCompare(a.date));
  cache.set(lang, list);
  return list;
}

/** Editions newest first. Drafts only on preview deploys. */
export const getEditions = (lang: Lang = "en") => loadAll(lang).filter((e) => showDrafts || !e.isDraft);
export const getEdition = (slug: string, lang: Lang = "en") => getEditions(lang).find((e) => e.slug === slug);
export const latestEdition = (lang: Lang = "en") => getEditions(lang)[0];

export const editionDate = (iso: string, lang: Lang) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString(lang === "es" ? "es-US" : "en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

/** Newsletter sign-up shows on the live site only once Go High Level is connected (GHL_NEWSLETTER_WEBHOOK_URL). */
export const newsSignupEnabled = () => !!process.env.GHL_NEWSLETTER_WEBHOOK_URL || process.env.VERCEL_ENV !== "production";
