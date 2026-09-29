import Image from "next/image";
import { ContentPageView, contentPageMetadata } from "@/components/ContentPageView";
import { AnswerCta } from "@/components/AnswerParts";
import { LifeRateCallout } from "@/components/life-rate/LifeRateCallout";
import { TreasuryChart } from "@/components/TreasuryChart";
import { getContentPage } from "@/lib/pages";

// Pricing hub (CLAUDE.md §9). No rate scenarios at launch (Ace's decision); fees as typical ranges only.
const page = getContentPage("costs");
export const metadata = contentPageMetadata(page);

export default function CostsPage() {
  return (
    <ContentPageView
      page={page}
      top={
        <div className="relative aspect-[3/2] overflow-hidden rounded-2xl sm:aspect-[21/9]">
          <Image src="/images/pages/costs.jpg" alt="Desk with a Loan Estimate, calculator, and coffee" fill preload sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
        </div>
      }
      bottom={
        <>
          <LifeRateCallout />
          <TreasuryChart idPrefix="costs-tsy" />
          <AnswerCta />
        </>
      }
    />
  );
}
