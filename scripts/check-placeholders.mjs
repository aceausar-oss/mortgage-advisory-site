// Fails a production build while unverified placeholder text remains (CLAUDE.md §8, §12).
// Production = Vercel production deploys, or STRICT_PLACEHOLDERS=1. Everywhere else it only warns.
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const ROOTS = ["content", "src"];
const PATTERN = /\[VERIFY|\bTODO\b/;
const EXTENSIONS = /\.(json|md|mdx|ts|tsx|js|jsx|css)$/;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (EXTENSIONS.test(entry.name)) yield path;
  }
}

const hits = [];
for (const root of ROOTS) {
  for await (const file of walk(root)) {
    const lines = (await readFile(file, "utf8")).split("\n");
    lines.forEach((line, i) => {
      if (PATTERN.test(line)) hits.push(`${file}:${i + 1}: ${line.trim()}`);
    });
  }
}

const strict = process.env.VERCEL_ENV === "production" || process.env.STRICT_PLACEHOLDERS === "1";

if (hits.length === 0) {
  console.log("Placeholder check: none found.");
} else if (strict) {
  console.error(`Placeholder check FAILED — ${hits.length} unverified item(s) must be filled before production:\n`);
  console.error(hits.join("\n"));
  process.exit(1);
} else {
  console.warn(`Placeholder check: ${hits.length} unverified item(s) (allowed outside production):`);
  console.warn(hits.join("\n"));
}
