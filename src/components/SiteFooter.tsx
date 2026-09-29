import Link from "next/link";
import { EqualHousingLenderLogo } from "@/components/EqualHousingLenderLogo";
import { getLoanPages, getLocationPages } from "@/lib/loans";
import { fullAddress, legalNav, licensing, stateCodes } from "@/lib/site";

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
      {/* Same large contrasting card as the homepage sections, on the same frame as every other section. */}
      <div className="mx-auto max-w-6xl space-y-8 rounded-[2rem] bg-white p-6 shadow-[0_20px_50px_-24px_rgba(57,58,62,0.22)] ring-1 ring-black/5 sm:p-10">
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

        <div className="grid gap-6 sm:grid-cols-2">
          {[
            { label: "Loans", pages: getLoanPages() },
            { label: "Where we lend", pages: getLocationPages() },
          ].map((group) => (
            <nav key={group.label} aria-label={group.label}>
              <p className="font-heading text-sm font-semibold uppercase tracking-wide text-brand-slate">{group.label}</p>
              <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
                {group.pages.map((p) => (
                  <li key={p.slug}>
                    <Link href={`${p.basePath}/${p.slug}`} className="text-brand-ink hover:text-brand-button hover:underline underline-offset-4">
                      {p.name}
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
