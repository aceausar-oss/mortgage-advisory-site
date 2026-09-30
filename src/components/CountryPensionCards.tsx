// "In other countries, it's called a housing pension" cards with big flags (Ace's "Hidden Pension" webinar slide).
// Same markup and styles (.country-grid in globals.css) as the cards inside answers, so they look identical everywhere.
export const COUNTRIES = [
  { code: "kr", name: "South Korea", flagWidth: 36, term: "Jutaek Yeongeum", meaning: "“Home Pension,” a government-backed program, age 55+" },
  { code: "ch", name: "Switzerland", flagWidth: 24, term: "Immobilienrente", meaning: "“Real estate pension,” also called a reverse mortgage" },
  { code: "se", name: "Sweden", flagWidth: 38, term: "Hypotekspension", meaning: "A leading provider’s name: “Swedish Mortgage Pension”" },
  { code: "us", name: "United States", flagWidth: 46, term: "HECM", meaning: "A federally insured loan, or “reverse mortgage”", home: true },
];

export function CountryPensionCards({ heading = true }: { heading?: boolean }) {
  return (
    <section aria-labelledby={heading ? "around-the-world" : undefined} aria-label={heading ? undefined : "What other countries call a reverse mortgage"} className="space-y-4">
      {heading && (
        <header className="space-y-1">
          <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-brand-button">Around the world</p>
          <h2 id="around-the-world" className="text-2xl font-bold sm:text-3xl">
            In other countries, it&apos;s called a <em>housing pension</em>
          </h2>
        </header>
      )}
      <div className="country-grid">
        {COUNTRIES.map((c) => (
          <div key={c.code} className={`country-card${c.home ? " home" : ""}`}>
            <p className="country">
              {/* eslint-disable-next-line @next/next/no-img-element -- tiny local SVG flags, no optimization needed */}
              <img src={`/flags/${c.code}.svg`} alt={`Flag of ${c.name}`} width={c.flagWidth} height={24} />
              {c.name}
            </p>
            <p className="term">{c.term}</p>
            <p className="meaning">{c.meaning}</p>
          </div>
        ))}
      </div>
      <p>
        <strong>Same idea, different name.</strong> In the U.S., it&apos;s a loan, and we&apos;ll show you exactly how it works.
      </p>
    </section>
  );
}

// Small inline row of the four flags, for spots with no room for the full cards.
export function FlagRow({ caption = true }: { caption?: boolean }) {
  return (
    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-brand-slate">
      {COUNTRIES.map((c) => (
        // eslint-disable-next-line @next/next/no-img-element -- tiny local SVG flags
        <img key={c.code} src={`/flags/${c.code}.svg`} alt={`Flag of ${c.name}`} width={c.flagWidth} height={24} className="h-6 w-auto rounded-[3px] shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.18)]" />
      ))}
      {caption && <span>Called a “housing pension” in South Korea, Switzerland, and Sweden</span>}
    </p>
  );
}
