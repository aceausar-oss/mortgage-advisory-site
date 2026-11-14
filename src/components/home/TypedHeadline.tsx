"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

// Homepage headline with a typing effect (Ace, Nov 2026, Vora-style): the lead stays put and the blue phrase
// types out, holds, erases, and moves to the next one. The server sends the first phrase, so crawlers, no-JS
// visitors, and screen readers (via the h1's aria-label) get the full approved headline. Visitors who ask for
// reduced motion see the first phrase, still.
const reducedQuery = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(reducedQuery);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

const TYPE_MS = 110;
const ERASE_MS = 60;
const HOLD_MS = 2200;

export function TypedHeadline({ lead, phrases, className = "" }: { lead: string; phrases: string[]; className?: string }) {
  const reduced = useSyncExternalStore(subscribe, () => window.matchMedia(reducedQuery).matches, () => true);
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(phrases[0]);
  const [phase, setPhase] = useState<"hold" | "erase" | "type">("hold");

  useEffect(() => {
    if (reduced) return;
    const target = phrases[index];
    let id: number;
    if (phase === "hold") id = window.setTimeout(() => setPhase("erase"), HOLD_MS);
    else if (phase === "erase") {
      if (shown.length) id = window.setTimeout(() => setShown(shown.slice(0, -1)), ERASE_MS);
      else {
        setIndex((index + 1) % phrases.length);
        setPhase("type");
      }
    } else {
      if (shown.length < target.length) id = window.setTimeout(() => setShown(target.slice(0, shown.length + 1)), TYPE_MS);
      else setPhase("hold");
    }
    return () => window.clearTimeout(id);
  }, [reduced, phase, shown, index, phrases]);

  return (
    <h1 aria-label={`${lead} ${phrases[0]}`} className={className}>
      <span aria-hidden="true" className="block">
        {lead}
      </span>
      {/* One line, always: on phones the blue phrase scales to the screen width so even the longest phrase fits,
          and one line's height is reserved so the page doesn't jump while it changes. */}
      <span aria-hidden="true" className="block min-h-[1.25em] whitespace-nowrap text-[5.6vw] text-brand-blue-deep sm:text-[length:inherit]">
        {shown}
        <span className="ml-1 inline-block h-[0.9em] w-[3px] translate-y-[0.1em] animate-pulse rounded-full bg-brand-blue-deep align-baseline motion-reduce:hidden" />
      </span>
    </h1>
  );
}
