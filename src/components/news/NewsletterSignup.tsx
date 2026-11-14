"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MarketArt } from "@/components/news/MarketArt";
import type { Lang } from "@/lib/i18n";

// Weekly email sign-up for The Advisory Report. The consent box starts unchecked and is required: no box, no email.
const T = {
  en: {
    title: "Get The Advisory Report every Monday",
    sub: "This week's housing and market numbers, a few fun facts, and what they mean for your home. Free, in your inbox.",
    first: "First name (optional)",
    email: "Email address",
    consent: "Yes, email me The Advisory Report and occasional updates from The Mortgage Advisory, Inc. I can unsubscribe anytime.",
    privacy: "Privacy Policy",
    button: "Sign me up",
    sending: "Signing you up…",
    done: "You're in! Look for The Advisory Report in your inbox on Monday.",
    needConsent: "Please check the box so we can email you.",
    bad: "Please enter a valid email address.",
    error: "Something went wrong. Please try again, or call (949) 649-4499.",
    popKicker: "Free weekly email",
    popTitle: "Know what the housing market is doing, every Monday",
    popSub: "The Advisory Report: home prices, home equity, and market moves in a 3-minute read, with what they mean for you. Free.",
    popPoints: ["Real numbers, each with its source", "Fun facts and myths, cleared up", "Free webinars and events first"],
    close: "Close",
  },
  es: {
    title: "Reciba The Advisory Report cada lunes",
    sub: "Los números de vivienda y del mercado de la semana, algunos datos curiosos y lo que significan para su casa. Gratis, en su correo.",
    first: "Nombre (opcional)",
    email: "Correo electrónico",
    consent: "Sí, envíenme The Advisory Report y novedades ocasionales de The Mortgage Advisory, Inc. Puedo darme de baja cuando quiera.",
    privacy: "Política de privacidad (en inglés)",
    button: "Suscribirme",
    sending: "Suscribiendo…",
    done: "¡Listo! Busque The Advisory Report en su correo el lunes.",
    needConsent: "Por favor marque la casilla para que podamos enviarle correos.",
    bad: "Por favor escriba un correo electrónico válido.",
    error: "Algo salió mal. Intente de nuevo o llame al (949) 649-4499.",
    popKicker: "Correo semanal gratis",
    popTitle: "Sepa qué pasa con el mercado de vivienda, cada lunes",
    popSub: "The Advisory Report: precios de casas, valor líquido y movimientos del mercado en 3 minutos, con lo que significan para usted. Gratis.",
    popPoints: ["Números reales, cada uno con su fuente", "Datos curiosos y mitos aclarados", "Seminarios web y eventos gratis primero"],
    close: "Cerrar",
  },
} as const;

// Remembered per browser (a convenience only): signed up → the popup never shows again; closed → hidden for 30 days.
const KEY = "tma-news";
const SNOOZE_MS = 30 * 24 * 60 * 60 * 1000;
const readState = (): { closedAt?: number; done?: boolean } => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
};
const writeState = (v: { closedAt?: number; done?: boolean }) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {}
};

/** Email + consent form shared by the page box (dark) and the popup (light). */
function NewsletterForm({ lang, page, tone, onDone }: { lang: Lang; page: string; tone: "dark" | "light"; onDone?: () => void }) {
  const t = T[lang];
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const dark = tone === "dark";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") || "").trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError(t.bad);
    if (f.get("consent") !== "on") return setError(t.needConsent);
    setError("");
    setState("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, firstName: f.get("firstName") || "", consent: true, lang, page: page || window.location.pathname, website: f.get("website") || "" }),
      });
      if (!res.ok) throw new Error();
      writeState({ done: true });
      setState("done");
      onDone?.();
    } catch {
      setState("idle");
      setError(t.error);
    }
  }

  if (state === "done")
    return (
      <p role="status" className={`mt-5 rounded-2xl p-4 font-semibold ${dark ? "bg-white text-brand-ink" : "bg-white text-brand-slate ring-1 ring-brand-blue/50"}`}>
        {t.done}
      </p>
    );

  const field = `min-h-12 w-full rounded-full bg-white px-5 text-brand-ink placeholder:text-brand-slate ${dark ? "border-0" : "border border-brand-steel/50"}`;
  return (
    <form onSubmit={submit} noValidate className="mt-5 space-y-4">
      <div className={`grid gap-3 ${dark ? "sm:grid-cols-[1fr_1.4fr_auto]" : ""}`}>
        <label className="block">
          <span className="sr-only">{t.first}</span>
          <input name="firstName" autoComplete="given-name" placeholder={t.first} className={field} />
        </label>
        <label className="block">
          <span className="sr-only">{t.email}</span>
          <input name="email" type="email" required autoComplete="email" inputMode="email" placeholder={t.email} className={field} />
        </label>
        <button
          type="submit"
          disabled={state === "sending"}
          className={`min-h-12 rounded-full px-6 font-semibold disabled:opacity-70 ${dark ? "bg-brand-soft text-brand-ink hover:bg-brand-blue" : "bg-brand-button text-white hover:bg-brand-slate"}`}
        >
          {state === "sending" ? t.sending : t.button}
        </button>
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <label className={`flex items-start gap-3 text-sm leading-relaxed ${dark ? "text-white/90" : "text-brand-slate"}`}>
        <input type="checkbox" name="consent" className="mt-1 h-5 w-5 shrink-0" />
        <span>
          {t.consent}{" "}
          <a href="/privacy" className="underline underline-offset-2">
            {t.privacy}
          </a>
        </span>
      </label>
      {error && (
        <p role="alert" className={`text-sm font-semibold ${dark ? "text-white" : "text-amber-800"}`}>
          {error}
        </p>
      )}
    </form>
  );
}

