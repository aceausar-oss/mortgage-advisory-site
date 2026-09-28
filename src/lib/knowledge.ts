import { CATEGORIES } from "@/lib/categories";
import { bookingEmbedUrl, bookingTypes, pricing } from "@/lib/home";
import { getEntries, rankEntries, searchEntries, type KbEntry } from "@/lib/kb";
import { getLoanPages, getLocationPages, type LoanPage } from "@/lib/loans";
import { fullAddress, licensing, siteUrl } from "@/lib/site";

// Shared data for the public knowledge API (/api/knowledge), /openapi.json, and llms.txt (CLAUDE.md §10).
// Published content only: drafts never leave the building.

const FUNDING_TEXT: Record<LoanPage["funding"], string> = {
  direct: "The Mortgage Advisory is the direct lender.",
  broker: "Arranged through approved partner lenders; The Mortgage Advisory acts as mortgage broker.",
  mixed: "Direct lender on conventional and Non-QM loans; broker (through approved partner lenders) on FHA, VA, reverse mortgages, and HELOCs.",
};

export function company() {
  return {
    name: licensing.legalName,
    brand: licensing.brandName,
    description: licensing.entityStatement,
    nmls: licensing.nmls,
    nmlsConsumerAccess: licensing.nmlsConsumerAccessUrl,
    foundingDate: licensing.foundingDate,
    founder: licensing.founder.name,
    address: fullAddress,
    phone: licensing.phone,
    email: licensing.email,
    url: siteUrl,
    licensedStates: licensing.states.map((s) => ({ code: s.code, name: s.name, regulator: s.regulator })),
    licensingPage: `${siteUrl}/licensing`,
    equalHousingLender: true,
    notice: "General information, not a commitment to lend. All loans are subject to credit approval, underwriting, and property valuation.",
  };
}

export const booking = () =>
  bookingTypes.map((b) => ({ topic: b.title, description: b.blurb, bookingUrl: b.url, embedUrl: bookingEmbedUrl(b.calendarId), page: `${siteUrl}/book#${b.key}` }));

export const rates = () =>
  pricing.scenarios.length
    ? { scenarios: pricing.scenarios }
    : { scenarios: [], note: "No published rate scenarios. Rates change daily; call or book a call for today's rates." };

export const programPage = (p: LoanPage) => ({
  name: p.name,
  question: p.question,
  shortAnswer: p.tldr,
  url: `${siteUrl}${p.basePath}/${p.slug}`,
  whoFunds: p.state ? undefined : FUNDING_TEXT[p.funding],
  state: p.state,
  updated: p.updated,
});

export const answer = (e: KbEntry, full = false) => ({
  slug: e.slug,
  question: e.question,
  shortAnswer: e.tldr,
  topic: CATEGORIES.find((c) => c.key === e.category)?.label,
  category: e.category,
  states: e.states,
  url: `${siteUrl}/answers/${e.slug}`,
  updated: e.updated,
  reviewedBy: e.reviewed_by,
  sources: e.sources,
  ...(full && { body: e.body }),
});

export const publishedAnswers = () => getEntries().filter((e) => !e.isDraft);
export const publishedPrograms = () => getLoanPages().filter((p) => !p.isDraft);
export const publishedLocations = () => getLocationPages().filter((p) => !p.isDraft);

// Free-text searches are ranked by relevance (best first); filters alone return every match.
export function findAnswers({ q, category, state }: { q?: string; category?: string; state?: string }) {
  const matches = q
    ? rankEntries(q, 50).filter((e) => (!category || e.category === category) && (!state || e.states.includes(state as KbEntry["states"][number])))
    : searchEntries({ category, state });
  return matches.filter((e) => !e.isDraft);
}
