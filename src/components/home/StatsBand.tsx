import type { Stat } from "@/lib/home";

// Three big, sourced numbers (Vora-style stat row). Sources sit right under the row so every figure is checkable.
export function StatsBand({ stats }: { stats: Stat[] }) {
  if (!stats.length) return null;
  return (
    <section aria-labelledby="stats-heading" className="mx-auto max-w-6xl px-4 pb-4 pt-6 sm:px-6">
      <h2 id="stats-heading" className="mx-auto max-w-3xl text-center text-2xl font-bold leading-snug sm:text-3xl">
        Homeowners have never had more equity, <span className="text-brand-blue-deep">or more card debt</span>.
      </h2>
      <dl className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-0">
        {stats.slice(0, 3).map((s, i) => (
          <div key={s.label} className={`flex flex-col px-4 text-center ${i > 0 ? "sm:border-l sm:border-brand-blue/60" : ""}`}>
            <dt className="order-2 mt-2 text-sm font-semibold uppercase tracking-[0.15em] text-brand-slate">{s.label}</dt>
            <dd className="order-1 font-heading text-5xl font-bold tracking-tight text-brand-ink sm:text-6xl">{s.value}</dd>
            {s.detail && <dd className="order-3 mt-2 text-sm leading-relaxed text-brand-slate">{s.detail}</dd>}
          </div>
        ))}
      </dl>
      <p className="mt-8 text-center text-xs leading-relaxed text-brand-slate">
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
    </section>
  );
}
