import Image from "next/image";
import type { Metadata } from "next";
import Script from "next/script";
import { BookingPicker } from "@/components/BookingPicker";
import { bookingEmbedUrl, bookingTypes } from "@/lib/home";
import { licensing } from "@/lib/site";

export const metadata: Metadata = {
  title: "Book a Call With an Advisor",
  description:
    "Schedule a call with a licensed advisor at The Mortgage Advisory (NMLS #1549739) about reverse mortgages, HELOCs, refinancing, or buying a home.",
  alternates: { canonical: "/book" },
};

// Booking page (CLAUDE.md §7, Phase 1): pick a topic, and only that Go High Level calendar loads (BookingPicker).
export default function BookPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-12 sm:px-6">
      <header className="space-y-3 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">Book a call with an advisor</h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed">Pick the topic that fits, then choose a time.</p>
        <p className="text-lg">
          Prefer to talk now? Call{" "}
          <a href={`tel:${licensing.phoneE164}`} className="whitespace-nowrap font-semibold underline underline-offset-4">
            {licensing.phone}
          </a>
        </p>
      </header>
      <div className="relative aspect-[3/2] overflow-hidden rounded-3xl sm:aspect-[21/9]">
        <Image
          src="/images/pages/book-call.jpg"
          alt="Friendly advisor smiling on a headset call at her desk"
          fill
          preload
          sizes="(min-width: 1024px) 1024px, 100vw"
          className="object-cover object-[center_25%]"
        />
      </div>

      <BookingPicker topics={bookingTypes.map((b) => ({ key: b.key, title: b.title, blurb: b.blurb, url: b.url, embedUrl: bookingEmbedUrl(b.calendarId) }))} />
      <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="lazyOnload" />
    </div>
  );
}
