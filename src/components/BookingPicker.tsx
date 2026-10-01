"use client";

import { useEffect, useState } from "react";

type Topic = { key: string; title: string; blurb: string; embedUrl: string; url: string };

// Book page (Ace, Sept 2026): pick a topic, and only that calendar loads. Links like /book#equity open the matching
// calendar directly. Without JavaScript, each topic links straight to its Go High Level booking page.
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
    // On phones the calendar sits below the topic cards: bring it into view.
    requestAnimationFrame(() => document.getElementById("cal-heading")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  const topic = topics.find((t) => t.key === selected);

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="mb-3 text-center font-heading text-xl font-semibold">What would you like to talk about?</legend>
        <div className="grid gap-4 md:grid-cols-3">
          {topics.map((t) => {
            const on = t.key === selected;
            return (
              <a
                key={t.key}
                id={t.key}
                href={t.url}
                onClick={(e) => {
                  e.preventDefault();
                  choose(t.key);
                }}
                aria-current={on ? "true" : undefined}
                className={`flex scroll-mt-24 flex-col rounded-2xl border-2 bg-white p-5 text-left transition ${
                  on ? "border-brand-button shadow-[0_0_18px_rgba(136,180,224,0.65)]" : "border-brand-blue/50 hover:border-brand-blue"
                }`}
              >
                <span className="font-heading text-lg font-semibold text-brand-ink">{t.title}</span>
                <span className="mt-1 flex-1 text-brand-slate">{t.blurb}</span>
                <span className={`mt-3 font-semibold ${on ? "text-brand-button" : "text-brand-slate"}`}>{on ? "Selected ✓" : "Choose →"}</span>
              </a>
            );
          })}
        </div>
      </fieldset>

      {topic ? (
        <section aria-labelledby="cal-heading" className="space-y-3 rounded-3xl border border-brand-steel/30 bg-white p-4 sm:p-6">
          <h2 id="cal-heading" className="scroll-mt-24 text-2xl font-semibold">
            {topic.title}: pick a time
          </h2>
          <iframe key={topic.key} src={topic.embedUrl} title={`Book a ${topic.title} call`} scrolling="no" className="min-h-[700px] w-full rounded-2xl border-0" />
          <p className="text-sm">
            Calendar not loading?{" "}
            <a href={topic.url} rel="noopener" className="font-semibold underline underline-offset-4">
              Open the booking page
            </a>
            .
          </p>
        </section>
      ) : (
        <p className="rounded-2xl border-2 border-dashed border-brand-steel/40 p-6 text-center text-brand-slate">
          Choose a topic above, and its calendar will open here.
        </p>
      )}
    </div>
  );
}
