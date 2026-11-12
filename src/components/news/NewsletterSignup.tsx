"use client";

import { useId, useState } from "react";
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
  },
} as const;

export function NewsletterSignup({ lang = "en", page = "" }: { lang?: Lang; page?: string }) {
  const t = T[lang];
  const id = useId();
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

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
        body: JSON.stringify({ email, firstName: f.get("firstName") || "", consent: true, lang, page, website: f.get("website") || "" }),
      });
      if (!res.ok) throw new Error();
      setState("done");
    } catch {
      setState("idle");
      setError(t.error);
    }
  }

  return (
    <section aria-labelledby={`${id}-h`} className="rounded-3xl bg-brand-slate p-6 text-white sm:p-8">
      {/* Inline color: the global h2 color would otherwise win over the utility class on this dark panel. */}
      <h2 id={`${id}-h`} className="font-heading text-2xl font-bold" style={{ color: "#fff" }}>
        {t.title}
      </h2>
      <p className="mt-2 max-w-2xl text-white/90">{t.sub}</p>
      {state === "done" ? (
        <p role="status" className="mt-5 rounded-2xl bg-white p-4 font-semibold text-brand-ink">
          {t.done}
        </p>
      ) : (
        <form onSubmit={submit} noValidate className="mt-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_1.4fr_auto]">
            <label className="block">
              <span className="sr-only">{t.first}</span>
              <input name="firstName" autoComplete="given-name" placeholder={t.first} className="min-h-12 w-full rounded-full border-0 px-5 text-brand-ink" />
            </label>
            <label className="block">
              <span className="sr-only">{t.email}</span>
              <input name="email" type="email" required autoComplete="email" placeholder={t.email} className="min-h-12 w-full rounded-full border-0 px-5 text-brand-ink" />
            </label>
            <button
              type="submit"
              disabled={state === "sending"}
              className="min-h-12 rounded-full bg-brand-soft px-6 font-semibold text-brand-ink hover:bg-brand-blue disabled:opacity-70"
            >
              {state === "sending" ? t.sending : t.button}
            </button>
          </div>
          <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
          <label className="flex items-start gap-3 text-sm leading-relaxed text-white/90">
            <input type="checkbox" name="consent" className="mt-1 h-5 w-5 shrink-0" />
            <span>
              {t.consent}{" "}
              <a href="/privacy" className="underline underline-offset-2">
                {t.privacy}
              </a>
            </span>
          </label>
          {error && (
            <p role="alert" className="text-sm font-semibold text-white">
              {error}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
