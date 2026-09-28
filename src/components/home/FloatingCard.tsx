import type { ReactNode } from "react";

// Vora-style section: a large card. Default: white card floating on the hero's soft blue glow; tone="blue": a
// light-blue card on a white page. The glow here is static
// (no animation) so extra sections don't cost scrolling performance; only the hero shimmer moves.
export function FloatingCard({
  id,
  eyebrow,
  title,
  intro,
  children,
  bare = false,
  tone = "white",
}: {
  bare?: boolean; // true = sit on the parent's background (e.g. the hero's) instead of drawing its own
  tone?: "white" | "blue"; // blue = light-blue card on a plain white page (white tiles inside pop against it)
  id: string;
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className={
        bare
          ? "relative px-4 pb-20 pt-4 sm:px-6"
          : tone === "blue"
            ? "relative px-4 py-16 sm:px-6"
            : "relative isolate overflow-hidden px-4 py-16 sm:px-6"
      }
    >
      {!bare && tone === "white" && <div aria-hidden="true" className="ai-glow" />}
      <div
        className={`relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] ${
          tone === "blue"
            ? "bg-white shadow-[0_20px_50px_-28px_rgba(57,58,62,0.25)] ring-1 ring-black/5"
            : "bg-white/90 shadow-[0_20px_50px_-24px_rgba(57,58,62,0.22)] ring-1 ring-white backdrop-blur"
        }`}
      >
        <header className="px-5 pb-10 pt-12 text-center sm:px-10">
          <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-brand-button">{eyebrow}</p>
          <h2 id={id} className="mt-3 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
            {title}
          </h2>
          {intro && <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-brand-slate">{intro}</p>}
        </header>
        <div className={`border-t px-5 py-10 sm:px-10 ${tone === "blue" ? "border-brand-steel/25" : "border-brand-steel/25"}`}>{children}</div>
      </div>
    </section>
  );
}
