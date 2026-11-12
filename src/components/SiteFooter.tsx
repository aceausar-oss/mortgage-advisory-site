import Image from "next/image";
import Link from "next/link";
import { EqualHousingLenderLogo } from "@/components/EqualHousingLenderLogo";
import { spanishLegalNav, ui, type Lang } from "@/lib/i18n";
import { getLoanPages, getLocationPages } from "@/lib/loans";
import { legalNav as enLegalNav, licensing, resourcesNav, stateCodes } from "@/lib/site";

// Compliance block required on every page (CLAUDE.md §8). All facts come from content/data/licensing.json.
// Layout (Ace, Nov 2026): frosted cards, one type size per role (small caps headings, 14px links, 12px fine print),
// links in simple vertical lists, and the compliance details gathered in one quiet strip at the bottom.
const SHORT: Record<string, string> = { "60DBO": "DFPI CFL", MBR: "Mortgage Broker" };
const stateLicenseIds = licensing.states.flatMap((s) =>
  s.licenses
    .filter((l) => !l.number.startsWith("NMLS"))
    .map((l) => `${s.code} ${Object.entries(SHORT).find(([k]) => l.number.startsWith(k))?.[1] ?? "License"} #${l.number}`),
);

const frost = "rounded-3xl bg-white/55 ring-1 ring-white/80 shadow-[0_8px_30px_-18px_rgba(31,78,121,0.35)] backdrop-blur-md";
const heading = "font-heading text-xs font-semibold uppercase tracking-[0.14em] text-brand-slate";
const link = "text-sm text-brand-ink/80 transition-colors hover:text-brand-button";

export function SiteFooter({ lang = "en" }: { lang?: Lang }) {
  const t = ui[lang];
  const legalNav = lang === "es" ? spanishLegalNav : enLegalNav;
  const groups = [
    { label: t.loansGroup, links: getLoanPages(lang).map((p) => ({ href: `${lang === "es" ? "/es" : ""}${p.basePath}/${p.slug}`, label: p.name })) },
    { label: t.whereGroup, links: getLocationPages().map((p) => ({ href: `${p.basePath}/${p.slug}`, label: p.name })) },
    { label: t.companyGroup, links: resourcesNav },
  ];

  return (
    <footer className="mt-auto px-4 pb-8 pt-10 text-brand-ink sm:px-6">
      <div className="mx-auto max-w-[75rem] space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.35fr_1fr_0.75fr_1fr]">
          {/* Company card */}
          <div className={`${frost} space-y-4 p-6`}>
            <Image src="/brand/logo-tma-2026.png" alt={licensing.legalName} width={1837} height={497} sizes="200px" className="h-auto w-48" />
            <address className="space-y-1.5 text-sm not-italic text-brand-ink/80">
              <p className="font-semibold text-brand-slate">{licensing.legalName}</p>
              <p>{t.directLender}</p>
              <p>
                {licensing.address.street}
                <br />
                {licensing.address.city}, {licensing.address.region} {licensing.address.postalCode}
              </p>
              <p>
                <a href={`tel:${licensing.phoneE164}`} className="hover:text-brand-button">
                  {licensing.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${licensing.email}`} className="break-all hover:text-brand-button">
                  {licensing.email}
                </a>
              </p>
            </address>
            <a
              href={licensing.nmlsConsumerAccessUrl}
              rel="noopener"
              className="inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-brand-button ring-1 ring-brand-blue/40 hover:ring-brand-button"
            >
              NMLS #{licensing.nmls}
            </a>
          </div>

          {groups.map((g) => (
            <nav key={g.label} aria-label={g.label} className={`${frost} p-6`}>
              <p className={heading}>{g.label}</p>
              <ul className="mt-4 space-y-2.5">
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={link}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Compliance strip */}
        <div className={`${frost} space-y-4 px-6 py-5`}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <EqualHousingLenderLogo className="h-9 w-9 shrink-0 text-brand-slate" />
              <p className="text-xs leading-relaxed text-brand-slate">
                <span className="font-semibold uppercase tracking-wide">{t.equalHousing}</span>
                <span className="mx-2" aria-hidden="true">·</span>
                {t.licensedIn} {stateCodes.join(", ")}
                {stateLicenseIds.length > 0 && <> · {stateLicenseIds.join(" · ")}</>}
              </p>
            </div>
            <nav aria-label={t.legal}>
              <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs">
                {legalNav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-brand-slate underline-offset-4 hover:text-brand-button hover:underline">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="flex flex-col gap-1 border-t border-brand-blue/30 pt-4 text-xs leading-relaxed text-brand-slate/90 sm:flex-row sm:justify-between sm:gap-6">
            <p>{t.notCommitment}</p>
            <p className="shrink-0">
              © {new Date().getFullYear()} {licensing.legalName} {t.rights}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
