import Link from "next/link";
import { Disclosures } from "@/components/Disclosures";
import { BookingSection } from "@/components/home/BookingSection";
import { EquitySlider } from "@/components/home/EquitySlider";
import { FloatingCard } from "@/components/home/FloatingCard";
import { GoalCards } from "@/components/home/GoalCards";
import { HeroChat } from "@/components/home/HeroChat";
import { LicensedStatesMap } from "@/components/home/LicensedStatesMap";
import { pricing } from "@/lib/home";
import { getLoanPages } from "@/lib/loans";

// Spanish homepage (Ace, Oct 2026). Same structure as the English one, minus sections whose content is English only
// for now (reviews, the Q&A tabs, and the question feed); the loan programs list takes the Q&A tabs' place.
const EXAMPLES = [
  "¿Puedo sacar dinero de mi casa sin perder mi tasa baja?",
  "¿Cómo funciona una hipoteca inversa?",
  "¿Cuánto necesito de pago inicial para comprar casa?",
  "¿Puedo calificar si trabajo por cuenta propia?",
  "¿Me conviene refinanciar ahora?",
];

export default function SpanishHome() {
  const loans = getLoanPages("es");
  return (
    <>
      <div className="relative isolate overflow-hidden bg-mist">
        <section aria-label="Introducción" className="relative isolate overflow-hidden">
          <div aria-hidden="true" className="platinum" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-mist" />
          <div className="relative mx-auto max-w-5xl space-y-6 px-4 pb-16 pt-14 text-center sm:px-6 sm:pt-20">
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Use el valor de su casa y <em className="not-italic text-brand-blue-deep">conserve</em> su tasa baja.
            </h1>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed sm:text-xl">
              Obtenga dinero con una HELOC, una hipoteca inversa o un préstamo para comprar casa. Pregúntele lo que quiera a nuestro asistente
              hipotecario de IA, y nuestro equipo le dará seguimiento, en español si lo prefiere.
            </p>
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-brand-slate shadow-sm ring-1 ring-brand-steel/20">
              <span aria-hidden="true">⚡</span> Las HELOC pueden cerrar en tan solo 5 días*
            </p>
            <div className="pt-4">
              <HeroChat examples={EXAMPLES} lang="es" />
            </div>
            <p className="mx-auto max-w-2xl text-xs leading-relaxed text-brand-slate">
              *Según algunos programas de HELOC. Los tiempos varían según su solicitud, la propiedad y la aprobación, y no están garantizados.
            </p>
          </div>
        </section>

        <GoalCards lang="es" />

        <FloatingCard
          bare
          id="equity-heading"
          eyebrow="El valor líquido de su casa"
          title={
            <>
              Vea cuánto podría <span className="text-brand-blue-deep">liberar</span> su casa.
            </>
          }
          intro="Mueva los controles para un estimado rápido y luego pida sus números reales. Prestamos en California, Texas, Florida y Colorado."
        >
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
            <EquitySlider maxCLTV={pricing.maxCLTV} lang="es" />
            <LicensedStatesMap lang="es" />
          </div>
        </FloatingCard>
      </div>

      <FloatingCard
        tone="blue"
        id="programs-heading"
        eyebrow="Nuestros préstamos"
        title={
          <>
            Respuestas claras, <span className="text-brand-blue-deep">en español</span>.
          </>
        }
        intro="Elija un tema. Cada página explica cómo funciona, cuánto cuesta y para quién es."
      >
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loans.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/es/loans/${p.slug}`}
                className="flex h-full flex-col rounded-2xl bg-white p-5 ring-1 ring-brand-blue/40 transition hover:ring-brand-blue"
              >
                <span className="font-heading text-sm font-semibold uppercase tracking-wide text-brand-button">{p.name}</span>
                <span className="mt-1 flex-1 text-lg font-semibold leading-snug text-brand-ink">{p.question}</span>
                <span className="mt-3 font-semibold text-brand-button">
                  Leer la respuesta <span aria-hidden="true">→</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </FloatingCard>

      <div id="booking" className="scroll-mt-16">
        <FloatingCard
          id="booking-heading"
          eyebrow="Hable con nuestro equipo"
          title={
            <>
              Reserve una llamada con un <span className="text-brand-blue-deep">asesor</span>.
            </>
          }
          intro="Elija el tema, escoja un horario y hablemos sin presión y en palabras sencillas. Puede pedir un asesor que hable español."
        >
          <BookingSection lang="es" />
        </FloatingCard>
      </div>

      <section aria-label="Divulgaciones" className="mx-auto max-w-[75rem] px-4 pb-16 sm:px-6">
        <Disclosures lang="es" entry={{ category: "reverse-mortgage", products: ["hecm", "reverse-second", "heloc", "va", "fha"] }} debt />
      </section>
    </>
  );
}
