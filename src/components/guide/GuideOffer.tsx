"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { GUIDE_PDF } from "@/lib/guide";

// Free reverse mortgage guide (Ace, Oct 2026): the book cover, the sign-up form, and two ways to show them —
// a popup on reverse mortgage pages (GuidePopup) and a box on the page itself (GuideBox).
type Lang = "en" | "es";

const T = {
  en: {
    badge: ["Free", "download"],
    cover: "Your home, your housing pension",
    coverSub: "A plain-English guide to reverse mortgages",
    points: ["What it is", "Who it's for", "What it costs"],
    get: "Get your",
    free: "FREE",
    title: "reverse mortgage guide.",
    sub: "Learn how a reverse mortgage works and see if it could be right for you.",
    label: "Email address",
    placeholder: "Enter email address",
    button: "Get my free guide",
    sending: "Sending…",
    consent: "By clicking “Get my free guide,” you agree to receive emails from The Mortgage Advisory, Inc. about reverse mortgages and home financing. Unsubscribe anytime.",
    privacy: "Privacy Policy",
    privacyHref: "/privacy",
    bad: "Please enter a valid email address.",
    error: "Something went wrong. Please try again, or call (949) 649-4499.",
    doneTitle: "Your guide is ready!",
    doneText: "We'll also email you a copy. When you'd like to see your own numbers, our team is here.",
    download: "Download the guide (PDF)",
    book: "Book a call with an advisor",
    bookHref: "/book#reverse",
    close: "Close",
    photo: "/images/retirement-couple.jpg",
    photoPos: "center 25%",
    photoAlt: "Smiling retired couple at home",
  },
  es: {
    badge: ["Descarga", "gratis"],
    cover: "Su casa, su pensión de vivienda",
    coverSub: "Guía clara sobre la hipoteca inversa",
    points: ["Qué es", "Para quién es", "Cuánto cuesta"],
    get: "Reciba su guía",
    free: "GRATIS",
    title: "sobre la hipoteca inversa.",
    sub: "Aprenda cómo funciona una hipoteca inversa y vea si podría convenirle.",
    label: "Correo electrónico",
    placeholder: "Escriba su correo electrónico",
    button: "Quiero mi guía gratis",
    sending: "Enviando…",
    consent: "Al hacer clic en «Quiero mi guía gratis», usted acepta recibir correos electrónicos de The Mortgage Advisory, Inc. sobre hipotecas inversas y financiamiento de vivienda. Puede darse de baja cuando quiera.",
    privacy: "Política de privacidad (en inglés)",
    privacyHref: "/privacy",
    bad: "Por favor escriba un correo electrónico válido.",
    error: "Algo salió mal. Intente de nuevo o llame al (949) 649-4499.",
    doneTitle: "¡Su guía está lista!",
    doneText: "También le enviaremos una copia por correo. Cuando quiera ver sus propios números, nuestro equipo está para ayudarle, en español.",
    download: "Descargar la guía (PDF)",
    book: "Reserve una llamada con un asesor",
    bookHref: "/es/book#reverse",
    close: "Cerrar",
    photo: "/images/loans/loan-reverse-mortgage.jpg",
    photoPos: "20% center",
    photoAlt: "Pareja jubilada sonriendo en su jardín",
  },
} as const;

// Remembered per browser (a convenience only): closed → hidden for 30 days; signed up → never shown again.
const KEY = "tma-guide";
const SNOOZE_MS = 30 * 24 * 60 * 60 * 1000;
function readState(): { closedAt?: number; done?: boolean } {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}
function writeState(s: { closedAt?: number; done?: boolean }) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {}
}

