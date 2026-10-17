import Link from "next/link";
import { Breadcrumbs } from "@/components/AnswerParts";
import { JsonLd } from "@/components/JsonLd";
import { QualifyQuiz } from "@/components/qualify/QualifyQuiz";
import type { Lang } from "@/lib/i18n";
import { GOALS, type Goal } from "@/lib/qualify";
import { licensing, siteUrl } from "@/lib/site";

// /qualify and /es/qualify: the quiz on its own page. Loan pages link here with ?goal= so visitors land on their path.
const C = {
  en: {
    crumb: "See what you qualify for",
    h1: "See what you qualify for",
    lead: "Buying, refinancing, tapping your equity, or looking at a reverse mortgage? Answer a few quick questions and get a personal snapshot: the loan options that may fit, an estimate where we can give one, and what to have ready.",
    points: ["About 2 minutes", "No credit check", "No Social Security number"],
    noJs: "This quiz needs JavaScript. You can also book a call or call us at",
    book: "book a call",
    how: "What happens after the quiz?",
    steps: [
      [
        "You see your snapshot right away",
        "Loan options that may fit, estimates where we can give one, and a document checklist.",
      ],
      [
        "An advisor reviews your answers",
        "So the first call starts with your situation, not a list of questions.",
      ],
      [
        "You get real numbers",
        "Today's pricing and every cost upfront, on an official Loan Estimate when you're ready to apply.",
      ],
    ],
    notApp:
      "This is a pre-qualification snapshot, not a loan application or a pre-approval. A pre-approval comes after we review your credit, income, and assets.",
  },
  es: {
    crumb: "Vea para qué califica",
    h1: "Vea para qué califica",
    lead: "¿Quiere comprar, refinanciar, usar el valor líquido de su casa o conocer la hipoteca inversa? Conteste unas preguntas rápidas y reciba un resumen personal: las opciones de préstamo que pueden funcionarle, un estimado cuando es posible y qué tener listo.",
    points: [
      "Unos 2 minutos",
      "Sin revisar su crédito",
      "Sin número de Seguro Social",
    ],
    noJs: "Este cuestionario necesita JavaScript. También puede reservar una llamada o llamarnos al",
    book: "reservar una llamada",
    how: "¿Qué pasa después del cuestionario?",
    steps: [
      [
        "Ve su resumen de inmediato",
        "Opciones de préstamo que pueden funcionarle, estimados cuando es posible y una lista de documentos.",
      ],
      [
        "Un asesor revisa sus respuestas",
        "Así la primera llamada empieza con su situación, no con una lista de preguntas.",
      ],
      [
        "Recibe números reales",
        "Los precios de hoy y cada costo desde el principio, en un Estimado del Préstamo oficial cuando esté listo para solicitar.",
      ],
    ],
    notApp:
      "Esto es un resumen de precalificación, no una solicitud de préstamo ni una preaprobación. La preaprobación viene después de revisar su crédito, ingresos y bienes.",
  },
};

export const goalFrom = (
  v: string | string[] | undefined,
): Goal | undefined => {
  const g = (Array.isArray(v) ? v[0] : v) as Goal | undefined;
  return g && GOALS.includes(g) ? g : undefined;
};

export function QualifyPageView({ lang, goal }: { lang: Lang; goal?: Goal }) {
  const c = C[lang];
  const es = lang === "es";
  const path = es ? "/es/qualify" : "/qualify";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: c.h1,
        url: `${siteUrl}${path}`,
        inLanguage: es ? "es-US" : "en-US",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description: c.lead,
        provider: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: es ? "Inicio" : "Home",
            item: `${siteUrl}${es ? "/es" : "/"}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: c.crumb,
            item: `${siteUrl}${path}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="bg-gradient-to-b from-mist to-white">
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6 sm:py-14">
        <JsonLd data={jsonLd} />
        <Breadcrumbs
          items={[
            { href: es ? "/es" : "/", label: es ? "Inicio" : "Home" },
            { href: path, label: c.crumb },
          ]}
        />
        <header className="space-y-4">
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            {c.h1}
          </h1>
          <p className="text-lg leading-relaxed">{c.lead}</p>
          <ul className="flex flex-wrap gap-2">
            {c.points.map((p) => (
              <li
                key={p}
                className="rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold text-brand-slate ring-1 ring-brand-blue/50"
              >
                <span aria-hidden="true" className="text-brand-blue-deep">
                  ✓{" "}
                </span>
                {p}
              </li>
            ))}
          </ul>
        </header>

        <QualifyQuiz lang={lang} startGoal={goal} />
        <noscript>
          <p className="rounded-2xl bg-white p-4 ring-1 ring-brand-steel/40">
            {c.noJs}{" "}
            <a
              href={`tel:${licensing.phoneE164}`}
              className="font-semibold underline"
            >
              {licensing.phone}
            </a>
            .{" "}
            <Link
              href={es ? "/es/book" : "/book"}
              className="font-semibold underline"
            >
              {c.book}
            </Link>
          </p>
        </noscript>

        <section aria-labelledby="after" className="space-y-4">
          <h2 id="after" className="font-heading text-2xl font-semibold">
            {c.how}
          </h2>
          <ol className="grid gap-3 sm:grid-cols-3">
            {c.steps.map(([title, body], i) => (
              <li
                key={title}
                className="rounded-2xl bg-white p-5 ring-1 ring-brand-blue/40"
              >
                <p className="font-heading text-sm font-semibold text-brand-button">
                  {i + 1}
                </p>
                <p className="mt-1 font-semibold">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-brand-slate">
                  {body}
                </p>
              </li>
            ))}
          </ol>
          <p className="text-sm leading-relaxed text-brand-slate">{c.notApp}</p>
        </section>
      </div>
    </div>
  );
}
