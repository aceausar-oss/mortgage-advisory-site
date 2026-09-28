import licensing from "../../content/data/licensing.json";

export { licensing };

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://themortgageadvisory.com"
).replace(/\/$/, "");

export const stateCodes = licensing.states.map((s) => s.code);

export const fullAddress = `${licensing.address.street}, ${licensing.address.city}, ${licensing.address.region} ${licensing.address.postalCode}`;

export const mainNav = [
  { href: "/loans/purchase", label: "Buy a Home" },
  { href: "/loans/refinance", label: "Refinance" },
  { href: "/loans/heloc", label: "HELOC & Equity" },
  { href: "/loans/reverse-mortgage", label: "Reverse Mortgage" },
  { href: "/answers", label: "Answers" },
  { href: "/costs", label: "Costs" },
  { href: "/about", label: "About" },
];

export const legalNav = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
  { href: "/accessibility", label: "Accessibility" },
  { href: "/licensing", label: "Licensing & Disclosures" },
  { href: "/do-not-sell", label: "Do Not Sell or Share My Personal Information" },
];

// Sitewide Organization / lender / founder / website graph (CLAUDE.md §12).
export function organizationJsonLd() {
  const orgId = `${siteUrl}/#organization`;
  const founderId = `${siteUrl}/#ace-ausar`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "FinancialService"],
        "@id": orgId,
        name: licensing.brandName,
        legalName: licensing.legalName,
        description: licensing.entityStatement,
        url: siteUrl,
        logo: `${siteUrl}/brand/logo-horizontal.png`,
        image: `${siteUrl}/brand/logo-horizontal.png`,
        identifier: {
          "@type": "PropertyValue",
          propertyID: "NMLS",
          value: licensing.nmls,
        },
        telephone: licensing.phoneE164,
        email: licensing.email,
        address: {
          "@type": "PostalAddress",
          streetAddress: licensing.address.street,
          addressLocality: licensing.address.city,
          addressRegion: licensing.address.region,
          postalCode: licensing.address.postalCode,
          addressCountry: licensing.address.country,
        },
        areaServed: licensing.states.map((s) => ({
          "@type": "State",
          name: s.name,
        })),
        founder: { "@id": founderId },
        foundingDate: licensing.foundingDate,
        sameAs: [licensing.nmlsConsumerAccessUrl, ...licensing.sameAs],
      },
      {
        "@type": "Person",
        "@id": founderId,
        name: licensing.founder.name,
        jobTitle: licensing.founder.jobTitle,
        image: `${siteUrl}${licensing.founder.image}`,
        worksFor: { "@id": orgId },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: licensing.brandName,
        publisher: { "@id": orgId },
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${siteUrl}/answers?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };
}
