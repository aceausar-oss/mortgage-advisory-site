"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Disclosures } from "@/components/Disclosures";
import type { Lang } from "@/lib/i18n";
import {
  questionsFor,
  resultFor,
  usd,
  type Answers,
  type Goal,
  type Question,
  type Result,
} from "@/lib/qualify";
import { licensing } from "@/lib/site";

// "See what you qualify for" quiz (Ace, Oct 2026). One question per screen, tap-to-answer buttons and Airbnb-style
// sliders, then contact details, then the results. Math lives in lib/qualify.ts; the lead goes to /api/qualify → Go
// High Level. startGoal (from ?goal=buy|refi|cash|reverse, read by the page) pre-picks the first answer.

const T = {
  en: {
    step: (n: number, of: number) => `Question ${n} of ${of}`,
    back: "Back",
    next: "Next",
    skip: "Skip",
    perMonth: "a month",
    years: "years old",
    inDollars: "in dollars",
    outsideTitle: "We're licensed in California, Texas, Florida, and Colorado",
    outsideBody:
      "We can't lend on a home in another state yet. If you have a home in one of our four states, start over and choose that state.",
    startOver: "Start over",
    contactTitle: "Where should we send your results?",
    contactHelp:
      "You'll see your results on the next screen, and we'll email you a copy. No credit check, and no Social Security number.",
    first: "First name",
    last: "Last name",
    email: "Email",
    phone: "Mobile phone (optional)",
    sms: "Yes, The Mortgage Advisory may call and text me, including automated messages, about my request. Consent is not a condition of any purchase or service. Message frequency varies. Msg & data rates may apply. Reply STOP to opt out, HELP for help.",
    see: "See my results",
    sending: "One moment…",
    agree:
      "By clicking “See my results,” you agree that The Mortgage Advisory, Inc. may email you about your request. Unsubscribe anytime. See our",
    privacy: "Privacy Policy",
    errName: "Please enter your first name.",
    errEmail: "Please check your email address.",
    errPhone: "Please check your phone number, or leave it blank.",
    errSend:
      "Something went wrong saving your details, but here are your results. Please call us so we don't miss you.",
    resultsFor: (name: string) => `${name}, here's your snapshot`,
    estimate:
      "Estimate only. Not an offer, a pre-approval, or a commitment to lend. Subject to credit approval, underwriting, property valuation, and program guidelines.",
    howWe: "How we estimate",
    fits: "Loan options that may fit",
    good: "Good to know",
    bring: "What to have ready",
    read: "Helpful reads",
    next2: "Your next step",
    nextBody:
      "A 15-minute call with an advisor turns this snapshot into real numbers, with today's pricing and every cost upfront. No pressure.",
    book: "Book a call with an advisor",
    ask: "Ask the AI assistant",
    call: "Call",
    englishOnly: "",
    noJs: "",
  },
  es: {
    step: (n: number, of: number) => `Pregunta ${n} de ${of}`,
    back: "Atrás",
    next: "Siguiente",
    skip: "Omitir",
    perMonth: "al mes",
    years: "años",
    inDollars: "en dólares",
    outsideTitle: "Tenemos licencia en California, Texas, Florida y Colorado",
    outsideBody:
      "Por ahora no podemos prestar sobre una casa en otro estado. Si tiene una casa en uno de nuestros cuatro estados, empiece de nuevo y elija ese estado.",
    startOver: "Empezar de nuevo",
    contactTitle: "¿A dónde le enviamos sus resultados?",
    contactHelp:
      "Verá sus resultados en la siguiente pantalla y le enviaremos una copia por correo. Sin revisar su crédito y sin número de Seguro Social.",
    first: "Nombre",
    last: "Apellido",
    email: "Correo electrónico",
    phone: "Celular (opcional)",
    sms: "Sí, The Mortgage Advisory puede llamarme y enviarme mensajes de texto, incluso automáticos, sobre mi solicitud. El consentimiento no es condición para ninguna compra o servicio. La frecuencia de los mensajes varía. Pueden aplicarse tarifas de mensajes y datos. Responda STOP para cancelar y HELP para ayuda.",
    see: "Ver mis resultados",
    sending: "Un momento…",
    agree:
      "Al hacer clic en «Ver mis resultados», usted acepta que The Mortgage Advisory, Inc. le envíe correos sobre su solicitud. Puede darse de baja cuando quiera. Vea nuestra",
    privacy: "Política de privacidad (en inglés)",
    errName: "Escriba su nombre, por favor.",
    errEmail: "Revise su correo electrónico, por favor.",
    errPhone: "Revise su número de teléfono o déjelo en blanco.",
    errSend:
      "Hubo un problema al guardar sus datos, pero aquí están sus resultados. Llámenos para no perder su solicitud.",
    resultsFor: (name: string) => `${name}, este es su resumen`,
    estimate:
      "Solo es un estimado. No es una oferta, una preaprobación ni un compromiso de préstamo. Sujeto a aprobación de crédito, suscripción, valuación de la propiedad y las reglas del programa.",
    howWe: "Cómo hacemos el estimado (en inglés)",
    fits: "Opciones de préstamo que pueden funcionarle",
    good: "Bueno saber",
    bring: "Qué tener listo",
    read: "Lecturas útiles",
    next2: "Su siguiente paso",
    nextBody:
      "Una llamada de 15 minutos con un asesor convierte este resumen en números reales, con los precios de hoy y cada costo desde el principio. Sin presión.",
    book: "Reserve una llamada con un asesor",
    ask: "Pregúntele al asistente",
    call: "Llame al",
    englishOnly: " (en inglés)",
    noJs: "",
  },
};

