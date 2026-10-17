"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// A chip with an href opens that page (the qualify quiz) instead of the chat.
const CHIPS_ES: { label: string; q: string; href?: string }[] = [
  { label: "Obtener preaprobación", q: "Quiero obtener una preaprobación para comprar casa", href: "/es/qualify?goal=buy" },
  { label: "Bajar mi tasa", q: "¿Cómo puedo bajar el pago o la tasa de mi hipoteca?" },
  { label: "Sacar dinero de mi casa", q: "¿Cómo puedo sacar dinero de mi casa y conservar mi tasa baja?" },
  { label: "Hipoteca inversa", q: "¿Me conviene una hipoteca inversa?" },
];

const CHIPS: { label: string; q: string; href?: string }[] = [
  { label: "Get pre-approved", q: "I want to get pre-approved to buy a home", href: "/qualify?goal=buy" },
  { label: "Lower my rate", q: "How can I lower my mortgage payment or rate?" },
  { label: "Get cash from my home", q: "How can I get cash from my home and keep my low rate?" },
  { label: "Reverse mortgage", q: "Is a reverse mortgage right for me?" },
];

// Big hero question box (CLAUDE.md §4.1). A plain GET form to /ask, so it works without JavaScript;
// with JavaScript, the placeholder "types" real borrower questions and the question feed can fill it.
export function HeroChat({ examples, lang = "en" }: { examples: string[]; lang?: "en" | "es" }) {
  const es = lang === "es";
  const ask = es ? "/es/ask" : "/ask";
  const chips = es ? CHIPS_ES : CHIPS;
  const [value, setValue] = useState("");
  const [placeholder, setPlaceholder] = useState(es ? "Pregunte lo que quiera sobre su hipoteca o el valor de su casa…" : "Ask anything about your mortgage or home equity…");
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
        action={ask}
        method="get"
        role="search"
        aria-label={es ? "Haga una pregunta sobre hipotecas" : "Ask a mortgage question"}
        className="silver-frame rounded-3xl p-4 sm:p-5"
      >
        <label htmlFor="hero-q" className="sr-only">
          {es ? "Haga una pregunta sobre hipotecas" : "Ask a mortgage question"}
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
            aria-label={es ? "Preguntar" : "Ask"}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-ink hover:bg-brand-blue"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>
        <ul className="mt-4 flex flex-wrap gap-2" aria-label={es ? "Preguntas rápidas" : "Quick questions"}>
          {chips.map((c) => (
            <li key={c.label}>
              <Link
                href={c.href ?? `${ask}?q=${encodeURIComponent(c.q)}`}
                className="inline-block rounded-full border border-brand-steel/40 bg-mist px-3.5 py-1.5 text-sm font-medium text-brand-slate hover:border-brand-slate"
              >
                {c.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href={es ? "/es/book" : "/book"} className="inline-block rounded-full bg-brand-soft px-3.5 py-1.5 text-sm font-semibold text-brand-ink hover:bg-brand-blue">
              {es ? "Reserve una llamada con un asesor" : "Book a call with an advisor"}
            </Link>
          </li>
        </ul>
      </form>
      <p className="mt-3 text-center text-xs leading-relaxed text-brand-slate">
        {es ? "Las sesiones de chat pueden grabarse. Al usar el chat, usted acepta nuestra" : "Chat sessions may be recorded. By using chat you agree to our"}{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          {es ? "Política de privacidad (en inglés)" : "Privacy Policy"}
        </Link>{" "}
        {es ? "y" : "and"}{" "}
        <Link href="/terms" className="underline underline-offset-2">
          {es ? "Términos (en inglés)" : "Terms"}
        </Link>
        {es ? ". Esto no es un compromiso de préstamo." : ". Not a commitment to lend."}
      </p>
    </div>
  );
}
