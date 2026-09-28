import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { z } from "zod";
import { CATEGORY_KEYS } from "@/lib/categories";
import { DidYouKnowList, PRODUCTS, Source, showDrafts } from "@/lib/kb";

// Loan program pages (CLAUDE.md §5 /loans/*, page template §6). One markdown file per program in content/loans/.
// Same editorial rules as the answers: question H1, TL;DR naming the brand, Ace's review before publishing.

const LOANS_DIR = path.join(process.cwd(), "content", "loans");
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

const Frontmatter = z
  .object({
    slug: z.enum(LOAN_SLUGS),
    name: z.string().min(3), // short program name for breadcrumbs, nav, and schema
    question: z.string().min(10),
    seoTitle: z.string().max(60).optional(),
    description: z.string().min(50).max(155),
    tldr: z.string().min(40),
    category: z.enum(CATEGORY_KEYS), // drives disclosures and the "more answers" link
    products: z.array(z.enum(PRODUCTS)).default([]),
    // Who funds the loan (CLAUDE.md §8): we lend directly on conventional and Non-QM; everything else is brokered.
    funding: z.enum(["direct", "broker", "mixed"]),
    booking: z.enum(["reverse", "equity", "purchase"]),
    related: z.array(z.string()).default([]), // answer slugs, checked at load time
    sources: z.array(Source).default([]),
    didYouKnow: DidYouKnowList,
    updated: z.coerce.date(),
    reviewed_by: z.string().optional(),
    status: z.enum(["draft", "published"]),
  })
  .refine((d) => (d.seoTitle ?? d.question).length <= 60, { message: "question is over 60 characters: add a seoTitle" })
  .refine((d) => d.tldr.includes(BRAND), { message: `tldr must name the brand ("${BRAND}")` })
  .refine((d) => d.status !== "published" || !!d.reviewed_by?.trim(), { message: "published pages need reviewed_by (Ace's review)" });

export type LoanPage = Omit<z.infer<typeof Frontmatter>, "updated"> & { updated: string; html: string; body: string; isDraft: boolean };

let cache: LoanPage[] | null = null;

function loadAll(): LoanPage[] {
  if (cache) return cache;
  if (!fs.existsSync(LOANS_DIR)) return (cache = []);
  const pages: LoanPage[] = [];
  const errors: string[] = [];
  for (const file of fs.readdirSync(LOANS_DIR).filter((f) => f.endsWith(".md")).sort()) {
    const { data, content } = matter(fs.readFileSync(path.join(LOANS_DIR, file), "utf8"));
    const parsed = Frontmatter.safeParse(data);
    if (!parsed.success) {
      errors.push(`${file}: ${parsed.error.issues.map((i) => `${i.path.join(".") || "file"} — ${i.message}`).join("; ")}`);
      continue;
    }
    if (`${parsed.data.slug}.md` !== file) errors.push(`${file}: slug "${parsed.data.slug}" must match the file name`);
    for (const r of parsed.data.related) {
      if (!fs.existsSync(path.join(process.cwd(), "content", "kb", `${r}.md`))) errors.push(`${file}: related answer "${r}" not found`);
    }
    pages.push({
      ...parsed.data,
      updated: parsed.data.updated.toISOString().slice(0, 10),
      body: content.trim(),
      html: marked.parse(content, { async: false }),
      isDraft: parsed.data.status === "draft",
    });
  }
  if (errors.length) throw new Error(`content/loans has ${errors.length} problem(s):\n${errors.join("\n")}`);
  return (cache = pages);
}

export function getLoanPages(): LoanPage[] {
  return loadAll().filter((p) => showDrafts || !p.isDraft);
}

export function getLoanPage(slug: string): LoanPage | undefined {
  return getLoanPages().find((p) => p.slug === slug);
}
