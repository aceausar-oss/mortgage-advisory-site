import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { z } from "zod";
import { CATEGORY_KEYS, type CategoryKey } from "@/lib/categories";
import { ES_ANSWER_SLUGS } from "@/lib/esAnswerSlugs";
import type { Lang } from "@/lib/i18n";

// Knowledge base loader (CLAUDE.md §10). One markdown file per question in content/kb/.
// Spanish twins (Ace, Nov 2026) live in content/es/kb/ with the same slug as their English answer and render at
// /es/answers/[slug]; every Spanish file needs an English twin and a spot in ES_ANSWER_SLUGS.
// Any invalid file fails the build with a message naming the file.

const KB_DIR = path.join(process.cwd(), "content", "kb");
const ES_KB_DIR = path.join(process.cwd(), "content", "es", "kb");
const BRAND = "The Mortgage Advisory";

export const PRODUCTS = [
  "fha",
  "va",
  "conventional",
  "heloc",
  "home-equity-loan",
  "cash-out-refi",
  "rate-term-refi",
  "hecm",
  "proprietary-reverse",
  "reverse-second",
  "homesafe", // Finance of America's HomeSafe Second (reverse-mortgage second); Ace may use the name and logo (Sept 2026)
  "non-qm",
] as const;

// Shared with the loan and location pages (src/lib/loans.ts).
export const Source = z.object({ title: z.string(), url: z.url() });
export const DidYouKnowList = z
  .array(z.object({ text: z.string().min(20).max(400), sources: z.array(Source).default([]) }))
  .max(3)
  .default([]);

const Frontmatter = z
  .object({
    question: z.string().min(10),
    slug: z.string().regex(/^[a-z0-9-]+$/, "slug: lowercase letters, numbers and dashes only"),
    seoTitle: z.string().max(60).optional(),
    description: z.string().min(50).max(155),
    tldr: z.string().min(40),
    category: z.enum(CATEGORY_KEYS),
    products: z.array(z.enum(PRODUCTS)).default([]),
    // Show the live 10-year Treasury chart after the answer body.
    treasuryChart: z.boolean().default(false),
    states: z.array(z.enum(["CA", "TX", "FL", "CO"])).default([]),
    persona: z.string().optional(),
    featured: z.boolean().default(false),
    // Optional: cite government sources only where the program is government-backed (CLAUDE.md §6.7).
    sources: z.array(Source).default([]),
    // Optional "Did you know?" side pill: short fun facts with optional supporting links.
    didYouKnow: DidYouKnowList,
    updated: z.coerce.date(),
    reviewed_by: z.string().optional(),
    status: z.enum(["draft", "published"]),
    researchId: z.string().optional(),
    // Mentions our affiliated real estate brokerage, The Home Advisory: adds the affiliated business disclosure.
    affiliate: z.boolean().default(false),
  })
  .refine((d) => (d.seoTitle ?? d.question).length <= 60, {
    message: "question is over 60 characters: add a seoTitle of 60 characters or fewer",
  })
  .refine((d) => d.tldr.includes(BRAND), { message: `tldr must name the brand ("${BRAND}")` })
  .refine((d) => d.status !== "published" || !!d.reviewed_by?.trim(), {
    message: "published answers need reviewed_by (Ace's review)",
  });

export type KbEntry = Omit<z.infer<typeof Frontmatter>, "updated"> & {
  updated: string; // YYYY-MM-DD
  category: CategoryKey;
  body: string; // markdown
  html: string;
  isDraft: boolean;
};

// Drafts are visible locally and on preview deploys, never on the live site.
export const showDrafts = process.env.VERCEL_ENV !== "production" && process.env.KB_HIDE_DRAFTS !== "1";

const cache = new Map<Lang, KbEntry[]>();

function loadAll(lang: Lang = "en"): KbEntry[] {
  const hit = cache.get(lang);
  if (hit) return hit;
  const dir = lang === "es" ? ES_KB_DIR : KB_DIR;
  if (!fs.existsSync(dir)) {
    cache.set(lang, []);
    return [];
  }

  const entries: KbEntry[] = [];
  const errors: string[] = [];
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort()) {
    const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
    const parsed = Frontmatter.safeParse(data);
    if (!parsed.success) {
      errors.push(`${file}: ${parsed.error.issues.map((i) => `${i.path.join(".") || "file"} — ${i.message}`).join("; ")}`);
      continue;
    }
    if (`${parsed.data.slug}.md` !== file) errors.push(`${file}: slug "${parsed.data.slug}" must match the file name`);
    entries.push({
      ...parsed.data,
      updated: parsed.data.updated.toISOString().slice(0, 10),
      body: content.trim(),
      html: marked.parse(content, { async: false }),
      isDraft: parsed.data.status === "draft",
    });
  }

  const slugs = new Set<string>();
  for (const e of entries) {
    if (slugs.has(e.slug)) errors.push(`duplicate slug "${e.slug}"`);
    slugs.add(e.slug);
  }
  if (lang === "es") {
    const listed: readonly string[] = ES_ANSWER_SLUGS;
    for (const e of entries) {
      if (!fs.existsSync(path.join(KB_DIR, `${e.slug}.md`))) errors.push(`${e.slug}.md: no English answer with this slug in content/kb`);
      if (!listed.includes(e.slug)) errors.push(`${e.slug}.md: add "${e.slug}" to ES_ANSWER_SLUGS in src/lib/esAnswerSlugs.ts`);
    }
    for (const s of listed) if (!slugs.has(s)) errors.push(`ES_ANSWER_SLUGS lists "${s}" but content/es/kb/${s}.md is missing`);
  }
  if (errors.length) throw new Error(`content/${lang === "es" ? "es/" : ""}kb has ${errors.length} problem(s):\n${errors.join("\n")}`);

  cache.set(lang, entries);
  return entries;
}

/** All answers visible in this environment (drafts excluded on the live site). */
export function getEntries(lang: Lang = "en"): KbEntry[] {
  return loadAll(lang).filter((e) => showDrafts || !e.isDraft);
}

export function getEntry(slug: string, lang: Lang = "en"): KbEntry | undefined {
  return getEntries(lang).find((e) => e.slug === slug);
}

/** True when a published (or, on previews, draft) Spanish twin exists for this answer. */
export function hasSpanish(slug: string): boolean {
  return !!getEntry(slug, "es");
}

export function searchEntries({ q, category, state }: { q?: string; category?: string; state?: string }) {
  const words = (q ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  return getEntries().filter((e) => {
    if (category && e.category !== category) return false;
    if (state && !e.states.includes(state as KbEntry["states"][number])) return false;
    const haystack = `${e.question} ${e.tldr} ${e.body}`.toLowerCase();
    return words.every((w) => haystack.includes(w));
  });
}

const STOPWORDS = new Set(
  "a an and are as at be by can could do does for from get go how i if in into is it its me my of on or our should so that the this to up was we what when where which who why will with you your".split(" "),
);

/** Loose relevance ranking for free-text questions (hero chat, /ask). Best matches first. */
export function rankEntries(q: string, limit = 5): KbEntry[] {
  const words = q
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
  if (!words.length) return [];
  return getEntries()
    .map((e) => {
      const question = e.question.toLowerCase();
      const tldr = e.tldr.toLowerCase();
      const body = e.body.toLowerCase();
      const score = words.reduce((n, w) => n + (question.includes(w) ? 3 : 0) + (tldr.includes(w) ? 2 : 0) + (body.includes(w) ? 1 : 0), 0);
      return { e, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.e);
}
