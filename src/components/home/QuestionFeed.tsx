"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Item = { question: string; slug: string; topic: string };

const VISIBLE = 3;
// Top pill is fully visible; the ones below fade out (Vora-style rolling stack).
const STYLES = ["opacity-100", "opacity-70 sm:translate-x-4", "opacity-40 sm:-translate-x-2"];

// "Questions people are asking" (CLAUDE.md §4.2): one-line question snippets that roll in to spark curiosity.
// Each pill is a real link to the full answer. No fake timestamps; the topic label shows instead.
export function QuestionFeed({ items }: { items: Item[] }) {
  const [start, setStart] = useState(0);

  useEffect(() => {
    if (items.length <= VISIBLE || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setStart((s) => (s + 1) % items.length), 3500);
    return () => clearInterval(id);
  }, [items.length]);

  // Newest on top: the pill that just rolled in is first.
  const shown = Array.from({ length: Math.min(VISIBLE, items.length) }, (_, i) => items[(start - i + items.length * 2) % items.length]);

  return (
    <ul className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3" aria-label="Questions people are asking">
      {shown.map((item, i) => (
        <li key={item.slug} className={`w-full transition-all duration-700 ease-out ${STYLES[i]} ${i === 0 ? "animate-[rollIn_0.7s_ease-out]" : ""}`}>
          <Link
            href={`/answers/${item.slug}`}
            className="flex items-center gap-3 rounded-full bg-white/90 px-5 py-3 text-left shadow-md ring-1 ring-brand-steel/15 backdrop-blur transition hover:ring-brand-blue"
          >
            <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
            <span className="min-w-0 flex-1 truncate text-[0.95rem] text-brand-slate">
              <span className="hidden sm:inline">People ask: </span>
              <strong className="font-semibold text-brand-ink">{item.question}</strong>
            </span>
            <span className="hidden shrink-0 text-xs font-medium text-brand-slate/80 sm:inline">{item.topic}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
