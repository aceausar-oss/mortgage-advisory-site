import Image from "next/image";
import Link from "next/link";
import { licensing, mainNav } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-steel/30 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:gap-4 sm:px-6">
        <Link href="/" className="shrink-0" aria-label={`${licensing.brandName} home`}>
          <Image
            src="/brand/logo-tma-v3.png"
            alt={licensing.brandName}
            width={1200}
            height={326}
            preload
            sizes="180px"
            className="h-9 w-auto min-[360px]:h-10 sm:h-14"
          />
        </Link>

        <nav aria-label="Main" className="hidden xl:block">
          <ul className="flex items-center gap-6 text-sm font-medium text-brand-slate">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="whitespace-nowrap hover:underline underline-offset-4">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={`tel:${licensing.phoneE164}`}
            className="hidden whitespace-nowrap text-sm font-semibold text-brand-slate hover:underline md:inline"
          >
            {licensing.phone}
          </a>
          <Link
            href="/book"
            className="whitespace-nowrap rounded-full bg-brand-soft px-3 py-2 text-sm font-semibold text-brand-ink hover:bg-brand-blue sm:px-4"
          >
            Book a call
          </Link>

          {/* Mobile menu: <details> works with JavaScript disabled. */}
          <details className="group relative xl:hidden">
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-brand-steel/50 text-brand-slate [&::-webkit-details-marker]:hidden">
              <span className="sr-only">Menu</span>
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" className="group-open:hidden" />
                <path d="M6 6l12 12M18 6 6 18" className="hidden group-open:block" />
              </svg>
            </summary>
            <nav
              aria-label="Mobile"
              className="absolute right-0 mt-2 w-64 rounded-2xl border border-brand-steel/30 bg-white p-2 shadow-lg"
            >
              <ul className="text-brand-slate">
                {mainNav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="block rounded-lg px-3 py-2 hover:bg-mist">
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <a href={`tel:${licensing.phoneE164}`} className="block rounded-lg px-3 py-2 font-semibold hover:bg-mist">
                    Call {licensing.phone}
                  </a>
                </li>
              </ul>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
