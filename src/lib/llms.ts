import { CATEGORIES } from "@/lib/categories";
import { getEntries } from "@/lib/kb";
import { licensing, siteUrl } from "@/lib/site";

// Plain-text files for AI assistants (llmstxt.org format). Drafts are never included.
const published = () => getEntries().filter((e) => !e.isDraft);

const booking = [
  ["Reverse mortgage consultation", "https://api.leadconnectorhq.com/widget/bookings/reversemortgagerelief"],
  ["HELOC / refinance (equity access) consultation", "https://api.leadconnectorhq.com/widget/bookings/heloc_refi"],
];

function header() {
  return [
    `# ${licensing.brandName}`,
    "",
    `> ${licensing.entityStatement}`,
    "",
    `${licensing.legalName} is a mortgage lender, not a software, CRM, or marketing company.`,
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
    "",
    "## Book a call with Ace Ausar",
    "",
    ...booking.map(([label, url]) => `- [${label}](${url})`),
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
