"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Item = { question: string; slug: string };

// "Questions people are asking" (CLAUDE.md §4.2). Every question is a real, crawlable link;
// with JavaScript, the visible window slowly rotates and each pill can send its question to the hero box.
export function QuestionFeed({ items, visible = 4 }: { items: Item[]; visible?: number }) {
  const [start, setStart] = useState(0);

  useEffect(() => {
    if (items.length <= visible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setStart((s) => (s + 1) % items.length), 4000);
    return () => clearInterval(id);
  }, [items.length, visible]);

  const shown = new Set(Array.from({ length: Math.min(visible, items.length) }, (_, i) => (start + i) % items.length));

  return (
    <ul className="space-y-3" aria-label="Questions people are asking">
      {items.map((item, i) => (
        <li
          key={item.slug}
          className={`${shown.has(i) ? "flex" : "hidden"} animate-[fadeIn_0.8s_ease] items-center gap-2 rounded-full border border-brand-steel/30 bg-white py-2 pl-4 pr-2 shadow-sm`}
        >
          <Link href={`/answers/${item.slug}`} className="flex-1 text-[0.95rem] font-medium text-brand-slate hover:underline">
            {item.question}
          </Link>
          {/* "js-only": hidden when JavaScript is off (see layout), since this button needs it. */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("tma:ask", { detail: item.question }))}
            className="js-only shrink-0 rounded-full bg-mist px-3 py-1 text-xs font-semibold text-brand-slate hover:bg-brand-blue/20"
            aria-label={`Ask: ${item.question}`}
          >
            Ask ↑
          </button>
        </li>
      ))}
    </ul>
  );
}
