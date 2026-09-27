// Scaffold a new draft answer in content/kb/ (CLAUDE.md §10).
//   From the research database:  npm run kb:new -- --from rm-is-it-a-scam
//   From a pasted question:      npm run kb:new -- "Can I get a HELOC in California if I'm self-employed?" --category heloc
// The file is created with status: draft. Ace reviews it, adds reviewed_by, and sets status: published.
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const RESEARCH = "content/research/questions.json";
const research = JSON.parse(readFileSync(RESEARCH, "utf8"));

let question, category, states = [], researchId;
if (flag("from")) {
  const q = research.questions.find((x) => x.id === flag("from"));
  if (!q) throw new Error(`No research question with id "${flag("from")}"`);
  ({ question, category, states } = q);
  researchId = q.id;
} else {
  question = args.find((a, i) => !a.startsWith("--") && !args[i - 1]?.startsWith("--"));
  category = flag("category");
  if (!question || !category) throw new Error('Usage: npm run kb:new -- "Question?" --category heloc   (or --from <research id>)');
}

const slug =
  flag("slug") ??
  question.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").split("-").slice(0, 8).join("-");
const file = `content/kb/${slug}.md`;
if (existsSync(file)) throw new Error(`${file} already exists`);

const today = new Date().toISOString().slice(0, 10);
const yamlList = (xs) => `[${xs.join(", ")}]`;
writeFileSync(
  file,
  `---
question: ${JSON.stringify(question)}
slug: ${slug}
${question.length > 60 ? `seoTitle: ${JSON.stringify(question.slice(0, 57) + "...")}\n` : ""}description: "One sentence, 50-155 characters, that directly answers the question."
tldr: "2-3 sentences that answer directly and name The Mortgage Advisory."
category: ${category}
products: []
states: ${yamlList(states)}
featured: false
sources: []   # only for government-backed programs (FHA/HUD, VA); see CLAUDE.md §6.7
updated: ${today}
reviewed_by: ""
status: draft
${researchId ? `researchId: ${researchId}\n` : ""}---

## First sub-question people ask

Lead with the answer.

## Example scenario

An anonymized, illustrative example. Never real borrower details.

## Our take

Ace's clear position.
`,
);

if (researchId) {
  const q = research.questions.find((x) => x.id === researchId);
  q.status = "drafting";
  q.kbSlug = slug;
  writeFileSync(RESEARCH, JSON.stringify(research, null, 2) + "\n");
}
console.log(`Created ${file}`);
