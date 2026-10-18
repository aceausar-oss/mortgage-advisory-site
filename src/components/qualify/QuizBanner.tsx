import Link from "next/link";
import type { Lang } from "@/lib/i18n";
import type { Goal } from "@/lib/qualify";
import { quizHref } from "@/lib/qualifyPaths";

// Loan and state pages: a short invite into the qualify quiz, opened on the matching path (Ace, Oct 2026).
const COPY: Record<
  Goal | "any",
  { en: [string, string]; es: [string, string] }
> = {
  buy: {
    en: [
      "Buying? See what you qualify for",
      "Your housing budget, loan options that may fit, and a document checklist in about 2 minutes.",
    ],
    es: [
      "¿Va a comprar? Vea para qué califica",
      "Su presupuesto de vivienda, opciones de préstamo que pueden funcionarle y una lista de documentos en unos 2 minutos.",
    ],
  },
  refi: {
    en: [
      "Is a refinance worth it for you?",
      "Answer a few questions to see which refinance options fit your loan and your goal.",
    ],
    es: [
      "¿Le conviene refinanciar?",
      "Conteste unas preguntas para ver qué opciones de refinanciamiento van con su préstamo y su objetivo.",
    ],
  },
  cash: {
    en: [
      "How much could your home unlock?",
      "See your estimated equity and whether a HELOC or cash-out refinance fits better.",
    ],
    es: [
      "¿Cuánto podría liberar su casa?",
      "Vea su valor líquido estimado y si le conviene más una HELOC o un refinanciamiento con retiro de efectivo.",
    ],
  },
  reverse: {
    en: [
      "See your reverse mortgage estimate",
      "Based on HUD's official tables, with options to keep your current mortgage.",
    ],
    es: [
      "Vea su estimado de hipoteca inversa",
      "Con base en las tablas oficiales de HUD, con opciones para conservar su hipoteca actual.",
    ],
  },
  any: {
    en: [
      "See what you qualify for",
      "Buying, refinancing, tapping equity, or a reverse mortgage: a personal snapshot in about 2 minutes.",
    ],
    es: [
      "Vea para qué califica",
      "Comprar, refinanciar, usar su valor líquido o una hipoteca inversa: un resumen personal en unos 2 minutos.",
    ],
  },
};

const GOAL_BY_SLUG: Record<string, Goal> = {
  purchase: "buy",
  conventional: "buy",
  fha: "buy",
  va: "buy",
  "non-qm": "buy",
  refinance: "refi",
  heloc: "cash",
  "debt-consolidation": "cash",
  "reverse-mortgage": "reverse",
};

export const goalForLoan = (slug: string): Goal | undefined =>
  GOAL_BY_SLUG[slug];

export function QuizBanner({
  lang = "en",
  goal,
}: {
  lang?: Lang;
  goal?: Goal;
}) {
  const [title, body] = COPY[goal ?? "any"][lang];
  const es = lang === "es";
  const href = quizHref(goal, lang);
  return (
    <aside
      aria-label={title}
      className="flex flex-col gap-4 rounded-2xl bg-mist p-5 ring-1 ring-brand-blue/50 sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p className="font-heading text-lg font-semibold text-brand-ink">
          {title}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-brand-slate">{body}</p>
      </div>
      <Link
        href={href}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-brand-soft px-5 py-2.5 font-semibold text-brand-ink hover:bg-brand-blue"
      >
        {es ? "Empezar" : "Start the quiz"} <span aria-hidden="true">→</span>
      </Link>
    </aside>
  );
}
