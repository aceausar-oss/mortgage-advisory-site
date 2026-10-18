import Image from "next/image";
import Link from "next/link";
import { AuthorBox, Breadcrumbs, TldrBox } from "@/components/AnswerParts";
import { Disclosures } from "@/components/Disclosures";
import { JsonLd } from "@/components/JsonLd";
import { QualifyQuiz } from "@/components/qualify/QualifyQuiz";
import type { Lang } from "@/lib/i18n";
import { PRE_APPROVAL_PHOTO as PHOTO } from "@/lib/preApproval";
import { licensing, siteUrl } from "@/lib/site";

// /pre-approval and /es/pre-approval (Ace, Oct 2026): answer-first page for "How do I get pre-approved?" (CLAUDE.md §6),
// with the qualify quiz opened on the Buy path. All answers are server-rendered; the quiz only adds the interactive part.
const UPDATED = "2026-10-17";
const REVIEWED = "Ace Ausar, NMLS #1143018";

// `a` is the plain-text answer used in FAQPage schema; `body` is what the page shows.
type Section = { q: string; a: string; body: React.ReactNode };

const C = {
  en: {
    crumb: "Get pre-approved",
    eyebrow: "Mortgage pre-approval",
    h1: "How do I get pre-approved for a mortgage?",
    tldr: "Share your income, assets, and debts, and let a lender review your credit and documents. That review is what turns a guess into a pre-approval letter sellers take seriously. At The Mortgage Advisory (NMLS #1549739), licensed in California, Texas, Florida, and Colorado, you start with a 2-minute quiz, then an advisor reviews your documents and gives you a pre-approval you can count on.",
    quizTitle: "Start with the 2-minute quiz",
    quizHelp:
      "Buying, refinancing, tapping your equity, or a reverse mortgage: pick yours below. No credit check and no Social Security number. You'll see the loan options that may fit, an estimate where we can give one, and your document checklist.",
    scenarioTitle: "Example scenario (illustrative)",
    takeTitle: "Our take",
    ctaTitle: "Ready for a real pre-approval?",
    ctaBody:
      "Book a call with an advisor. We'll review your documents and show you what you qualify for and what you're comfortable with.",
    book: "Book a call with an advisor",
    call: "Call",
    related: "Questions people ask",
  },
  es: {
    crumb: "Obtener preaprobación",
    eyebrow: "Preaprobación hipotecaria",
    h1: "¿Cómo obtengo una preaprobación para una hipoteca?",
    tldr: "Comparta sus ingresos, bienes y deudas, y deje que un prestamista revise su crédito y sus documentos. Esa revisión es lo que convierte un cálculo en una carta de preaprobación que los vendedores toman en serio. En The Mortgage Advisory (NMLS #1549739), con licencia en California, Texas, Florida y Colorado, empieza con un cuestionario de 2 minutos; luego un asesor revisa sus documentos y le da una preaprobación con la que puede contar.",
    quizTitle: "Empiece con el cuestionario de 2 minutos",
    quizHelp:
      "Comprar, refinanciar, usar el valor líquido de su casa o una hipoteca inversa: elija la suya abajo. Sin revisar su crédito y sin número de Seguro Social. Verá las opciones de préstamo que pueden funcionarle, un estimado cuando es posible y su lista de documentos.",
    scenarioTitle: "Ejemplo (ilustrativo)",
    takeTitle: "Nuestra opinión",
    ctaTitle: "¿Listo para una preaprobación real?",
    ctaBody:
      "Reserve una llamada con un asesor. Revisaremos sus documentos y le mostraremos para cuánto califica y con cuánto se siente cómodo.",
    book: "Reserve una llamada con un asesor",
    call: "Llame al",
    related: "Preguntas frecuentes (en inglés)",
  },
};