export function NewsletterSignup({ lang = "en", page = "" }: { lang?: Lang; page?: string }) {
  const t = T[lang];
  const id = useId();
  return (
    // Same market artwork as the popup and page banner, so the sign-up stands out instead of fading into the page.
    <section aria-labelledby={`${id}-h`} className="relative isolate overflow-hidden rounded-[2rem] p-6 text-white shadow-lg sm:p-10">
      <MarketArt className="absolute inset-0 -z-10 h-full w-full" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-[#24343c]/85 via-[#24343c]/45 to-transparent" />
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/85">{t.popKicker}</p>
      {/* Inline color: the global h2 color would otherwise win over the utility class on this dark panel. */}
      <h2 id={`${id}-h`} className="mt-2 max-w-2xl font-heading text-2xl font-bold sm:text-3xl" style={{ color: "#fff" }}>
        {t.title}
      </h2>
      <p className="mt-2 max-w-2xl text-white/90">{t.sub}</p>
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/95">
        {t.popPoints.map((x) => (
          <li key={x} className="flex gap-2">
            <span aria-hidden="true">✓</span>
            {x}
          </li>
        ))}
      </ul>
      <NewsletterForm lang={lang} page={page} tone="dark" />
    </section>
  );
}

// Pages where the popup stays out of the way: The Advisory Report itself (it has the box), and pages where the
// visitor is already taking action (quiz, booking, chat).
const QUIET = /^\/(es\/)?(news|qualify|pre-approval|book|ask)(\/|$)/;

/**
 * Site-wide popup for The Advisory Report (Ace, Nov 2026). Opens after 45 seconds or two-thirds of the way down the
 * page, never over another dialog. On reverse mortgage pages, where the free-guide popup comes first, it waits until
 * this browser has already seen the guide offer. Closed: hidden 30 days. Signed up: never again.
 * Test links: ?news=show opens it right away; ?news=reset forgets this browser's choice.
 */
export function NewsletterPopup({ lang = "en" }: { lang?: Lang }) {
  const t = T[lang];
  const path = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const shown = useRef(false);
  const testing = useRef(false);
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    shown.current = false;
    const test = new URLSearchParams(window.location.search).get("news");
    if (test === "show") {
      testing.current = true;
      const id = setTimeout(() => {
        shown.current = true;
        setOpen(true);
      }, 600);
      return () => clearTimeout(id);
    }
    if (test === "reset") writeState({});
    if (QUIET.test(path)) return;
    const s = readState();
    if (s.done || (s.closedAt && Date.now() - s.closedAt < SNOOZE_MS)) return;
    const show = () => {
      if (shown.current || document.querySelector("dialog[open], [role=dialog]")) return;
      // Reverse mortgage pages: the free guide offer goes first.
      if (document.querySelector("[data-guide-page]")) {
        try {
          const g = JSON.parse(localStorage.getItem("tma-guide") || "{}");
          if (!g.done && !g.closedAt) return;
        } catch {
          return;
        }
      }
      shown.current = true;
      setOpen(true);
    };
    const timer = setTimeout(show, 45_000);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max > 0.66) show();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [path]);

  const close = () => {
    setOpen(false);
    if (!done && !testing.current) writeState({ closedAt: Date.now() });
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    panel.current?.querySelector<HTMLElement>("input")?.focus({ preventScroll: true });
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" lang={lang}>
      <div aria-hidden="true" onClick={close} className="absolute inset-0 hidden bg-black/45 backdrop-blur-[2px] sm:block" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-[0_-12px_40px_rgba(0,0,0,0.25)] motion-safe:animate-[guide-up_0.35s_ease-out] sm:max-w-3xl sm:rounded-[2rem] sm:shadow-2xl"
      >
        <button
          type="button"
          onClick={close}
          aria-label={t.close}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-brand-slate shadow hover:bg-white"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
        <div className="grid sm:grid-cols-[0.85fr_1.15fr]">
          <div className="relative hidden overflow-hidden rounded-l-[2rem] sm:block">
            <MarketArt className="absolute inset-0 h-full w-full" />
            <div className="relative flex h-full flex-col justify-end p-6 text-white">
              <p className="font-heading text-3xl font-bold leading-tight" style={{ color: "#fff" }}>
                The Advisory Report
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {t.popPoints.map((x) => (
                  <li key={x} className="flex gap-2">
                    <span aria-hidden="true">✓</span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-brand-blue-deep">{t.popKicker}</p>
            <h2 id={titleId} className="mt-2 text-2xl font-bold leading-snug sm:text-3xl">
              {t.popTitle}
            </h2>
            <p className="mt-2 leading-relaxed text-brand-slate">{t.popSub}</p>
            <NewsletterForm lang={lang} page="" tone="light" onDone={() => setDone(true)} />
          </div>
        </div>
      </div>
    </div>
  );
}
