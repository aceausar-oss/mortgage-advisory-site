import type { KbEntry } from "@/lib/kb";

// "Did you know?" fun-fact pill: a side card on desktop, an inline card on mobile.
export function DidYouKnow({ facts }: { facts: KbEntry["didYouKnow"] }) {
  if (!facts.length) return null;
  return (
    <aside aria-labelledby="did-you-know" className="rounded-3xl border border-brand-blue/50 bg-white p-5 shadow-sm">
      <p id="did-you-know" className="flex items-center gap-2 font-heading text-base font-bold text-brand-slate">
        <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-brand-ink">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2Z" />
          </svg>
        </span>
        Did you know?
      </p>
      <ul className="mt-3 space-y-3 text-[0.95rem] leading-relaxed">
        {facts.map((f) => (
          <li key={f.text}>
            {f.text}
            {f.sources.length > 0 && (
              <span className="mt-1 block text-xs">
                {f.sources.map((s, i) => (
                  <span key={s.url}>
                    {i > 0 && " · "}
                    <a href={s.url} rel="noopener" className="text-brand-slate underline underline-offset-2">
                      {s.title}
                    </a>
                  </span>
                ))}
              </span>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}
