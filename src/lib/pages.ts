import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { z } from "zod";

// Standalone content pages (content/pages/*.md): /costs, /about, and the legal pages. Markdown so Ace (or an
// attorney) can edit the words without touching code. Legal pages carry attorneyReview until signed off.
const Frontmatter = z.object({
  h1: z.string().min(5),
  title: z.string().max(60),
  description: z.string().min(50).max(155),
  intro: z.string().optional(), // short-answer box under the H1
  updated: z.coerce.date(),
  attorneyReview: z.enum(["pending", "done"]).optional(), // legal pages only
  faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]), // rendered as FAQ + FAQPage schema
});

export type ContentPage = Omit<z.infer<typeof Frontmatter>, "updated"> & { slug: string; updated: string; html: string };

export function getContentPage(slug: string): ContentPage {
  const file = path.join(process.cwd(), "content", "pages", `${slug}.md`);
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  const parsed = Frontmatter.safeParse(data);
  if (!parsed.success) {
    throw new Error(`content/pages/${slug}.md: ${parsed.error.issues.map((i) => `${i.path.join(".")} — ${i.message}`).join("; ")}`);
  }
  return {
    ...parsed.data,
    slug,
    updated: parsed.data.updated.toISOString().slice(0, 10),
    html: marked.parse(content, { async: false }),
  };
}
