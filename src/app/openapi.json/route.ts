import { CATEGORY_KEYS } from "@/lib/categories";
import { licensing, siteUrl, stateCodes } from "@/lib/site";

// OpenAPI description of the public knowledge API (CLAUDE.md §10). Also served at /.well-known/openapi.json.
export const dynamic = "force-static";

export function GET() {
  const spec = {
    openapi: "3.1.0",
    info: {
      title: `${licensing.brandName} Knowledge API`,
      version: "1.0.0",
      description: `Read-only answers to real mortgage questions from ${licensing.legalName} (NMLS #${licensing.nmls}), a mortgage lender and broker licensed in ${stateCodes.join(", ")}. General information, not a commitment to lend.`,
      contact: { name: licensing.brandName, email: licensing.email, url: siteUrl },
    },
    servers: [{ url: siteUrl }],
    paths: {
      "/api/knowledge": {
        get: {
          operationId: "getKnowledge",
          summary: "Company profile, loan programs, locations, booking links, and mortgage answers",
          description:
            "With no parameters, returns the company profile, loan programs, state pages, rate note, booking links, and an index of every published answer. With q, category, or state, returns matching answers with full text. With slug, returns one answer.",
          parameters: [
            { name: "q", in: "query", required: false, schema: { type: "string", maxLength: 200 }, description: "Words to search for, e.g. 'heloc keep low rate'." },
            { name: "category", in: "query", required: false, schema: { type: "string", enum: CATEGORY_KEYS }, description: "Topic filter." },
            { name: "state", in: "query", required: false, schema: { type: "string", enum: stateCodes }, description: "Two-letter state filter." },
            { name: "slug", in: "query", required: false, schema: { type: "string" }, description: "Return one answer by its slug." },
          ],
          responses: {
            "200": { description: "JSON knowledge response", content: { "application/json": { schema: { type: "object" } } } },
            "400": { description: "Unknown category" },
            "404": { description: "No published answer with that slug" },
          },
        },
      },
    },
  };
  return new Response(JSON.stringify(spec, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*", "Cache-Control": "public, max-age=3600" },
  });
}
