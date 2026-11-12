"use client";

import { useEffect, useState } from "react";

// Page dots for a native scroll-snap row (Ace, Nov 2026): replaces the scrollbar. One dot per screenful of cards;
// the filled dot follows the scroll position, and tapping a dot scrolls to that page.
export function CarouselDots({ targetId, label = "reviews" }: { targetId: string; label?: string }) {
  const [pages, setPages] = useState(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const row = document.getElementById(targetId);
    if (!row) return;
    const measure = () => {
      const n = Math.max(1, Math.ceil((row.scrollWidth - 8) / row.clientWidth));
      setPages(n);
      const atEnd = row.scrollLeft + row.clientWidth >= row.scrollWidth - 8;
      setActive(atEnd ? n - 1 : Math.min(n - 1, Math.round(row.scrollLeft / row.clientWidth)));
    };
    measure();
    row.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      row.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [targetId]);

  if (pages < 2) return null;
  const go = (i: number) => {
    const row = document.getElementById(targetId);
    if (row) row.scrollTo({ left: i * row.clientWidth, behavior: "smooth" });
  };
  return (
    <div className="js-only flex justify-center gap-1.5" role="group" aria-label={`Choose a page of ${label}`}>
      {Array.from({ length: pages }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => go(i)}
          aria-label={`Page ${i + 1} of ${pages}`}
          aria-current={i === active ? "true" : undefined}
          className="flex h-6 w-6 items-center justify-center"
        >
          <span className={`block rounded-full transition-all duration-300 ${i === active ? "h-2.5 w-6 bg-brand-button" : "h-2.5 w-2.5 bg-brand-blue/50 hover:bg-brand-blue"}`} />
        </button>
      ))}
    </div>
  );
}