const SECTIONS: Record<Lang, Section[]> = {
  en: [
    {
      q: "What's the difference between pre-qualification and pre-approval?",
      a: "A pre-qualification is an estimate based on what you tell a lender, with no credit check. A pre-approval is based on your credit report and documents the lender has verified, so it carries much more weight with sellers.",
      body: (
        <>
          <p>
            A pre-qualification is an estimate based on what you tell us. A
            pre-approval is based on what we verify. Sellers and their agents
            know the difference.
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th scope="col"></th>
                  <th scope="col">Pre-qualification</th>
                  <th scope="col">Pre-approval</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Based on</th>
                  <td>What you tell us</td>
                  <td>Your credit report and documents</td>
                </tr>
                <tr>
                  <th scope="row">Credit check</th>
                  <td>No</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <th scope="row">Time</th>
                  <td>Minutes</td>
                  <td>Often 1 to 3 business days once your documents are in</td>
                </tr>
                <tr>
                  <th scope="row">Weight with sellers</th>
                  <td>Low</td>
                  <td>Much higher</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      q: "What documents do I need to get pre-approved?",
      a: "Pay stubs for the last 30 days and W-2s for 2 years (or 2 years of tax returns or 12 to 24 months of bank statements if self-employed), the last 2 months of bank and investment statements, a gift letter if family is helping, a DD-214 for veterans, and a photo ID.",
      body: (
        <ul>
          <li>
            <strong>Income:</strong> pay stubs for the last 30 days and W-2s for
            the last 2 years. Self-employed: 2 years of tax returns, or 12 to 24
            months of bank statements for a{" "}
            <Link href="/loans/non-qm">bank statement loan</Link>.
          </li>
          <li>
            <strong>Assets:</strong> the last 2 months of bank and investment
            statements, every page.
          </li>
          <li>
            <strong>Down payment gift:</strong> a signed gift letter, if family
            is helping. See{" "}
            <Link href="/answers/gift-funds-down-payment">
              how gift funds work
            </Link>
            .
          </li>
          <li>
            <strong>Veterans:</strong> your DD-214 or Statement of Service. We
            can usually pull your Certificate of Eligibility for you.
          </li>
          <li>
            <strong>ID:</strong> a government photo ID.
          </li>
        </ul>
      ),
    },
    {
      q: "Does getting pre-approved hurt my credit?",
      a: "A pre-approval uses a credit check that can lower your score by a few points for a short time. Several mortgage inquiries within a short window (14 to 45 days, depending on the scoring model) generally count as one.",
      body: (
        <p>
          A pre-approval uses a credit check, which can lower your score by a
          few points for a short time. Shopping several mortgage lenders within
          a short window (14 to 45 days, depending on the scoring model)
          generally counts as a single inquiry, so comparing lenders won&apos;t
          hurt you more. The quiz on this page doesn&apos;t check your credit at
          all.
        </p>
      ),
    },
    {
      q: "How long is a pre-approval good for?",
      a: "Usually 60 to 90 days, because credit reports and pay stubs get stale. It can be updated with fresh documents.",
      body: (
        <p>
          Usually 60 to 90 days, because credit reports and pay stubs get stale.
          If your search runs longer, we update it with fresh documents.
          Shopping for a while? Get pre-approved when you&apos;re within a few
          months of making offers.
        </p>
      ),
    },
    {
      q: "What can hurt my pre-approval before closing?",
      a: "Opening new credit, changing jobs, large cash deposits you can't document, missed payments, and co-signing someone else's loan.",
      body: (
        <ul>
          <li>Opening new credit or financing a car or furniture</li>
          <li>Changing jobs, or going from a paycheck to self-employed</li>
          <li>Large cash deposits you can&apos;t document</li>
          <li>Missing a payment on anything</li>
          <li>Co-signing a loan for someone else</li>
        </ul>
      ),
    },
    {
      q: "How much house will I be pre-approved for?",
      a: "It depends on your gross income, monthly debts, credit, and down payment. A common starting point is a total house payment of about 28% to 31% of gross monthly income, though many programs approve more.",
      body: (
        <p>
          Lenders look at your gross income, your monthly debts, your credit,
          and your down payment. A common starting point is keeping your total
          house payment around 28% to 31% of your gross monthly income. Many
          programs approve more than that, which is why we show you both
          numbers. See{" "}
          <Link href="/answers/how-much-house-can-i-afford">
            how much house you can afford
          </Link>
          .
        </p>
      ),
    },
  ],
  es: [
    {
      q: "¿Cuál es la diferencia entre precalificación y preaprobación?",
      a: "La precalificación es un estimado basado en lo que usted le dice al prestamista, sin revisar su crédito. La preaprobación se basa en su reporte de crédito y en documentos verificados, por eso tiene mucho más peso ante los vendedores.",
      body: (
        <>
          <p>
            La precalificación es un estimado basado en lo que usted nos dice.
            La preaprobación se basa en lo que verificamos. Los vendedores y sus
            agentes conocen la diferencia.
          </p>
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th scope="col"></th>
                  <th scope="col">Precalificación</th>
                  <th scope="col">Preaprobación</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Se basa en</th>
                  <td>Lo que usted nos dice</td>
                  <td>Su reporte de crédito y sus documentos</td>
                </tr>
                <tr>
                  <th scope="row">Revisión de crédito</th>
                  <td>No</td>
                  <td>Sí</td>
                </tr>
                <tr>
                  <th scope="row">Tiempo</th>
                  <td>Minutos</td>
                  <td>
                    Muchas veces de 1 a 3 días hábiles después de recibir sus
                    documentos
                  </td>
                </tr>
                <tr>
                  <th scope="row">Peso ante los vendedores</th>
                  <td>Bajo</td>
                  <td>Mucho mayor</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      q: "¿Qué documentos necesito para la preaprobación?",
      a: "Talones de pago de 30 días y formularios W-2 de 2 años (o 2 años de impuestos o de 12 a 24 meses de estados de cuenta si trabaja por su cuenta), estados de cuenta de los últimos 2 meses, una carta de regalo si su familia ayuda, el DD-214 para veteranos y una identificación con foto.",
      body: (
        <ul>
          <li>
            <strong>Ingresos:</strong> talones de pago de los últimos 30 días y
            formularios W-2 de los últimos 2 años. Si trabaja por su cuenta: 2
            años de declaraciones de impuestos, o de 12 a 24 meses de estados de
            cuenta para un{" "}
            <Link href="/es/loans/non-qm">
              préstamo con estados de cuenta bancarios
            </Link>
            .
          </li>
          <li>
            <strong>Bienes:</strong> estados de cuenta bancarios y de inversión
            de los últimos 2 meses, todas las páginas.
          </li>
          <li>
            <strong>Regalo para el enganche:</strong> una carta de regalo
            firmada, si su familia le ayuda.
          </li>
          <li>
            <strong>Veteranos:</strong> su DD-214 o constancia de servicio.
            Normalmente podemos obtener su Certificado de Elegibilidad por
            usted.
          </li>
          <li>
            <strong>Identificación:</strong> una identificación oficial con
            foto.
          </li>
        </ul>
      ),
    },
    {
      q: "¿La preaprobación afecta mi crédito?",
      a: "Incluye una revisión de crédito que puede bajar su puntaje unos puntos por poco tiempo. Varias consultas hipotecarias en un periodo corto (de 14 a 45 días, según el modelo) normalmente cuentan como una.",
      body: (
        <p>
          La preaprobación incluye una revisión de crédito, que puede bajar su
          puntaje unos puntos por poco tiempo. Comparar varios prestamistas
          hipotecarios en un periodo corto (de 14 a 45 días, según el modelo de
          puntaje) normalmente cuenta como una sola consulta, así que comparar
          no le perjudica más. El cuestionario de esta página no revisa su
          crédito.
        </p>
      ),
    },
    {
      q: "¿Cuánto tiempo dura una preaprobación?",
      a: "Normalmente de 60 a 90 días, porque los reportes de crédito y los talones de pago caducan. Se puede actualizar con documentos nuevos.",
      body: (
        <p>
          Normalmente de 60 a 90 días, porque los reportes de crédito y los
          talones de pago caducan. Si su búsqueda tarda más, la actualizamos con
          documentos nuevos. Si apenas está empezando, pida la preaprobación
          cuando le falten pocos meses para hacer ofertas.
        </p>
      ),
    },
    {
      q: "¿Qué puede afectar mi preaprobación antes del cierre?",
      a: "Abrir crédito nuevo, cambiar de trabajo, depósitos grandes en efectivo sin comprobar, atrasos en pagos y ser codeudor del préstamo de otra persona.",
      body: (
        <ul>
          <li>Abrir crédito nuevo o financiar un auto o muebles</li>
          <li>
            Cambiar de trabajo, o pasar de sueldo a trabajo por cuenta propia
          </li>
          <li>Depósitos grandes en efectivo que no pueda comprobar</li>
          <li>Atrasarse en cualquier pago</li>
          <li>Ser codeudor del préstamo de otra persona</li>
        </ul>
      ),
    },
    {
      q: "¿Para cuánta casa me van a preaprobar?",
      a: "Depende de su ingreso bruto, sus deudas, su crédito y su enganche. Un buen punto de partida es un pago total de casa de 28 % a 31 % del ingreso mensual bruto, aunque muchos programas aprueban más.",
      body: (
        <p>
          Los prestamistas revisan su ingreso bruto, sus deudas mensuales, su
          crédito y su enganche. Un buen punto de partida es que el pago total
          de la casa sea de 28 % a 31 % de su ingreso mensual bruto. Muchos
          programas aprueban más, por eso le mostramos los dos números.
        </p>
      ),
    },
  ],
};

const SCENARIO = {
  en: "A first-time buyer in Fort Worth takes the quiz on a Sunday night: W-2 income, a 690 score, $18,000 saved. Her snapshot shows FHA and a conventional 3%-down loan as options, plus her document checklist. She uploads pay stubs and bank statements on Monday, and by Wednesday she has a pre-approval letter and a payment she's comfortable with, not just the maximum.",
  es: "Una compradora de primera vez en Fort Worth hace el cuestionario un domingo en la noche: sueldo W-2, puntaje de 690 y $18,000 ahorrados. Su resumen muestra FHA y un préstamo convencional con 3 % de enganche como opciones, además de su lista de documentos. El lunes envía sus talones de pago y estados de cuenta, y para el miércoles tiene su carta de preaprobación y un pago con el que se siente cómoda, no solo el máximo.",
};

const TAKE = {
  en: "Get a real pre-approval, not a quick pre-qual, before you fall in love with a house. When we review your income and assets upfront, your offer is stronger and there are fewer surprises in escrow. And shop by payment: the pre-approval is the ceiling, not the target.",
  es: "Obtenga una preaprobación real, no una precalificación rápida, antes de enamorarse de una casa. Cuando revisamos sus ingresos y bienes desde el principio, su oferta es más fuerte y hay menos sorpresas en escrow. Y busque por pago: la preaprobación es el techo, no la meta.",
};

const RELATED = [
  ["how-much-house-can-i-afford", "How much house can I afford?"],
  ["how-much-down-payment-do-i-need", "How much down payment do I need?"],
  [
    "credit-score-to-buy-a-house",
    "What credit score do I need to buy a house?",
  ],
  [
    "fha-vs-conventional-small-down-payment",
    "FHA or conventional with a small down payment?",
  ],
  ["why-sellers-turn-down-va-offers", "Why do sellers turn down VA offers?"],
] as const;

export function PreApprovalView({ lang }: { lang: Lang }) {
  const c = C[lang];
  const es = lang === "es";
  const path = es ? "/es/pre-approval" : "/pre-approval";
  const url = `${siteUrl}${path}`;
  const sections = SECTIONS[lang];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: c.h1,
        abstract: c.tldr,
        url,
        mainEntityOfPage: url,
        datePublished: UPDATED,
        dateModified: UPDATED,
        inLanguage: es ? "es-US" : "en-US",
        ...(es && {
          translationOfWork: { "@id": `${siteUrl}/pre-approval#article` },
        }),
        author: { "@id": `${siteUrl}/#ace-ausar` },
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        inLanguage: es ? "es-US" : "en-US",
        mainEntity: [{ q: c.h1, a: c.tldr }, ...sections].map((x) => ({
          "@type": "Question",
          name: x.q,
          acceptedAnswer: { "@type": "Answer", text: x.a },
        })),
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
          { "@type": "ListItem", position: 2, name: c.crumb, item: url },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd data={jsonLd} />
      <article className="space-y-8">
        <Breadcrumbs
          items={[
            { href: es ? "/es" : "/", label: es ? "Inicio" : "Home" },
            { href: path, label: c.crumb },
          ]}
        />
        <header className="space-y-5">
          <p className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-brand-button">
            {c.eyebrow}
          </p>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            {c.h1}
          </h1>
          {/* Same young family as the share image (Ace, Oct 2026). Kept short on phones so the quiz stays close. */}
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl sm:aspect-[21/9]">
            <Image
              src={PHOTO.src}
              alt={PHOTO.alt[lang]}
              fill
              preload
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
              style={{ objectPosition: PHOTO.position }}
            />
          </div>
          <TldrBox text={c.tldr} lang={lang} />
        </header>

        <section
          aria-labelledby="quiz"
          className="space-y-3 rounded-3xl bg-mist p-4 sm:p-6"
        >
          <h2 id="quiz" className="font-heading text-2xl font-semibold">
            {c.quizTitle}
          </h2>
          <p className="leading-relaxed text-brand-slate">{c.quizHelp}</p>
          {/* Opens on "What would you like to do?" so all four options show: buy, refinance, HELOC, reverse (Ace, Oct 2026). */}
          <QualifyQuiz lang={lang} />
        </section>

        <div className="answer-body">
          {sections.map((s) => (
            <section key={s.q}>
              <h2>{s.q}</h2>
              {s.body}
            </section>
          ))}
          <h2>{c.scenarioTitle}</h2>
          <p>{SCENARIO[lang]}</p>
          <h2>{c.takeTitle}</h2>
          <p>{TAKE[lang]}</p>
        </div>

        <section aria-labelledby="related" className="space-y-3">
          <h2 id="related" className="font-heading text-2xl font-semibold">
            {c.related}
          </h2>
          <ul className="space-y-2">
            {RELATED.map(([slug, q]) => (
              <li key={slug}>
                <Link
                  href={`/answers/${slug}`}
                  hrefLang={es ? "en" : undefined}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-white px-5 py-3.5 font-semibold text-brand-ink ring-1 ring-brand-blue/40 hover:ring-brand-blue"
                >
                  <span lang={es ? "en" : undefined}>{q}</span>
                  <span aria-hidden="true" className="text-brand-button">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <AuthorBox
          entry={{ updated: UPDATED, reviewed_by: REVIEWED }}
          lang={lang}
        />
        <Disclosures
          entry={{
            category: "buying",
            products: ["conventional", "fha", "va"],
          }}
          lang={lang}
        />

        <section
          aria-label={c.ctaTitle}
          className="rounded-2xl bg-brand-slate p-6 text-white"
        >
          <p className="font-heading text-xl font-semibold text-white">
            {c.ctaTitle}
          </p>
          <p className="mt-1 text-white/90">{c.ctaBody}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={es ? "/es/book#purchase" : "/book#purchase"}
              className="rounded-full bg-white px-5 py-2.5 font-semibold text-brand-slate hover:bg-mist"
            >
              {c.book}
            </Link>
            <a
              href={`tel:${licensing.phoneE164}`}
              className="rounded-full border border-white px-5 py-2.5 font-semibold text-white hover:bg-white/10"
            >
              {c.call} {licensing.phone}
            </a>
          </div>
        </section>
      </article>
    </div>
  );
}
