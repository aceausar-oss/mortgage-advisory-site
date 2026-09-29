import Link from "next/link";
import { EqualHousingLenderLogo } from "@/components/EqualHousingLenderLogo";
import { getLoanPages, getLocationPages } from "@/lib/loans";
import { fullAddress, legalNav, licensing, resourcesNav, stateCodes } from "@/lib/site";

// Compliance block required on every page (CLAUDE.md §8). All facts come from content/data/licensing.json.
// State license numbers that differ from the NMLS ID are shown here too.
const SHORT: Record<string, string> = { "60DBO": "DFPI CFL", MBR: "Mortgage Broker" };
const stateLicenseIds = licensing.states.flatMap((s) =>
  s.licenses
    .filter((l) => !l.number.startsWith("NMLS"))
    .map((l) => `${s.code} ${Object.entries(SHORT).find(([k]) => l.number.startsWith(k))?.[1] ?? "License"} #${l.number}`),
);
export function SiteFooter() {
  return (
    <footer className="mt-auto px-4 pb-10 pt-6 text-brand-ink sm:px-6">
      {/* Same large rounded card shape as the homepage sections, but no fill or shadow: it matches the page
          background and is marked only by a thin outline (Ace, Sept 2026). */}
      <div className="mx-auto max-w-6xl space-y-8 rounded-[2rem] border border-brand-steel/40 p-6 sm:p-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xl space-y-2 text-sm">
            <p className="font-heading text-lg font-semibold text-brand-slate">{licensing.legalName}</p>
            <p>
              <a
                href={licensing.nmlsConsumerAccessUrl}
                className="font-medium text-brand-button underline underline-offset-4 hover:text-brand-slate"
                rel="noopener"
              >
                NMLS #{licensing.nmls}
              </a>{" "}
              · Direct lender & mortgage broker
            </p>
            <address className="not-italic">
              {fullAddress} ·{" "}
              <a href={`tel:${licensing.phoneE164}`} className="font-medium text-brand-button underline underline-offset-4 hover:text-brand-slate">
                {licensing.phone}
              </a>{" "}
              ·{" "}
              <a href={`mailto:${licensing.email}`} className="font-medium text-brand-button underline underline-offset-4 hover:text-brand-slate">
                {licensing.email}
              </a>
            </address>
            <p>
              Licensed in {stateCodes.join(", ")}
              {stateLicenseIds.length > 0 && <> · {stateLicenseIds.join(" · ")}</>} — see{" "}
              <Link href="/licensing" className="font-medium text-brand-button underline underline-offset-4 hover:text-brand-slate">
                Licensing &amp; Disclosures
              </Link>
              .
            </p>
          </div>

          <div className="flex items-center gap-3">
            <EqualHousingLenderLogo className="h-14 w-14 text-brand-slate" />
            <span className="font-heading text-sm font-semibold uppercase tracking-wide text-brand-slate">
              Equal Housing Lender
            </span>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          {[
            { label: "Loans", links: getLoanPages().map((p) => ({ href: `${p.basePath}/${p.slug}`, label: p.name })) },
            { label: "Where we lend", links: getLocationPages().map((p) => ({ href: `${p.basePath}/${p.slug}`, label: p.name })) },
            { label: "Company & tools", links: resourcesNav },
          ].map((group) => (
            <nav key={group.label} aria-label={group.label}>
              <p className="font-heading text-sm font-semibold uppercase tracking-wide text-brand-slate">{group.label}</p>
              <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
                {group.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-brand-ink hover:text-brand-button hover:underline underline-offset-4">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <nav aria-label="Legal">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="font-medium text-brand-button underline underline-offset-4 hover:text-brand-slate">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="border-t border-brand-blue/50 pt-6 text-xs leading-relaxed text-brand-slate">
          This is not a commitment to lend. All loans subject to credit approval, underwriting, and
          property valuation. Rates, terms, and programs subject to change without notice.
        </p>
        <p className="text-xs text-brand-slate">
          © {new Date().getFullYear()} {licensing.legalName} All rights reserved.
        </p>
      </div>
    </footer>
  );
}
