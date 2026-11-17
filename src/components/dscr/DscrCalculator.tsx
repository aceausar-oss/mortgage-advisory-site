"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Lang } from "@/lib/i18n";
import { clampMoney, dscr, usd, type DscrBand, type DscrInput } from "@/lib/dscr";

// Interactive DSCR calculator. Server-rendered with the same numbers inside a GET form, so without JavaScript the
// visitor edits the fields and presses Calculate. Math runs on the device only; nothing is sent or saved.

type Field = { key: keyof DscrInput; en: string; es: string; hintEn: string; hintEs: string; per: "mo" | "yr" };

const FIELDS: Field[] = [
  { key: "rent", en: "Monthly rent", es: "Renta mensual", hintEn: "Lease, or the appraiser's market rent", hintEs: "Contrato de renta o renta de mercado del avalúo", per: "mo" },
  { key: "pi", en: "Principal & interest", es: "Capital e intereses", hintEn: "From your quote or your own estimate", hintEs: "De su cotización o su propio estimado", per: "mo" },
  { key: "taxes", en: "Property taxes", es: "Impuestos a la propiedad", hintEn: "Yearly amount", hintEs: "Monto anual", per: "yr" },
  { key: "insurance", en: "Insurance", es: "Seguro", hintEn: "Yearly premium (get a real quote)", hintEs: "Prima anual (pida una cotización real)", per: "yr" },
  { key: "hoa", en: "HOA dues", es: "Cuotas de HOA", hintEn: "Monthly, if any", hintEs: "Mensual, si aplica", per: "mo" },
];

const BAND: Record<DscrBand, { en: [string, string]; es: [string, string]; color: string }> = {
  strong: {
    en: ["Rent covers the payment with room to spare", "Most DSCR programs look for 1.00 or higher; you're above it with a cushion."],
    es: ["La renta cubre el pago con margen", "La mayoría de los programas DSCR buscan 1.00 o más; usted está por encima, con margen."],
    color: "#7cc4ff",
  },
  covers: {
    en: ["Rent covers the payment", "Most DSCR programs look for 1.00 or higher. A little more cushion can open more options."],
    es: ["La renta cubre el pago", "La mayoría de los programas DSCR buscan 1.00 o más. Un poco más de margen puede abrir más opciones."],
    color: "#a7c8ea",
  },
  short: {
    en: ["Rent falls short of the payment", "Some programs allow a ratio under 1.00, usually with a bigger down payment. Let's look at your options."],
    es: ["La renta no alcanza a cubrir el pago", "Algunos programas permiten menos de 1.00, normalmente con un enganche mayor. Revisemos sus opciones."],
    color: "#f2b880",
  },
};

const GAUGE_MAX = 2;

