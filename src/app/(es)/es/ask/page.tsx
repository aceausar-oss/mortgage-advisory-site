import type { Metadata } from "next";
import Link from "next/link";
import { ChatAssistant } from "@/components/chat/ChatAssistant";
import { alternates } from "@/lib/i18n";
import { getLoanPages } from "@/lib/loans";
import { licensing } from "@/lib/site";

// Spanish chat page: destination for the Spanish hero box, chips, and slider. The assistant answers in Spanish.
export const metadata: Metadata = {
  title: "Haga una pregunta sobre hipotecas",
  description:
    "Respuestas claras en español sobre HELOC, hipotecas inversas, comprar casa y refinanciar, de un prestamista y corredor hipotecario con licencia, NMLS #1549739.",
  alternates: alternates("/ask", "es"),
  robots: { index: false, follow: true },
};

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim().slice(0, 300) || "";

export default async function SpanishAskPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const city = one(sp.city);
  const money = (key: string) => {
    const n = Number(one(sp[key]).replace(/[^0-9]/g, ""));
    return n > 0 ? `$${n.toLocaleString("en-US")}` : "";
  };
  const goal = one(sp.goal);
  const product = one(sp.product);
  const details = [
    money("value") && `mi casa vale unos ${money("value")}`,
    money("balance") && `debo ${money("balance")} de hipoteca`,
    money("cash") && `necesito unos ${money("cash")}`,
    product && `me interesa: ${product}`,
  ].filter(Boolean);
  const q =
    one(sp.q) ||
    [[goal || "Opciones con el valor de mi casa", city && `en ${city}`].filter(Boolean).join(" "), details.length ? `${details.join(", ").replace(/^./, (c) => c.toUpperCase())}.` : ""]
      .filter(Boolean)
      .join(". ");
  const loans = getLoanPages("es");

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold sm:text-3xl">Pregúntele a nuestro asistente hipotecario</h1>
        <p className="text-brand-slate">Respuestas claras sobre HELOC, hipotecas inversas, comprar casa y refinanciar. Ace y nuestro equipo le dan seguimiento.</p>
      </header>

      <div className="js-only">
        <ChatAssistant initialQuestion={q || undefined} phone={licensing.phone} phoneE164={licensing.phoneE164} lang="es" />
      </div>
      <noscript>
        <p className="rounded-2xl bg-white p-5">
          El chat necesita JavaScript. Mientras tanto, vea nuestras respuestas abajo, llame al{" "}
          <a href={`tel:${licensing.phoneE164}`} className="font-semibold underline">
            {licensing.phone}
          </a>{" "}
          o <a href="/es/book" className="font-semibold underline">reserve una llamada</a>.
        </p>
        {q && <p className="mt-4 font-semibold text-brand-slate">Su pregunta: {q}</p>}
      </noscript>

      <section aria-labelledby="programs" className="space-y-4">
        <h2 id="programs" className="text-xl font-semibold">
          Nuestras respuestas en español
        </h2>
        <ul className="space-y-3">
          {loans.map((p) => (
            <li key={p.slug}>
              <Link href={`/es/loans/${p.slug}`} className="block rounded-2xl bg-white p-4 ring-1 ring-brand-blue/50 transition hover:shadow-md">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-button">{p.name}</span>
                <span className="mt-1 block font-semibold">{p.question}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-label="Hable con nuestro equipo" className="rounded-3xl bg-brand-slate p-6 text-white">
        <p className="font-heading text-xl font-semibold text-white">¿Quiere una respuesta directa para su situación?</p>
        <p className="mt-1 text-white/90">Nuestro equipo le explica sus opciones con números reales. Puede pedir un asesor que hable español.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/es/book" className="rounded-full bg-white px-5 py-2.5 font-semibold text-brand-slate hover:bg-mist">
            Reserve una llamada con un asesor
          </Link>
          <a href={`tel:${licensing.phoneE164}`} className="rounded-full border border-white px-5 py-2.5 font-semibold text-white hover:bg-white/10">
            Llame al {licensing.phone}
          </a>
        </div>
      </section>
    </div>
  );
}
