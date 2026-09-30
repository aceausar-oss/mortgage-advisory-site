import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { z } from "zod";
import { showDrafts } from "@/lib/kb";

// Printable one-page handouts for the For Financial Pros hub (content/handouts/*.md), served at /pros/handouts/<slug>.
// Drafts show locally and on preview deploys only, like answers.
const Frontmatter = z.object({
  title: z.string().min(5).max(60),
  description: z.string().min(50).max(155),
  audience: z.enum(["client", "professional"]), // who reads it: a homeowner, or the planner
  reverse: z.boolean().default(true), // show the reverse mortgage disclosures
  order: z.number().default(99),
  updated: z.coerce.date(),
  status: z.enum(["draft", "published"]),
});

export type Handout = Omit<z.infer<typeof Frontmatter>, "updated"> & { slug: string; updated: string; html: string; isDraft: boolean };

const DIR = path.join(process.cwd(), "content", "handouts");
let cache: Handout[] | null = null;

function loadAll(): Handout[] {
  if (cache) return cache;
  const out: Handout[] = [];
  for (const file of fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => f.endsWith(".md")).sort() : []) {
    const { data, content } = matter(fs.readFileSync(path.join(DIR, file), "utf8"));
    const parsed = Frontmatter.safeParse(data);
    if (!parsed.success) throw new Error(`content/handouts/${file}: ${parsed.error.issues.map((i) => `${i.path.join(".")} — ${i.message}`).join("; ")}`);
    out.push({
      ...parsed.data,
      slug: file.replace(/\.md$/, ""),
      updated: parsed.data.updated.toISOString().slice(0, 10),
      html: marked.parse(content, { async: false }),
      isDraft: parsed.data.status === "draft",
    });
  }
  return (cache = out.sort((a, b) => a.order - b.order));
}

export function getHandouts(): Handout[] {
  return loadAll().filter((h) => showDrafts || !h.isDraft);
}

export function getHandout(slug: string): Handout | undefined {
  return getHandouts().find((h) => h.slug === slug);
}
