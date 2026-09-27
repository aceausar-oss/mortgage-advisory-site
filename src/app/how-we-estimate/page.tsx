import type { Metadata } from "next";
import Link from "next/link";
import { pricing } from "@/lib/home";

export const metadata: Metadata = {
  title: "How We Estimate Your Home Equity",
  description:
    "The simple math behind our home equity estimate: home value × 80% − your mortgage balance, plus what can change the real number when you apply.",
  alternates: { canonical: "/how-we-estimate" },
};

const pct = (n: number) => `${Math.round(n * 100)}%`;

export default function HowWeEstimatePage() {
  const { heloc, cashOut } = pricing.maxCLTV;
  return (
    <article className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6">
      <header className="space-y-4">
        <h1 className="text-3xl font-bold sm:text-4xl">How do we estimate your home equity?</h1>
        <div className="rounded-2xl border-l-4 border-brand-blue bg-mist p-5">
          <p className="text-lg leading-relaxed">
            We multiply your home&apos;s value by the share most programs let you borrow against (currently {pct(heloc)} for a HELOC and{" "}
            {pct(cashOut)} for a cash-out refinance), then subtract what you still owe. What&apos;s left is a ballpark of the equity you could
            access. We show the math on purpose: no black boxes.
          </p>
        </div>
      </header>

      <div className="answer-body">
        <h2>What&apos;s the formula?</h2>
        <p>
          <strong>
            Home value × {pct(heloc)} − current mortgage balance = estimated available equity
          </strong>
        </p>
        <p>
          For example, a $750,000 home with a $300,000 mortgage: $750,000 × {pct(heloc)} = $600,000, minus $300,000 = about $300,000. If the
          math comes out below zero, we show $0.
        </p>

        <h2>Why {pct(heloc)} and not 100%?</h2>
        <p>
          Lenders leave a cushion of equity in the home. Most HELOC and cash-out programs cap your total mortgage debt (your first mortgage
          plus the new money) at around {pct(heloc)} of the home&apos;s value. Some programs go higher, depending on credit, income, and the
          property.
        </p>

        <h2>What can change the real number?</h2>
        <ul>
          <li>
            <strong>Your home&apos;s actual value.</strong> We confirm it with an appraisal or a valuation model, which may differ from what you
            entered.
          </li>
          <li>
            <strong>Your credit and income.</strong> They affect how much you qualify for and the rate.
          </li>
          <li>
            <strong>Other liens on the home,</strong> like an existing HELOC or second mortgage.
          </li>
          <li>
            <strong>Program limits</strong> by state, property type, and loan amount.
          </li>
          <li>
            <strong>Closing costs</strong> that come out of the proceeds. We&apos;ll show you every one of them up front.
          </li>
        </ul>

        <h2>What about reverse mortgages?</h2>
        <p>
          Reverse mortgages use a different formula, based on the youngest borrower&apos;s age, current interest rates, and program limits, so
          we don&apos;t estimate them on the slider. Ask us, and we&apos;ll run your real numbers.
        </p>
      </div>

      <p className="text-sm leading-relaxed text-brand-slate">
        Estimate only. Not an offer or commitment to lend. Subject to credit approval, property valuation, and program guidelines.
      </p>

      <div className="flex flex-wrap gap-3">
        <Link href="/#equity-heading" className="rounded-full bg-brand-blue px-5 py-2.5 font-semibold text-brand-ink hover:bg-brand-blue/75">
          Try the estimate
        </Link>
        <Link href="/book" className="rounded-full border border-brand-slate px-5 py-2.5 font-semibold text-brand-slate hover:bg-mist">
          Book a call with Ace
        </Link>
      </div>
    </article>
  );
}
