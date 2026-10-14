import Image from "next/image";
import type { Metadata } from "next";
import { BookingPicker } from "@/components/BookingPicker";
import { alternates } from "@/lib/i18n";
import { bookingEmbedUrl, bookingTypes, spanishCalendars } from "@/lib/home";
import { licensing } from "@/lib/site";

export const metadata: Metadata = {
  title: "Reserve una llamada con un asesor",
  description:
    "Reserve una llamada en español o en inglés con un asesor de The Mortgage Advisory (NMLS #1549739) sobre hipotecas inversas, HELOC, refinanciamiento o comprar casa.",
  alternates: alternates("/book", "es"),
};

// Spanish booking page (Ace, Oct 2026): same Go High Level calendars as /book, plus a choice of call language that
// routes to a Spanish-speaking advisor (lib/home.ts spanishCalendars).
export default function SpanishBookPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-12 sm:px-6">
      <header className="space-y-3 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">Reserve una llamada con un asesor</h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed">Elija el idioma y el tema de su llamada, y luego un horario.</p>
        <p className="text-lg">
          ¿Prefiere hablar ahora? Llame al{" "}
          <a href={`tel:${licensing.phoneE164}`} className="whitespace-nowrap font-semibold underline underline-offset-4">
            {licensing.phone}
          </a>{" "}
          y pida un asesor que hable español.
        </p>
      </header>
      <div className="relative aspect-[3/2] overflow-hidden rounded-3xl sm:aspect-[21/9]">
        <Image
          src="/images/pages/book-call.jpg"
          alt="Asesora sonriente en una llamada con audífonos en su escritorio"
          fill
          preload
          sizes="(min-width: 1024px) 1024px, 100vw"
          className="object-cover object-[center_25%]"
        />
      </div>

      <BookingPicker
        lang="es"
        topics={bookingTypes.map((b) => {
          const es = spanishCalendars[b.key];
          return {
            key: b.key,
            title: b.titleEs,
            blurb: b.blurbEs,
            url: b.url,
            embedUrl: bookingEmbedUrl(b.calendarId),
            ...(es && { spanishUrl: es.url, spanishEmbedUrl: bookingEmbedUrl(es.calendarId) }),
          };
        })}
      />
    </div>
  );
}
