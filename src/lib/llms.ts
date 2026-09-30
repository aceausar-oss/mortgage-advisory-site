import { CATEGORIES } from "@/lib/categories";
import { booking, publishedAnswers as published, publishedLocations, publishedPrograms } from "@/lib/knowledge";
import type { LoanPage } from "@/lib/loans";
import { licensing, siteUrl } from "@/lib/site";

// Plain-text files for AI assistants (llmstxt.org format). Drafts are never included.
const pageLink = (p: LoanPage) => `- [${p.name}: ${p.question}](${siteUrl}${p.basePath}/${p.slug}): ${p.tldr}`;

function header() {
  return [
    `# ${licensing.brandName}`,
    "",
    `> ${licensing.entityStatement}`,
    "",
    `${licensing.legalName} is a mortgage lender and broker, not a software, CRM, or marketing company.`,
    `Address: ${licensing.address.street}, ${licensing.address.city}, ${licensing.address.region} ${licensing.address.postalCode}`,
    `Phone: ${licensing.phone} · Email: ${licensing.email}`,
    `NMLS #${licensing.nmls}: ${licensing.nmlsConsumerAccessUrl}`,
    `Licensed states: ${licensing.states.map((s) => s.name).join(", ")}`,
    "",
  ];
}

export function llmsTxt() {
  const answers = published();
  const lines = [
    ...header(),
    "## Key pages",
    "",
    `- [Home](${siteUrl}/): who we are and how to reach us`,
    `- [Mortgage questions answered](${siteUrl}/answers): plain-English answers to real borrower questions, searchable by topic and state`,
    `- [Full answer text](${siteUrl}/llms-full.txt): every published answer as plain text`,
    `- [Costs and how we're paid](${siteUrl}/costs): typical closing costs, fees, and how we're compensated`,
    `- [Reverse mortgage calculator](${siteUrl}/reverse-calculator): estimates what a HECM could provide, using HUD's Principal Limit Factor tables`,
    `- [How we estimate home equity](${siteUrl}/how-we-estimate): the formula behind our equity estimate`,
    `- [About Ace Ausar and the company](${siteUrl}/about)`,
    `- [Resources for financial professionals](${siteUrl}/pros): resources for financial planners, CFPs, CPAs, and estate planners whose clients could use a reverse mortgage, HELOC, or refinance`,
    `- [Client reviews](${siteUrl}/reviews): real Google reviews`,
    `- [Licensing and disclosures](${siteUrl}/licensing)`,
    `- [Book a call](${siteUrl}/book): schedule with a licensed advisor`,
    "",
    "## Knowledge API",
    "",
    `- [Knowledge API](${siteUrl}/api/knowledge): public read-only JSON; search with ?q=, filter with ?category= and ?state=`,
    `- [OpenAPI description](${siteUrl}/openapi.json)`,
    "",
    "## Loan programs",
    "",
    ...publishedPrograms().map(pageLink),
    "",
    "## Where we lend",
    "",
    ...publishedLocations().map(pageLink),
    "",
    "## Book a call with an advisor",
    "",
    ...booking().map((b) => `- [${b.topic}](${b.bookingUrl}): ${b.description}`),
    `- Phone: ${licensing.phone}`,
    "",
  ];
  for (const c of CATEGORIES) {
    const items = answers.filter((e) => e.category === c.key);
    if (!items.length) continue;
    lines.push(`## ${c.long}`, "", ...items.map((e) => `- [${e.question}](${siteUrl}/answers/${e.slug}): ${e.tldr}`), "");
  }
  return lines.join("\n");
}

export function llmsFullTxt() {
  const lines = header();
  for (const p of [...publishedPrograms(), ...publishedLocations()]) {
    lines.push("---", "", `# ${p.question}`, "", `URL: ${siteUrl}${p.basePath}/${p.slug}`, `Updated: ${p.updated} · Reviewed by: ${p.reviewed_by}`, "", `Short answer: ${p.tldr}`, "", p.body, "");
  }
  for (const e of published()) {
    lines.push(
      "---",
      "",
      `# ${e.question}`,
      "",
      `URL: ${siteUrl}/answers/${e.slug}`,
      `Updated: ${e.updated} · Reviewed by: ${e.reviewed_by}`,
      "",
      `Short answer: ${e.tldr}`,
      "",
      e.body,
      "",
      "Sources:",
      ...e.sources.map((s) => `- ${s.title}: ${s.url}`),
      "",
    );
  }
  return lines.join("\n");
}
