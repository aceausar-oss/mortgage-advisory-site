"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Item = { question: string; slug: string; topic: string };

const VISIBLE = 3;
const ROW_REM = 4; // one pill (~3rem) plus the gap between pills
const INTERVAL_MS = 4000;
// Top pill is fully visible; the ones below fade out (Vora-style rolling stack). Sideways nudge on larger screens only.
const SLOT_STYLE = ["opacity-100", "opacity-70 sm:translate-x-4", "opacity-40 sm:-translate-x-2"];

// "Questions people are asking" (CLAUDE.md §4.2): one-line question snippets that roll in to spark curiosity.
// Every pill stays mounted and is positioned by its slot, so moving between slots is one smooth CSS transition:
// the newest slides down from above while fading in, the others glide down a row, the oldest fades away below.
// Hidden pills wait above the stack, invisible, so nothing ever crosses the visible ones.
export function QuestionFeed({ items }: { items: Item[] }) {
  const [start, setStart] = useState(0);
  const n = items.length;

  useEffect(() => {
    if (n <= VISIBLE || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setStart((s) => (s + 1) % n), INTERVAL_MS);
    return () => clearInterval(id);
  }, [n]);

  return (
    <ul
      className="relative mx-auto w-full max-w-2xl"
      style={{ height: `${Math.min(VISIBLE, n) * ROW_REM - 1}rem` }}
      aria-label="Questions people are asking"
    >
      {items.map((item, idx) => {
        const slot = (start - idx + n) % n; // 0 = newest (top)
        const visible = slot < VISIBLE;
        // Just-exited pill fades out a little below the stack; all other hidden pills wait just above it.
        const y = visible ? slot * ROW_REM : slot === VISIBLE ? VISIBLE * ROW_REM - 1 : -ROW_REM;
        return (
          <li
            key={item.slug}
            aria-hidden={!visible}
            className={`absolute inset-x-0 top-0 transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
              visible ? "" : "pointer-events-none opacity-0"
            }`}
            style={{ transform: `translateY(${y}rem)`, zIndex: VISIBLE - Math.min(slot, VISIBLE) }}
          >
            <Link
              href={`/answers/${item.slug}`}
              tabIndex={visible ? undefined : -1}
              className={`flex items-center gap-3 rounded-full bg-white/90 px-5 py-3 text-left shadow-md ring-1 ring-brand-steel/15 backdrop-blur transition-[transform,opacity,box-shadow] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:ring-brand-blue ${
                visible ? SLOT_STYLE[slot] : "opacity-0"
              }`}
            >
              <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
              <span className="min-w-0 flex-1 truncate text-[0.95rem] text-brand-slate">
                <span className="hidden sm:inline">People ask: </span>
                <strong className="font-semibold text-brand-ink">{item.question}</strong>
              </span>
              <span className="hidden shrink-0 text-xs font-medium text-brand-slate/80 sm:inline">{item.topic}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
