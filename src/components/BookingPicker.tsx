"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Topic = { key: string; title: string; blurb: string; embedUrl: string; url: string };

// Book page: the original stacked topic sections. "Pick a time" opens that topic's Go High Level calendar in a
// full-screen window (Ace, Oct 2026), so the whole calendar and form are in one view on any device, with no dependence
// on Go High Level's resize script. /book#equity (etc.) opens the matching calendar directly. Without JavaScript, the
// button links straight to the Go High Level booking page.
export function BookingPicker({ topics }: { topics: Topic[] }) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const topic = topics.find((t) => t.key === openKey) ?? null;

  const open = useCallback((key: string) => {
    setOpenKey(key);
    history.replaceState(null, "", `#${key}`);
  }, []);

  const close = useCallback(() => {
    setOpenKey(null);
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }, []);

  // Open from the address (/book#reverse), including links from other pages.
  useEffect(() => {
    const fromHash = () => {
      const key = window.location.hash.slice(1);
      if (topics.some((t) => t.key === key)) setOpenKey(key);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [topics]);

  // Show or hide the window, and stop the page behind it from scrolling.
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (topic && !d.open) d.showModal();
    if (!topic && d.open) d.close();
    document.documentElement.style.overflow = topic ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [topic]);

  return (
    <>
      {topics.map((t) => (
        <section key={t.key} aria-labelledby={`cal-${t.key}`} className="space-y-3 rounded-3xl border border-brand-steel/30 bg-white p-4 sm:p-6">
          <span id={t.key} className="block scroll-mt-24" />
          <h2 id={`cal-${t.key}`} className="text-2xl font-semibold">
            {t.title}
          </h2>
          <p>{t.blurb}</p>
          <a
            href={t.url}
            onClick={(e) => {
              e.preventDefault();
              open(t.key);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-soft px-5 py-2.5 font-semibold text-brand-ink hover:bg-brand-blue"
          >
            Pick a time <span aria-hidden="true">→</span>
          </a>
        </section>
      ))}

      <dialog
        ref={dialog}
        onClose={close}
        onClick={(e) => {
          if (e.target === dialog.current) close(); // click on the dimmed backdrop
        }}
        aria-labelledby="booking-title"
        className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none overflow-hidden bg-white p-0 backdrop:bg-black/50 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:h-[min(calc(100dvh-2rem),900px)] sm:w-[min(calc(100vw-2rem),1100px)] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl"
      >
        {topic && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-4 border-b border-brand-steel/30 px-4 py-2 sm:px-6">
              <h2 id="booking-title" className="text-base font-semibold sm:text-lg">
                {topic.title}: pick a time
              </h2>
              <button
                type="button"
                onClick={close}
                autoFocus
                aria-label="Close"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-brand-steel/40 text-2xl leading-none text-brand-ink hover:bg-mist"
              >
                ×
              </button>
            </div>
            {/* aria-label instead of title: a title shows as a hover tooltip over the calendar. */}
            <iframe key={topic.key} src={topic.embedUrl} aria-label={`Book a ${topic.title} call`} className="min-h-0 w-full flex-1 border-0" />
          </div>
        )}
      </dialog>
    </>
  );
}