export function DscrCalculator({ initial, lang = "en", compact = false }: { initial: DscrInput; lang?: Lang; compact?: boolean }) {
  const es = lang === "es";
  const pre = es ? "/es" : "";
  const [v, setV] = useState<DscrInput>(initial);
  const r = useMemo(() => dscr(v), [v]);
  const band = BAND[r.band];
  const [title, note] = es ? band.es : band.en;
  const has = r.payment > 0 && v.rent > 0;
  const ratio = has ? r.ratio.toFixed(2) : "—";
  const marker = Math.min(Math.max(r.ratio / GAUGE_MAX, 0), 1) * 100;

  const askQ = es
    ? `El DSCR de mi propiedad de renta es ${ratio}: renta ${usd(v.rent)} al mes, pago total ${usd(r.payment)} al mes. ¿Qué préstamos DSCR me funcionan?`
    : `My rental's DSCR is ${ratio}: rent ${usd(v.rent)}/mo, full payment ${usd(r.payment)}/mo. Which DSCR loan options fit?`;

  return (
    <form
      action="/dscr-calculator"
      method="get"
      aria-label={es ? "Calculadora DSCR" : "DSCR calculator"}
      className={`grid gap-6 ${compact ? "" : "lg:grid-cols-[1.1fr_1fr] lg:gap-8"}`}
    >
      <fieldset className="space-y-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
        <legend className="sr-only">{es ? "Números de la propiedad" : "Property numbers"}</legend>
        <p className="font-heading text-lg font-semibold">{es ? "Números de la propiedad" : "Your property's numbers"}</p>
        <div className={`grid gap-4 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"}`}>
          {FIELDS.map((f) => (
            <label key={f.key} className="block">
              <span className="block text-sm font-semibold text-brand-ink">{es ? f.es : f.en}</span>
              <span className="mt-1 flex items-center rounded-xl border border-brand-steel/40 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-brand-button">
                <span aria-hidden="true" className="text-brand-slate">
                  $
                </span>
                <input
                  name={f.key}
                  inputMode="numeric"
                  value={v[f.key].toLocaleString("en-US")}
                  onChange={(e) => setV((o) => ({ ...o, [f.key]: clampMoney(Number(e.target.value.replace(/[^0-9]/g, ""))) }))}
                  className="w-full bg-transparent px-1 text-right text-lg tabular-nums outline-none"
                />
                <span className="text-sm text-brand-slate">{f.per === "mo" ? (es ? "/mes" : "/mo") : es ? "/año" : "/yr"}</span>
              </span>
              <span className="mt-1 block text-xs text-brand-slate">{es ? f.hintEs : f.hintEn}</span>
            </label>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-brand-steel/20 pt-4">
          <button type="submit" className="no-js-only rounded-full bg-brand-soft px-5 py-2 font-semibold text-brand-ink">
            {es ? "Calcular" : "Calculate"}
          </button>
          <p className="text-xs text-brand-slate">
            {es
              ? "Los números de ejemplo son del caso “Propiedad A” de nuestra respuesta. Cámbielos por los suyos."
              : "Example numbers from “Property A” in our answer. Replace them with yours."}
          </p>
        </div>
      </fieldset>

      <section aria-live="polite" aria-label={es ? "Su resultado DSCR" : "Your DSCR result"} className="space-y-5 rounded-2xl bg-charcoal p-5 text-white sm:p-6">
        <div>
          <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-white/80">{es ? "Su DSCR" : "Your DSCR"}</p>
          <p className="font-heading text-6xl font-bold tracking-tight" style={{ color: "#fff" }}>
            {ratio}
          </p>
          {has && (
            <p className="mt-1 text-lg font-semibold" style={{ color: band.color }}>
              {title}
            </p>
          )}
          {has && <p className="mt-1 text-sm text-white/85">{note}</p>}
        </div>

        <figure aria-hidden="true" className="space-y-1.5">
          <div className="relative h-3 rounded-full bg-white/15">
            <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${has ? marker : 0}%`, background: band.color }} />
            {[1, 1.25].map((m) => (
              <span key={m} className="absolute -top-1 h-5 w-0.5 bg-white/70" style={{ left: `${(m / GAUGE_MAX) * 100}%` }} />
            ))}
          </div>
          <div className="relative h-4 text-xs text-white/75">
            <span className="absolute left-0">0</span>
            <span className="absolute -translate-x-1/2" style={{ left: "50%" }}>
              1.00
            </span>
            <span className="absolute -translate-x-1/2" style={{ left: "62.5%" }}>
              1.25
            </span>
            <span className="absolute right-0">2.00+</span>
          </div>
        </figure>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-white/10 p-3">
            <dt className="text-white/80">{es ? "Pago total (PITIA)" : "Full payment (PITIA)"}</dt>
            <dd className="font-heading text-xl font-bold tabular-nums">
              {usd(r.payment)}
              <span className="text-sm font-normal">{es ? "/mes" : "/mo"}</span>
            </dd>
          </div>
          <div className="rounded-xl bg-white/10 p-3">
            <dt className="text-white/80">{es ? "Renta menos pago" : "Rent minus payment"}</dt>
            <dd className="font-heading text-xl font-bold tabular-nums">
              {usd(r.cashFlow)}
              <span className="text-sm font-normal">{es ? "/mes" : "/mo"}</span>
            </dd>
          </div>
          <div className="rounded-xl bg-white/10 p-3">
            <dt className="text-white/80">{es ? "Renta para llegar a 1.00" : "Rent needed for 1.00"}</dt>
            <dd className="font-heading text-xl font-bold tabular-nums">{usd(r.rentFor1)}</dd>
          </div>
          <div className="rounded-xl bg-white/10 p-3">
            <dt className="text-white/80">{es ? "Renta para llegar a 1.25" : "Rent needed for 1.25"}</dt>
            <dd className="font-heading text-xl font-bold tabular-nums">{usd(r.rentFor125)}</dd>
          </div>
        </dl>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <Link href={`${pre}/qualify/investor`} className="rounded-full bg-white px-5 py-2.5 font-semibold text-brand-ink hover:bg-mist">
              {es ? "Vea qué préstamos le funcionan" : "See which loans fit my rental"}
            </Link>
            <Link href={`${pre}/ask?q=${encodeURIComponent(askQ)}`} className="js-only rounded-full border border-white px-5 py-2.5 font-semibold text-white hover:bg-white/10">
              {es ? "Pregúntele al asistente" : "Ask about my numbers"}
            </Link>
          </div>
          <p className="text-xs leading-relaxed text-white/75">
            {es
              ? "Solo un estimado: el prestamista usa la renta del avalúo o del contrato y su pago real. “Renta menos pago” no incluye vacantes, reparaciones ni administración. Sus números se quedan en su dispositivo y no se guardan."
              : "Estimate only: the lender uses the appraisal or lease rent and your actual payment. “Rent minus payment” doesn't include vacancy, repairs, or management. Your numbers stay on your device and aren't saved."}
          </p>
        </div>
      </section>
    </form>
  );
}
