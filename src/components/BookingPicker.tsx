"use client";

import { useEffect, useState } from "react";

type Topic = { key: string; title: string; blurb: string; embedUrl: string; url: string };

// Book page: the original stacked calendar sections, but only the chosen calendar loads (Ace, Sept 2026).
// Each section shows a "Pick a time" button until it's chosen; /book#equity (etc.) opens that section directly.
// Without JavaScript, the button links straight to the Go High Level booking page.
export function BookingPicker({ topics }: { topics: Topic[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const fromHash = () => {
      const key = window.location.hash.slice(1);
      if (topics.some((t) => t.key === key)) setSelected(key);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [topics]);

  function choose(key: string) {
    setSelected(key);
    history.replaceState(null, "", `#${key}`);
    requestAnimationFrame(() => document.getElementById(`cal-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  return (
    <>
      {topics.map((t) => (
        <section key={t.key} aria-labelledby={`cal-${t.key}`} className="space-y-3 rounded-3xl border border-brand-steel/30 bg-white p-4 sm:p-6">
          <span id={t.key} className="block scroll-mt-24" />
          <h2 id={`cal-${t.key}`} className="scroll-mt-24 text-2xl font-semibold">
            {t.title}
          </h2>
          <p>{t.blurb}</p>
          {selected === t.key ? (
            <>
              <iframe src={t.embedUrl} title={`Book a ${t.title} call`} scrolling="no" className="min-h-[700px] w-full rounded-2xl border-0" />
              <p className="text-sm">
                Calendar not loading?{" "}
                <a href={t.url} rel="noopener" className="font-semibold underline underline-offset-4">
                  Open the booking page
                </a>
                .
              </p>
            </>
          ) : (
            <a
              href={t.url}
              onClick={(e) => {
                e.preventDefault();
                choose(t.key);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-soft px-5 py-2.5 font-semibold text-brand-ink hover:bg-brand-blue"
            >
              Pick a time <span aria-hidden="true">→</span>
            </a>
          )}
        </section>
      ))}
    </>
  );
}
