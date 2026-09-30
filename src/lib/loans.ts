import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { z } from "zod";
import { CATEGORY_KEYS } from "@/lib/categories";
import { DidYouKnowList, PRODUCTS, Source, showDrafts } from "@/lib/kb";

// Loan program pages (/loans/*, content/loans/) and state pages (/locations/*, content/locations/), both on the
// page template (CLAUDE.md §6). Same editorial rules as the answers: question H1, TL;DR naming the brand,
// Ace's review before publishing.

const BRAND = "The Mortgage Advisory";

export const LOAN_SLUGS = [
  "purchase",
  "refinance",
  "heloc",
  "reverse-mortgage",
  "fha",
  "va",
  "debt-consolidation",
  "conventional",
  "non-qm",
] as const;

export const LOCATION_SLUGS = ["california", "texas", "florida", "colorado"] as const;

const Frontmatter = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    name: z.string().min(3), // short program name for breadcrumbs, nav, and schema
    question: z.string().min(10),
    seoTitle: z.string().max(60).optional(),
    description: z.string().min(50).max(155),
    tldr: z.string().min(40),
    category: z.enum(CATEGORY_KEYS), // drives disclosures and the "more answers" link
    products: z.array(z.enum(PRODUCTS)).default([]),
    // Who funds the loan (CLAUDE.md §8): we lend directly on conventional and Non-QM; everything else is brokered.
    funding: z.enum(["direct", "broker", "mixed"]).default("mixed"),
    booking: z.enum(["reverse", "equity", "purchase"]).optional(), // omit to link the general /book page
    state: z.enum(["CA", "TX", "FL", "CO"]).optional(), // location pages only
    related: z.array(z.string()).default([]), // answer slugs, checked at load time
    // Header photo (public/ path) and its description; illustration only, never presented as a real client.
    image: z.string().startsWith("/images/").optional(),
    imageAlt: z.string().optional(),
    // Which part of a wide photo stays in view when the frame crops it, e.g. "20% center" (CSS object-position).
    imagePosition: z.string().regex(/^[0-9a-z% ]+$/).optional(),
    sources: z.array(Source).default([]),
    didYouKnow: DidYouKnowList,
    updated: z.coerce.date(),
    reviewed_by: z.string().optional(),
    status: z.enum(["draft", "published"]),
  })
  .refine((d) => (d.seoTitle ?? d.question).length <= 60, { message: "question is over 60 characters: add a seoTitle" })
  .refine((d) => d.tldr.includes(BRAND), { message: `tldr must name the brand ("${BRAND}")` })
  .refine((d) => d.status !== "published" || !!d.reviewed_by?.trim(), { message: "published pages need reviewed_by (Ace's review)" });

export type LoanPage = Omit<z.infer<typeof Frontmatter>, "updated"> & {
  updated: string;
  html: string;
  body: string;
  isDraft: boolean;
  basePath: "/loans" | "/locations";
};

const cache = new Map<string, LoanPage[]>();

function loadAll(kind: "loans" | "locations"): LoanPage[] {
  const hit = cache.get(kind);
  if (hit) return hit;
  const dir = path.join(process.cwd(), "content", kind);
  const allowed: readonly string[] = kind === "loans" ? LOAN_SLUGS : LOCATION_SLUGS;
  if (!fs.existsSync(dir)) return [];
  const pages: LoanPage[] = [];
  const errors: string[] = [];
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort()) {
    const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
    const parsed = Frontmatter.safeParse(data);
    if (!parsed.success) {
      errors.push(`${file}: ${parsed.error.issues.map((i) => `${i.path.join(".") || "file"} — ${i.message}`).join("; ")}`);
      continue;
    }
    if (`${parsed.data.slug}.md` !== file) errors.push(`${file}: slug "${parsed.data.slug}" must match the file name`);
    if (!allowed.includes(parsed.data.slug)) errors.push(`${file}: slug must be one of ${allowed.join(", ")}`);
    for (const r of parsed.data.related) {
      if (!fs.existsSync(path.join(process.cwd(), "content", "kb", `${r}.md`))) errors.push(`${file}: related answer "${r}" not found`);
    }
    pages.push({
      ...parsed.data,
      updated: parsed.data.updated.toISOString().slice(0, 10),
      body: content.trim(),
      html: marked.parse(content, { async: false }),
      isDraft: parsed.data.status === "draft",
      basePath: `/${kind}`,
    });
  }
  if (errors.length) throw new Error(`content/${kind} has ${errors.length} problem(s):\n${errors.join("\n")}`);
  pages.sort((a, b) => allowed.indexOf(a.slug) - allowed.indexOf(b.slug)); // menu order, not file order
  cache.set(kind, pages);
  return pages;
}

export function getLoanPages(): LoanPage[] {
  return loadAll("loans").filter((p) => showDrafts || !p.isDraft);
}

export function getLoanPage(slug: string): LoanPage | undefined {
  return getLoanPages().find((p) => p.slug === slug);
}

export function getLocationPages(): LoanPage[] {
  return loadAll("locations").filter((p) => showDrafts || !p.isDraft);
}

export function getLocationPage(slug: string): LoanPage | undefined {
  return getLocationPages().find((p) => p.slug === slug);
}
