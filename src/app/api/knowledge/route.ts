import { CATEGORY_KEYS } from "@/lib/categories";
import { answer, booking, company, findAnswers, programPage, publishedAnswers, publishedLocations, publishedPrograms, rates } from "@/lib/knowledge";
import { siteUrl } from "@/lib/site";

// Public, read-only knowledge API for AI assistants and developers (CLAUDE.md §10). Described at /openapi.json.
//   GET /api/knowledge                         → company, programs, locations, rates, booking, answer index
//   GET /api/knowledge?q=heloc&category=heloc  → matching answers (with full text)
//   GET /api/knowledge?slug=how-does-a-heloc-work → one answer with full text
export const dynamic = "force-dynamic";

const headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
};
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data, null, 2), { status, headers });

export function OPTIONS() {
  return new Response(null, { status: 204, headers });
}

export function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const slug = params.get("slug")?.trim();
  const q = params.get("q")?.trim().slice(0, 200) || undefined;
  const category = params.get("category")?.trim() || undefined;
  const state = params.get("state")?.trim().toUpperCase() || undefined;

  if (category && !(CATEGORY_KEYS as readonly string[]).includes(category)) {
    return json({ error: `Unknown category. Use one of: ${CATEGORY_KEYS.join(", ")}` }, 400);
  }

  if (slug) {
    const e = publishedAnswers().find((x) => x.slug === slug);
    return e ? json({ company: company().name, answer: answer(e, true) }) : json({ error: "No published answer with that slug." }, 404);
  }

  if (q || category || state) {
    const results = findAnswers({ q, category, state }).slice(0, 25);
    return json({ query: { q, category, state }, count: results.length, answers: results.map((e) => answer(e, true)), booking: booking() });
  }

  return json({
    company: company(),
    programs: publishedPrograms().map(programPage),
    locations: publishedLocations().map(programPage),
    rates: rates(),
    booking: booking(),
    answers: publishedAnswers().map((e) => answer(e)),
    docs: { openapi: `${siteUrl}/openapi.json`, llms: `${siteUrl}/llms.txt`, llmsFull: `${siteUrl}/llms-full.txt` },
  });
}
