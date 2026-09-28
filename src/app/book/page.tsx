import type { Metadata } from "next";
import Script from "next/script";
import { bookingEmbedUrl, bookingTypes } from "@/lib/home";
import { licensing } from "@/lib/site";

export const metadata: Metadata = {
  title: "Book a Call With an Advisor",
  description:
    "Schedule a call with a licensed advisor at The Mortgage Advisory (NMLS #1549739) about reverse mortgages, HELOCs, refinancing, or buying a home.",
  alternates: { canonical: "/book" },
};

// Booking page (CLAUDE.md §7, Phase 1): Go High Level calendar embeds, with direct links as a no-JS fallback.
export default function BookPage() {
  // Two booking types share one calendar until a Purchase calendar exists; embed each calendar once.
  const calendars = bookingTypes.filter((b, i) => bookingTypes.findIndex((x) => x.calendarId === b.calendarId) === i);

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-12 sm:px-6">
      <header className="space-y-3 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">Book a call with an advisor</h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed">
          Pick the topic that fits and choose a time. Prefer to talk now? Call{" "}
          <a href={`tel:${licensing.phoneE164}`} className="font-semibold underline underline-offset-4">
            {licensing.phone}
          </a>
          .
        </p>
      </header>

      {calendars.map((c) => {
        const titles = bookingTypes.filter((b) => b.calendarId === c.calendarId);
        return (
          <section key={c.calendarId} aria-labelledby={`cal-${c.key}`} className="space-y-3 rounded-3xl border border-brand-steel/30 bg-white p-4 sm:p-6">
            {titles.map((t) => (
              <span key={t.key} id={t.key} className="block scroll-mt-24" />
            ))}
            <h2 id={`cal-${c.key}`} className="text-2xl font-semibold">
              {titles.map((t) => t.title).join(" · ")}
            </h2>
            <p>{titles.map((t) => t.blurb).join(" ")}</p>
            <iframe
              src={bookingEmbedUrl(c.calendarId)}
              title={`Book a ${titles.map((t) => t.title).join(" or ")} call`}
              loading="lazy"
              scrolling="no"
              className="min-h-[700px] w-full rounded-2xl border-0"
            />
            <p className="text-sm">
              Calendar not loading?{" "}
              <a href={c.url} rel="noopener" className="font-semibold underline underline-offset-4">
                Open the booking page
              </a>
              .
            </p>
          </section>
        );
      })}
      <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="lazyOnload" />
    </div>
  );
}
