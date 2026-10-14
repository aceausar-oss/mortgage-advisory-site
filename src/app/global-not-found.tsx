import type { Metadata } from "next";
import Link from "next/link";
import { inter, montserrat } from "@/lib/fonts";
import "./globals.css";

// Sitewide 404 (needed because English and Spanish have separate root layouts). Bilingual, since it can't know which
// language the visitor was browsing in.

export const metadata: Metadata = { title: "Page not found | The Mortgage Advisory", robots: { index: false } };

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${inter.variable} ${montserrat.variable} h-full antialiased`}>
      <body className="flex min-h-full items-center justify-center bg-mist px-4 font-sans">
        <main className="max-w-lg space-y-6 py-20 text-center">
          <h1 className="text-3xl font-bold">We couldn&apos;t find that page.</h1>
          <p className="text-lg">The link may be old, or the page may have moved.</p>
          <p className="flex flex-wrap justify-center gap-3">
            <Link href="/" className="rounded-full bg-brand-soft px-5 py-2.5 font-semibold text-brand-ink hover:bg-brand-blue">Go to the homepage</Link>
            <Link href="/book" className="rounded-full border border-brand-slate px-5 py-2.5 font-semibold text-brand-slate hover:bg-white">Book a call</Link>
          </p>
          <div lang="es" className="space-y-3 border-t border-brand-steel/30 pt-6">
            <p className="text-lg">No encontramos esa página.</p>
            <p>
              <Link href="/es" className="font-semibold text-brand-button underline underline-offset-4">Ir a la página principal en español</Link>
            </p>
          </div>
          <p className="text-sm text-brand-slate">The Mortgage Advisory, Inc. · NMLS #1549739</p>
        </main>
      </body>
    </html>
  );
}
