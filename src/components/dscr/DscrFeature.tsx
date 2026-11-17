import Image from "next/image";
import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import { quizHref } from "@/lib/qualifyPaths";
import { DSCR_EXAMPLE } from "@/lib/dscr";
import { DscrCalculator } from "@/components/dscr/DscrCalculator";

// The DSCR page's investor check (Ace, Nov 2026): a big, hard-to-miss card in place of the small quiz banner.
// The button says what the visitor gets, never "quiz". Links to the investor path and the DSCR calculator.

const COPY = {
  en: {
    kicker: "2-minute investor check · No tax returns needed",
    title: "Will your rental qualify for a DSCR loan?",
    points: ["DSCR or conventional: which fits this property", "Your estimated cash-out on a refinance", "Your document checklist, ready to go"],
    cta: "Check if my rental qualifies",
    calc: "Run the DSCR calculator",
    calcHref: "#dscr-calculator",
    alt: "Single-family rental home",
  },
  es: {
    kicker: "Revisión para inversionistas en 2 minutos · Sin declaraciones de impuestos",
    title: "¿Su propiedad de renta califica para un préstamo DSCR?",
    points: ["DSCR o convencional: cuál le funciona a esta propiedad", "Su estimado de retiro de efectivo al refinanciar", "Su lista de documentos, lista para usar"],
    cta: "Ver si mi propiedad califica",
    calc: "Usar la calculadora DSCR",
    calcHref: "#calculadora-dscr",
    alt: "Casa unifamiliar de renta",
  },
};

export function DscrFeature({ lang = "en", showCalc = true }: { lang?: Lang; showCalc?: boolean }) {
  const c = COPY[lang];
  return (
    <section
      aria-labelledby="dscr-check-h"
      className="overflow-hidden rounded-3xl bg-gradient-to-br from-brand-slate to-[#1f4e79] text-white shadow-[0_24px_48px_-24px_rgba(31,78,121,0.7)] ring-1 ring-brand-blue/40 sm:grid sm:grid-cols-[1.4fr_1fr]"
    >
      <div className="relative p-6 sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-brand-blue/30 blur-3xl" />
        <p className="relative inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white">{c.kicker}</p>
        <h2 id="dscr-check-h" className="relative mt-4 text-2xl font-bold leading-tight sm:text-3xl" style={{ color: "#fff" }}>
          {c.title}
        </h2>
        <ul className="relative mt-4 space-y-2">
          {c.points.map((p) => (
            <li key={p} className="flex items-start gap-2.5 text-white/95">
              <span aria-hidden="true" className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand-ink">
                ✓
              </span>
              {p}
            </li>
          ))}
        </ul>
        <div className="relative mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={quizHref("invest", lang)}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-6 py-3 text-lg font-bold text-brand-ink shadow-lg transition hover:-translate-y-0.5 hover:bg-mist"
          >
            {c.cta} <span aria-hidden="true">→</span>
          </Link>
          {showCalc && (
            <Link href={c.calcHref} className="inline-flex min-h-12 items-center rounded-full border border-white/70 px-5 py-3 font-semibold text-white hover:bg-white/10">
              {c.calc}
            </Link>
          )}
        </div>
      </div>
      <div className="relative hidden min-h-56 sm:block">
        <Image src="/images/loans/dscr-single-family.jpg" alt={c.alt} fill sizes="(min-width: 768px) 320px, 0px" className="object-cover" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#1f4e79] via-[#1f4e79]/20 to-transparent" />
      </div>
    </section>
  );
}

/** The calculator, embedded further down the DSCR page (English links to the full calculator page). */
export function DscrCalculatorSection({ lang = "en" }: { lang?: Lang }) {
  const es = lang === "es";
  return (
    <section id={es ? "calculadora-dscr" : "dscr-calculator"} aria-labelledby="dscr-calc-h" className="scroll-mt-24 space-y-4">
      <h2 id="dscr-calc-h" className="font-heading text-2xl font-semibold">
        {es ? "Calcule el DSCR de su propiedad" : "Calculate your property's DSCR"}
      </h2>
      <p className="leading-relaxed text-brand-slate">
        {es
          ? "DSCR = renta mensual ÷ pago mensual completo (capital, intereses, impuestos, seguro y HOA). Escriba sus números para ver su resultado."
          : "DSCR = monthly rent ÷ the full monthly payment (principal, interest, taxes, insurance, and HOA). Type in your numbers to see where you land."}
      </p>
      <DscrCalculator initial={DSCR_EXAMPLE} lang={lang} compact />
      {!es && (
        <p className="text-sm">
          <Link href="/dscr-calculator" className="font-semibold text-brand-button underline underline-offset-2">
            Open the full DSCR calculator →
          </Link>
        </p>
      )}
    </section>
  );
}
