"use client";

import { usePathname } from "next/navigation";
import { SPANISH_PATHS, toEn, toEs, type Lang } from "@/lib/i18n";

// EN/ES switch in the header. Goes to the same page in the other language when it exists (/loans/heloc ↔
// /es/loans/heloc); English pages without a Spanish twin go to the Spanish homepage. Rendered on the server too
// (usePathname works during server rendering), so it's a plain link that works without JavaScript.
// A plain <a>, not next/link: the two languages use separate root layouts, so switching is a full page load anyway.
export function LangToggle({ lang }: { lang: Lang }) {
  const path = usePathname() || "/";
  // ?lang=en tells src/proxy.ts to remember English (so a visitor who chose Spanish earlier isn't sent back).
  const target = lang === "es" ? `${toEn(path)}?lang=en` : SPANISH_PATHS.includes(path) ? toEs(path) : "/es";
  return (
    <a
      href={target}
      hrefLang={lang === "es" ? "en" : "es"}
      lang={lang === "es" ? "en" : "es"}
      aria-label={lang === "es" ? "View this page in English" : "Ver esta página en español"}
      className="inline-flex h-10 shrink-0 items-center gap-1 rounded-full border border-brand-steel/50 px-2.5 text-sm font-semibold text-brand-slate hover:border-brand-slate"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="hidden h-4 w-4 sm:block" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </svg>
      <span className="sm:hidden">{lang === "es" ? "EN" : "ES"}</span>
      <span className="hidden sm:inline">{lang === "es" ? "English" : "Español"}</span>
    </a>
  );
}
