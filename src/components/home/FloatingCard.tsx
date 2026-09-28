import type { ReactNode } from "react";

// Vora-style section: a large white card floating on the hero's soft blue glow. The glow here is static
// (no animation) so extra sections don't cost scrolling performance; only the hero shimmer moves.
export function FloatingCard({
  id,
  eyebrow,
  title,
  intro,
  children,
  bare = false,
}: {
  bare?: boolean; // true = sit on the parent's background (e.g. the hero's) instead of drawing its own
  id: string;
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className={bare ? "relative px-4 pb-20 pt-4 sm:px-6" : "relative isolate overflow-hidden bg-gradient-to-b from-mist via-mist to-white px-4 py-16 sm:px-6"}
    >
      {!bare && <div aria-hidden="true" className="ai-glow" />}
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-white/90 shadow-[0_24px_70px_-20px_rgba(61,133,204,0.35)] ring-1 ring-white backdrop-blur">
        <header className="px-5 pb-10 pt-12 text-center sm:px-10">
          <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-brand-button">{eyebrow}</p>
          <h2 id={id} className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            {title}
          </h2>
          {intro && <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-brand-slate">{intro}</p>}
        </header>
        <div className="border-t border-brand-blue/25 px-5 py-10 sm:px-10">{children}</div>
      </div>
    </section>
  );
}
