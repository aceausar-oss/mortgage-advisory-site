import Link from "next/link";
import { EqualHousingLenderLogo } from "@/components/EqualHousingLenderLogo";
import { fullAddress, legalNav, licensing, stateCodes } from "@/lib/site";

// Compliance block required on every page (CLAUDE.md §8). All facts come from content/data/licensing.json.
export function SiteFooter() {
  return (
    <footer className="mt-auto bg-brand-slate text-white">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xl space-y-2 text-sm">
            <p className="font-heading text-lg font-semibold">{licensing.legalName}</p>
            <p>
              <a
                href={licensing.nmlsConsumerAccessUrl}
                className="underline underline-offset-4 hover:text-brand-blue"
                rel="noopener"
              >
                NMLS #{licensing.nmls}
              </a>{" "}
              · Direct mortgage lender
            </p>
            <address className="not-italic">
              {fullAddress} ·{" "}
              <a href={`tel:${licensing.phoneE164}`} className="underline underline-offset-4 hover:text-brand-blue">
                {licensing.phone}
              </a>{" "}
              ·{" "}
              <a href={`mailto:${licensing.email}`} className="underline underline-offset-4 hover:text-brand-blue">
                {licensing.email}
              </a>
            </address>
            <p>
              Licensed in {stateCodes.join(", ")} — see{" "}
              <Link href="/licensing" className="underline underline-offset-4 hover:text-brand-blue">
                Licensing &amp; Disclosures
              </Link>
              .
            </p>
          </div>

          <div className="flex items-center gap-3">
            <EqualHousingLenderLogo className="h-14 w-14 text-white" />
            <span className="font-heading text-sm font-semibold uppercase tracking-wide">
              Equal Housing Lender
            </span>
          </div>
        </div>

        <nav aria-label="Legal">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="underline underline-offset-4 hover:text-brand-blue">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="border-t border-white/20 pt-6 text-xs leading-relaxed text-white/90">
          This is not a commitment to lend. All loans subject to credit approval, underwriting, and
          property valuation. Rates, terms, and programs subject to change without notice.
        </p>
        <p className="text-xs text-white/90">
          © {new Date().getFullYear()} {licensing.legalName} All rights reserved.
        </p>
      </div>
    </footer>
  );
}
