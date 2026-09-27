"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const CHIPS = [
  { label: "Get pre-approved", q: "I want to get pre-approved to buy a home" },
  { label: "Lower my rate", q: "How can I lower my mortgage payment or rate?" },
  { label: "Get cash from my home", q: "How can I get cash from my home and keep my low rate?" },
  { label: "Reverse mortgage", q: "Is a reverse mortgage right for me?" },
];

// Big hero question box (CLAUDE.md §4.1). A plain GET form to /ask, so it works without JavaScript;
// with JavaScript, the placeholder "types" real borrower questions and the question feed can fill it.
export function HeroChat({ examples }: { examples: string[] }) {
  const [value, setValue] = useState("");
  const [placeholder, setPlaceholder] = useState("Ask anything about your mortgage or home equity…");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Typing placeholder that cycles real questions. Static when the visitor prefers reduced motion.
  useEffect(() => {
    if (!examples.length) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let i = 0;
    let char = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const text = examples[i % examples.length];
      if (reduce) {
        setPlaceholder(text);
        i++;
        timer = setTimeout(tick, 5000);
        return;
      }
      char++;
      setPlaceholder(text.slice(0, char));
      if (char < text.length) {
        timer = setTimeout(tick, 45);
      } else {
        char = 0;
        i++;
        timer = setTimeout(tick, 2600);
      }
    };
    timer = setTimeout(tick, 800);
    return () => clearTimeout(timer);
  }, [examples]);

  // Questions from the "Questions people are asking" feed land here.
  useEffect(() => {
    const onAsk = (e: Event) => {
      setValue((e as CustomEvent<string>).detail);
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      inputRef.current?.focus();
    };
    window.addEventListener("tma:ask", onAsk);
    return () => window.removeEventListener("tma:ask", onAsk);
  }, []);

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <div aria-hidden="true" className="pointer-events-none absolute -inset-8 -z-10 rounded-full bg-brand-blue/30 blur-3xl" />
      <form
        ref={formRef}
        action="/ask"
        method="get"
        role="search"
        aria-label="Ask a mortgage question"
        className="rounded-3xl border border-brand-steel/30 bg-white p-4 shadow-xl sm:p-5"
      >
        <label htmlFor="hero-q" className="sr-only">
          Ask a mortgage question
        </label>
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            id="hero-q"
            name="q"
            rows={2}
            required
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && value.trim()) {
                e.preventDefault();
                formRef.current?.requestSubmit();
              }
            }}
            placeholder={placeholder}
            className="min-h-[3.5rem] flex-1 resize-none border-0 bg-transparent text-lg leading-relaxed text-brand-ink placeholder:text-brand-steel focus:outline-none sm:text-xl"
          />
          <button
            type="submit"
            aria-label="Ask"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-ink hover:bg-brand-blue"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Quick questions">
          {CHIPS.map((c) => (
            <li key={c.label}>
              <Link
                href={`/ask?q=${encodeURIComponent(c.q)}`}
                className="inline-block rounded-full border border-brand-steel/40 bg-mist px-3.5 py-1.5 text-sm font-medium text-brand-slate hover:border-brand-slate"
              >
                {c.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/book" className="inline-block rounded-full bg-brand-soft px-3.5 py-1.5 text-sm font-semibold text-brand-ink hover:bg-brand-blue">
              Book a call with Ace
            </Link>
          </li>
        </ul>
      </form>
      <p className="mt-3 text-center text-xs leading-relaxed text-brand-slate">
        Chat sessions may be recorded. By using chat you agree to our{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link href="/terms" className="underline underline-offset-2">
          Terms
        </Link>
        . Not a commitment to lend.
      </p>
    </div>
  );
}
