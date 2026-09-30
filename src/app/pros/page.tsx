import Link from "next/link";
import { Disclosures } from "@/components/Disclosures";
import { ContentPageView, contentPageMetadata } from "@/components/ContentPageView";
import { getContentPage } from "@/lib/pages";
import { licensing } from "@/lib/site";

// Fin Pro Hub (Ace, Sept 2026): resources for financial professionals whose clients could use a reverse mortgage,
// HELOC, or refinance. Everything here is free to any professional and never tied to referrals.
const page = getContentPage("pros");
export const metadata = contentPageMetadata(page);

const TOOLS = [
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

export default function ProsPage() {
  return (
    <ContentPageView
      page={page}
      top={
        <section aria-labelledby="pro-tools" className="space-y-4">
          <h2 id="pro-tools" className="font-heading text-2xl font-semibold">
            Free tools and resources
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {TOOLS.map((t) => (
              <li key={t.title} className="flex flex-col rounded-2xl bg-white p-5 ring-1 ring-brand-blue/40">
                <h3 className="font-heading text-lg font-semibold">{t.title}</h3>
                <p className="mt-1 flex-1 leading-relaxed">{t.body}</p>
                <Link href={t.href} className="mt-3 font-semibold text-brand-button underline underline-offset-4">
                  {t.cta} →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      }
      bottom={
        <>
          <section aria-label="Talk to our team" className="rounded-2xl bg-brand-slate p-6 text-white">
            <p className="font-heading text-xl font-semibold text-white">Have a client in mind?</p>
            <p className="mt-1 text-white/90">Book a 15-minute case review with our team. No names needed, and no referral fees, ever.</p>
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
