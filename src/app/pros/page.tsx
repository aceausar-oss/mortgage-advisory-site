import Link from "next/link";
import { CountryPensionCards } from "@/components/CountryPensionCards";
import { Disclosures } from "@/components/Disclosures";
import { ContentPageView, contentPageMetadata } from "@/components/ContentPageView";
import { getHandouts } from "@/lib/handouts";
import { getEntries } from "@/lib/kb";
import { getContentPage } from "@/lib/pages";
import { licensing } from "@/lib/site";

// For Financial Pros (/pros; Ace's "Fin Pro Hub", Sept 2026): resources for financial professionals whose clients could use a reverse mortgage,
// HELOC, or refinance. Everything here is free to any professional and never tied to referrals.
const page = getContentPage("pros");
export const metadata = contentPageMetadata(page);

const TOOLS = [
  {
    title: "Reverse Mortgage Calculator",
    body: "Four numbers, an estimated range, and an honest fit rating, built on HUD's official tables. Share the link with clients: TheMortgageAdvisory.com/reverse-calculator.",
    href: "/reverse-calculator",
    cta: "Open the calculator",
  },
  {
    title: "Life Rate Calculator",
    body: "A client's blended rate on everything they owe: mortgage, cards, car loans, and solar or PACE liens. Runs in the browser; nothing is saved.",
    href: "/life-rate",
    cta: "Open the calculator",
  },
  {
    title: "Reverse mortgage library",
    body: "Plain-English answers on the line of credit, taxes, trusts, spouses, heirs, and when a reverse mortgage is a bad idea. Safe to share with clients.",
    href: "/answers",
    cta: "Browse the answers",
  },
  {
    title: "15-minute case review",
    body: "Bring a client scenario, no names needed. We'll tell you honestly whether a reverse mortgage, HELOC, or refinance fits.",
    href: "/book",
    cta: "Book a case review",
  },
  {
    title: "Client workshops",
    body: "Invite clients to our free homeowner workshops, or co-host one with us at fair, shared cost. Materials sent early for compliance review.",
    href: "/book",
    cta: "Ask about a workshop",
  },
];

function DraftTag({ show }: { show: boolean }) {
  return show ? <span className="ml-2 rounded bg-mist px-2 py-0.5 align-middle text-xs font-semibold">Draft</span> : null;
}

export default function ProsPage() {
  const answers = getEntries().filter((e) => e.category === "pros");
  const handouts = getHandouts();
  return (
    <ContentPageView
      page={page}
      top={
        <>
        <div className="space-y-3">
          <CountryPensionCards />
          <p className="text-brand-slate">
            Many of the planners we work with open the conversation this way. It reframes a reverse mortgage in one sentence, from
            &ldquo;last resort&rdquo; to a planning tool the rest of the world already uses, and it shows clients you&apos;ve looked beyond the
            headlines. See{" "}
            <Link href="/answers/how-to-bring-up-reverse-mortgage-with-clients" className="font-semibold text-brand-button underline underline-offset-4">
              how to bring it up with a client
            </Link>
            .
          </p>
        </div>
        <section aria-labelledby="pro-tools" className="space-y-4">
          <h2 id="pro-tools" className="font-heading text-2xl font-semibold">
            Free tools and resources
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {TOOLS.map((t) => (
              <li key={t.title} className="flex flex-col rounded-2xl bg-white p-5 ring-1 ring-brand-blue/40 first:sm:col-span-2">
                <h3 className="font-heading text-lg font-semibold">{t.title}</h3>
                <p className="mt-1 flex-1 leading-relaxed">{t.body}</p>
                <Link href={t.href} className="mt-3 font-semibold text-brand-button underline underline-offset-4">
                  {t.cta} →
                </Link>
              </li>
            ))}
          </ul>
          {answers.length > 0 && (
            <div className="space-y-3 pt-4">
              <h2 className="font-heading text-2xl font-semibold">Questions planners ask us</h2>
              <ul className="space-y-2">
                {answers.map((e) => (
                  <li key={e.slug} className="rounded-2xl bg-white p-4 ring-1 ring-brand-blue/40">
                    <Link href={`/answers/${e.slug}`} className="font-semibold text-brand-button underline underline-offset-4">
                      {e.question}
                    </Link>
                    <DraftTag show={e.isDraft} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {handouts.length > 0 && (
            <div className="space-y-3 pt-4">
              <h2 className="font-heading text-2xl font-semibold">Printable handouts</h2>
              <p className="text-brand-slate">One page each. Open one, then print it or save it as a PDF to share with a client or your compliance team.</p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {handouts.map((h) => (
                  <li key={h.slug} className="flex flex-col rounded-2xl bg-white p-4 ring-1 ring-brand-blue/40">
                    <p className="text-xs font-semibold uppercase tracking-wider text-brand-slate">{h.audience === "client" ? "For clients" : "For you"}</p>
                    <Link href={`/pros/handouts/${h.slug}`} className="mt-1 font-semibold text-brand-button underline underline-offset-4">
                      {h.title}
                    </Link>
                    <DraftTag show={h.isDraft} />
                    <p className="mt-1 text-sm text-brand-slate">{h.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
        </>
      }
      bottom={
        <>
          <section aria-label="Talk to our team" className="rounded-2xl bg-brand-slate p-6 text-white">
            <p className="font-heading text-xl font-semibold text-white">Have a client in mind?</p>
            <p className="mt-1 text-white/90">Book a 15-minute case review with our team. No names needed. We never offer or accept referral fees.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/book" className="rounded-full bg-white px-5 py-2.5 font-semibold text-brand-slate hover:bg-mist">
                Book a case review
              </Link>
              <a href={`tel:${licensing.phoneE164}`} className="rounded-full border border-white px-5 py-2.5 font-semibold text-white hover:bg-white/10">
                Call {licensing.phone}
              </a>
            </div>
          </section>
          <Disclosures entry={{ category: "reverse-mortgage", products: ["hecm", "proprietary-reverse", "reverse-second", "heloc"] }} />
        </>
      }
    />
  );
}
