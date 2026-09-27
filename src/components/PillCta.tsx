import Link from "next/link";

// AngelAi-style pill call-to-action: icon + label + filled arrow circle, with a soft blue glow.
export function PillCta({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-3 rounded-full border-2 border-brand-blue-deep/50 bg-white py-2 pl-2 pr-2 font-semibold text-brand-ink shadow-[0_0_24px_rgba(61,133,204,0.28)] transition hover:border-brand-blue-deep hover:shadow-[0_0_32px_rgba(61,133,204,0.45)]"
    >
      <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-blue/25 text-brand-button">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d={icon} />
        </svg>
      </span>
      <span className="pr-1">{label}</span>
      <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-button text-white transition group-hover:translate-x-0.5">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </Link>
  );
}
