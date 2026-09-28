import type { Stat } from "@/lib/home";

// Three big, sourced numbers (Vora-style stat row). Sources sit right under the row so every figure is checkable.
export function StatsBand({ stats }: { stats: Stat[] }) {
  if (!stats.length) return null;
  return (
    <section aria-labelledby="stats-heading" className="relative mb-14 bg-charcoal px-4 py-14 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
      <h2 id="stats-heading" className="mx-auto max-w-3xl text-center text-2xl font-bold leading-snug !text-white sm:text-3xl">
        Homeowners have never had more equity, <span className="text-brand-blue">or more card debt</span>.
      </h2>
      <dl className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-0">
        {stats.slice(0, 3).map((s, i) => (
          <div key={s.label} className={`flex flex-col px-4 text-center ${i > 0 ? "sm:border-l sm:border-white/25" : ""}`}>
            <dt className="order-2 mt-2 text-sm font-semibold uppercase tracking-[0.15em] text-white/85">{s.label}</dt>
            <dd className="order-1 font-heading text-5xl font-bold tracking-tight text-white sm:text-6xl">{s.value}</dd>
            {s.detail && <dd className="order-3 mt-2 text-sm leading-relaxed text-white/80">{s.detail}</dd>}
          </div>
        ))}
      </dl>
      <p className="mt-8 text-center text-xs leading-relaxed text-white/75">
        Sources:{" "}
        {stats.slice(0, 3).map((s, i) => (
          <span key={s.source}>
            {i > 0 && " · "}
            <a href={s.sourceUrl} rel="noopener noreferrer" target="_blank" className="underline underline-offset-2">
              {s.source}
            </a>{" "}
            ({s.asOf})
          </span>
        ))}
      </p>
      </div>
    </section>
  );
}
