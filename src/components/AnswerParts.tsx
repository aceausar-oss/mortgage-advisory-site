import Image from "next/image";
import Link from "next/link";
import { licensing } from "@/lib/site";
import type { KbEntry } from "@/lib/kb";

export function DraftBanner() {
  return (
    <p role="note" className="rounded-xl border-2 border-dashed border-brand-slate bg-white px-4 py-3 text-sm font-semibold text-brand-slate">
      Draft — not yet reviewed by Ace Ausar. Drafts are hidden on the live site until reviewed.
    </p>
  );
}

export function Breadcrumbs({ items }: { items: { href: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1 text-brand-slate">
        {items.map((item, i) => (
          <li key={item.href} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden="true">/</span>}
            {i < items.length - 1 ? (
              <Link href={item.href} className="underline underline-offset-4">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function TldrBox({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border-l-4 border-brand-blue bg-mist p-5">
      <p className="mb-1 font-heading text-sm font-bold uppercase tracking-wide text-brand-slate">The short answer</p>
      <p className="text-lg leading-relaxed">{text}</p>
    </div>
  );
}

export function SourcesList({ sources }: { sources: KbEntry["sources"] }) {
  return (
    <section aria-labelledby="sources-heading">
      <h2 id="sources-heading" className="mb-2 text-xl font-semibold">
        Sources
      </h2>
      <ul className="list-disc space-y-1 pl-5">
        {sources.map((s) => (
          <li key={s.url}>
            <a href={s.url} rel="noopener" className="text-brand-slate underline underline-offset-4">
              {s.title}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AuthorBox({ entry }: { entry: Pick<KbEntry, "updated" | "reviewed_by"> }) {
  return (
    <section aria-label="About the author" className="flex items-center gap-4 rounded-2xl border border-brand-steel/30 p-5">
      <Image
        src={licensing.founder.image}
        alt={licensing.founder.name}
        width={578}
        height={914}
        sizes="80px"
        className="h-20 w-20 shrink-0 rounded-full bg-mist object-cover object-top"
      />
      <div className="text-sm leading-relaxed">
        <p className="font-heading text-base font-semibold text-brand-slate">
          {licensing.founder.name}, {licensing.founder.jobTitle}
        </p>
        <p>
          {licensing.legalName} · NMLS #{licensing.nmls}
        </p>
        <p>
          {entry.reviewed_by ? `Reviewed by ${entry.reviewed_by}` : "Pending review"} · Updated{" "}
          <time dateTime={entry.updated}>{entry.updated}</time>
        </p>
      </div>
    </section>
  );
}

export function AnswerCta() {
  return (
    <section aria-label="Talk to our team" className="rounded-2xl bg-brand-slate p-6 text-white">
      <p className="font-heading text-xl font-semibold text-white">Have a question about your situation?</p>
      <p className="mt-1 text-white/90">Talk it through with our team — no pressure, plain English.</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href="/book" className="rounded-full bg-white px-5 py-2.5 font-semibold text-brand-slate hover:bg-mist">
          Book a call with an advisor
        </Link>
        <a href={`tel:${licensing.phoneE164}`} className="rounded-full border border-white px-5 py-2.5 font-semibold text-white hover:bg-white/10">
          Call {licensing.phone}
        </a>
      </div>
    </section>
  );
}