type Phase = "questions" | "contact" | "results" | "outside";

export function QualifyQuiz({
  lang = "en",
  startGoal,
}: {
  lang?: Lang;
  startGoal?: Goal;
}) {
  const t = T[lang];
  const es = lang === "es";
  const [answers, setAnswers] = useState<Answers>(
    startGoal ? { goal: startGoal } : {},
  );
  const [step, setStep] = useState(startGoal ? 1 : 0);
  const [phase, setPhase] = useState<Phase>("questions");
  const [result, setResult] = useState<Result | null>(null);
  const [firstName, setFirstName] = useState("");
  const [sendFailed, setSendFailed] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const id = useId();

  // Move focus to the new question (not on first load, so the page doesn't jump).
  useEffect(() => {
    if (!moved.current) return;
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({
      block: "nearest",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [step, phase]);

  const questions = useMemo(() => questionsFor(answers), [answers]);
  const total = questions.length + 1; // + contact screen
  const q = questions[step];
  const shownStep = phase === "contact" ? total : step + 1;
  const progress = phase === "results" ? 1 : shownStep / total;

  const advance = (next: Answers) => {
    moved.current = true;
    const list = questionsFor(next);
    if (next.state === "other") return setPhase("outside");
    if (step + 1 < list.length) setStep(step + 1);
    else setPhase("contact");
  };
  const choose = (qid: string, value: string) => {
    // Changing the goal starts that path fresh.
    const next =
      qid === "goal" ? { goal: value } : { ...answers, [qid]: value };
    setAnswers(next);
    advance(next);
  };
  const restart = () => {
    moved.current = true;
    setAnswers(startGoal ? { goal: startGoal } : {});
    setStep(startGoal ? 1 : 0);
    setResult(null);
    setPhase("questions");
  };
  const back = () => {
    moved.current = true;
    if (phase === "contact" || phase === "outside")
      return setPhase("questions");
    if (step > 0) setStep(step - 1);
  };

  return (
    <section
      aria-label={
        es
          ? "Cuestionario: vea para qué califica"
          : "Quiz: see what you qualify for"
      }
      className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-brand-blue/40 sm:p-8"
    >
      {phase !== "results" && (
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between gap-3 text-sm text-brand-slate">
            {phase === "contact" || phase === "outside" || step > 0 ? (
              <button
                type="button"
                onClick={back}
                className="rounded-full px-2 py-1 font-semibold text-brand-button hover:bg-mist"
              >
                <span aria-hidden="true">←</span> {t.back}
              </button>
            ) : (
              <span />
            )}
            {phase !== "outside" && <span>{t.step(shownStep, total)}</span>}
          </div>
          <div
            className="h-2 overflow-hidden rounded-full bg-mist"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            aria-label={es ? "Progreso" : "Progress"}
          >
            <div
              className="h-full rounded-full bg-brand-blue-deep transition-[width] duration-300 motion-reduce:transition-none"
              style={{ width: `${Math.max(4, progress * 100)}%` }}
            />
          </div>
        </div>
      )}

      {phase === "questions" && q && (
        <QuestionView
          key={`${q.id}-${answers.goal}`}
          q={q}
          lang={lang}
          answers={answers}
          headingRef={headingRef}
          onChoose={choose}
          onValue={(v) => {
            const next = { ...answers, [q.id]: v };
            setAnswers(next);
            advance(next);
          }}
        />
      )}

      {phase === "outside" && (
        <div className="space-y-4 text-center">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="font-heading text-2xl font-bold text-brand-ink outline-none"
          >
            {t.outsideTitle}
          </h2>
          <p className="mx-auto max-w-lg leading-relaxed text-brand-slate">
            {t.outsideBody}
          </p>
          <button
            type="button"
            onClick={restart}
            className="rounded-full bg-brand-soft px-6 py-3 font-semibold text-brand-ink hover:bg-brand-blue"
          >
            {t.startOver}
          </button>
        </div>
      )}

      {phase === "contact" && (
        <ContactForm
          lang={lang}
          answers={answers}
          headingRef={headingRef}
          onDone={(name, failed) => {
            moved.current = true;
            setResult(resultFor(answers));
            setFirstName(name);
            setSendFailed(failed);
            setPhase("results");
          }}
          idBase={id}
        />
      )}

      {phase === "results" && result && (
        <Results
          lang={lang}
          result={result}
          name={firstName}
          failed={sendFailed}
          headingRef={headingRef}
          onRestart={restart}
        />
      )}
    </section>
  );
}

function QuestionView({
  q,
  lang,
  answers,
  headingRef,
  onChoose,
  onValue,
}: {
  q: Question;
  lang: Lang;
  answers: Answers;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onChoose: (qid: string, value: string) => void;
  onValue: (v: string | number) => void;
}) {
  const t = T[lang];
  const id = useId();
  const initial =
    q.kind === "money"
      ? typeof q.initial === "function"
        ? q.initial(answers)
        : q.initial
      : q.kind === "age"
        ? q.initial
        : 0;
  const [num, setNum] = useState<number>(
    answers[q.id] !== undefined && q.kind !== "text" && q.kind !== "choice"
      ? Number(answers[q.id])
      : initial,
  );
  const [text, setText] = useState<string>(
    q.kind === "text" ? String(answers[q.id] ?? "") : "",
  );

  const heading = (
    <div className="space-y-2">
      <h2
        ref={headingRef}
        id={`${id}-q`}
        tabIndex={-1}
        className="font-heading text-2xl font-bold leading-tight text-brand-ink outline-none sm:text-3xl"
      >
        {q.title[lang]}
      </h2>
      {q.help && (
        <p className="leading-relaxed text-brand-slate">{q.help[lang]}</p>
      )}
    </div>
  );

  if (q.kind === "choice") {
    return (
      <div className="space-y-5">
        {heading}
        <ul
          className={`grid gap-3 ${q.options.length > 4 ? "sm:grid-cols-2" : ""}`}
          aria-labelledby={`${id}-q`}
        >
          {q.options.map((opt) => {
            const picked = answers[q.id] === opt.value;
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  aria-pressed={picked}
                  onClick={() => onChoose(q.id, opt.value)}
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl px-5 py-4 text-left text-lg font-semibold ring-1 transition-colors ${
                    picked
                      ? "bg-brand-soft text-brand-ink ring-brand-slate"
                      : "bg-white text-brand-ink ring-brand-steel/40 hover:bg-mist hover:ring-brand-blue-deep"
                  }`}
                >
                  {opt.label[lang]}
                  <span aria-hidden="true" className="text-brand-button">
                    →
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  if (q.kind === "text") {
    return (
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          onValue(text.trim().slice(0, 80));
        }}
      >
        {heading}
        <label htmlFor={`${id}-text`} className="sr-only">
          {q.title[lang]}
        </label>
        <input
          id={`${id}-text`}
          value={text}
          maxLength={80}
          autoComplete="address-level2"
          onChange={(e) => setText(e.target.value)}
          placeholder={q.placeholder[lang]}
          className="w-full rounded-2xl border border-brand-steel/50 bg-white px-5 py-3.5 text-lg text-brand-ink placeholder:text-brand-steel focus:border-brand-button focus:outline-none focus:ring-2 focus:ring-brand-blue/50"
        />
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-full bg-brand-soft px-7 py-3 font-semibold text-brand-ink hover:bg-brand-blue"
          >
            {text.trim() ? t.next : t.skip} <span aria-hidden="true">→</span>
          </button>
        </div>
      </form>
    );
  }

  // money or age: big number + slider + exact input
  const isAge = q.kind === "age";
  const min = q.min;
  const max = q.max;
  const step = q.kind === "money" ? q.step : 1;
  const shown = isAge
    ? `${num} ${t.years}`
    : `${usd(num)}${q.kind === "money" && q.perMonth ? ` ${t.perMonth}` : ""}`;
  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onValue(Math.max(0, Math.round(num)));
      }}
    >
      {heading}
      <p
        className="font-heading text-4xl font-bold text-brand-blue-deep sm:text-5xl"
        aria-live="polite"
      >
        {shown}
      </p>
      <div>
        <label htmlFor={`${id}-range`} className="sr-only">
          {q.title[lang]}
        </label>
        <input
          id={`${id}-range`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={Math.min(Math.max(num, min), max)}
          onChange={(e) => setNum(Number(e.target.value))}
          className="w-full accent-[var(--color-brand-blue-deep)]"
        />
        <div
          className="mt-1 flex justify-between text-xs text-brand-steel"
          aria-hidden="true"
        >
          <span>{isAge ? min : usd(min)}</span>
          <span>{isAge ? `${max}+` : `${usd(max)}+`}</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-brand-slate">
          <span>
            {isAge
              ? lang === "es"
                ? "Edad exacta"
                : "Exact age"
              : lang === "es"
                ? "Cantidad exacta"
                : "Exact amount"}
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={isAge ? 1 : step}
            value={num}
            aria-label={
              isAge ? q.title[lang] : `${q.title[lang]} ${t.inDollars}`
            }
            onChange={(e) => setNum(Math.max(0, Number(e.target.value) || 0))}
            className="w-36 rounded-lg border border-brand-steel/50 px-2 py-1.5 text-right"
          />
        </label>
        <button
          type="submit"
          className="rounded-full bg-brand-soft px-7 py-3 font-semibold text-brand-ink hover:bg-brand-blue"
        >
          {t.next} <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  );
}

function ContactForm({
  lang,
  answers,
  headingRef,
  onDone,
  idBase,
}: {
  lang: Lang;
  answers: Answers;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onDone: (firstName: string, failed: boolean) => void;
  idBase: string;
}) {
  const t = T[lang];
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    smsConsent: false,
    website: "",
  });
  const [status, setStatus] = useState<
    "idle" | "sending" | "name" | "email" | "phone"
  >("idle");
  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm({
        ...form,
        [k]: k === "smsConsent" ? e.target.checked : e.target.value,
      });
      if (status !== "sending") setStatus("idle");
    };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName.trim()) return setStatus("name");
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return setStatus("email");
    if (form.phone.trim() && form.phone.replace(/\D/g, "").length < 10)
      return setStatus("phone");
    setStatus("sending");
    let failed = false;
    try {
      const res = await fetch("/api/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          lang,
          page: window.location.pathname,
          answers,
        }),
      });
      if (res.status === 400) {
        const { error } = await res.json().catch(() => ({ error: "" }));
        if (error === "email" || error === "phone" || error === "name")
          return setStatus(error);
      }
      failed = !res.ok;
    } catch {
      failed = true;
    }
    onDone(form.firstName.trim(), failed);
  }

  const input =
    "w-full rounded-2xl border border-brand-steel/50 bg-white px-4 py-3 text-lg text-brand-ink placeholder:text-brand-steel focus:border-brand-button focus:outline-none focus:ring-2 focus:ring-brand-blue/50";
  const err =
    status === "name"
      ? t.errName
      : status === "email"
        ? t.errEmail
        : status === "phone"
          ? t.errPhone
          : "";
  const fid = (k: string) => `${idBase}-${k}`;

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <div className="space-y-2">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="font-heading text-2xl font-bold leading-tight text-brand-ink outline-none sm:text-3xl"
        >
          {t.contactTitle}
        </h2>
        <p className="leading-relaxed text-brand-slate">{t.contactHelp}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label
            htmlFor={fid("first")}
            className="mb-1 block text-sm font-semibold text-brand-slate"
          >
            {t.first}
          </label>
          <input
            id={fid("first")}
            autoComplete="given-name"
            required
            value={form.firstName}
            onChange={set("firstName")}
            aria-invalid={status === "name"}
            className={input}
          />
        </div>
        <div>
          <label
            htmlFor={fid("last")}
            className="mb-1 block text-sm font-semibold text-brand-slate"
          >
            {t.last}
          </label>
          <input
            id={fid("last")}
            autoComplete="family-name"
            value={form.lastName}
            onChange={set("lastName")}
            className={input}
          />
        </div>
        <div>
          <label
            htmlFor={fid("email")}
            className="mb-1 block text-sm font-semibold text-brand-slate"
          >
            {t.email}
          </label>
          <input
            id={fid("email")}
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={set("email")}
            aria-invalid={status === "email"}
            className={input}
          />
        </div>
        <div>
          <label
            htmlFor={fid("phone")}
            className="mb-1 block text-sm font-semibold text-brand-slate"
          >
            {t.phone}
          </label>
          <input
            id={fid("phone")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={set("phone")}
            aria-invalid={status === "phone"}
            className={input}
          />
        </div>
      </div>
      <label className="flex items-start gap-3 rounded-2xl bg-mist p-4 text-sm leading-relaxed text-brand-slate">
        <input
          type="checkbox"
          checked={form.smsConsent}
          onChange={set("smsConsent")}
          className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-brand-slate)]"
        />
        <span>{t.sms}</span>
      </label>
      {/* Spam trap: hidden from people, filled in by bots. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={form.website}
        onChange={set("website")}
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      <p
        aria-live="polite"
        className="min-h-0 text-sm font-semibold text-amber-800"
      >
        {err}
      </p>
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-2xl bg-brand-button px-6 py-4 text-lg font-semibold text-white hover:bg-brand-slate disabled:opacity-70"
      >
        {status === "sending" ? t.sending : t.see}
      </button>
      <p className="text-center text-xs leading-relaxed text-brand-slate">
        {t.agree}{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          {t.privacy}
        </Link>
        .
      </p>
    </form>
  );
}

function Results({
  lang,
  result,
  name,
  failed,
  headingRef,
  onRestart,
}: {
  lang: Lang;
  result: Result;
  name: string;
  failed: boolean;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onRestart: () => void;
}) {
  const t = T[lang];
  const es = lang === "es";
  const pre = es ? "/es" : "";
  const askQ = es
    ? "Acabo de hacer el cuestionario de calificación. ¿Cuáles son mis siguientes pasos?"
    : `I just took the qualify quiz (${result.programs.map((p) => p.name.en).join(", ")}). What are my next steps?`;
  const card = "rounded-2xl bg-mist p-5";

  return (
    <div className="space-y-6">
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="font-heading text-2xl font-bold leading-tight text-brand-ink outline-none sm:text-3xl"
      >
        {t.resultsFor(name || (es ? "Listo" : "All set"))}
      </h2>
      {failed && (
        <p className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-900 ring-1 ring-amber-500/40">
          {t.errSend} {licensing.phone}.
        </p>
      )}

      {result.figure && (
        <div className="rounded-3xl bg-brand-slate p-6 text-white">
          <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
            {result.figure.label[lang]}
          </p>
          <p className="mt-1 font-heading text-4xl font-bold sm:text-5xl">
            {result.figure.value}
          </p>
          {result.figure.math && (
            <p className="mt-2 text-sm text-white/80">{result.figure.math}</p>
          )}
        </div>
      )}
      {!!result.extra?.length && (
        <dl className="grid gap-3 sm:grid-cols-2">
          {result.extra.map((x) => (
            <div key={x.label.en} className={card}>
              <dt className="text-sm text-brand-slate">{x.label[lang]}</dt>
              <dd className="mt-1 font-heading text-2xl font-bold text-brand-ink">
                {x.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
      <p className="text-xs leading-relaxed text-brand-slate">
        {t.estimate}{" "}
        <Link
          href="/how-we-estimate"
          className="font-semibold underline underline-offset-2"
        >
          {t.howWe}
        </Link>
      </p>

      <div className="space-y-3">
        <h3 className="font-heading text-xl font-semibold">{t.fits}</h3>
        <ul className="space-y-3">
          {result.programs.map((p) => (
            <li
              key={p.name.en}
              className="rounded-2xl bg-white p-4 ring-1 ring-brand-blue/50"
            >
              <p className="font-semibold text-brand-ink">{p.name[lang]}</p>
              <p className="mt-1 leading-relaxed text-brand-slate">
                {p.why[lang]}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {result.notes.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-heading text-xl font-semibold">{t.good}</h3>
          <ul className="list-disc space-y-2 pl-5 leading-relaxed">
            {result.notes.map((n) => (
              <li key={n.en}>{n[lang]}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={`${card} space-y-2`}>
        <h3 className="font-heading text-xl font-semibold">{t.bring}</h3>
        <ul className="space-y-1.5 leading-relaxed">
          {result.checklist.map((c) => (
            <li key={c.en} className="flex gap-2">
              <span aria-hidden="true" className="text-brand-blue-deep">
                ✓
              </span>
              {c[lang]}
            </li>
          ))}
        </ul>
      </div>

      <section
        aria-label={t.next2}
        className="rounded-2xl bg-brand-slate p-6 text-white"
      >
        <p className="font-heading text-xl font-semibold text-white">
          {t.next2}
        </p>
        <p className="mt-1 text-white/90">{t.nextBody}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href={`${pre}/book#${result.booking}`}
            className="rounded-full bg-white px-5 py-2.5 font-semibold text-brand-slate hover:bg-mist"
          >
            {t.book} <span aria-hidden="true">→</span>
          </Link>
          <Link
            href={`${pre}/ask?q=${encodeURIComponent(askQ)}`}
            className="rounded-full border border-white px-5 py-2.5 font-semibold text-white hover:bg-white/10"
          >
            {t.ask}
          </Link>
          <a
            href={`tel:${licensing.phoneE164}`}
            className="rounded-full border border-white px-5 py-2.5 font-semibold text-white hover:bg-white/10"
          >
            {t.call} {licensing.phone}
          </a>
        </div>
      </section>

      {result.reads.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-heading text-xl font-semibold">{t.read}</h3>
          <ul className="space-y-2">
            {result.reads.map((r) => (
              <li key={r.href}>
                <Link
                  href={r.href}
                  className="font-semibold text-brand-button underline underline-offset-4"
                  hrefLang={es ? "en" : undefined}
                >
                  {r.label[lang]}
                  {t.englishOnly}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Disclosures
        entry={{
          category: result.goal === "reverse" ? "reverse-mortgage" : "buying",
          products: result.disclosures.products,
        }}
        debt={result.disclosures.debt}
        lang={lang}
      />

      <button
        type="button"
        onClick={onRestart}
        className="text-sm font-semibold text-brand-button underline underline-offset-4"
      >
        {t.startOver}
      </button>
    </div>
  );
}
