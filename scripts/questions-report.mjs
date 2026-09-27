// Validates content/research/questions.json and writes a ranked summary to content/research/report.md.
// Run: npm run questions:report
import { readFile, writeFile } from "node:fs/promises";

const FILE = "content/research/questions.json";
const REPORT = "content/research/report.md";
const CATEGORIES = {
  buying: "Buying (incl. FHA & VA)",
  refinancing: "Refinancing",
  heloc: "HELOC & Equity",
  "debt-consolidation": "Debt Consolidation",
  "reverse-mortgage": "Reverse Mortgage",
  "self-employed": "Self-Employed / Non-QM",
  costs: "Costs & Pricing",
  about: "About Us",
};
const STATUSES = ["new", "drafting", "in-review", "published", "skip"];
const REQUIRED = ["id", "question", "category", "mentions", "sources", "firstSeen", "lastSeen", "status"];

const data = JSON.parse(await readFile(FILE, "utf8"));
const errors = [];
const ids = new Set();

for (const q of data.questions) {
  for (const field of REQUIRED) if (q[field] === undefined) errors.push(`${q.id ?? "?"}: missing "${field}"`);
  if (ids.has(q.id)) errors.push(`${q.id}: duplicate id`);
  ids.add(q.id);
  if (!CATEGORIES[q.category]) errors.push(`${q.id}: unknown category "${q.category}"`);
  if (!STATUSES.includes(q.status)) errors.push(`${q.id}: unknown status "${q.status}"`);
  if (q.sources?.some((u) => /reddit\.com\/(u|user)\//i.test(u))) errors.push(`${q.id}: links to a user profile`);
}

if (errors.length) {
  console.error(`questions.json has ${errors.length} problem(s):\n${errors.join("\n")}`);
  process.exit(1);
}

// Priority = times asked + extra weight for recent threads + licensed-state bonus + core-product bonus.
const BOOST = { "reverse-mortgage": 2, heloc: 2, "debt-consolidation": 2 };
const LICENSED = ["CA", "TX", "FL", "CO"];
// A source counts as recent if its age label is hours, days, or months (under a year), e.g. "reddit:r/Mortgages (3d)".
const recent = (q) => q.sources.filter((s) => /\((\d+)(h|d|mo)\)/.test(s)).length;
const score = (q) =>
  q.mentions +
  recent(q) +
  (q.states?.some((st) => LICENSED.includes(st)) ? 3 : 0) +
  (BOOST[q.category] ?? 0) +
  // Pinned = Ace's strategic priority pages; always ranked first regardless of post counts.
  (q.pinned ? 1000 : 0);

const lines = [
  `# Mortgage question report`,
  ``,
  `Generated from \`${FILE}\` (last updated ${data.updated}). ${data.questions.length} questions.`,
  ``,
  `Priority = times asked + 1 per thread from the past year + 3 if asked about CA, TX, FL, or CO + 2 for reverse/HELOC/debt topics. 📌 = pinned priority (always first).`,
  ``,
];

for (const [key, label] of Object.entries(CATEGORIES)) {
  const qs = data.questions.filter((q) => q.category === key).sort((a, b) => score(b) - score(a));
  if (!qs.length) continue;
  lines.push(`## ${label} (${qs.length})`, ``, `| Priority | Asked | States | Status | Question |`, `|---|---|---|---|---|`);
  for (const q of qs) lines.push(`| ${q.pinned ? "📌" : score(q)} | ${q.mentions} | ${q.states?.join(" ") ?? ""} | ${q.status} | ${q.question} |`);
  lines.push(``);
}

const next = data.questions
  .filter((q) => q.status === "new")
  .sort((a, b) => score(b) - score(a))
  .slice(0, 10);
lines.push(`## Next 10 to answer`, ``, ...next.map((q, i) => `${i + 1}. ${q.pinned ? "📌 " : ""}${q.question} (\`${q.id}\`)`), ``);

await writeFile(REPORT, lines.join("\n"));
console.log(`OK: ${data.questions.length} questions, report written to ${REPORT}`);
