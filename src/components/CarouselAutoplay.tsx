"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// Gentle auto-advance for a native scroll-snap row (WCAG 2.2.2): one card every few seconds, a visible
// Pause/Play button, pauses while hovered or focused and for a while after any swipe/tap/scroll,
// and stays still for visitors who ask for reduced motion (unless they press Play).
const INTERVAL_MS = 5000;
const IDLE_AFTER_INTERACTION_MS = 10000;

const reducedQuery = "(prefers-reduced-motion: reduce)";
const subscribeReduced = (cb: () => void) => {
  const mq = window.matchMedia(reducedQuery);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export function CarouselAutoplay({ targetId, label = "reviews" }: { targetId: string; label?: string }) {
  const reduced = useSyncExternalStore(subscribeReduced, () => window.matchMedia(reducedQuery).matches, () => false);
  const [choice, setChoice] = useState<"play" | "pause" | null>(null);
  const running = choice === "play" || (choice === null && !reduced);
  const hold = useRef({ hover: false, focus: false, lastTouch: 0 });

  useEffect(() => {
    const row = document.getElementById(targetId);
    if (!row || !running) return;
    const h = hold.current;
    const touched = () => (h.lastTouch = Date.now());
    const on: [string, EventListener][] = [
      ["pointerenter", (e) => (h.hover = (e as PointerEvent).pointerType === "mouse")],
      ["pointerleave", () => (h.hover = false)],
      ["focusin", () => (h.focus = true)],
      ["focusout", () => (h.focus = false)],
      ["pointerdown", touched],
      ["touchstart", touched],
      ["wheel", touched],
      ["keydown", touched],
    ];
    on.forEach(([t, fn]) => row.addEventListener(t, fn, { passive: true }));

    const timer = window.setInterval(() => {
      if (h.hover || h.focus || document.hidden || Date.now() - h.lastTouch < IDLE_AFTER_INTERACTION_MS) return;
      const card = row.querySelector("li");
      if (!card) return;
      const gap = parseFloat(getComputedStyle(row).columnGap) || 0;
      const atEnd = row.scrollLeft + row.clientWidth >= row.scrollWidth - 8;
      if (atEnd) row.scrollTo({ left: 0, behavior: "smooth" });
      else row.scrollBy({ left: card.getBoundingClientRect().width + gap, behavior: "smooth" });
    }, INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
      on.forEach(([t, fn]) => row.removeEventListener(t, fn));
    };
  }, [targetId, running]);

  return (
    <button
      type="button"
      onClick={() => setChoice(running ? "pause" : "play")}
      aria-controls={targetId}
      className="js-only inline-flex items-center gap-1.5 rounded-full border-2 border-brand-blue bg-white px-3 py-1.5 text-sm font-semibold text-brand-button hover:border-brand-blue-deep"
    >
      <span aria-hidden="true">{running ? "⏸" : "▶"}</span>
      {running ? `Pause ${label}` : `Play ${label}`}
    </button>
  );
}