export function GuideCover({ lang, className = "" }: { lang: Lang; className?: string }) {
  const t = T[lang];
  return (
    <div className={`relative mx-auto w-full max-w-[15rem] ${className}`}>
      {/* The book: a slight 3D tilt, spine shadow on the left, and a soft floor shadow. */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-r-lg rounded-l-sm bg-[#1f4e79] shadow-[0_24px_40px_-18px_rgba(31,78,121,0.65),inset_6px_0_8px_-4px_rgba(0,0,0,0.35)] [transform:perspective(900px)_rotateY(-10deg)]">
        <div className="absolute inset-x-0 top-0 h-[58%]">
          <Image src={t.photo} alt={t.photoAlt} fill sizes="240px" className="object-cover" style={{ objectPosition: t.photoPos }} />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-[#1f4e79]" />
          <div className="absolute left-3 top-3 rounded-md bg-white px-1.5 py-1">
            <Image src="/brand/logo-tma-2026.png" alt="The Mortgage Advisory" width={1837} height={497} sizes="96px" className="h-5 w-auto" />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 space-y-2 px-4 pb-4">
          <p className="font-heading text-[1.05rem] font-bold leading-tight text-white">{t.cover}</p>
          <p className="text-[0.62rem] leading-snug text-[#cfe0f1]">{t.coverSub}</p>
          <ul className="space-y-1 pt-1">
            {t.points.map((p) => (
              <li key={p} className="flex items-center gap-1.5 font-heading text-[0.55rem] font-bold uppercase tracking-wider text-white">
                <span aria-hidden="true" className="flex h-3 w-3 items-center justify-center rounded-full bg-brand-blue-deep text-[0.45rem]">
                  ✓
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <span
        aria-hidden="true"
        className="absolute -left-6 top-[38%] flex h-[4.6rem] w-[4.6rem] flex-col items-center justify-center rounded-full bg-brand-button text-center font-heading text-[0.6rem] font-bold uppercase leading-tight tracking-wider text-white shadow-lg"
      >
        {t.badge[0]}
        <br />
        {t.badge[1]}
        <svg viewBox="0 0 24 24" className="mt-0.5 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
        </svg>
      </span>
    </div>
  );
}

function GuideForm({ lang, onDone, autoFocus = false }: { lang: Lang; onDone?: () => void; autoFocus?: boolean }) {
  const t = T[lang];
  const id = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error" | "bad">("idle");
  const [guide, setGuide] = useState<string>(GUIDE_PDF[lang]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setStatus("bad");
    setStatus("sending");
    const website = (new FormData(e.currentTarget).get("website") as string) || "";
    try {
      const res = await fetch("/api/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, lang, page: window.location.pathname, website }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 400) return setStatus("bad");
      if (!res.ok || !data.ok) throw new Error();
      setGuide(data.guide || GUIDE_PDF[lang]);
      writeState({ done: true });
      setStatus("done");
      onDone?.();
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="space-y-4 text-center" role="status">
        <p className="font-heading text-2xl font-bold text-brand-slate">{t.doneTitle}</p>
        <p className="leading-relaxed">{t.doneText}</p>
        <a
          href={guide}
          target="_blank"
          rel="noopener"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-button px-6 py-4 text-lg font-semibold text-white hover:bg-brand-slate"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
          </svg>
          {t.download}
        </a>
        <Link href={t.bookHref} className="inline-block font-semibold text-brand-button underline underline-offset-4">
          {t.book} →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <label htmlFor={`${id}-email`} className="sr-only">
        {t.label}
      </label>
      <input
        id={`${id}-email`}
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        autoFocus={autoFocus}
        required
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (status === "bad" || status === "error") setStatus("idle");
        }}
        placeholder={t.placeholder}
        aria-invalid={status === "bad"}
        aria-describedby={`${id}-msg`}
        className="w-full rounded-2xl border border-brand-steel/50 bg-white px-5 py-3.5 text-lg text-brand-ink placeholder:text-brand-steel focus:border-brand-button focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
      />
      {/* Spam trap: hidden from people, filled in by bots. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-2xl bg-brand-button px-6 py-3.5 text-lg font-semibold text-white hover:bg-brand-slate disabled:opacity-70"
      >
        {status === "sending" ? t.sending : t.button}
      </button>
      <p id={`${id}-msg`} aria-live="polite" className="min-h-0 text-sm font-semibold text-amber-800">
        {status === "bad" ? t.bad : status === "error" ? t.error : ""}
      </p>
      <p className="text-center text-xs leading-relaxed text-brand-slate">
        {t.consent}{" "}
        <Link href={t.privacyHref} className="underline underline-offset-2">
          {t.privacy}
        </Link>
      </p>
    </form>
  );
}

function Headline({ lang, id, size = "lg" }: { lang: Lang; id?: string; size?: "lg" | "md" }) {
  const t = T[lang];
  return (
    <div className="space-y-2 text-center">
      <h2 id={id} className={`font-heading font-bold leading-tight text-brand-ink ${size === "lg" ? "text-3xl sm:text-4xl" : "text-2xl sm:text-3xl"}`}>
        {t.get} <span className="text-brand-blue-deep">{t.free}</span> {t.title}
      </h2>
      <p className="mx-auto max-w-sm leading-relaxed text-brand-slate sm:text-lg">{t.sub}</p>
    </div>
  );
}

/**
 * Popup for reverse mortgage pages. Opens once the visitor shows real interest: after 40 seconds, after scrolling
 * half the page, or (on a computer, after 8 seconds) when the mouse heads for the tabs or back button. Closed: hidden
 * for 30 days. Signed up: never again. On phones it's a panel that slides up from the bottom, not a full-screen
 * cover, so the page stays readable (Google penalizes full-screen mobile popups).
 */
export function GuidePopup({ lang = "en" }: { lang?: Lang }) {
  const t = T[lang];
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const shown = useRef(false);
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    const s = readState();
    if (s.done || (s.closedAt && Date.now() - s.closedAt < SNOOZE_MS)) return;
    const start = Date.now();
    const show = () => {
      if (shown.current) return;
      if (document.querySelector("dialog[open]")) return; // the booking window is open
      shown.current = true;
      setOpen(true);
    };
    const timer = setTimeout(show, 40_000);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max > 0.5) show();
    };
    const onLeave = (e: MouseEvent) => {
      if (!e.relatedTarget && e.clientY <= 0 && Date.now() - start > 8_000) show();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseout", onLeave);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onLeave);
    };
  }, []);

  const close = () => {
    setOpen(false);
    if (!done) writeState({ closedAt: Date.now() });
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    panel.current?.querySelector<HTMLElement>("input,button")?.focus({ preventScroll: true });
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" lang={lang}>
      {/* Dimmed page behind (computer only; on phones the page above the panel stays visible). */}
      <div aria-hidden="true" onClick={close} className="absolute inset-0 hidden bg-black/45 backdrop-blur-[2px] sm:block" />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative max-h-[78vh] w-full overflow-y-auto rounded-t-3xl bg-mist px-5 pb-6 pt-8 shadow-[0_-12px_40px_rgba(0,0,0,0.25)] motion-safe:animate-[guide-up_0.35s_ease-out] sm:max-h-[92vh] sm:max-w-4xl sm:overflow-visible sm:rounded-[2rem] sm:p-10 sm:shadow-2xl"
      >
        <button
          type="button"
          onClick={close}
          aria-label={t.close}
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-button text-white shadow-lg hover:bg-brand-slate sm:-right-4 sm:-top-4 sm:h-14 sm:w-14"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 sm:h-7 sm:w-7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
        <div className="grid items-center gap-6 sm:grid-cols-[0.9fr_1.1fr] sm:gap-10">
          <GuideCover lang={lang} className="hidden sm:block" />
          <div className="space-y-5">
            {!done && <Headline lang={lang} id={titleId} />}
            {done && <span id={titleId} className="sr-only">{t.doneTitle}</span>}
            <GuideForm lang={lang} autoFocus={false} onDone={() => setDone(true)} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Always-there sign-up box on the reverse mortgage page, for people who closed the popup or never saw it. */
export function GuideBox({ lang = "en" }: { lang?: Lang }) {
  const titleId = useId();
  return (
    <section aria-labelledby={titleId} className="rounded-3xl bg-mist p-6 ring-1 ring-brand-blue/40 sm:p-8" lang={lang}>
      <div className="grid items-center gap-8 sm:grid-cols-[0.8fr_1.2fr]">
        <GuideCover lang={lang} className="max-w-[11rem] sm:max-w-[13rem]" />
        <div className="space-y-4">
          <Headline lang={lang} id={titleId} size="md" />
          <GuideForm lang={lang} />
        </div>
      </div>
    </section>
  );
}
